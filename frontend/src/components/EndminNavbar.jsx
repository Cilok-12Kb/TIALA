// src/components/AdminNavbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import bmkgLogo from "../assets/images/Logo.png";

const navSections = [
  {
    label: "UTAMA",
    items: [
      { to: "/ocean-dashboard", label: "Dashboard", icon: "ti-layout-dashboard", end: true },
    ],
  },
  {
    label: "MONITORING",
    items: [
      { to: "/ocean-dashboard/pasang-surut", label: "Pasang Surut", icon: "ti-chart-line" },
      { to: "/ocean-dashboard/peta", label: "Peta & Wilayah Rob", icon: "ti-map-2" },
      { to: "/ocean-dashboard/cuaca", label: "Integrasi Cuaca", icon: "ti-cloud" },
    ],
  },
  {
    label: "MANAJEMEN",
    items: [
      { to: "/ocean-dashboard/pengguna", label: "Pengguna", icon: "ti-users", superAdminOnly: true },
    ],
  },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    navigate("/TIALA-Endmin");
  };

  const userName = localStorage.getItem("name") || "Super Admin";
  const userRole = localStorage.getItem("role") || "";
  const initials = userName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <aside style={st.sidebar}>
      {/* Brand */}
      <div style={st.brand}>
        <div style={st.brandIcon}>
          <img
            src={bmkgLogo}
            alt="TIALA Logo"
            style={st.logo}
          />
        </div>
        <div>
          <div style={st.brandTitle}>TIALA</div>
          <div style={st.brandSub}>ADMIN PANEL</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {navSections.map((section) => (
          <div key={section.label}>
            <div style={st.sectionLabel}>{section.label}</div>
            {section.items
              .filter(item => !item.superAdminOnly || userRole === "super_admin")
              .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                style={({ isActive }) => ({
                  ...st.navItem,
                  background: isActive ? "rgba(96, 165, 250, 0.18)" : "transparent",
                  borderLeft: isActive ? "3px solid #60a5fa" : "3px solid transparent",
                })}
              >
                {({ isActive }) => (
                  <>
                    <i
                      className={`ti ${item.icon}`}
                      style={{ fontSize: 17, color: isActive ? "#93c5fd" : "#7096c4", minWidth: 17 }}
                    />
                    <span style={{ ...st.navLabel, color: isActive ? "#e0f2fe" : "#94b8d6", fontWeight: isActive ? 600 : 400 }}>
                      {item.label}
                    </span>
                    {item.badge && (
                      <span style={{ ...st.badge, background: item.badgeColor }}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom: Profile + Logout */}
      <div style={st.bottom}>
        <div style={st.divider} />

        {/* Profile button */}
        <button style={st.profileBtn} onClick={() => navigate("/ocean-dashboard/profil")}>
          <div style={st.avatar}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
            <div style={st.userName}>{userName}</div>
            <div style={st.userRole}>{userRole}</div>
          </div>
          <i className="ti ti-chevron-right" style={{ fontSize: 14, color: "#4a7fa5" }} />
        </button>

        {/* Logout button */}
        <button style={st.logoutBtn} onClick={handleLogout}>
          <i className="ti ti-logout" style={{ fontSize: 16, color: "#f87171" }} />
          <span style={{ fontSize: 13, color: "#f87171", fontWeight: 500 }}>Keluar</span>
        </button>
      </div>
    </aside>
  );
}

const st = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0c2a4a 0%, #0d3560 50%, #0a2d54 100%)",
    borderRight: "1px solid rgba(96, 165, 250, 0.15)",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    top: 0,
    left: 0,
    zIndex: 100,
    boxShadow: "4px 0 20px rgba(0, 0, 0, 0.3)",
  },
  brand: {
    padding: "18px 16px",
    borderBottom: "1px solid rgba(96, 165, 250, 0.15)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(0, 0, 0, 0.15)",
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: { fontSize: 13, fontWeight: 700, color: "#e0f2fe", letterSpacing: "0.06em" },
  brandSub: { fontSize: 9, color: "#4a7fa5", letterSpacing: "0.1em", marginTop: 1 },
  sectionLabel: {
    fontSize: 10,
    color: "#2e608a",
    letterSpacing: "0.1em",
    padding: "12px 16px 4px",
    fontWeight: 700,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "9px 16px",
    textDecoration: "none",
    transition: "background 0.15s",
    cursor: "pointer",
  },
  navLabel: { fontSize: 13, flex: 1 },
  badge: {
    fontSize: 10,
    color: "#ffffff",
    borderRadius: 20,
    padding: "1px 6px",
    fontWeight: 600,
    flexShrink: 0,
  },
  bottom: {
    padding: "0 0 8px",
    background: "rgba(0, 0, 0, 0.1)",
  },
  divider: { height: 1, background: "rgba(96, 165, 250, 0.15)", margin: "4px 0 8px" },
  profileBtn: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 16px",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    width: "100%",
    borderRadius: 0,
    transition: "background 0.15s",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #0ea5e9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#ffffff",
    flexShrink: 0,
    boxShadow: "0 0 8px rgba(56, 189, 248, 0.35)",
  },
  userName: { fontSize: 12, color: "#bfdbfe", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  userRole: { fontSize: 10, color: "#4a7fa5", marginTop: 1 },
  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "9px 16px",
    background: "rgba(248, 113, 113, 0.08)",
    border: "none",
    cursor: "pointer",
    width: "100%",
    margin: "0",
    borderTop: "1px solid rgba(248, 113, 113, 0.15)",
    transition: "background 0.15s",
  },
};