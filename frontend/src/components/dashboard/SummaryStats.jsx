// src/components/dashboard/SummaryStats.jsx
import {
  LocationPinIcon,
  AlertTriangleIcon,
  WaveIcon,
  ThermometerIcon,
} from "./icons";

export default function SummaryStats({ robData, weatherData }) {
  const maxRob = robData.length
    ? Math.max(...robData.map((i) => i.tinggi_rob))
    : 0;
  const highCount = robData.filter((i) => i.tinggi_rob >= 0.7).length;
  const avgTemp = weatherData.length
    ? (
        weatherData.reduce((s, i) => s + Number(i.t || 0), 0) /
        weatherData.length
      ).toFixed(1)
    : "-";

  const stats = [
    {
      label: "Lokasi Dipantau",
      value: robData.length || "-",
      unit: "titik",
      icon: <LocationPinIcon />,
      color: "blue",
    },
    {
      label: "Siaga Tinggi",
      value: highCount || "0",
      unit: "area",
      icon: <AlertTriangleIcon size={20} strokeWidth={2} />,
      color: "red",
    },
    {
      label: "Tinggi Rob Maks",
      value: maxRob.toFixed(2),
      unit: "meter",
      icon: <WaveIcon size={20} />,
      color: "amber",
    },
    {
      label: "Suhu Rata-rata",
      value: avgTemp,
      unit: "°C",
      icon: <ThermometerIcon />,
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