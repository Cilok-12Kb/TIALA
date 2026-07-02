// src/components/pengguna/UserModal.jsx
import { useState } from "react";
import { Edit2, Plus, X, Eye, EyeOff, ChevronDown, RefreshCw } from "lucide-react";
import { ROLES, ROLE_LABEL } from "./RoleBadge";

export default function UserModal({ mode, user, onClose, onSave }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    name:                  user?.name  || "",
    email:                 user?.email || "",
    role:                  user?.role  || "staff",
    password:              "",
    password_confirmation: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name  = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Format email tidak valid";
    if (!isEdit && !form.password) e.password = "Password wajib diisi untuk pengguna baru";
    if (form.password && form.password.length < 8) e.password = "Password minimal 8 karakter";
    if (form.password && form.password !== form.password_confirmation)
      e.password_confirmation = "Konfirmasi password tidak cocok";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try { await onSave(form); } catch {} finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {isEdit ? <Edit2 size={18} className="text-blue-600" /> : <Plus size={18} className="text-emerald-600" />}
            <h2 className="font-bold text-gray-800">{isEdit ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Nama Lengkap</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Contoh: Budi Santoso"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.name ? "border-red-400" : "border-gray-200"}`} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@tiala.id"
              className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.email ? "border-red-400" : "border-gray-200"}`} />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Role</label>
            <div className="relative">
              <select value={form.role} onChange={e => set("role", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm outline-none appearance-none bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
              {isEdit ? "Password Baru (kosongkan jika tidak diubah)" : "Password"}
            </label>
            <div className="relative">
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.password ? "border-red-400" : "border-gray-200"}`} />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          {form.password && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Konfirmasi Password</label>
              <input type="password" value={form.password_confirmation} onChange={e => set("password_confirmation", e.target.value)} placeholder="••••••••"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${errors.password_confirmation ? "border-red-400" : "border-gray-200"}`} />
              {errors.password_confirmation && <p className="text-xs text-red-500 mt-1">{errors.password_confirmation}</p>}
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">Batal</button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
            {loading && <RefreshCw size={13} className="animate-spin" />}
            {isEdit ? "Simpan Perubahan" : "Tambah Pengguna"}
          </button>
        </div>
      </div>
    </div>
  );
}