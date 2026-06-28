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

export default function PetaAdmin() {
  const [robData,  setRobData]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showModalWilayah, setShowModalWilayah] = useState(false);
  const [showModalPeta,    setShowModalPeta]    = useState(false);

  async function fetchRobData() {
    setLoading(true);
    try {
      const res = await api.get("/peta/rob-data");
      setRobData(res.data.data || []);
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

          {/* ── Stat cards ── */}
          <Row className="g-3 mb-4">
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

          {/* ── Peta ── */}
          <AdminPetaMap robData={robData} />

          {/* ── Tabel ── */}
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-3 p-md-4">
              <Row className="align-items-center g-2 mb-3">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Data Wilayah Rob</h5>
                  {dataAirAt && (
                    <small className="text-muted">
                      Data pasang surut terkini: <strong>{dataAirAt} WIB</strong>
                    </small>
                  )}
                </Col>
              </Row>
              <WilayahTable data={robData} loading={loading} />
            </Card.Body>
          </Card>

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