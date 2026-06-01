import { useEffect, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";
import api from "../../services/api";
import "../../styles/PasangSurut.css";

function formatDateTime(value) {
  if (!value) return "-";

  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getTodayLabel() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// GANTI BAGIAN INI DENGAN API MODEL PREDIKSI PASANG SURUT
//-- START --//
function TideChart({ data }) {
  const maxHeight = 4;
  const chartWidth = 1200;
  const chartHeight = 420;
  const paddingLeft = 80;
  const paddingRight = 35;
  const paddingTop = 45;
  const paddingBottom = 70;

  const chartInnerWidth = chartWidth - paddingLeft - paddingRight;
  const chartInnerHeight = chartHeight - paddingTop - paddingBottom;

  const points = data.map((item, index) => {
    const x =
      paddingLeft +
      (index * chartInnerWidth) / Math.max(data.length - 1, 1);

    const y =
      paddingTop +
      chartInnerHeight -
      (Number(item.tide_height) / maxHeight) * chartInnerHeight;

    const hour = new Date(item.datetime).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { x, y, hour, ...item };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="tide-chart-card">
      <div className="chart-header">
        <strong>Prediksi Pasang Surut Air Laut</strong>
      </div>

      <div className="chart-date">{getTodayLabel()}</div>

      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="tide-chart">
        {[0, 1, 2, 3, 4].map((value) => {
          const y =
            paddingTop +
            chartInnerHeight -
            (value / maxHeight) * chartInnerHeight;

          return (
            <g key={value}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={chartWidth - paddingRight}
                y2={y}
                className="chart-grid"
              />
              <text x={35} y={y + 5} className="axis-label">
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}

        <line
          x1={paddingLeft}
          y1={paddingTop}
          x2={paddingLeft}
          y2={chartHeight - paddingBottom}
          className="axis-line"
        />

        <line
          x1={paddingLeft}
          y1={chartHeight - paddingBottom}
          x2={chartWidth - paddingRight}
          y2={chartHeight - paddingBottom}
          className="axis-line"
        />

        <text
          x={22}
          y={chartHeight / 2}
          className="axis-title-y"
          transform={`rotate(-90 22 ${chartHeight / 2})`}
        >
          Prediksi Kenaikan Air Laut (m)
        </text>

        <text
          x={chartWidth / 2}
          y={chartHeight - 18}
          className="axis-title-x"
        >
          Waktu Prediksi Per Jam
        </text>

        <path d={path} className="chart-line" fill="none" />

        {points.map((point, index) => (
          <g key={point.id}>
            <circle cx={point.x} cy={point.y} r="5" className="chart-dot" />

            <text x={point.x - 16} y={point.y - 12} className="chart-label">
              {point.tide_height}m
            </text>

            {index % 2 === 0 && (
              <text
                x={point.x - 18}
                y={chartHeight - paddingBottom + 28}
                className="x-axis-label"
              >
                {point.hour}
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}
//-- END --//

function TideSummarySection({ data }) {
  return (
    <section className="tide-summary-section">
      <TideChart data={data} />
    </section>
  );
}

function TideTable({ data }) {
  function exportCSV() {
    const header = ["No", "Lokasi", "Pasang/Surut", "Kenaikan Air", "Tanggal dan Waktu"];

    const rows = data.map((item, index) => [
      index + 1,
      item.lokasi,
      item.status,
      `${item.kenaikan_air} cm`,
      `${formatDateTime(item.datetime)} WIB`,
    ]);

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data-pasang-surut.csv";
    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="tide-tabel-card">
      <section className="tide-table-section">
        <div className="table-title-row">
          <h1>RINCIAN INFORMASI PASANG SURUT</h1>
          <button onClick={exportCSV}>Export CSV</button>
        </div>

        <table className="tide-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Lokasi</th>
              <th>Pasang/Surut</th>
              <th>Kenaikan Air</th>
              <th>Tanggal dan Waktu</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.lokasi}</td>
                <td>{item.status}</td>
                <td>{item.kenaikan_air} cm</td>
                <td>{formatDateTime(item.datetime)} WIB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function PasangSurutContent() {
  const [tideData, setTideData] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchTideData() {
    try {
      const response = await api.get("/pasang-surut");
      setTideData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTideData();
  }, []);

  if (loading) {
    return (
      <main className="pasang-surut-page">
        Memuat data pasang surut...
      </main>
    );
  }

  return (
    <main className="pasang-surut-page">
      <TideSummarySection data={tideData} />
      <TideTable data={tideData} />
    </main>
  );
}

export default function PasangSurut() {
  return (
    <>
      <PublicNavbar />
      <PasangSurutContent />
    </>
  );
}