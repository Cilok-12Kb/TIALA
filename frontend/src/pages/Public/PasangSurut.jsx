// src/pages/Public/PasangSurut.jsx
import { useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import PublicNavbar from "../../components/PublicNavbar";
import TideChart from "../../components/PasangSurut/TideChart";
import TideTable from "../../components/PasangSurut/TideTable";
import api from "../../services/api";
import { toDateInputValue, getCurrentHourValue } from "../../utils/tideHelpers";
import "../../styles/PasangSurut.css";

function PasangSurutContent() {
  const [chartData,    setChartData]    = useState([]);
  const [robData,      setRobData]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue(new Date()));
  const [selectedHour, setSelectedHour] = useState(getCurrentHourValue());

  async function fetchChartData(tanggal) {
    try {
      const res = await api.get("/pasang-surut", { params: { tanggal } });
      setChartData(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data grafik pasang surut:", error);
    }
  }

  async function fetchRobData(tanggal, jam) {
    try {
      const res = await api.get("/pasang-surut/rob-wilayah", { params: { tanggal, jam } });
      setRobData(res.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data rob per wilayah:", error);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchChartData(selectedDate).finally(() => setLoading(false));
  }, [selectedDate]);

  useEffect(() => {
    fetchRobData(selectedDate, selectedHour);
  }, [selectedDate, selectedHour]);

  useEffect(() => {
    const interval = setInterval(() => {
      const todayStr = toDateInputValue(new Date());
      setSelectedDate((prev) => {
        if (prev !== todayStr && prev === toDateInputValue(new Date(Date.now() - 60000))) {
          setSelectedHour(getCurrentHourValue());
          return todayStr;
        }
        return prev;
      });
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="pasang-surut-page py-3 py-md-4">
      <Container fluid="xl">
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
            showExport={false}
          />
        )}
      </Container>
    </main>
  );
}

export default function PasangSurut() {
  return (
    <>
      <PublicNavbar />
      <PasangSurutContent />
    </>
  );
}