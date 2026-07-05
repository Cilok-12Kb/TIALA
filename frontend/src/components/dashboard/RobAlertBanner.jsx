// src/components/dashboard/RobAlertBanner.jsx
import { AlertTriangleIcon, AlertCircleIcon } from "./icons";

// ── Alert kondisi AKTUAL (real-time) ──
// Dua level seperti sebelumnya, berdasarkan tinggi_rob saat ini (jam
// terakhir yang ada datanya), diambil dari WilayahRobController::petaData().
function ActualAlert({ robData }) {
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
          {level === "tinggi" ? "ROB TINGGI · TERJADI SEKARANG" : "ROB SEDANG · TERJADI SEKARANG"}
        </span>
        <span className="db-alert-banner__text">
          Rob aktual terdeteksi di: <strong>{areas.join(", ")}</strong>.
          Segera lakukan langkah antisipasi.
        </span>
      </div>
      <div className="db-alert-banner__pulse" />
    </div>
  );
}

// ── Alert PREDIKSI 24 jam ──
// Satu level ("Siaga"), berdasarkan prediksi per wilayah (field
// `tergenang` dari WilayahRobController::robPrediksiPerWilayah).
function PrediksiAlert({ prediksiData }) {
  const alerts = prediksiData.filter((item) => item.tergenang);

  if (alerts.length === 0) return null;

  function formatJam(jam) {
    return String(jam).padStart(2, "0") + ":00";
  }

  const areaLabels = alerts.map((item) =>
    item.jam_mulai !== null && item.jam_selesai !== null
      ? `${item.nama_wilayah} (${formatJam(item.jam_mulai)}–${formatJam(item.jam_selesai)})`
      : item.nama_wilayah
  );

  return (
    <div className="db-alert-banner db-alert-banner--siaga">
      <div className="db-alert-banner__icon">
        <AlertTriangleIcon />
      </div>
      <div className="db-alert-banner__body">
        <span className="db-alert-banner__tag">SIAGA ROB · PREDIKSI</span>
        <span className="db-alert-banner__text">
          Prediksi 24 jam ke depan menunjukkan potensi rob di:{" "}
          <strong>{areaLabels.join(", ")}</strong>. Segera lakukan langkah
          antisipasi.
        </span>
        <span className="db-alert-banner__note">
          *Berdasarkan data prediksi model, bukan kondisi aktual saat ini.
        </span>
      </div>
      <div className="db-alert-banner__pulse" />
    </div>
  );
}

export default function RobAlertBanner({ robData, prediksiData }) {
  return (
    <>
      <ActualAlert robData={robData} />
      <PrediksiAlert prediksiData={prediksiData} />
    </>
  );
}