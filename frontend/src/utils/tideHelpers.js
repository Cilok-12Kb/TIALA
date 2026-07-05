// src/utils/tideHelpers.js
// Helper format & kalkulasi murni untuk fitur Pasang Surut.
// Dipisah dari komponen agar bisa dipakai ulang oleh TideChart, TideTable,
// dan halaman lain (misal halaman admin) tanpa duplikasi logic.

export const MSL_VALUE = 1.5;

export const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const value = String(i).padStart(2, "0") + ":00";
  const label = String(i).padStart(2, "0") + ".00";
  return { value, label };
});

export function getRobPotential(tinggiRob) {
  if (tinggiRob >= 0.7) return "Tinggi";
  if (tinggiRob >= 0.4) return "Sedang";
  if (tinggiRob > 0)    return "Rendah";
  return "Surut";
}

export function getRobBadgeVariant(potential) {
  switch (potential) {
    case "Tinggi": return "danger";
    case "Sedang": return "warning";
    case "Rendah": return "primary";
    default:       return "success";
  }
}

// Warna polygon di peta admin, berdasarkan tinggi rob & status tergenang.
export function getRobColor(tinggiRob, tergenang) {
  if (!tergenang || tinggiRob <= 0) return "#23c000";
  if (tinggiRob < 0.4)  return "#ffff00";
  if (tinggiRob < 0.7)  return "#ffb000";
  return "#ff0000";
}

// Daftar warna + label legend potensi rob — satu sumber kebenaran dipakai
// oleh legend di AdminPetaMap (label singkat) maupun MapLegend publik
// (label dengan rentang meter), supaya warna & ambang batas selalu konsisten.
export const ROB_LEVEL_LEGEND = [
  { level: "Surut", color: "#23c000", rangeLabel: "Surut" },
  { level: "Rendah", color: "#ffff00", rangeLabel: "Rendah (< 0.4 m)" },
  { level: "Sedang", color: "#ffb000", rangeLabel: "Sedang (0.4 – 0.7 m)" },
  { level: "Tinggi", color: "#ff0000", rangeLabel: "Tinggi (> 0.7 m)" },
];

// Bangun array GeoJSON Feature dari robData (cuma item yang punya geometry).
// Dipakai bersama oleh AdminPetaMap (untuk cek hasGeometry) dan
// RobPolygonLayer (untuk render polygon-nya).
export function buildRobFeatures(robData) {
  return (robData || [])
    .filter(item => item.geometry)
    .map(item => ({
      type: "Feature",
      properties: {
        nama_wilayah: item.nama_wilayah,
        tinggi_rob:   item.tinggi_rob,
        tinggi_tanah: item.tinggi_tanah,
        tinggi_air:   item.tinggi_air,
        tergenang:    item.tergenang,
      },
      geometry: item.geometry,
    }));
}

export function formatTanggalJam(tanggal, jam) {
  if (!tanggal && jam == null) return "-";
  const date = new Date(tanggal + "T00:00:00");
  const tanggalStr = date.toLocaleDateString("id-ID", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
  const jamStr = String(jam).padStart(2, "0") + ":00";
  return `${tanggalStr} ${jamStr}`;
}

export function formatDateLabel(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("id-ID", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });
}

export function toDateInputValue(date) {
  const year  = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day   = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getCurrentHourValue() {
  const now = new Date();
  return String(now.getHours()).padStart(2, "0") + ":00";
}

// Cek apakah tanggal+jam yang dipilih ada di masa depan (relatif ke waktu
// sekarang) — dipakai untuk menampilkan pesan "data belum tersedia" alih-alih
// "tidak ada data" pada jam yang memang belum terlewati.
export function isFutureSelection(selectedDate, selectedHour) {
  const today = toDateInputValue(new Date());
  if (selectedDate > today) return true;
  if (selectedDate < today) return false;
  // Tanggal sama dengan hari ini → bandingkan jam
  const selectedHourNum = parseInt(String(selectedHour).split(":")[0], 10);
  const currentHourNum = new Date().getHours();
  return selectedHourNum > currentHourNum;
}

function escapeCsvValue(value) {
  const str = value == null ? "" : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Export data tabel rob-per-wilayah ke file CSV.
// Pakai BOM (\uFEFF) agar karakter terbaca benar saat dibuka di Excel,
// dan escaping untuk nilai yang mengandung koma/petik/baris baru.
export function exportTideTableToCSV(data, selectedDate, selectedHour) {
  if (!data || data.length === 0) return;

  const headers = [
    "No", "Lokasi", "Tinggi Tanah (m)", "Tinggi Air (m)",
    "Tinggi Rob (m)", "Potensi Rob", "Pasang/Surut", "Tanggal dan Waktu",
  ];

  const rows = data.map((item, index) => {
    const potential = getRobPotential(item.tinggi_rob);
    return [
      index + 1,
      item.nama_wilayah,
      item.tinggi_tanah,
      item.tide_height_digital,
      item.tinggi_rob > 0 ? item.tinggi_rob : "Tidak tergenang",
      potential,
      item.status,
      `${formatTanggalJam(item.tanggal, item.jam)} WIB`,
    ].map(escapeCsvValue).join(",");
  });

  const csvContent = [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pasang-surut_${selectedDate}_${String(selectedHour).replace(":", "")}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}