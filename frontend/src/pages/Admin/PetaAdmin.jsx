// src/pages/Admin/PetaAdmin.jsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import api from "../../services/api";

import AdminNavbar from "../../components/EndminNavbar";
import EndminTopbar from "../../components/EndminTopbar";
import ModalWilayahRob from "../../components/PasangSurut/ModalWilayahRob";
import ModalPetaWilayah from "../../components/PasangSurut/ModalPetaWilayah";
import AdminPetaMap from "../../components/potensi_rob/AdminPetaMap";
import WilayahTable from "../../components/potensi_rob/WilayahTable";
import StatCard from "../../components/potensi_rob/StatCard";
import { getRobPotential } from "../../utils/tideHelpers";

function formatJamRange(jamMulai, jamSelesai) {
  if (jamMulai == null || jamSelesai == null) return "-";
  const start = String(jamMulai).padStart(2, "0") + ":00";
  const end = String(jamSelesai + 1).padStart(2, "0") + ":00";
  return `${start} - ${end}`;
}

export default function PetaAdmin() {
  const [robData,      setRobData]      = useState([]);
  const [prediksiData, setPrediksiData] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModalWilayah, setShowModalWilayah] = useState(false);
  const [showModalPeta,    setShowModalPeta]    = useState(false);

  async function fetchRobData() {
    setLoading(true);
    try {
      const [robRes, prediksiRes] = await Promise.all([
        api.get("/peta/rob-data"),
        api.get("/peta/rob-prediksi"),
      ]);
      setRobData(robRes.data.data || []);
      setPrediksiData(prediksiRes.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data peta rob:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRobData(); }, []);

  const totalWilayah       = robData.length;
  const tergenang          = robData.filter(w => w.tergenang).length;
  const sudahGeometri      = robData.filter(w => w.geometry).length;
  const dataAirAt          = robData.length > 0 ? robData[0].data_air_at : null;
  const tinggiRobMax       = robData.length > 0 ? Math.max(...robData.map(w => w.tinggi_rob ?? 0)) : 0;
  const potensialTertinggi = getRobPotential(tinggiRobMax);

  // ── Ringkasan prediksi tertinggi (untuk stat card & tabel prediksi) ──
  const tergenangPrediksi = prediksiData.filter(p => p.tergenang);
  const prediksiTertinggi = tergenangPrediksi.length > 0
    ? tergenangPrediksi.reduce((max, item) =>
        item.tinggi_rob_max > max.tinggi_rob_max ? item : max
      , tergenangPrediksi[0])
    : null;
  const potensiPrediksiTertinggi = prediksiTertinggi
    ? getRobPotential(prediksiTertinggi.tinggi_rob_max)
    : "Surut";

  // Gabungkan data wilayah (nama, tinggi_tanah, geometry) dengan hasil
  // prediksi per wilayah, supaya WilayahTable bisa dipakai apa adanya.
  const prediksiRows = robData.map((item) => {
    const match = prediksiData.find((p) => p.nama_wilayah === item.nama_wilayah);
    return {
      ...item,
      tinggi_rob: match?.tinggi_rob_max ?? 0,
      tergenang: match?.tergenang ?? false,
      tinggi_air: match?.tinggi_air_prediksi_max ?? null,
      jam_mulai: match?.jam_mulai,
      jam_selesai: match?.jam_selesai,
    };
  });

  return (
    <>
      <AdminNavbar />
      <EndminTopbar />

      <main
        style={{
          background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
          paddingTop: "100px",
          paddingBottom: "32px",
        }}
        className="px-3 px-md-4 min-vh-100"
      >
        <Container fluid="xl">

          {/* ── Toolbar ── */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-3">
              <Row className="g-2 align-items-center">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Kelola Peta & Wilayah Rob</h5>
                  <small className="text-muted">
                    Manajemen wilayah, tinggi tanah, dan geometri peta potensi rob
                  </small>
                </Col>
                <Col xs={12} md="auto">
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setShowModalWilayah(true)}>
                      <i className="bi bi-geo-alt me-1" />
                      Kelola Wilayah
                    </Button>
                    <Button variant="outline-primary" onClick={() => setShowModalPeta(true)}>
                      <i className="bi bi-map me-1" />
                      Kelola Geometri Peta
                    </Button>
                    <Button variant="outline-secondary" onClick={fetchRobData} disabled={loading}>
                      {loading
                        ? <Spinner size="sm" animation="border" />
                        : <i className="bi bi-arrow-clockwise" />}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ── Stat cards (Aktual) ── */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="rounded-circle"
              style={{ width: 8, height: 8, background: "#0ea5e9", display: "inline-block" }}
            />
            <small className="text-uppercase fw-semibold text-muted" style={{ letterSpacing: "0.5px", fontSize: 11 }}>
              Kondisi Aktual — Data Pasang Surut Terkini
            </small>
          </div>
          <Row className="g-3 mb-3">
            <Col xs={6} md={3}>
              <StatCard label="Total Wilayah" value={totalWilayah} sub="wilayah terdaftar" color="#0ea5e9" />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Wilayah Tergenang"
                value={tergenang}
                sub={`dari ${totalWilayah} wilayah`}
                color={tergenang > 0 ? "#ef4444" : "#22c55e"}
              />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Potensi Tertinggi"
                value={potensialTertinggi}
                sub={`rob maks ${tinggiRobMax.toFixed(2)} m`}
                color={
                  potensialTertinggi === "Tinggi" ? "#ef4444" :
                  potensialTertinggi === "Sedang" ? "#f59e0b" :
                  potensialTertinggi === "Rendah" ? "#3b82f6" : "#22c55e"
                }
              />
            </Col>
            <Col xs={6} md={3}>
              <StatCard
                label="Geometri Peta"
                value={`${sudahGeometri}/${totalWilayah}`}
                sub="wilayah sudah ada polygon"
                color={sudahGeometri === totalWilayah && totalWilayah > 0 ? "#22c55e" : "#f59e0b"}
              />
            </Col>
          </Row>

          {/* ── Stat card Prediksi ── */}
          <div className="d-flex align-items-center gap-2 mb-2">
            <span
              className="rounded-circle"
              style={{ width: 8, height: 8, background: "#8b5cf6", display: "inline-block" }}
            />
            <small className="text-uppercase fw-semibold text-muted" style={{ letterSpacing: "0.5px", fontSize: 11 }}>
              Prediksi — Hasil Model 24 Jam
            </small>
          </div>
          <Row className="g-3 mb-4">
            <Col xs={12} md={4}>
              <StatCard
                label="Prediksi Tertinggi"
                value={potensiPrediksiTertinggi}
                sub={
                  prediksiTertinggi
                    ? `${prediksiTertinggi.nama_wilayah} — ${prediksiTertinggi.tinggi_rob_max} m`
                    : "belum ada prediksi"
                }
                color={
                  potensiPrediksiTertinggi === "Tinggi" ? "#ef4444" :
                  potensiPrediksiTertinggi === "Sedang" ? "#f59e0b" :
                  potensiPrediksiTertinggi === "Rendah" ? "#3b82f6" : "#22c55e"
                }
              />
            </Col>
            <Col xs={12} md={4}>
              <StatCard
                label="Rentang Jam Puncak Rob Tertinggi"
                value={
                  prediksiTertinggi
                    ? formatJamRange(prediksiTertinggi.jam_mulai, prediksiTertinggi.jam_selesai)
                    : "-"
                }
                sub={prediksiTertinggi ? `di ${prediksiTertinggi.nama_wilayah}` : "WIB"}
                color="#8b5cf6"
              />
            </Col>
            <Col xs={12} md={4}>
              <StatCard
                label="Wilayah Terdampak (Prediksi)"
                value={tergenangPrediksi.length}
                sub={`dari ${totalWilayah} wilayah`}
                color={tergenangPrediksi.length > 0 ? "#ef4444" : "#22c55e"}
              />
            </Col>
          </Row>

          {/* ── Peta ── */}
          <AdminPetaMap robData={robData} prediksiData={prediksiData} />

          {/* ── Tabel Aktual & Prediksi berdampingan ── */}
          <Row className="g-4 mt-1">
            <Col lg={6}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Body className="p-3 p-md-4">
                  <Row className="align-items-center g-2 mb-3">
                    <Col xs={12}>
                      <h5 className="mb-0 fw-bold">Data Wilayah Rob (Aktual)</h5>
                      {dataAirAt && (
                        <small className="text-muted">
                          Data pasang surut terkini: <strong>{dataAirAt} WIB</strong>
                        </small>
                      )}
                    </Col>
                  </Row>
                  <WilayahTable data={robData} loading={loading} showDataAirColumn={false} />
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="shadow-sm border-0 rounded-4 h-100">
                <Card.Body className="p-3 p-md-4">
                  <Row className="align-items-center g-2 mb-3">
                    <Col xs={12}>
                      <h5 className="mb-0 fw-bold">Prediksi Potensi Rob</h5>
                      <small className="text-muted">
                        Berdasarkan hasil model prediksi 24 jam
                      </small>
                    </Col>
                  </Row>
                  <WilayahTable
                    data={prediksiRows}
                    loading={loading}
                    showDataAirColumn={false}
                    showGeometryColumn={false}
                    emptyMessage="Belum ada prediksi untuk tanggal ini. Gunakan fitur Generate Prediksi di menu Pasang Surut."
                    extraColumns={[
                      {
                        header: "Rentang Jam Rob",
                        render: (item) =>
                          item.tergenang ? formatJamRange(item.jam_mulai, item.jam_selesai) : "-",
                        className: "text-muted small",
                      },
                    ]}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Container>
      </main>

      {/* ── Modals ── */}
      <ModalWilayahRob
        show={showModalWilayah}
        onHide={() => setShowModalWilayah(false)}
        onDataChanged={fetchRobData}
      />
      <ModalPetaWilayah
        show={showModalPeta}
        onHide={() => setShowModalPeta(false)}
        onDataChanged={fetchRobData}
      />
    </>
  );
}