// src/components/dashboard/RobAlertBanner.jsx
import { AlertTriangleIcon, AlertCircleIcon } from "./icons";

export default function RobAlertBanner({ robData }) {
  const highAlerts = robData.filter((item) => item.tinggi_rob >= 0.7);
  const medAlerts = robData.filter(
    (item) => item.tinggi_rob >= 0.4 && item.tinggi_rob < 0.7
  );

  if (robData.length === 0) return null;

  const level =
    highAlerts.length > 0 ? "tinggi" : medAlerts.length > 0 ? "sedang" : null;

  if (!level) return null;

  const areas =
    level === "tinggi"
      ? highAlerts.map((i) => i.nama_wilayah)
      : medAlerts.map((i) => i.nama_wilayah);

  return (
    <div className={`db-alert-banner db-alert-banner--${level}`}>
      <div className="db-alert-banner__icon">
        {level === "tinggi" ? <AlertTriangleIcon /> : <AlertCircleIcon />}
      </div>
      <div className="db-alert-banner__body">
        <span className="db-alert-banner__tag">
          {level === "tinggi" ? "SIAGA ROB TINGGI" : "WASPADA ROB SEDANG"}
        </span>
        <span className="db-alert-banner__text">
          Potensi rob terdeteksi di:{" "}
          <strong>{areas.join(", ")}</strong>. Segera lakukan langkah
          antisipasi.
        </span>
      </div>
      <div className="db-alert-banner__pulse" />
    </div>
  );
}