// src/components/potensi_rob/AdminPetaMap.jsx
import { Card, Row, Col } from "react-bootstrap";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import RobPolygonLayer from "./RobPolygonLayer";
import { buildRobFeatures, ROB_LEVEL_LEGEND } from "../../utils/tideHelpers";

const SEMARANG_CENTER = [-6.9667, 110.4167];

export default function AdminPetaMap({ robData, prediksiData = [] }) {
  const featureCount = buildRobFeatures(robData).length;
  const hasGeometry = featureCount > 0;

  return (
    <Card className="shadow-sm border-0 rounded-4 mb-4">
      <Card.Body className="p-3 p-md-4">
        <Row className="align-items-center g-2 mb-3">
          <Col xs={12} md="auto" className="me-md-auto">
            <h5 className="mb-0 fw-bold">Peta Potensi Rob</h5>
            <small className="text-muted">
              {hasGeometry
                ? `${featureCount} wilayah tampil dengan overlay potensi rob`
                : "Belum ada wilayah yang memiliki geometri peta — kelola di tombol 'Kelola Geometri Peta'"}
            </small>
          </Col>
          {/* Legenda */}
          <Col xs={12} md="auto">
            <div className="d-flex flex-wrap gap-2 align-items-center small">
              {ROB_LEVEL_LEGEND.map(({ level, color }) => (
                <span key={level} className="d-flex align-items-center gap-1">
                  <span
                    className="border rounded-1"
                    style={{ display: "inline-block", width: 14, height: 14, background: color }}
                  />
                  {level}
                </span>
              ))}
            </div>
          </Col>
        </Row>

        {/* Wrapper class dipakai supaya kita bisa override .leaflet-container
            secara terpisah (border-radius + overflow), tanpa memotong popup
            yang muncul dekat tepi peta — sama seperti fix di peta publik. */}
        <div className="admin-peta-map-wrapper" style={{ position: "relative" }}>
          <MapContainer
            center={SEMARANG_CENTER}
            zoom={12}
            style={{ height: 480, width: "100%", zIndex: 1 }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <RobPolygonLayer robData={robData} prediksiData={prediksiData} />

            {!hasGeometry && (
              // Placeholder info overlay saat belum ada geometri
              <div
                className="position-absolute top-0 start-0 end-0 bottom-0 d-flex align-items-center justify-content-center bg-white bg-opacity-75 rounded-4 pe-none"
                style={{ zIndex: 500 }}
              >
                <div className="text-center text-muted">
                  <div className="fs-1">🗺️</div>
                  <div className="fw-semibold mt-2">Belum ada geometri wilayah</div>
                  <small>Tambahkan melalui tombol "Kelola Geometri Peta"</small>
                </div>
              </div>
            )}
          </MapContainer>
        </div>
      </Card.Body>
    </Card>
  );
}