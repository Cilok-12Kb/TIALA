// src/pages/Admin/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../../services/api";
import bmkgLogo from "../../assets/images/Logo.png";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [tokenValid, setTokenValid]     = useState(null); // null=loading, true, false
  const [tokenMessage, setTokenMessage] = useState("");

  const [form, setForm]       = useState({ password: "", password_confirmation: "" });
  const [showPwd, setShowPwd] = useState({ password: false, confirm: false });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  // ── Validasi token saat halaman dibuka ─────────────────────────────────────
  useEffect(() => {
    if (!token || !email) {
      setTokenValid(false);
      setTokenMessage("Link reset password tidak lengkap atau tidak valid.");
      return;
    }

    api
      .get("/TIALA-Endmin/reset-password/validate", {
        params: { token, email },
      })
      .then(() => setTokenValid(true))
      .catch((err) => {
        setTokenValid(false);
        setTokenMessage(
          err.response?.data?.message ??
          "Link reset password tidak valid atau telah kedaluwarsa."
        );
      });
  }, [token, email]);

  // ── Validasi password lokal ────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (form.password.length < 8)
      e.password = "Password minimal 8 karakter.";
    if (form.password !== form.password_confirmation)
      e.password_confirmation = "Konfirmasi password tidak cocok.";
    return e;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);

    try {
      await api.post("/TIALA-Endmin/reset-password", {
        token,
        email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
      });
      setDone(true);
      // Redirect ke login setelah 3 detik
      setTimeout(() => navigate("/TIALA-Endmin"), 3000);
    } catch (err) {
      setErrors({
        global:
          err.response?.data?.message ??
          "Gagal mereset password. Silakan coba kembali.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Kekuatan password ──────────────────────────────────────────────────────
  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8)  score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  })();

  const strengthLabel = ["", "Sangat Lemah", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][strength];
  const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0284c7"][strength];

  // ── UI States ──────────────────────────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <Loading />
        </div>
      </div>
    );
  }

  if (tokenValid === false) {
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} />
        <div style={s.card}>
          <Brand />
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ ...s.iconWrap, background: "linear-gradient(135deg, #fef2f2, #fecaca)" }}>
              <i className="ti ti-link-off" style={{ fontSize: 28, color: "#dc2626" }} />
            </div>
            <h2 style={{ ...s.heading, color: "#991b1b" }}>Link Tidak Valid</h2>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.6, marginBottom: 20 }}>
              {tokenMessage}
            </p>
            <Link to="/TIALA-Endmin/forgot-password" style={s.btn2}>
              <i className="ti ti-refresh" style={{ fontSize: 15 }} />
              Minta Link Baru
            </Link>
            <div style={{ marginTop: 16 }}>
              <Link to="/TIALA-Endmin" style={s.backLink}>
                <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
                Kembali ke login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div style={s.page}>
        <div style={s.blob1} /><div style={s.blob2} />
        <div style={s.card}>
          <Brand />
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={s.iconWrap}>
              <i className="ti ti-circle-check" style={{ fontSize: 32, color: "#22c55e" }} />
            </div>
            <h2 style={s.heading}>Password Berhasil Diubah!</h2>
            <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6, marginBottom: 8 }}>
              Password Anda telah diperbarui. Anda akan diarahkan ke halaman login
              dalam beberapa detik.
            </p>
            <Link to="/TIALA-Endmin" style={s.btn2}>
              <i className="ti ti-login" style={{ fontSize: 15 }} />
              Ke Halaman Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Form utama ─────────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <div style={s.blob1} /><div style={s.blob2} />
      <div style={s.card}>
        <Brand />
        <div style={s.iconWrap}>
          <i className="ti ti-lock-password" style={{ fontSize: 28, color: "#0284c7" }} />
        </div>
        <h2 style={s.heading}>Buat Password Baru</h2>
        <p style={s.sub}>
          Masukkan password baru untuk akun <strong>{email}</strong>.
        </p>

        {errors.global && (
          <div style={s.errorBox}>
            <i className="ti ti-alert-circle" style={{ fontSize: 15 }} />
            {errors.global}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          {/* Password */}
          <div style={s.field}>
            <label style={s.label}>
              <i className="ti ti-lock" style={{ fontSize: 13, color: "#0284c7" }} />
              Password Baru
            </label>
            <div style={s.inputWrap}>
              <input
                style={{ ...s.input, paddingRight: 40 }}
                type={showPwd.password ? "text" : "password"}
                placeholder="Minimal 8 karakter"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoFocus
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPwd((p) => ({ ...p, password: !p.password }))}
              >
                <i
                  className={`ti ti-eye${showPwd.password ? "-off" : ""}`}
                  style={{ fontSize: 15, color: "#94a3b8" }}
                />
              </button>
            </div>
            {/* Strength bar */}
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={s.strengthTrack}>
                  {[1,2,3,4,5].map((i) => (
                    <div
                      key={i}
                      style={{
                        ...s.strengthBar,
                        background: i <= strength ? strengthColor : "#e2e8f0",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColor, fontWeight: 600 }}>
                  {strengthLabel}
                </span>
              </div>
            )}
            {errors.password && <span style={s.errText}>{errors.password}</span>}
          </div>

          {/* Konfirmasi */}
          <div style={s.field}>
            <label style={s.label}>
              <i className="ti ti-lock-check" style={{ fontSize: 13, color: "#0284c7" }} />
              Konfirmasi Password
            </label>
            <div style={s.inputWrap}>
              <input
                style={{ ...s.input, paddingRight: 40 }}
                type={showPwd.confirm ? "text" : "password"}
                placeholder="Ulangi password baru"
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({ ...form, password_confirmation: e.target.value })
                }
                required
              />
              <button
                type="button"
                style={s.eyeBtn}
                onClick={() => setShowPwd((p) => ({ ...p, confirm: !p.confirm }))}
              >
                <i
                  className={`ti ti-eye${showPwd.confirm ? "-off" : ""}`}
                  style={{ fontSize: 15, color: "#94a3b8" }}
                />
              </button>
            </div>
            {form.password_confirmation && form.password === form.password_confirmation && (
              <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>
                ✓ Password cocok
              </span>
            )}
            {errors.password_confirmation && (
              <span style={s.errText}>{errors.password_confirmation}</span>
            )}
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? (
              <>
                <i
                  className="ti ti-loader-2"
                  style={{ fontSize: 16, animation: "spin 1s linear infinite" }}
                />
                Menyimpan...
              </>
            ) : (
              <>
                <i className="ti ti-device-floppy" style={{ fontSize: 16 }} />
                Simpan Password Baru
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: 18 }}>
          <Link to="/TIALA-Endmin" style={s.backLink}>
            <i className="ti ti-arrow-left" style={{ fontSize: 13 }} />
            Kembali ke login
          </Link>
        </div>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function Brand() {
  return (
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
  );
}

