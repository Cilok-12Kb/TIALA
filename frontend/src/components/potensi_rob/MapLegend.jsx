// src/components/potensi_rob/MapLegend.jsx
import ReactDOM from "react-dom";
import { useMap } from "react-leaflet";
import { ROB_LEVEL_LEGEND } from "../../utils/tideHelpers";

// Legend overlay yang nempel di pojok peta (pakai portal supaya posisinya
// relatif ke container Leaflet, bukan ke document body).
export default function MapLegend() {
  const map = useMap();
  const container = map.getContainer();

  return ReactDOM.createPortal(
    <div
      className="position-absolute bg-white rounded-3 shadow-sm p-2 pe-none"
      style={{ bottom: "32px", right: "10px", zIndex: 1000, minWidth: "170px", lineHeight: 1.8 }}
    >
      <p className="text-uppercase fw-semibold text-secondary mb-2" style={{ fontSize: "11px", letterSpacing: "0.5px" }}>
        Potensi Rob (Pasang Surut)
      </p>
      {ROB_LEVEL_LEGEND.map(({ level, color, rangeLabel }) => (
        <div key={level} className="d-flex align-items-center gap-2 small">
          <span
            className="border rounded-1 flex-shrink-0"
            style={{ width: 14, height: 14, background: color, display: "inline-block" }}
          />
          <span className="text-secondary-emphasis">{rangeLabel}</span>
        </div>
      ))}
    </div>,
    container
  );
}