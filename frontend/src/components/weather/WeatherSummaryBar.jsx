// src/components/weather/WeatherSummaryBar.jsx
export default function WeatherSummaryBar({ rata, loading }) {
  const items = [
    {
      icon: "ti-temperature",
      label: "Suhu rata-rata",
      value: rata?.suhu != null ? `${rata.suhu}°C` : "-",
      iconColor: "text-red-500",
      bg: "bg-red-50",
    },
    {
      icon: "ti-droplet",
      label: "Kelembapan",
      value: rata?.kelembapan != null ? `${rata.kelembapan}%` : "-",
      iconColor: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      icon: "ti-wind",
      label: "Kec. angin",
      value: rata?.kecepatan_angin != null ? `${rata.kecepatan_angin} km/j` : "-",
      iconColor: "text-sky-600",
      bg: "bg-sky-100",
    },
    {
      icon: "ti-compass",
      label: "Arah angin dominan",
      value: rata?.arah_angin ?? "-",
      iconColor: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      icon: "ti-cloud",
      label: "Cuaca dominan",
      value: rata?.cuaca ?? "-",
      iconColor: "text-slate-500",
      bg: "bg-slate-100",
    },
  ];

  return (
    <div className="row gx-2 gy-2 px-3 px-md-4 py-3">
      {loading
        ? [...Array(5)].map((_, i) => (
            <div key={i} className="col-6 col-md-4 col-lg">
              <div className="d-flex align-items-center gap-2 bg-slate-100 rounded-lg p-2 p-md-3 h-100">
                <div className="bg-slate-200 rounded-md animate-pulse" style={{ width: 80, height: 14 }} />
              </div>
            </div>
          ))
        : items.map((item) => (
            <div key={item.label} className="col-6 col-md-4 col-lg">
              <div
                className={`d-flex align-items-center gap-2 ${item.bg} rounded-lg p-2 p-md-3 h-100`}
              >
                <div className="d-flex align-items-center justify-content-center bg-white rounded-md flex-shrink-0 shadow-sm w-9 h-9">
                  <i className={`ti ${item.icon} ${item.iconColor}`} style={{ fontSize: 18 }} />
                </div>
                <div className="min-w-0 overflow-hidden">
                  <div className="fw-bold text-slate-900 text-truncate" style={{ fontSize: 15 }}>
                    {item.value}
                  </div>
                  <div className="text-slate-500 text-truncate" style={{ fontSize: 11 }}>
                    {item.label}
                  </div>
                </div>
              </div>
            </div>
          ))}
    </div>
  );
}