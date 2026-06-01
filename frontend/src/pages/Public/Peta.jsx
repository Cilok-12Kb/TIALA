import PublicNavbar from "../../components/PublicNavbar";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import api from "../../services/api";
import "../../styles/Peta.css";

const SEMARANG_CENTER = [-6.9667, 110.4167];

const SEMARANG_BOUNDS = [
  [-7.15, 110.25],
  [-6.82, 110.58],
];

const pinIcon = L.divIcon({
  className: "custom-map-pin",
  html: `<div class="pin-dot"></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getRiskLevel(item) {
  const windSpeed = Number(item.ws ?? 0);
  const humidity = Number(item.hu ?? 0);

  if (windSpeed >= 20 || humidity >= 90) return "danger";
  if (windSpeed >= 12 || humidity >= 80) return "warning";
  if (windSpeed >= 7 || humidity >= 70) return "medium";
  return "low";
}

function getRiskText(level) {
  const labels = {
    low: "Risiko Rendah",
    medium: "Risiko Sedang",
    warning: "Siaga",
    danger: "Darurat Rob",
  };

  return labels[level] || "Risiko Rendah";
}

function InfoPopup({ location }) {
  const riskLevel = getRiskLevel(location);

  return (
    <div className="map-info-popup">
      <div className="popup-date">
        {formatDate(location.local_datetime)} WIB
      </div>

      <h6>
        {location.desa}, {location.kecamatan}
      </h6>

      <div className="info-row">
        <span>Suhu</span>
        <strong>{location.t ?? "-"}°C</strong>
      </div>

      <div className="info-row">
        <span>Cuaca</span>
        <strong>{location.weather_desc ?? "-"}</strong>
      </div>

      <div className="info-row">
        <span>Kelembapan</span>
        <strong>{location.hu ?? "-"}%</strong>
      </div>

      <div className="info-row">
        <span>Kecepatan Angin</span>
        <strong>{location.ws ?? "-"} km/jam</strong>
      </div>

      <div className="info-row">
        <span>Arah Angin</span>
        <strong>{location.wd ?? "-"}</strong>
      </div>

      <div className="info-row">
        <span>Potensi Rob</span>
        <span className={`risk-status ${riskLevel}`}>
          {getRiskText(riskLevel)}
        </span>
      </div>
    </div>
  );
}

function RiskLegend() {
  return (
    <div className="risk-legend">
      <p>Indikasi Potensi Rob</p>
      <div><span className="risk-box low" /> Risiko Rendah</div>
      <div><span className="risk-box medium" /> Risiko Sedang</div>
      <div><span className="risk-box warning" /> Siaga</div>
      <div><span className="risk-box danger" /> Darurat Rob</div>
    </div>
  );
}

function PetaContent() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMapData() {
    try {
      const response = await api.get("/cuaca-semarang");

      const filteredData = response.data.data.filter((item) => {
        const lat = Number(item.lat);
        const lon = Number(item.lon);

        return (
          lat >= SEMARANG_BOUNDS[0][0] &&
          lat <= SEMARANG_BOUNDS[1][0] &&
          lon >= SEMARANG_BOUNDS[0][1] &&
          lon <= SEMARANG_BOUNDS[1][1]
        );
      });

      setLocations(filteredData);
    } catch (error) {
      console.error("Gagal mengambil data peta:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMapData();
  }, []);

  return (
    <main className="peta-page">
      <div className="peta-card">
        {loading && <div className="map-loading">Memuat data peta...</div>}
        
        <div>

          <p
            className="mb-2"
            style={{
              color: "#0ea5e9",
              letterSpacing: "2px",
              fontWeight: "700",
              fontSize: "13px",
            }}
          >
            BMKG MAP VIEW
          </p>

          <h1
            className="fw-bold mb-3"
            style={{
              fontSize: "42px",
              color: "#0f172a",
            }}
          >
            Peta Wilayah Potensi Rob Semarang
          </h1>

        </div>

        <MapContainer
          center={SEMARANG_CENTER}
          zoom={11}
          minZoom={8}
          maxZoom={18}
          className="peta-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {locations.map((location) => (
            <Marker
              key={location.id}
              position={[Number(location.lat), Number(location.lon)]}
              icon={pinIcon}
            >
              <Popup closeButton>
                <InfoPopup location={location} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        <RiskLegend />
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