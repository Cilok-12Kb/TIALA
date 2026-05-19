import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "../pages/Public/Dashboard";
import PasangSurut from "../pages/Public/PasangSurut";
import Cuaca from "../pages/Public/Cuaca";
import Peta from "../pages/Public/Peta";
import PotensiRob from "../pages/Public/PotensiRob";
import MarinMinamo from "../pages/Public/MarinMinamo";

import Login from "../pages/Admin/Login";
import AdminDashboard from "../pages/Admin/Dashboard";

import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/Pasang-Surut" element={<PasangSurut />} />
        <Route path="/Cuaca" element={<Cuaca />} />
        <Route path="/Peta" element={<Peta />} />
        <Route path="/Potensi-Rob" element={<PotensiRob />} />
        <Route path="/marin-minamo" element={<MarinMinamo />} />

        {/* ADMIN */}
        <Route
          path="/MyOcean-Endmin"
          element={<Login />}
        />

        <Route
          path="/ocean-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

      </Routes>

    </BrowserRouter>
  );
}