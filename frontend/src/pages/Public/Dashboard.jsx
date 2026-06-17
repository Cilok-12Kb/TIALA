import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PublicNavbar from "../../components/PublicNavbar";
import WeatherMapView from "../../components/weather/WeatherMap";
import RobPotentialMap from "../../components/potensi_rob/RobPotentialMap";
import api from "../../services/api";
import "../../styles/Dashboard.css";

const ROB_AREAS = [
  "Tambakharjo",
  "Tawangsari",
  "Tawangmas",
  "Panggung Lor",
  "Bandarharjo",
  "Tanjung Mas",
  "Kemijen",
  "Tambakrejo",
  "Terboyo Kulon",
  "Terboyo Wetan",
  "Trimulyo",
];

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

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

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getAreaName(item) {
  return item.lokasi || item.desa || item.kelurahan || "-";
}

function getTideValue(item) {
  return Number(item.tide_height || item.kenaikan_air || 0);
}

function getRobPotential(value) {
  if (value >= 2.2) return "Tinggi";
  if (value >= 1.8) return "Sedang";
  if (value >= 1.5) return "Rendah";
  return "Tenang";
}

function getRobPotentialClass(value) {
  if (value >= 2.2) return "tinggi";
  if (value >= 1.8) return "sedang";
  if (value >= 1.5) return "rendah";
  return "tenang";
}

/* ── Alert Banner ── */
function RobAlertBanner({ tideData }) {
  const highAlerts = tideData.filter((item) => getTideValue(item) >= 2.2);
  const medAlerts = tideData.filter(
    (item) => getTideValue(item) >= 1.8 && getTideValue(item) < 2.2
  );

  if (tideData.length === 0) return null;

  const level =
    highAlerts.length > 0 ? "tinggi" : medAlerts.length > 0 ? "sedang" : null;

  if (!level) return null;

  const areas =
    level === "tinggi"
      ? highAlerts.map(getAreaName)
      : medAlerts.map(getAreaName);

  return (
    <div className={`db-alert-banner db-alert-banner--${level}`}>
      <div className="db-alert-banner__icon">
        {level === "tinggi" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        )}
      </div>
      <div className="db-alert-banner__body">
        <span className="db-alert-banner__tag">
          {level === "tinggi" ? "SIAGA ROB TINGGI" : "WASPADA ROB SEDANG"}
        </span>
        <span className="db-alert-banner__text">
          Potensi rob terdeteksi di:{" "}
          <strong>{areas.join(", ")}</strong>. Segera lakukan langkah
          antisipasi.
        </span>
      </div>
      <div className="db-alert-banner__pulse" />
    </div>
  );
}

