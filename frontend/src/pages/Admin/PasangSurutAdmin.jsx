// src/pages/admin/PasangSurutAdmin.jsx
import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import api from "../../services/api";
import "../../styles/PasangSurut.css";

import AdminNavbar from "../../components/EndminNavbar";
import EndminTopbar from "../../components/EndminTopbar";

import ModalPasangSurut from "../../components/PasangSurut/ModalPasangSurut";
import ModalWilayahRob from "../../components/PasangSurut/ModalWilayahRob";
import ModalGeneratePrediksi from "../../components/PasangSurut/ModalGeneratePrediksi";
import TideChart from "../../components/PasangSurut/TideChart";
import TideTable from "../../components/PasangSurut/TideTable";

import { toDateInputValue, getCurrentHourValue } from "../../utils/tideHelpers";

export default function PasangSurutAdmin() {
  const [chartData, setChartData] = useState([]);
  const [robData,   setRobData]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [selectedHour, setSelectedHour] = useState(getCurrentHourValue());

  const [showModalPasut, setShowModalPasut]       = useState(false);
  const [showModalWilayah, setShowModalWilayah]   = useState(false);
  const [showModalPrediksi, setShowModalPrediksi] = useState(false);

  async function fetchChartData(tanggal) {
    try {
      const res = await api.get("/pasang-surut", { params: { tanggal } });
      setChartData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data grafik:", err);
    }
  }

  async function fetchRobData(tanggal, jam) {
    try {
      const res = await api.get("/pasang-surut/rob-wilayah", { params: { tanggal, jam } });
      setRobData(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data rob:", err);
    }
  }

  function refreshAll() {
    fetchChartData(selectedDate);
    fetchRobData(selectedDate, selectedHour);
  }

  useEffect(() => {
    setLoading(true);
    fetchChartData(selectedDate).finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fetchRobData(selectedDate, selectedHour);
  }, [selectedDate, selectedHour]);

  return (
    <>
      <AdminNavbar />

      <EndminTopbar />

      <main
        className="pasang-surut-page pb-4 px-3 px-md-4"
        style={{
          background: "linear-gradient(to bottom, #f8fafc, #eef2ff)",
          paddingTop: "100px",
        }}
      >
        <Container fluid="xl">
          {/* ── Toolbar admin ── */}
          <Card className="shadow-sm border-0 rounded-4 mb-4">
            <Card.Body className="p-3">
              <Row className="g-2 align-items-center">
                <Col xs={12} md="auto" className="me-md-auto">
                  <h5 className="mb-0 fw-bold">Kelola Data Pasang Surut</h5>
                  <small className="text-muted">Input, edit, dan hapus data secara manual</small>
                </Col>
                <Col xs={12} md="auto">
                  <div className="d-flex flex-wrap gap-2">
                    <Button variant="primary" onClick={() => setShowModalPasut(true)}>
                      Kelola Pasang Surut
                    </Button>
                    <Button variant="outline-primary" onClick={() => setShowModalWilayah(true)}>
                      Kelola Wilayah Rob
                    </Button>
                    <Button variant="success" onClick={() => setShowModalPrediksi(true)}>
                      Generate Prediksi 24 Jam
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* ── Grafik & tabel (komponen sama persis dengan halaman publik) ── */}
          <section className="tide-summary-section mb-4">
            <TideChart
              data={chartData}
              selectedDate={selectedDate}
              onDateChange={(d) => { setSelectedDate(d); setSelectedHour(getCurrentHourValue()); }}
            />
          </section>

          {loading ? (
            <div className="d-flex justify-content-center align-items-center py-5">
              <Spinner animation="border" variant="primary" className="me-2" />
              <span className="text-muted">Memuat data pasang surut...</span>
            </div>
          ) : (
            <TideTable
              data={robData}
              selectedDate={selectedDate}
              selectedHour={selectedHour}
              onHourChange={setSelectedHour}
              showExport={true}
            />
          )}
        </Container>
      </main>

      {/* ── Modals ── */}
      <ModalPasangSurut
        show={showModalPasut}
        onHide={() => setShowModalPasut(false)}
        onDataChanged={refreshAll}
      />
      <ModalWilayahRob
        show={showModalWilayah}
        onHide={() => setShowModalWilayah(false)}
        onDataChanged={refreshAll}
      />
      <ModalGeneratePrediksi
        show={showModalPrediksi}
        onHide={() => setShowModalPrediksi(false)}
        onDataChanged={refreshAll}
      />
    </>
  );
}