// src/pages/Admin/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/api";
import bmkgLogo from "../../assets/images/Logo.png";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/TIALA-Endmin", form);
      const { token, user } = res.data;

      // Simpan semua data user ke localStorage
      localStorage.setItem("token",   token);
      localStorage.setItem("role",    user.role);
      localStorage.setItem("name",    user.name);
      localStorage.setItem("email",   user.email);
      localStorage.setItem("phone",   user.phone    ?? "");
      localStorage.setItem("jabatan", user.jabatan  ?? "");
      localStorage.setItem("user_id", user.id);

      navigate("/ocean-dashboard");
    } catch (err) {
      setError(err.response?.data?.message ?? "Login gagal. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Decorative blobs */}
      <div style={s.blob1} />
      <div style={s.blob2} />

      <div style={s.card}>
        {/* Brand */}
        <div style={s.brand}>
          <div style={s.brandIcon}>
            <img
              src={bmkgLogo}
              alt="TIALA Logo"
              style={s.logo}
            />
          </div>
          <div>
            <div style={s.brandTitle}>TIALA</div>
            <div style={s.brandSub}>Admin Panel</div>
          </div>
        </div>

        <h2 style={s.heading}>Masuk ke Dashboard</h2>
        <p style={s.sub}>Gunakan akun admin yang telah terdaftar</p>

        {error && (
          <div style={s.errorBox}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div style={s.field}>
            <label style={s.label}>
              <i className="ti ti-mail" style={{ fontSize: 13, color: "#0284c7" }} />
              Email
            </label>
            <input
              style={s.input}
              type="email"
              placeholder="admin@tiala.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div style={s.field}>
            <div style={s.labelRow}>
              <label style={s.label}>
                <i className="ti ti-lock" style={{ fontSize: 13, color: "#0284c7" }} />
                Password
              </label>
              {/* ── Tombol Lupa Password ── */}
              <Link
                to="/TIALA-Endmin/forgot-password"
                style={s.forgotLink}
                tabIndex={0}
              >
                Lupa password?
              </Link>
            </div>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? (
              <>
                <i
                  className="ti ti-loader-2"
                  style={{ fontSize: 16, animation: "spin 1s linear infinite" }}
                />
                Memproses...
              </>
            ) : (
              <>
                <i className="ti ti-login" style={{ fontSize: 16 }} />
                Masuk
              </>
            )}
          </button>
        </form>

        {/* Divider + info */}
        <div style={s.divider}>
          <div style={s.dividerLine} />
          <span style={s.dividerText}>info</span>
          <div style={s.dividerLine} />
        </div>

        <div style={s.infoBox}>
          <i className="ti ti-shield-lock" style={{ fontSize: 14, color: "#0369a1", flexShrink: 0 }} />
          <span>
            Reset password hanya tersedia untuk akun <strong>Super Admin</strong>.
          </span>
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, position: "relative", overflow: "hidden",
  },
  blob1: {
    position: "absolute", top: -80, right: -80,
    width: 320, height: 320, borderRadius: "50%",
    background: "rgba(2,132,199,0.12)", pointerEvents: "none",
  },
  blob2: {
    position: "absolute", bottom: -100, left: -60,
    width: 280, height: 280, borderRadius: "50%",
    background: "rgba(14,165,233,0.08)", pointerEvents: "none",
  },
  card: {
    position: "relative", background: "#ffffff", borderRadius: 20,
    padding: "36px 32px", width: "100%", maxWidth: 400,
    boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
  },
  brand:     { display: "flex", alignItems: "center", gap: 12, marginBottom: 28 },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 8,
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: { fontSize: 16, fontWeight: 700, color: "#0c4a6e" },
  brandSub:   { fontSize: 11, color: "#94a3b8" },
  heading: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  sub:     { fontSize: 13, color: "#64748b", marginBottom: 20 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#991b1b", borderRadius: 8,
    padding: "10px 12px", fontSize: 13, marginBottom: 8,
  },
  field:    { display: "flex", flexDirection: "column", gap: 6 },
  labelRow: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  label: {
    fontSize: 12, fontWeight: 600, color: "#475569",
    display: "flex", alignItems: "center", gap: 5,
  },
  forgotLink: {
    fontSize: 12, color: "#0284c7", textDecoration: "none",
    fontWeight: 500,
    // Subtle hover handled via inline — for full hover use CSS class
  },
  input: {
    padding: "10px 12px", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: 13,
    color: "#0f172a", outline: "none", background: "#f8fafc",
  },
  btn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "11px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "#ffffff", fontSize: 14, fontWeight: 600,
    cursor: "pointer", marginTop: 4,
  },
  divider: {
    display: "flex", alignItems: "center", gap: 10, margin: "20px 0 12px",
  },
  dividerLine: { flex: 1, height: 1, background: "#e2e8f0" },
  dividerText: { fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.5px" },
  infoBox: {
    display: "flex", alignItems: "flex-start", gap: 8,
    background: "#f0f9ff", border: "1px solid #bae6fd",
    borderRadius: 8, padding: "10px 12px",
    fontSize: 12, color: "#0c4a6e", lineHeight: 1.5,
  },
};