/* ── Summary Stats ── */
function SummaryStats({ tideData, weatherData }) {
  const maxTide = tideData.length
    ? Math.max(...tideData.map(getTideValue))
    : 0;
  const highCount = tideData.filter((i) => getTideValue(i) >= 2.2).length;
  const avgTemp = weatherData.length
    ? (weatherData.reduce((s, i) => s + Number(i.t || 0), 0) / weatherData.length).toFixed(1)
    : "-";

  const stats = [
    {
      label: "Lokasi Dipantau",
      value: tideData.length || "-",
      unit: "titik",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      ),
      color: "blue",
    },
    {
      label: "Siaga Tinggi",
      value: highCount || "0",
      unit: "area",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      ),
      color: "red",
    },
    {
      label: "Muka Air Maks",
      value: maxTide.toFixed(2),
      unit: "meter",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 12h20M2 6c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3M2 18c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3"/>
        </svg>
      ),
      color: "amber",
    },
    {
      label: "Suhu Rata-rata",
      value: avgTemp,
      unit: "°C",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/>
        </svg>
      ),
      color: "green",
    },
  ];

  return (
    <div className="db-stats-grid">
      {stats.map((s, i) => (
        <div key={i} className={`db-stat-card db-stat-card--${s.color}`}>
          <div className={`db-stat-card__icon db-stat-card__icon--${s.color}`}>
            {s.icon}
          </div>
          <div className="db-stat-card__body">
            <div className="db-stat-card__label">{s.label}</div>
            <div className="db-stat-card__value">
              {s.value}
              <span className="db-stat-card__unit">{s.unit}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Section Header ── */
function SectionHeader({ icon, title, subtitle, linkTo, linkLabel }) {
  const navigate = useNavigate();
  return (
    <div className="db-section-header">
      <div className="db-section-header__left">
        <div className="db-section-header__icon">{icon}</div>
        <div>
          <div className="db-section-header__title">{title}</div>
          {subtitle && (
            <div className="db-section-header__subtitle">{subtitle}</div>
          )}
        </div>
      </div>
      {linkTo && (
        <button
          className="db-detail-btn"
          onClick={() => navigate(linkTo)}
        >
          {linkLabel || "Lihat Detail"}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── Weather Summary Card ── */
function WeatherSummaryCard({ weather, onSelect, isSelected }) {
  const temp = weather?.t ?? "-";
  const humidity = weather?.hu ?? "-";
  const windSpeed = weather?.ws ?? "-";
  const desc = weather?.weather_desc ?? weather?.cuaca ?? "Cerah Berawan";
  const location = weather?.desa || "Semarang";

  return (
    <div
      className={`db-weather-mini ${isSelected ? "db-weather-mini--active" : ""}`}
      onClick={() => onSelect && onSelect(weather)}
    >
      <div className="db-weather-mini__temp">{temp}°</div>
      <div className="db-weather-mini__info">
        <div className="db-weather-mini__loc">{location}</div>
        <div className="db-weather-mini__desc">{desc}</div>
        <div className="db-weather-mini__stats">
          <span>{humidity}% RH</span>
          <span>{windSpeed} km/j</span>
        </div>
      </div>
    </div>
  );
}

/* ── Weather Section ── */
function WeatherSection({
  selectedWeather,
  setSelectedWeather,
  filteredCuaca,
  loading,
  countdown,
  searchKelurahan,
  setSearchKelurahan,
  filterKecamatan,
  setFilterKecamatan,
  kecamatanList,
}) {
  const topItems = filteredCuaca.slice(0, 4);

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 010 9z"/>
          </svg>
        }
        title="Data Cuaca Semarang"
        subtitle={`Sinkronisasi realtime · update ${countdown}d`}
        linkTo="/cuaca"
        linkLabel="Semua Data Cuaca"
      />

      {/* ── Search & Filter dipindah ke sini, di luar map ── */}
      <div className="db-weather-filter">
        <input
          type="text"
          placeholder="Cari kelurahan..."
          className="db-weather-filter__input"
          value={searchKelurahan}
          onChange={(e) => setSearchKelurahan(e.target.value)}
        />
        <select
          className="db-weather-filter__select"
          value={filterKecamatan}
          onChange={(e) => setFilterKecamatan(e.target.value)}
        >
          {kecamatanList.map((kecamatan, index) => (
            <option key={index} value={kecamatan}>
              {kecamatan}
            </option>
          ))}
        </select>
      </div>

      <div className="db-weather-map-wrap">
        <WeatherMapView
          filteredCuaca={filteredCuaca}
          loading={loading}
          countdown={countdown}
          searchKelurahan={searchKelurahan}
          setSearchKelurahan={setSearchKelurahan}
          filterKecamatan={filterKecamatan}
          setFilterKecamatan={setFilterKecamatan}
          kecamatanList={kecamatanList}
          onWeatherSelect={setSelectedWeather}
          showFilters={false}
        />
      </div>

      <div className="db-weather-layout">
        <div className="db-weather-main-card">
          <div className="db-weather-main-card__bg" />
          <div className="db-weather-main-card__content">
            <div className="db-weather-main-card__loc">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {selectedWeather?.desa || "Semarang"}
            </div>
            <div className="db-weather-main-card__temp">
              {selectedWeather?.t ?? "-"}°
            </div>
            <div className="db-weather-main-card__desc">
              {selectedWeather?.weather_desc ?? selectedWeather?.cuaca ?? "Cerah Berawan"}
            </div>
            <div className="db-weather-main-card__row">
              <span>💧 {selectedWeather?.hu ?? "-"}%</span>
              <span>🌬 {selectedWeather?.ws ?? "-"} km/j</span>
              <span>🕐 {formatTime(selectedWeather?.local_datetime)}</span>
            </div>
          </div>
        </div>

        <div className="db-weather-list">
          <div className="db-weather-list__label">Kelurahan lainnya</div>
          {loading ? (
            <div className="db-loading">Memuat data...</div>
          ) : (
            topItems.map((item, i) => (
              <WeatherSummaryCard
                key={item.id || i}
                weather={item}
                onSelect={setSelectedWeather}
                isSelected={selectedWeather?.id === item.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Tide Section ── */
function TideSection({ data }) {
  const sorted = [...data].sort(
    (a, b) => getTideValue(b) - getTideValue(a)
  );
  const preview = sorted.slice(0, 6);

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12h20M2 6c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3M2 18c1.5 2 3 3 5 3s3.5-1 5-3 3.5-3 5-3"/>
          </svg>
        }
        title="Data Pasang Surut"
        subtitle="Potensi rob 11 kelurahan pesisir"
        linkTo="/pasang-surut"
        linkLabel="Detail Pasang Surut"
      />

      {data.length === 0 ? (
        <div className="db-empty">Data pasang surut belum tersedia.</div>
      ) : (
        <div className="db-tide-table-wrap">
          <table className="db-tide-table">
            <thead>
              <tr>
                <th>Lokasi</th>
                <th>Status</th>
                <th>Potensi Rob</th>
                <th>Kenaikan</th>
                <th>Waktu</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((item, index) => {
                const value = getTideValue(item);
                const potential = getRobPotential(value);
                const cls = getRobPotentialClass(value);
                return (
                  <tr key={item.id || index}>
                    <td className="db-tide-table__loc">
                      {getAreaName(item)}
                    </td>
                    <td>
                      <span className={`db-status-pill db-status-pill--${normalizeText(item.status || "")}`}>
                        {item.status || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={`db-rob-badge db-rob-badge--${cls}`}>
                        {potential}
                      </span>
                    </td>
                    <td className="db-tide-table__val">
                      <span className={`db-tide-val db-tide-val--${cls}`}>
                        {value.toFixed(2)} m
                      </span>
                    </td>
                    <td className="db-tide-table__time">
                      {formatDateTime(item.datetime)} WIB
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length > 6 && (
            <div className="db-table-overflow-hint">
              +{sorted.length - 6} lokasi lainnya · klik "Detail Pasang Surut"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Rob Map Section ── */
function RobMapSection({ data }) {
  const highCount = data.filter((i) => getTideValue(i) >= 2.2).length;
  const medCount = data.filter(
    (i) => getTideValue(i) >= 1.8 && getTideValue(i) < 2.2
  ).length;
  const lowCount = data.filter(
    (i) => getTideValue(i) >= 1.5 && getTideValue(i) < 1.8
  ).length;
  const safeCount = data.filter((i) => getTideValue(i) < 1.5).length;

  return (
    <div className="db-card">
      <SectionHeader
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
        }
        title="Peta Potensi Rob"
        subtitle="Sebaran titik terdampak di Semarang"
        linkTo="/peta"
        linkLabel="Buka Peta Lengkap"
      />

      <div className="db-rob-layout">
        <div className="db-rob-legend">
          <div className="db-rob-legend__title">Ringkasan Sebaran</div>
          {[
            { label: "Tinggi", count: highCount, cls: "tinggi" },
            { label: "Sedang", count: medCount, cls: "sedang" },
            { label: "Rendah", count: lowCount, cls: "rendah" },
            { label: "Tenang", count: safeCount, cls: "tenang" },
          ].map((item) => (
            <div key={item.cls} className="db-rob-legend__row">
              <span className={`db-rob-legend__dot db-rob-legend__dot--${item.cls}`} />
              <span className="db-rob-legend__label">{item.label}</span>
              <span className="db-rob-legend__count">{item.count} lokasi</span>
            </div>
          ))}
          <div className="db-rob-legend__divider" />
          <div className="db-rob-legend__note">
            Data diperbarui setiap 60 detik dari sensor BMKG
          </div>
        </div>

        <div className="db-rob-map-wrap">
          <RobPotentialMap locations={data} height="320px" />
        </div>
      </div>
    </div>
  );
}

/* ── Dashboard Content ── */
function DashboardContent() {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [tideData, setTideData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const [searchKelurahan, setSearchKelurahan] = useState("");
  const [filterKecamatan, setFilterKecamatan] = useState("Semua Kecamatan");

  async function fetchWeather() {
    try {
      const response = await api.get("/cuaca-semarang");
      const data = response.data.data || [];
      setWeatherData(data);
      if (!selectedWeather && data.length > 0) {
        setSelectedWeather(data[0]);
      }
    } catch (error) {
      console.error("Gagal mengambil data cuaca:", error);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function fetchTideData() {
    try {
      const response = await api.get("/pasang-surut");
      const rawData = response.data.data || [];
      const filteredData = rawData.filter((item) => {
        const text = normalizeText(JSON.stringify(item));
        return ROB_AREAS.some((area) => text.includes(normalizeText(area)));
      });
      setTideData(filteredData);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    }
  }

  useEffect(() => {
    fetchWeather();
    fetchTideData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchWeather();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const kecamatanList = useMemo(() => {
    const list = weatherData.map((item) => item.kecamatan).filter(Boolean);
    return ["Semua Kecamatan", ...new Set(list)];
  }, [weatherData]);

  const filteredCuaca = useMemo(() => {
    return weatherData.filter((item) => {
      const matchKelurahan = normalizeText(item.desa).includes(
        normalizeText(searchKelurahan)
      );
      const matchKecamatan =
        filterKecamatan === "Semua Kecamatan" ||
        item.kecamatan === filterKecamatan;
      return matchKelurahan && matchKecamatan;
    });
  }, [weatherData, searchKelurahan, filterKecamatan]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="db-page">
      <div className="db-page-header">
        <div>
          <div className="db-page-header__eyebrow">Dashboard BMKG</div>
          <h1 className="db-page-header__title">
            Informasi Cuaca &amp; Potensi Rob
            <span className="db-page-header__place"> Semarang</span>
          </h1>
          <div className="db-page-header__date">{dateStr}</div>
        </div>
        <div className="db-live-badge">
          <span className="db-live-badge__dot" />
          Realtime aktif
        </div>
      </div>

      <RobAlertBanner tideData={tideData} />
      <SummaryStats tideData={tideData} weatherData={weatherData} />

      <WeatherSection
        selectedWeather={selectedWeather || weatherData?.[0]}
        setSelectedWeather={setSelectedWeather}
        filteredCuaca={filteredCuaca}
        loading={loadingWeather}
        countdown={countdown}
        searchKelurahan={searchKelurahan}
        setSearchKelurahan={setSearchKelurahan}
        filterKecamatan={filterKecamatan}
        setFilterKecamatan={setFilterKecamatan}
        kecamatanList={kecamatanList}
      />

      <div className="db-bottom-grid">
        <TideSection data={tideData} />
        <RobMapSection data={tideData} />
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <>
      <PublicNavbar />
      <DashboardContent />
    </>
  );
}