import { Link } from "react-router-dom";

export default function Navbar() {

  return (
    <nav
      style={{
        padding: "20px",
        background: "#0f172a",
        color: "white",
        display: "flex",
        gap: "20px",
      }}
    >

      <h2>My_Ocean</h2>

      <Link to="/" style={{ color: "white" }}>
        Home
      </Link>

      <Link to="/monitoring" style={{ color: "white" }}>
        Monitoring
      </Link>

      <Link to="/warning" style={{ color: "white" }}>
        Warning
      </Link>

      <Link to="/about" style={{ color: "white" }}>
        About
      </Link>

    </nav>
  );
}