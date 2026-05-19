import { useNavigate } from "react-router-dom";

export default function Dashboard() {

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/MyOcean-Endmin");
  };

  return (
    <div style={{ padding: "30px" }}>

      <h1>Dashboard Admin My_Ocean</h1>

      <button onClick={handleLogout}>
        Logout
      </button>

    </div>
  );
}