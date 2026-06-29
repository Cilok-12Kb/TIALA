// src/pages/Admin/ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import bmkgLogo from "../../assets/images/Logo.png";

export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [status, setStatus]     = useState(null); // "success" | "error"
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);

    try {
      const res = await api.post("/MyOcean-Endmin/forgot-password", { email });
      setStatus("success");
      setMessage(res.data.message);
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message ?? "Terjadi kesalahan. Coba lagi.");
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
                alt="MY_OCEAN Logo"
                style={s.logo}
            />
           </div>
          <div>
            <div style={s.brandTitle}>MY_OCEAN</div>
            <div style={s.brandSub}>Admin Panel</div>
          </div>
        </div>

        {/* Icon lock */}
        <div style={s.iconWrap}>
          <i className="ti ti-lock-open" style={{ fontSize: 28, color: "#0284c7" }} />
        </div>

        <h2 style={s.heading}>Lupa Password?</h2>
        <p style={s.sub}>
          Masukkan email akun <strong>Super Admin</strong> Anda. Kami akan mengirimkan
          link untuk membuat password baru.
        </p>

        {/* Success state */}
        {status === "success" ? (
          <div style={s.successBox}>
            <div style={s.successIcon}>
              <i className="ti ti-mail-check" style={{ fontSize: 32, color: "#0284c7" }} />
            </div>
            <h3 style={s.successTitle}>Email Terkirim!</h3>
            <p style={s.successText}>{message}</p>
            <p style={s.successNote}>
              Periksa folder <strong>Inbox</strong> atau <strong>Spam</strong> Anda.
              Link akan kedaluwarsa dalam <strong>60 menit</strong>.
            </p>
            <Link to="/MyOcean-Endmin" style={s.backLink}>
              <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
              Kembali ke halaman login
            </Link>
          </div>
        ) : (
          <>
            {/* Error alert */}
            {status === "error" && (
              <div style={s.errorBox}>
                <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
                {message}
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
                  Email Super Admin
                </label>
                <input
                  style={s.input}
                  type="email"
                  placeholder="superadmin@myocean.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <button type="submit" style={s.btn} disabled={loading}>
                {loading ? (
                  <>
                    <i
                      className="ti ti-loader-2"
                      style={{ fontSize: 16, animation: "spin 1s linear infinite" }}
                    />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <i className="ti ti-send" style={{ fontSize: 16 }} />
                    Kirim Link Reset
                  </>
                )}
              </button>
            </form>

            <div style={s.footer}>
              <Link to="/MyOcean-Endmin" style={s.backLink}>
                <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
                Kembali ke login
              </Link>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0c4a6e 0%, #0f172a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    position: "relative",
    overflow: "hidden",
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
    position: "relative",
    background: "#ffffff",
    borderRadius: 20,
    padding: "36px 32px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
  },
  brand: { display: "flex", alignItems: "center", gap: 12, marginBottom: 24 },
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

  iconWrap: {
    width: 60, height: 60, borderRadius: 16,
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 16,
  },
  heading: { fontSize: 20, fontWeight: 700, color: "#0f172a", marginBottom: 6 },
  sub: { fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 },

  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "#fef2f2", border: "1px solid #fecaca",
    color: "#991b1b", borderRadius: 8,
    padding: "10px 12px", fontSize: 13, marginBottom: 8,
  },

  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 12, fontWeight: 600, color: "#475569",
    display: "flex", alignItems: "center", gap: 5,
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

  footer: { textAlign: "center", marginTop: 20 },
  backLink: {
    display: "inline-flex", alignItems: "center", gap: 5,
    color: "#0284c7", fontSize: 13, textDecoration: "none", fontWeight: 500,
  },

  // Success state
  successBox: { textAlign: "center", padding: "8px 0" },
  successIcon: {
    width: 72, height: 72, borderRadius: 20,
    background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto 16px",
  },
  successTitle: { fontSize: 18, fontWeight: 700, color: "#0c4a6e", margin: "0 0 8px" },
  successText:  { fontSize: 13, color: "#475569", lineHeight: 1.6, margin: "0 0 12px" },
  successNote:  {
    fontSize: 12, color: "#64748b", lineHeight: 1.6,
    background: "#f8fafc", border: "1px solid #e2e8f0",
    borderRadius: 8, padding: "10px 14px", margin: "0 0 20px",
  },
};