// src/components/EndminTopbar.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function EndminTopbar() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const formatDate = (d) =>
    d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div style={s.topbar}>
      <div style={s.left}>
        <div style={s.titleRow}>
          <div style={s.pulse} />
          <span style={s.pageTitle}>Dashboard Overview</span>
          <span style={s.liveBadge}>LIVE</span>
        </div>
        <div style={s.pageMeta}>
          <i className="ti ti-calendar" style={{ fontSize: 11, marginRight: 4 }} />
          {formatDate(time)} — {formatTime(time)} WIB
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          style={s.iconBtn}
          onClick={() => window.location.reload()}
          title="Refresh data"
        >
          <i className="ti ti-refresh" style={{ fontSize: 15, color: "#bbf7d0" }} />
        </button>
        <button
          style={s.iconBtn}
          onClick={() => navigate("/ocean-dashboard/profil")}
          title="Profil"
        >
          <i className="ti ti-user" style={{ fontSize: 15, color: "#bbf7d0" }} />
        </button>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}

const s = {
  topbar: {
    background: "#15803d",
    borderBottom: "1px solid #166534",
    padding: "12px 28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    position: "fixed",
    top: 0,
    left: 240,
    right: 0,
    zIndex: 50,
    boxShadow: "0 1px 8px rgba(0,0,0,0.12)",
  },
  left: {
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  titleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  pulse: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#86efac",
    animation: "pulseDot 2s ease-in-out infinite",
    flexShrink: 0,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "0.01em",
  },
  liveBadge: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: "0.08em",
    color: "#15803d",
    background: "#86efac",
    padding: "2px 7px",
    borderRadius: 20,
  },
  pageMeta: {
    fontSize: 11,
    color: "#86efac",
    display: "flex",
    alignItems: "center",
    paddingLeft: 15,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "rgba(0,0,0,0.15)",
    border: "1px solid rgba(255,255,255,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.15s",
  },
};