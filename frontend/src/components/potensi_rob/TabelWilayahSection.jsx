// src/components/potensi_rob/TabelWilayahSection.jsx
import WilayahTable from "./WilayahTable";

function formatJamRange(jamMulai, jamSelesai) {
  if (jamMulai == null || jamSelesai == null) return "-";
  const start = String(jamMulai).padStart(2, "0") + ":00";
  const end = String(jamSelesai + 1).padStart(2, "0") + ":00";
  return `${start} - ${end}`;
}

export default function TabelWilayahSection({ robData, prediksiData = [] }) {
  if (!robData || robData.length === 0) return null;

  const prediksiRows = robData.map((item) => {
    const match = prediksiData.find((p) => p.nama_wilayah === item.nama_wilayah);
    return {
      ...item,
      tinggi_rob: match?.tinggi_rob_max ?? 0,
      tergenang: match?.tergenang ?? false,
      tinggi_air: match?.tinggi_air_prediksi_max ?? null, // <-- diisi prediksi tertinggi
      jam_mulai: match?.jam_mulai,
      jam_selesai: match?.jam_selesai,
    };
  });

  return (
    <div className="wilayah-table-section d-flex flex-column flex-lg-row gap-4">
      {/* ===== Card Aktual ===== */}
      <div className="wilayah-table-card flex-fill">
        <h2 className="wilayah-table-heading">DETAIL WILAYAH POTENSI ROB (AKTUAL)</h2>
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

      {/* ===== Card Prediksi (terpisah) ===== */}
      <div className="wilayah-table-card flex-fill">
        <h2 className="wilayah-table-heading">PREDIKSI POTENSI ROB</h2>
        <p className="wilayah-table-note text-muted small mb-2">
          Berdasarkan hasil model prediksi 24 jam
        </p>
        <WilayahTable
          data={prediksiRows}
          showDataAirColumn={false}
          badgeStyle="continuous"
          tableClassName="wilayah-table"
          emptyMessage="Belum ada prediksi untuk tanggal ini."
          extraColumns={[
            {
              header: "Rentang Jam Rob",
              render: (item) =>
                item.tergenang ? formatJamRange(item.jam_mulai, item.jam_selesai) : "-",
              className: "text-muted small",
            },
          ]}
        />
      </div>
    </div>
  );
}