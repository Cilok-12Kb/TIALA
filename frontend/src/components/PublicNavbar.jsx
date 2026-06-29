import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import bmkgLogo from "../assets/images/Logo.png";

export default function PublicNavbar() {

  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {

    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);

  }, []);

  const formattedDate = time.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const wibTime = time.toLocaleTimeString("id-ID");

  const utcTime = time.toUTCString().split(" ")[4];

  return (
    <>

      {/* TOP BAR */}
      <div
        className="
          d-none
          d-md-flex
          justify-content-between
          align-items-center
          px-5
        "
        style={{
          background: "#eef1f5",
          minHeight: "48px",
          fontSize: "14px",
        }}
      >

        <div
          style={{
            color: "#4b5563",
            textTransform: "uppercase",
          }}
        >
          {formattedDate}
        </div>

        <div
          style={{
            color: "#4b5563",
            fontWeight: "500",
          }}
        >

          STANDAR WAKTU INDONESIA

          <span
            style={{
              color: "green",
              marginLeft: "15px",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {wibTime}
          </span>

          <span className="mx-3">/</span>

          <span
            style={{
              color: "green",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            {utcTime} UTC
          </span>

        </div>

      </div>

      {/* MAIN NAVBAR */}
      <nav
        className="bg-white shadow-sm border-bottom"
        style={{
          position: "relative",
          zIndex: 999,
        }}
      >

        <div className="container-fluid px-4 px-lg-5 py-3">

          <div className="d-flex justify-content-between align-items-center">

            {/* LOGO */}
            <Link
              className="navbar-brand fw-bold d-flex align-items-center m-0"
              to="/"
            >

              <img
                src={bmkgLogo}
                alt="BMKG Logo"
                style={{
                  width: "58px",
                  height: "58px",
                  objectFit: "contain",
                }}
              />

              <div className="ms-2">

                <div
                  style={{
                    fontSize: "15px",
                    fontWeight: "700",
                    lineHeight: "1.2",
                    color: "#111827",
                  }}
                >
                  MY_OCEAN
                </div>

                <div
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                  }}
                >
                  MONITORING PASANG-SURUT
                </div>

              </div>

            </Link>

            {/* DESKTOP MENU */}
            <div className="d-none d-lg-flex align-items-center">

              <ul className="navbar-nav flex-row mx-auto">

                <li className="nav-item mx-1">
                  <Link
                    className="nav-link custom-nav-link"
                    to="/"
                  >
                    Dashboard
                  </Link>
                </li>

                <li className="nav-item mx-1">
                  <Link
                    className="nav-link custom-nav-link"
                    to="/Pasang-Surut"
                  >
                    Pasang Surut
                  </Link>
                </li>

                <li className="nav-item mx-1">
                  <Link
                    className="nav-link custom-nav-link"
                    to="/Peta"
                  >
                    Peta
                  </Link>
                </li>

                <li className="nav-item mx-1">
                  <Link
                    className="nav-link custom-nav-link"
                    to="/Cuaca"
                  >
                    Cuaca
                  </Link>
                </li>

              </ul>

            </div>

            {/* RIGHT SIDE */}
            <div className="d-flex align-items-center">

              {/* AI BUTTON DESKTOP */}
              <Link
                className="
                  btn
                  btn-outline-primary
                  rounded-3
                  px-4
                  d-none
                  d-lg-inline-flex
                "
                to="/marin-minamo"
              >
                🤖 Marin Minamo
              </Link>

              {/* MOBILE BUTTON */}
              <button
                className="
                  btn
                  d-lg-none
                  border-0
                  shadow-none
                  fs-2
                "
                onClick={() => setIsOpen(!isOpen)}
              >
                ☰
              </button>

            </div>

          </div>

          {/* MOBILE MENU */}
          {
            isOpen && (
              <div
                className="
                  d-lg-none
                  mt-4
                  pt-4
                  border-top
                "
              >

                <ul className="navbar-nav text-center">

                  <li className="nav-item py-2">
                    <Link
                      className="nav-link text-dark fw-medium"
                      to="/"
                      onClick={() => setIsOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>

                  <li className="nav-item py-2">
                    <Link
                      className="nav-link text-dark fw-medium"
                      to="/Pasang-Surut"
                      onClick={() => setIsOpen(false)}
                    >
                      Pasang Surut
                    </Link>
                  </li>

                  <li className="nav-item py-2">
                    <Link
                      className="nav-link text-dark fw-medium"
                      to="/Peta"
                      onClick={() => setIsOpen(false)}
                    >
                      Peta
                    </Link>
                  </li>

                  <li className="nav-item py-2">
                    <Link
                      className="nav-link text-dark fw-medium"
                      to="/Cuaca"
                      onClick={() => setIsOpen(false)}
                    >
                      Cuaca
                    </Link>
                  </li>

                </ul>

                <div className="mt-4 d-flex justify-content-center">

                  <Link
                    className="btn btn-outline-primary rounded-3 px-4"
                    to="/marin-minamo"
                    onClick={() => setIsOpen(false)}
                  >
                    🤖 Marin Minamo
                  </Link>

                </div>

              </div>
            )
          }

        </div>

      </nav>

    </>
  );
}