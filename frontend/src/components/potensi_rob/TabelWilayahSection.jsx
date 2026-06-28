// src/components/potensi_rob/TabelWilayahSection.jsx
import WilayahTable from "./WilayahTable";

// Bungkus heading + catatan waktu data + tabel, khusus tampilan publik
// (heading & spacing-nya beda dari yang dipakai admin, jadi dipisah dari
// WilayahTable supaya komponen tabelnya sendiri tetap netral/reusable).
export default function TabelWilayahSection({ robData }) {
  if (!robData || robData.length === 0) return null;

  return (
    <div className="wilayah-table-wrapper mt-3">
      <h2 className="wilayah-table-heading">DETAIL WILAYAH POTENSI ROB</h2>
      {robData[0]?.data_air_at && (
        <p className="wilayah-table-note text-muted small mb-2">
          Data pasang surut: <strong>{robData[0].data_air_at} WIB</strong>
        </p>
      )}
      <WilayahTable
        data={robData}
        showDataAirColumn={false}
        badgeStyle="continuous"
        tableClassName="wilayah-table"
        emptyMessage={null}
      />
    </div>
  );
}