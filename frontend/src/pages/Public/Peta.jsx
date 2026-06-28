// src/pages/Public/Peta.jsx
import { MapContainer, TileLayer } from "react-leaflet";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import PublicNavbar from "../../components/PublicNavbar";
import RobPolygonLayer from "../../components/potensi_rob/RobPolygonLayer";
import MapLegend from "../../components/potensi_rob/MapLegend";
import TabelWilayahSection from "../../components/potensi_rob/TabelWilayahSection";
import api from "../../services/api";
import "../../styles/Peta.css";

const SEMARANG_CENTER = [-6.9667, 110.4167];

const SEMARANG_BOUNDS = [
  [-7.15, 110.25],
  [-6.82, 110.58],
];

function PetaContent() {
  const [robData, setRobData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchAll() {
    setLoading(true);
    try {
      const robRes = await api.get("/peta/rob-data");
      setRobData(robRes.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data peta:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchAll(); }, []);

  return (
    <main className="peta-page">
      <div className="peta-card">
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
          <RobPolygonLayer robData={robData} fillOpacity={0.45} hoverFillOpacity={0.7} />
        </MapContainer>

        {/* Tabel detail di bawah peta */}
        <TabelWilayahSection robData={robData} />
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