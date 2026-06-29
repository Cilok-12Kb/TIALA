// src/pages/Admin/Dashboard.jsx
import { useNavigate } from "react-router-dom";
import EndminTopbar from "../../components/EndminTopbar";
import useDashboardData from "../../hooks/useDashboardData";
import { getRobPotential } from "../../utils/tideHelpers";
import { useState, useId } from "react";
import { Waves, ArrowRight } from "lucide-react";

const ROUTE_CUACA = "/ocean-dashboard/cuaca";
const ROUTE_PASANG_SURUT = "/ocean-dashboard/pasang-surut";
const ROUTE_PETA = "/ocean-dashboard/peta";

function getDominantWeather(weatherData) {
  if (!weatherData.length) return "-";
  const counts = {};
  weatherData.forEach((w) => {
    const key = w.weather_desc || w.cuaca || "-";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

function getLatestTide(tideChartData) {
  for (let i = tideChartData.length - 1; i >= 0; i--) {
    if (tideChartData[i].tide_height_digital != null) return tideChartData[i];
  }
  return null;
}

function getTopRobArea(robData) {
  if (!robData.length) return null;
  return [...robData].sort((a, b) => b.tinggi_rob - a.tinggi_rob)[0];
}

function robBadgeStyle(level) {
  switch (level) {
    case "Tinggi": return { bg: "#fef2f2", text: "#dc2626", bar: "#ef4444" };
    case "Sedang": return { bg: "#fffbeb", text: "#d97706", bar: "#f59e0b" };
    case "Rendah": return { bg: "#e0f2fe", text: "#0284c7", bar: "#38bdf8" };
    default:       return { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" };
  }
}

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    weatherData,
    robData,
    loadingWeather,
    countdown,
    tideChartData,
  } = useDashboardData();

  const maxRob = robData.length
    ? Math.max(...robData.map((i) => i.tinggi_rob))
    : 0;
  const highCount = robData.filter((i) => i.tinggi_rob >= 0.7).length;
  const avgTemp = weatherData.length
    ? (
        weatherData.reduce((sum, i) => sum + Number(i.t || 0), 0) /
        weatherData.length
      ).toFixed(1)
    : null;

  const dominantWeather = getDominantWeather(weatherData);
  const latestTide = getLatestTide(tideChartData);
  const topRobArea = getTopRobArea(robData);
  const topRobLevel = topRobArea ? getRobPotential(topRobArea.tinggi_rob) : null;

  const siagaAreas = [...robData]
    .filter((r) => r.tinggi_rob > 0)
    .sort((a, b) => b.tinggi_rob - a.tinggi_rob)
    .slice(0, 5);

  const maxRobInSiaga = siagaAreas.length ? siagaAreas[0].tinggi_rob : 1;

  if (loadingWeather) {
    return (
      <div style={s.loadWrap}>
        <i
          className="ti ti-loader-2"
          style={{ fontSize: 32, color: "#0284c7", animation: "spin 1s linear infinite" }}
        />
        <p style={{ marginTop: 12, color: "#64748b", fontSize: 14 }}>
          Memuat data dashboard...
        </p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <EndminTopbar />

      <div style={s.content}>

        {/* ── Stat Cards ── */}
        <div style={s.statsGrid}>
          <StatCard
            label="Lokasi Dipantau"
            value={robData.length || "-"}
            sub={`${robData.length} titik wilayah pesisir`}
            accent="#0284c7"
            accentBg="#e0f2fe"
            icon="ti-map-pin"
          />
          <StatCard
            label="Siaga Tinggi"
            value={highCount || 0}
            sub={highCount > 0 ? "area berpotensi rob tinggi" : "tidak ada siaga tinggi"}
            accent={highCount > 0 ? "#ef4444" : "#16a34a"}
            accentBg={highCount > 0 ? "#fef2f2" : "#f0fdf4"}
            icon="ti-alert-triangle"
          />
          <StatCard
            label="Tinggi Rob Maks"
            value={`${maxRob.toFixed(2)} m`}
            sub="dari seluruh wilayah pesisir"
            accent="#f59e0b"
            accentBg="#fffbeb"
            icon="ti-waves"
          />
          <StatCard
            label="Suhu Rata-rata"
            value={avgTemp != null ? `${avgTemp}°C` : "- °C"}
            sub={`${weatherData.length} kelurahan terpantau`}
            accent="#16a34a"
            accentBg="#f0fdf4"
            icon="ti-temperature"
          />
        </div>

        {/* ── Ringkasan Monitoring — 3 card individual ── */}
        <div style={s.monGrid}>
          {/* Card 1: Cuaca */}
          <div style={s.monCard}>
            <div style={s.monCardHeader}>
              <div style={{ ...s.cardIconBox, background: "#e0f2fe" }}>
                <i className="ti ti-cloud" style={{ fontSize: 14, color: "#0284c7" }} />
              </div>
              <div>
                <div style={s.monCardTitle}>Cuaca Semarang</div>
                <div style={s.monCardSub}>Integrasi BMKG</div>
              </div>
            </div>
            <div style={s.monItems}>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Kelurahan terpantau</span>
                <span style={s.monItemValue}>{weatherData.length || "-"}</span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Suhu rata-rata</span>
                <span style={s.monItemValue}>{avgTemp != null ? `${avgTemp}°C` : "-"}</span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Cuaca dominan</span>
                <span style={s.monItemValue}>{dominantWeather}</span>
              </div>
            </div>
            <button
              style={{ ...s.detailBtn, borderColor: "#0284c7", color: "#0284c7" }}
              onClick={() => navigate(ROUTE_CUACA)}
            >
              Detail Cuaca <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>

          {/* Card 2: Pasang Surut */}
          <div style={s.monCard}>
            <div style={s.monCardHeader}>
              <div style={{ ...s.cardIconBox, background: "#fffbeb" }}>
                <i className="ti ti-chart-line" style={{ fontSize: 14, color: "#f59e0b" }} />
              </div>
              <div>
                <div style={s.monCardTitle}>Pasang Surut</div>
                <div style={s.monCardSub}>Data real-time</div>
              </div>
            </div>
            <div style={s.monItems}>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Jam terakhir</span>
                <span style={s.monItemValue}>
                  {latestTide ? `${String(latestTide.jam).padStart(2, "0")}:00` : "-"}
                </span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Tinggi air terkini</span>
                <span style={s.monItemValue}>
                  {latestTide ? `${(latestTide.tide_height_digital * 100).toFixed(0)} cm` : "-"}
                </span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Status</span>
                <span style={s.monItemValue}>
                  {latestTide?.status ? (
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#16a34a",
                        display: "inline-block", flexShrink: 0,
                      }} />
                      {latestTide.status}
                    </span>
                  ) : "-"}
                </span>
              </div>
            </div>
            <button
              style={{ ...s.detailBtn, borderColor: "#f59e0b", color: "#f59e0b" }}
              onClick={() => navigate(ROUTE_PASANG_SURUT)}
            >
              Detail Pasang Surut <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>

          {/* Card 3: Potensi Rob */}
          <div style={s.monCard}>
            <div style={s.monCardHeader}>
              <div style={{ ...s.cardIconBox, background: "#fef2f2" }}>
                <i className="ti ti-map-2" style={{ fontSize: 14, color: "#ef4444" }} />
              </div>
              <div>
                <div style={s.monCardTitle}>Potensi Rob</div>
                <div style={s.monCardSub}>Pemantauan pesisir</div>
              </div>
            </div>
            <div style={s.monItems}>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Wilayah dipantau</span>
                <span style={s.monItemValue}>{robData.length || "-"}</span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Area kritis</span>
                <span style={s.monItemValue}>{topRobArea ? topRobArea.nama_wilayah : "-"}</span>
              </div>
              <div style={s.monItemRow}>
                <span style={s.monItemLabel}>Potensi tertinggi</span>
                <span style={{
                  ...s.monItemValue,
                  color: topRobLevel === "Tinggi" ? "#dc2626" : "#0f172a",
                }}>
                  {topRobArea ? `${topRobLevel} (${topRobArea.tinggi_rob} m)` : "-"}
                </span>
              </div>
            </div>
            <button
              style={{ ...s.detailBtn, borderColor: "#ef4444", color: "#ef4444" }}
              onClick={() => navigate(ROUTE_PETA)}
            >
              Detail Peta Rob <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>

        {/* ── Tren & Siaga ── */}
        <div style={s.row2}>

          {/* Grafik tren pasang surut */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={{ ...s.cardIconBox, background: "#fffbeb" }}>
                  <i className="ti ti-chart-line" style={{ fontSize: 14, color: "#f59e0b" }} />
                </div>
                <span style={s.cardTitle}>Tren Pasang Surut</span>
              </div>
              <span style={s.cardSubtitle}>24 jam terakhir</span>
            </div>

            {tideChartData.length === 0 ? (
              <EmptyState text="Belum ada data pasang surut untuk hari ini." />
            ) : (
              <TideTrendChart data={tideChartData} />
            )}

            {/* ── Stat ringkas di bawah grafik ── */}
            <div style={s.tideStatsRow}>
              <div style={s.tideStat}>
                <span style={s.tideStatLabel}>Tertinggi hari ini</span>
                <span style={{ ...s.tideStatValue, color: "#d97706" }}>
                  {tideChartData.length
                    ? `${Math.round(Math.max(...tideChartData.map(p => Number(p.tide_height_digital || 0))) * 100)} cm`
                    : "-"}
                </span>
              </div>
              <div style={s.tideStatDivider} />
              <div style={s.tideStat}>
                <span style={s.tideStatLabel}>Terendah hari ini</span>
                <span style={{ ...s.tideStatValue, color: "#0284c7" }}>
                  {tideChartData.length
                    ? `${Math.round(Math.min(...tideChartData.filter(p => p.tide_height_digital != null).map(p => Number(p.tide_height_digital))) * 100)} cm`
                    : "-"}
                </span>
              </div>
              <div style={s.tideStatDivider} />
              <div style={s.tideStat}>
                <span style={s.tideStatLabel}>Rata-rata</span>
                <span style={{ ...s.tideStatValue, color: "#475569" }}>
                  {tideChartData.length
                    ? `${Math.round(
                        tideChartData
                          .filter(p => p.tide_height_digital != null)
                          .reduce((sum, p) => sum + Number(p.tide_height_digital), 0) /
                        tideChartData.filter(p => p.tide_height_digital != null).length * 100
                      )} cm`
                    : "-"}
                </span>
              </div>
              <div style={s.tideStatDivider} />
              <div style={s.tideStat}>
                <span style={s.tideStatLabel}>Status terkini</span>
                <span style={{ ...s.tideStatValue, color: "#16a34a", display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a", display: "inline-block" }} />
                  {latestTide?.status || "-"}
                </span>
              </div>
            </div>

            <button
              style={{ ...s.detailBtn, borderColor: "#f59e0b", color: "#f59e0b", marginTop: 14 }}
              onClick={() => navigate(ROUTE_PASANG_SURUT)}
            >
              Lihat grafik lengkap <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>

          {/* Wilayah siaga */}
          <div style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitleWrap}>
                <div style={{ ...s.cardIconBox, background: "#fef2f2" }}>
                  <i className="ti ti-alert-triangle" style={{ fontSize: 14, color: "#ef4444" }} />
                </div>
                <span style={s.cardTitle}>Wilayah Siaga</span>
              </div>
              <span style={s.cardSubtitle}>
                {siagaAreas.length} dari {robData.length} wilayah
              </span>
            </div>

            {siagaAreas.length === 0 ? (
              <div style={s.emptyState}>
                <i className="ti ti-circle-check" style={{ fontSize: 28, color: "#16a34a" }} />
                <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>
                  Tidak ada wilayah siaga saat ini.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {siagaAreas.map((area, i) => {
                  const level = getRobPotential(area.tinggi_rob);
                  const badge = robBadgeStyle(level);
                  const barPct = Math.min(
                    100,
                    Math.round((area.tinggi_rob / maxRobInSiaga) * 100)
                  );
                  return (
                    <div key={area.id || i} style={s.siagaRow}>
                      <div style={s.siagaRank}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={s.siagaName}>{area.nama_wilayah}</div>
                        <div style={s.siagaSub}>{area.tinggi_rob} m tergenang</div>
                        <div style={s.barTrack}>
                          <div
                            style={{
                              ...s.barFill,
                              width: `${barPct}%`,
                              background: badge.bar,
                            }}
                          />
                        </div>
                      </div>
                      <span
                        style={{
                          ...s.badge,
                          background: badge.bg,
                          color: badge.text,
                          flexShrink: 0,
                        }}
                      >
                        {level}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              style={{ ...s.detailBtn, borderColor: "#ef4444", color: "#ef4444", marginTop: 14 }}
              onClick={() => navigate(ROUTE_PETA)}
            >
              Lihat semua wilayah <i className="ti ti-arrow-right" style={{ fontSize: 11 }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────

function StatCard({ label, value, sub, accent, accentBg, icon }) {
  return (
    <div style={{ ...s.statCard, borderTop: `3px solid ${accent}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={s.statLabel}>{label}</span>
        <div
          style={{
            width: 32, height: 32, borderRadius: 8, background: accentBg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}
        >
          <i className={`ti ${icon}`} style={{ fontSize: 16, color: accent }} />
        </div>
      </div>
      <div style={s.statVal}>{value}</div>
      <div style={{ fontSize: 11, color: accent, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        {sub}
      </div>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={s.emptyState}>
      <i className="ti ti-info-circle" style={{ fontSize: 28, color: "#94a3b8" }} />
      <p style={{ fontSize: 13, color: "#64748b", marginTop: 6 }}>{text}</p>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Smooth curve helper (Catmull-Rom → cubic Bézier)
// ─────────────────────────────────────────────
function buildSmoothPath(pts) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] || p2;
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
}

// ─────────────────────────────────────────────
//  TideTrendChart — upgraded (hover tooltip,
//  draw animation, pulse dot, Catmull-Rom curve)
// ─────────────────────────────────────────────
function TideTrendChart({ data }) {
  const rawId = useId();
  const uid = rawId.replace(/[:]/g, "");
  const [hoverIdx, setHoverIdx] = useState(null);

  const W = 560, H = 170;
  const PAD_L = 34, PAD_R = 10, PAD_T = 24, PAD_B = 22;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const baseline = PAD_T + plotH;
  const denom = Math.max(data.slice(0, 24).length - 1, 1);

  const points = data.slice(0, 24);

  // Only real readings — future/empty hours are not forced to 0
  const valid = points
    .map((p, i) => ({ i, jam: p.jam, h: p.tide_height_digital, status: p.status }))
    .filter((p) => p.h != null);

  if (valid.length === 0) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "28px 0" }}>
        <Waves size={26} color="#cbd5e1" />
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 8 }}>
          Data pasang surut belum tersedia.
        </p>
      </div>
    );
  }

  const cmValues = valid.map((p) => Number(p.h) * 100);
  const maxVal = Math.max(...cmValues);
  const minVal = Math.min(...cmValues);
  const pad = (maxVal - minVal) * 0.2 || 12;
  const yTop = maxVal + pad;
  const yBot = Math.max(0, minVal - pad);
  const yRange = yTop - yBot || 1;

  function toXY(i, cmVal) {
    const x = PAD_L + (i / denom) * plotW;
    const y = PAD_T + plotH - ((cmVal - yBot) / yRange) * plotH;
    return [x, y];
  }

  const xyPoints = valid.map((p) => toXY(p.i, Number(p.h) * 100));
  const linePath = buildSmoothPath(xyPoints);
  const areaPath = `${linePath} L ${xyPoints[xyPoints.length - 1][0].toFixed(2)} ${baseline} L ${xyPoints[0][0].toFixed(2)} ${baseline} Z`;

  const peakLocalIdx = cmValues.indexOf(maxVal);
  const troughLocalIdx = cmValues.indexOf(minVal);
  const lastLocalIdx = valid.length - 1;
  const lastXY = xyPoints[lastLocalIdx];
  const lastOriginalIdx = valid[lastLocalIdx].i;
  const hasFuture = lastOriginalIdx < points.length - 1;

  const gridLines = Array.from({ length: 4 }, (_, k) => {
    const val = yBot + (k / 3) * yRange;
    const [, gy] = toXY(0, val);
    return { y: gy, label: Math.round(val) };
  });

  const xTicks = [0, 6, 12, 18, 23].map((h) => {
    const idx = Math.min(h, points.length - 1);
    const [tx] = toXY(idx, 0);
    return { x: tx, label: `${String(h).padStart(2, "0")}:00` };
  });

  const hovered = hoverIdx != null ? valid[hoverIdx] : null;
  const hoverXY = hovered ? toXY(hovered.i, Number(hovered.h) * 100) : null;

  function handleMove(e) {
    const svg = e.currentTarget.ownerSVGElement;
    const rect = svg.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0, best = Infinity;
    xyPoints.forEach(([x], idx) => {
      const d = Math.abs(x - relX);
      if (d < best) { best = d; nearest = idx; }
    });
    setHoverIdx(nearest);
  }

  return (
    <div style={{ position: "relative" }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: 180, display: "block", overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={`grad-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#fbbf24" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
          <clipPath id={`clip-${uid}`}>
            <rect x={PAD_L} y={PAD_T - 4} width={plotW} height={plotH + 4} />
          </clipPath>
        </defs>

        <text x={PAD_L} y={13} fontSize="9" fill="#cbd5e1" textAnchor="start">cm</text>

        {gridLines.map((g, k) => (
          <g key={k}>
            <line
              x1={PAD_L} y1={g.y} x2={W - PAD_R} y2={g.y}
              stroke={k === 0 ? "#e2e8f0" : "#f1f5f9"}
              strokeWidth={k === 0 ? 1 : 0.75}
              strokeDasharray={k === 0 ? "0" : "3,3"}
            />
            <text x={PAD_L - 6} y={g.y + 3} fontSize="9" fill="#94a3b8" textAnchor="end">
              {g.label}
            </text>
          </g>
        ))}

        {xTicks.slice(1, -1).map((t, k) => (
          <line key={k}
            x1={t.x} y1={PAD_T} x2={t.x} y2={baseline}
            stroke="#f1f5f9" strokeWidth="0.75" strokeDasharray="2,4"
          />
        ))}

        {hasFuture && lastXY[0] < W - PAD_R - 36 && (
          <text
            x={(lastXY[0] + (W - PAD_R)) / 2}
            y={baseline - 6}
            fontSize="9"
            fill="#cbd5e1"
            textAnchor="middle"
            fontStyle="italic"
          >
            menunggu data
          </text>
        )}

        <g clipPath={`url(#clip-${uid})`}>
          <path d={areaPath} fill={`url(#grad-${uid})`} />
          <path
            d={linePath}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            className={`tide-draw-${uid}`}
          />
        </g>

        {/* Trough marker */}
        <circle
          cx={xyPoints[troughLocalIdx][0]}
          cy={xyPoints[troughLocalIdx][1]}
          r="3.5"
          fill="#fff"
          stroke="#0ea5e9"
          strokeWidth="2"
        />

        {/* Peak marker */}
        {peakLocalIdx !== troughLocalIdx && (
          <circle
            cx={xyPoints[peakLocalIdx][0]}
            cy={xyPoints[peakLocalIdx][1]}
            r="3.5"
            fill="#fff"
            stroke="#f59e0b"
            strokeWidth="2"
          />
        )}

        {/* "Now" pulse marker */}
        {lastLocalIdx !== peakLocalIdx && lastLocalIdx !== troughLocalIdx && (
          <g>
            <circle
              cx={lastXY[0]}
              cy={lastXY[1]}
              r="5"
              fill="#f59e0b"
              opacity="0.45"
              className={`tide-pulse-${uid}`}
            />
            <circle
              cx={lastXY[0]}
              cy={lastXY[1]}
              r="3.5"
              fill="#f59e0b"
              stroke="#fff"
              strokeWidth="1.5"
            />
          </g>
        )}

        {/* Hover crosshair */}
        {hoverXY && (
          <g>
            <line
              x1={hoverXY[0]} y1={PAD_T}
              x2={hoverXY[0]} y2={baseline}
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="3,3"
            />
            <circle
              cx={hoverXY[0]}
              cy={hoverXY[1]}
              r="4.5"
              fill="#fff"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </g>
        )}

        {/* X-axis labels */}
        {xTicks.map((t, k) => (
          <text key={k} x={t.x} y={H - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">
            {t.label}
          </text>
        ))}

        {/* Invisible hit area for hover */}
        <rect
          x={PAD_L}
          y={PAD_T - 8}
          width={plotW}
          height={plotH + 16}
          fill="transparent"
          onMouseMove={handleMove}
        />
      </svg>

      {/* Floating tooltip */}
      {hovered && hoverXY && (
        <div
          style={{
            position: "absolute",
            left: `${(hoverXY[0] / W) * 100}%`,
            top: `${(hoverXY[1] / H) * 100}%`,
            transform: "translate(-50%, -135%)",
            background: "#0f172a",
            color: "#fff",
            padding: "5px 9px",
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 10px rgba(15,23,42,0.25)",
            zIndex: 10,
          }}
        >
          {String(hovered.jam).padStart(2, "0")}:00 · {Math.round(Number(hovered.h) * 100)} cm
        </div>
      )}

      <style>{`
        .tide-draw-${uid} {
          animation: tideDraw-${uid} 1.1s ease-out forwards;
        }
        @keyframes tideDraw-${uid} {
          from { stroke-dashoffset: 1; }
          to   { stroke-dashoffset: 0; }
        }
        .tide-pulse-${uid} {
          transform-box: fill-box;
          transform-origin: center;
          animation: tidePulse-${uid} 2s ease-out infinite;
        }
        @keyframes tidePulse-${uid} {
          0%   { transform: scale(0.6); opacity: 0.55; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .tide-draw-${uid}  { animation: none; stroke-dashoffset: 0; }
          .tide-pulse-${uid} { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Styles
// ─────────────────────────────────────────────
const s = {
  page: { minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" },
  loadWrap: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh" },
  content: { padding: "24px 28px", paddingTop: "86px", display: "flex", flexDirection: "column", gap: 16 },

  // Stat grid
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  statCard: { background: "#ffffff", borderRadius: 12, padding: "16px 18px", border: "1px solid #e2e8f0" },
  statLabel: { fontSize: 11, color: "#64748b", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" },
  statVal: { fontSize: 28, fontWeight: 700, color: "#0f172a", marginTop: 10, lineHeight: 1 },

  // Monitoring — 3 card individual
  monGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  monCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  monCardHeader: { display: "flex", alignItems: "center", gap: 10 },
  monCardTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.2 },
  monCardSub: { fontSize: 10, color: "#94a3b8", marginTop: 2 },
  monItems: { display: "flex", flexDirection: "column", gap: 0, flex: 1 },
  monItemRow: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "7px 0", borderBottom: "1px solid #f1f5f9",
  },
  monItemLabel: { fontSize: 12, color: "#64748b" },
  monItemValue: { fontSize: 12, fontWeight: 600, color: "#0f172a", textAlign: "right" },

  // Tombol detail
  detailBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "6px 12px",
    borderRadius: 7,
    border: "1px solid",
    background: "transparent",
    fontSize: 11,
    fontWeight: 600,
    cursor: "pointer",
    alignSelf: "flex-start",
    transition: "background 0.15s",
  },

  // Card generik
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px 20px" },
  cardHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 },
  cardTitleWrap: { display: "flex", alignItems: "center", gap: 8 },
  cardIconBox: { width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  cardTitle: { fontSize: 13, fontWeight: 700, color: "#0f172a" },
  cardSubtitle: { fontSize: 11, color: "#94a3b8", fontWeight: 500 },

  // Bottom row
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },

  // Stat ringkas di bawah grafik
  tideStatsRow: {
    display: "flex",
    alignItems: "stretch",
    background: "#f8fafc",
    borderRadius: 8,
    border: "1px solid #f1f5f9",
    marginTop: 12,
    overflow: "hidden",
  },
  tideStat: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "8px 6px",
    gap: 3,
  },
  tideStatDivider: { width: "1px", background: "#e2e8f0", flexShrink: 0 },
  tideStatLabel: { fontSize: 10, color: "#94a3b8", textAlign: "center", lineHeight: 1.3 },
  tideStatValue: { fontSize: 13, fontWeight: 700, textAlign: "center" },

  // Empty state
  emptyState: { display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0" },

  // Siaga list
  siagaRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f1f5f9" },
  siagaRank: {
    width: 20, height: 20, borderRadius: "50%",
    background: "#f8fafc", border: "1px solid #e2e8f0",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 600, color: "#94a3b8", flexShrink: 0,
  },
  siagaName: { fontSize: 12, fontWeight: 600, color: "#0f172a" },
  siagaSub: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  barTrack: { height: 3, borderRadius: 2, background: "#f1f5f9", marginTop: 6, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 2, transition: "width 0.4s ease" },
  badge: { display: "inline-block", padding: "2px 8px", borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" },
};