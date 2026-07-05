// src/pages/Public/Peta.jsx
import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import PublicNavbar from "../../components/PublicNavbar";
import RobPolygonLayer from "../../components/potensi_rob/RobPolygonLayer";
import MapLegend from "../../components/potensi_rob/MapLegend";
import RingkasanPrediksiRob from "../../components/potensi_rob/RingkasanPrediksiRob";
import TabelWilayahSection from "../../components/potensi_rob/TabelWilayahSection";
import api from "../../services/api";
import "../../styles/Peta.css";

const SEMARANG_CENTER = [-6.9667, 110.4167];

// src/pages/Public/Peta.jsx
const SEMARANG_BOUNDS = [
  [-7.35, 110.05], // diperlonggar lebih jauh dari sebelumnya
  [-6.62, 110.78],
];

function PetaContent() {
  const [robData, setRobData] = useState([]);
  const [prediksiData, setPrediksiData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const [robRes, prediksiRes] = await Promise.all([
        api.get("/peta/rob-data"),
        api.get("/peta/rob-prediksi"),
      ]);
      setRobData(robRes.data.data || []);
      setPrediksiData(prediksiRes.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data peta:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <main className="peta-page">
      {/* ===== Card Peta ===== */}
      <div className="peta-card position-relative">
        {loading && (
          <div
            className="position-absolute top-0 start-0 end-0 d-flex align-items-center justify-content-center gap-2 p-2 small text-muted bg-white bg-opacity-75"
            style={{ zIndex: 1000 }}
          >
            <Spinner size="sm" animation="border" variant="primary" />
            Memuat data peta...
          </div>
        )}

        <div>
          <p className="mb-2 fw-bold small text-uppercase" style={{ letterSpacing: "2px", color: "#0ea5e9" }}>
            BMKG MAP VIEW
          </p>
          <h1 className="fw-bold mb-3 fs-1" style={{ color: "#0f172a" }}>
            Peta Wilayah Potensi Rob Semarang
          </h1>
        </div>

        {/* Ringkasan prediksi tertinggi — tampil di atas peta */}
        <RingkasanPrediksiRob prediksiData={prediksiData} loading={loading} />

        <MapContainer
          center={SEMARANG_CENTER}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          maxBounds={SEMARANG_BOUNDS}
          className="peta-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Legend overlay di pojok kanan bawah peta */}
          <MapLegend />

          {/* Overlay polygon rob — wilayah yang punya GeoJSON geometry */}
          <RobPolygonLayer
            robData={robData}
            prediksiData={prediksiData}
            fillOpacity={0.45}
            hoverFillOpacity={0.7}
          />
        </MapContainer>
      </div>

      {/* ===== Card Tabel — Aktual & Prediksi (masing-masing card sendiri) ===== */}
      <div className="mt-4">
        <TabelWilayahSection robData={robData} prediksiData={prediksiData} />
      </div>
    </main>
  );
}

export default function Peta() {
  return (
    <>
      <PublicNavbar />
      <PetaContent />
    </>
  );
}