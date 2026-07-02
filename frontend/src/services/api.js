import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Otomatis pasang token di setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Otomatis handle 401 — redirect ke login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Endpoint login yang sebenarnya dipakai di Login.jsx: api.post("/TIALA-Endmin", form)
    const isLoginEndpoint = err.config?.url?.includes("/TIALA-Endmin");

    // Jangan redirect jika error dari endpoint login itu sendiri
    if (err.response?.status === 401 && !isLoginEndpoint) {
      localStorage.clear();
      window.location.href = "/TIALA-Endmin";
    }
    return Promise.reject(err);
  }
);

// Ambil semua pengguna (dengan opsional search & role filter)
export const getUsers = (params = {}) =>
  api.get("/admin/users", { params });

// Buat pengguna baru
export const createUser = (data) =>
  api.post("/admin/users", data);

// Update data pengguna (nama, email, role)
export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

// Ganti password pengguna
export const updateUserPassword = (id, data) =>
  api.patch(`/admin/users/${id}/password`, data);

// Toggle aktif / nonaktif
export const toggleUserStatus = (id) =>
  api.patch(`/admin/users/${id}/toggle`);

export default api;