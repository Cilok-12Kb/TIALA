// src/components/potensi_rob/RingkasanPrediksiRob.jsx
import { Badge, Spinner } from "react-bootstrap";
import { getRobPotential, getRobBadgeVariant } from "../../utils/tideHelpers";

function formatJamRange(jamMulai, jamSelesai) {
  if (jamMulai == null || jamSelesai == null) return "-";
  const start = String(jamMulai).padStart(2, "0") + ":00";
  const end = String(jamSelesai + 1).padStart(2, "0") + ":00"; // akhir periode = jam terakhir + 1
  return `${start} - ${end}`;
}

export default function RingkasanPrediksiRob({ prediksiData = [], loading = false }) {
  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted small mb-3">
        <Spinner size="sm" animation="border" variant="primary" />
        Memuat prediksi rob...
      </div>
    );
  }

  const tergenang = prediksiData.filter((item) => item.tergenang);

  if (tergenang.length === 0) {
    return (
      <div className="alert alert-success mb-3 py-2 px-3 small">
        Tidak ada prediksi rob untuk wilayah manapun hari ini.
      </div>
    );
  }

  const tertinggi = tergenang.reduce((max, item) =>
    item.tinggi_rob_max > max.tinggi_rob_max ? item : max
  , tergenang[0]);

  const potential = getRobPotential(tertinggi.tinggi_rob_max);
  const jamRange = formatJamRange(tertinggi.jam_mulai, tertinggi.jam_selesai);

  return (
    <div
      className="d-flex flex-wrap align-items-center gap-3 mb-3 px-3 py-2 rounded-3"
      style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
    >
      <Badge bg={getRobBadgeVariant(potential)} className="px-3 py-2">
        Prediksi Tertinggi: {potential}
      </Badge>

      <span className="small">
        <strong>{tertinggi.nama_wilayah}</strong> — {tertinggi.tinggi_rob_max} m
      </span>

      <span className="small text-muted">
        Diperkirakan terjadi <strong>{jamRange} WIB</strong>
      </span>

      {tergenang.length > 1 && (
        <span className="small text-muted">
          ({tergenang.length} wilayah berpotensi terdampak)
        </span>
      )}
    </div>
  );
}