function Loading() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <i
        className="ti ti-loader-2"
        style={{
          fontSize: 36,
          color: "#0284c7",
          animation: "spin 1s linear infinite",
          display: "block",
          marginBottom: 12,
        }}
      />
      <p style={{ color: "#64748b", fontSize: 14 }}>Memvalidasi link...</p>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
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
    padding: "36px 32px", width: "100%", maxWidth: 420,
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
  label: { fontSize: 12, fontWeight: 600, color: "#475569", display: "flex", alignItems: "center", gap: 5 },
  inputWrap: { position: "relative" },
  input: {
    width: "100%", boxSizing: "border-box",
    padding: "10px 12px", borderRadius: 8,
    border: "1px solid #e2e8f0", fontSize: 13,
    color: "#0f172a", outline: "none", background: "#f8fafc",
  },
  eyeBtn: {
    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer", padding: 2,
  },
  strengthTrack: { display: "flex", gap: 4, marginBottom: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, transition: "background 0.3s" },
  errText: { fontSize: 11, color: "#dc2626", fontWeight: 500 },
  btn: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "11px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "#ffffff", fontSize: 14, fontWeight: 600, cursor: "pointer", marginTop: 4,
  },
  btn2: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    gap: 8, padding: "11px 24px", borderRadius: 8, border: "none",
    background: "linear-gradient(135deg, #0284c7, #0369a1)",
    color: "#ffffff", fontSize: 14, fontWeight: 600,
    cursor: "pointer", textDecoration: "none",
  },
  backLink: {
    display: "inline-flex", alignItems: "center", gap: 5,
    color: "#0284c7", fontSize: 13, textDecoration: "none", fontWeight: 500,
  },
};