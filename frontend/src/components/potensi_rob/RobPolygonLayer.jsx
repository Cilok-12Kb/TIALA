// src/components/potensi_rob/RobPolygonLayer.jsx
import { useRef } from "react";
import { GeoJSON } from "react-leaflet";
import { getRobColor, getRobPotential, buildRobFeatures } from "../../utils/tideHelpers";

// Layer GeoJSON overlay polygon potensi rob — dipakai bersama oleh peta admin
// (AdminPetaMap) dan peta publik (Peta.jsx), supaya warna, ambang batas, dan
// isi popup-nya selalu konsisten di kedua halaman.
export default function RobPolygonLayer({
  robData,
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
    layer.bindPopup(`
      <div style="font-size:13px;min-width:170px;line-height:1.7">
        <strong style="font-size:14px;display:block;margin-bottom:4px">${p.nama_wilayah}</strong>
        Tinggi tanah: <b>${p.tinggi_tanah} m</b><br/>
        Tinggi air: <b>${p.tinggi_air != null ? p.tinggi_air + " m" : "-"}</b><br/>
        Rob: <b>${p.tinggi_rob > 0 ? p.tinggi_rob + " m" : "Tidak tergenang"}</b><br/>
        Potensi: <b>${level}</b>
      </div>
    `);
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