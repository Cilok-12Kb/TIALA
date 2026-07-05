// src/components/potensi_rob/RobPolygonLayer.jsx
import { useRef } from "react";
import { GeoJSON } from "react-leaflet";
import { getRobColor, getRobPotential, buildRobFeatures } from "../../utils/tideHelpers";

function formatJamRange(jamMulai, jamSelesai) {
  if (jamMulai == null || jamSelesai == null) return "-";
  const start = String(jamMulai).padStart(2, "0") + ":00";
  const end = String(jamSelesai + 1).padStart(2, "0") + ":00";
  return `${start} - ${end}`;
}

// Layer GeoJSON overlay polygon potensi rob — dipakai bersama oleh peta admin
// (AdminPetaMap) dan peta publik (Peta.jsx), supaya warna, ambang batas, dan
// isi popup-nya selalu konsisten di kedua halaman.
export default function RobPolygonLayer({
  robData,
  prediksiData = [],
  fillOpacity = 0.5,
  hoverFillOpacity = 0.75,
  weight = 2,
  hoverWeight = 3,
}) {
  const geoJsonRef = useRef(null);
  const features = buildRobFeatures(robData);

  if (features.length === 0) return null;

  function style(feature) {
    const { tinggi_rob, tergenang } = feature.properties;
    const color = getRobColor(tinggi_rob, tergenang);
    return {
      fillColor:   color,
      fillOpacity,
      color,
      weight,
      opacity: 0.9,
    };
  }

  function onEachFeature(feature, layer) {
    const p = feature.properties;
    const level = getRobPotential(p.tinggi_rob);
    // Pakai getRobColor (bukan Bootstrap variant) supaya warna badge di popup
    // SAMA PERSIS dengan warna polygon di peta & legend (Surut hijau,
    // Rendah kuning, Sedang oranye, Tinggi merah) — sebelumnya badge ini
    // pakai warna Bootstrap generik (success/warning/danger) yang tidak
    // konsisten dengan skema warna rob di tempat lain.
    const badgeColor = getRobColor(p.tinggi_rob, p.tergenang);

    // Cari data prediksi untuk wilayah ini (kalau ada)
    const prediksi = prediksiData.find((pr) => pr.nama_wilayah === p.nama_wilayah);
    const prediksiBadgeColor = prediksi
      ? getRobColor(prediksi.tinggi_rob_max, prediksi.tergenang)
      : null;
    const prediksiLevel = prediksi ? getRobPotential(prediksi.tinggi_rob_max) : null;

    const prediksiSection = prediksi
      ? `
        <div class="pt-2 mt-2 border-top">
          <div class="text-secondary small mb-2 fw-semibold">Prediksi Rob</div>
          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2 mb-2">
            <span class="text-secondary small">Tertinggi</span>
            <strong class="small">
              ${prediksi.tergenang ? prediksi.tinggi_rob_max + " m" : "Tidak tergenang"}
            </strong>
          </div>
          ${prediksi.tergenang ? `
          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2 mb-2">
            <span class="text-secondary small">Rentang jam</span>
            <strong class="small">${formatJamRange(prediksi.jam_mulai, prediksi.jam_selesai)} WIB</strong>
          </div>` : ""}
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-secondary small">Potensi prediksi</span>
            <span
              class="d-inline-block px-3 py-1 rounded-pill text-center fw-semibold border"
              style="background:${prediksiBadgeColor};font-size:10px;letter-spacing:0.3px;text-transform:uppercase"
            >
              ${prediksiLevel}
            </span>
          </div>
        </div>`
      : "";

    layer.bindPopup(`
      <div class="py-3 px-2" style="min-width:200px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif">
        <h6 class="fw-bold text-center mb-4" style="font-size:15px">${p.nama_wilayah}</h6>

        <div class="d-grid gap-2 mb-2">
          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Tinggi tanah</span>
            <strong class="small">${p.tinggi_tanah} m</strong>
          </div>

          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Tinggi air</span>
            <strong class="small">${p.tinggi_air != null ? p.tinggi_air + " m" : "-"}</strong>
          </div>

          <div class="d-flex justify-content-between align-items-center bg-light rounded-3 px-3 py-2">
            <span class="text-secondary small">Rob (aktual)</span>
            <strong class="small">${p.tinggi_rob > 0 ? p.tinggi_rob + " m" : "Tidak tergenang"}</strong>
          </div>
        </div>

        <div class="d-flex justify-content-between align-items-center pt-3 mt-2 border-top">
          <span class="text-secondary small">Potensi</span>
          <span
            class="d-inline-block px-3 py-1 rounded-pill text-center fw-semibold border"
            style="background:${badgeColor};font-size:10px;letter-spacing:0.3px;text-transform:uppercase"
          >
            ${level}
          </span>
        </div>

        ${prediksiSection}
      </div>
    `, {
      autoPanPadding: [30, 30],
    });

    layer.on("mouseover", () => layer.setStyle({ fillOpacity: hoverFillOpacity, weight: hoverWeight }));
    layer.on("mouseout",  () => layer.setStyle({ fillOpacity, weight }));
  }

  return (
    <GeoJSON
      ref={geoJsonRef}
      key={JSON.stringify(features.map(f => f.properties.tinggi_rob))}
      data={{ type: "FeatureCollection", features }}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}