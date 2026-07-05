// src/components/potensi_rob/WilayahTable.jsx
import { Spinner, Badge, Table } from "react-bootstrap";
import { getRobPotential, getRobBadgeVariant, getRobColor } from "../../utils/tideHelpers";

export default function WilayahTable({
  data,
  loading = false,
  showDataAirColumn = true,
  showGeometryColumn = true, // BARU — default true supaya tidak mengubah pemakaian lain
  badgeStyle = "bootstrap",
  tableClassName = "",
  emptyMessage,
  extraColumns = [],
}) {
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <Spinner animation="border" variant="primary" className="me-2" />
        <span className="text-muted">Memuat data wilayah...</span>
      </div>
    );
  }

  if (!data || data.length === 0) {
    if (emptyMessage === null) return null;
    return (
      <div className="text-center text-muted py-5">
        {emptyMessage ?? (
          <>Belum ada data wilayah rob. Klik <strong>"Kelola Wilayah"</strong> untuk menambahkan.</>
        )}
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <Table hover className={`align-middle mb-0 small ${tableClassName}`}>
        <thead className="table-light">
          <tr>
            <th style={{ width: 40 }}>#</th>
            <th>Nama Wilayah</th>
            <th>Tinggi Tanah (MDPL)</th>
            <th>Tinggi Air{showDataAirColumn ? " Terkini" : ""}</th>
            <th>Tinggi Rob</th>
            <th>Potensi Rob</th>
            {showGeometryColumn && <th>Geometri Peta</th>}
            {extraColumns.map((col) => (
              <th key={col.header}>{col.header}</th>
            ))}
            {showDataAirColumn && <th>Data Air</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => {
            const potential = getRobPotential(item.tinggi_rob);
            return (
              <tr key={item.id ?? item.nama_wilayah ?? idx}>
                <td className="text-muted">{idx + 1}</td>
                <td className="fw-semibold">{item.nama_wilayah}</td>
                <td>{item.tinggi_tanah} m</td>
                <td>
                  {item.tinggi_air != null
                    ? `${item.tinggi_air} m`
                    : <span className="text-muted">-</span>}
                </td>
                <td>
                  {item.tinggi_rob > 0
                    ? <strong>{item.tinggi_rob} m</strong>
                    : <span className="text-muted">Tidak tergenang</span>}
                </td>
                <td>
                  {badgeStyle === "continuous" ? (
                    <span
                      className="d-inline-block px-2 py-1 rounded-1 border text-center fw-semibold"
                      style={{ background: getRobColor(item.tinggi_rob, item.tergenang), minWidth: 80, fontSize: 11 }}
                    >
                      {potential}
                    </span>
                  ) : (
                    <Badge bg={getRobBadgeVariant(potential)} className="px-2 py-1">
                      {potential}
                    </Badge>
                  )}
                </td>
                {showGeometryColumn && (
                  <td>
                    <Badge bg={item.geometry ? "success" : "secondary"} className="px-2 py-1">
                      {item.geometry ? "✓ Ada" : "Belum ada"}
                    </Badge>
                  </td>
                )}
                {extraColumns.map((col) => (
                  <td key={col.header} className={col.className}>
                    {col.render(item)}
                  </td>
                ))}
                {showDataAirColumn && (
                  <td className="text-muted small">{item.data_air_at ?? "-"}</td>
                )}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}