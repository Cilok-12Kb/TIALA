// src/components/common/StatCard.jsx
import { Card } from "react-bootstrap";

export default function StatCard({ label, value, sub, color }) {
  return (
    <Card className="shadow-sm border-0 rounded-4 h-100">
      <Card.Body className="p-3">
        <div className="text-muted small mb-1">{label}</div>
        <div className="fw-bold fs-3" style={{ color }}>{value}</div>
        {sub && <div className="text-muted small">{sub}</div>}
      </Card.Body>
    </Card>
  );
}