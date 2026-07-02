import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import AdminNavbar from "../components/EndminNavbar";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!token) {
      navigate("/TIALA-Endmin");
    }
  }, [navigate]);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminNavbar />
      <main style={{
        marginLeft: 240,
        width: "calc(100vw - 240px)",
        minHeight: "100vh",
        background: "#f8fafc",
        overflow: "hidden",
      }}>
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}