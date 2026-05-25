import { useEffect, useState } from "react";
import PublicNavbar from "../../components/PublicNavbar";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// ICON BERDASARKAN KONDISI CUACA
const getWeatherIcon = (cuaca) => {

  const kondisi = cuaca?.toLowerCase() || "";

  // CERAH
  if (
    kondisi.includes("cerah") &&
    !kondisi.includes("berawan")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/869/869869.png",
      iconSize: [34, 34],
    });
  }

  // CERAH BERAWAN
  if (
    kondisi.includes("cerah berawan")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/1163/1163661.png",
      iconSize: [34, 34],
    });
  }

  // BERAWAN
  if (
    kondisi.includes("berawan")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/414/414825.png",
      iconSize: [34, 34],
    });
  }

  // HUJAN RINGAN
  if (
    kondisi.includes("hujan ringan")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/3313/3313884.png",
      iconSize: [34, 34],
    });
  }

  // HUJAN SEDANG / HUJAN
  if (
    kondisi.includes("hujan")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/3351/3351979.png",
      iconSize: [34, 34],
    });
  }

  // PETIR
  if (
    kondisi.includes("petir")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/1146/1146860.png",
      iconSize: [34, 34],
    });
  }

  // KABUT
  if (
    kondisi.includes("kabut")
  ) {
    return new L.Icon({
      iconUrl:
        "https://cdn-icons-png.flaticon.com/512/4005/4005901.png",
      iconSize: [34, 34],
    });
  }

  // DEFAULT
  return new L.Icon({
    iconUrl:
      "https://cdn-icons-png.flaticon.com/512/4834/4834559.png",
    iconSize: [34, 34],
  });

};

export default function Cuaca() {

  const [cuacaList, setCuacaList] = useState([]);

  const [selectedWilayah, setSelectedWilayah] = useState(null);

  const [searchKelurahan, setSearchKelurahan] = useState("");

  const [filterKecamatan, setFilterKecamatan] =
  useState("Semua");

  const [loading, setLoading] = useState(true);

  // LIST KECAMATAN
  const kecamatanList = [
    "Semua",
    "Banyumanik",
    "Candisari",
    "Gajahmungkur",
    "Gayamsari",
    "Genuk",
    "Gunungpati",
    "Mijen",
    "Ngaliyan",
    "Pedurungan",
    "Semarang Barat",
    "Semarang Selatan",
    "Semarang Tengah",
    "Semarang Timur",
    "Semarang Utara",
    "Tembalang",
    "Tugu",
  ];

  // FILTER DATA
  const filteredCuaca = cuacaList.filter((item) => {

    const cocokKelurahan =
      item.desa
        .toLowerCase()
        .includes(searchKelurahan.toLowerCase());

    const cocokKecamatan =
      filterKecamatan === "Semua"
        ? true
        : item.kecamatan
            .toLowerCase()
            .includes(filterKecamatan.toLowerCase());

    return cocokKelurahan && cocokKecamatan;

  });

  useEffect(() => {

    const fetchCuaca = async () => {

      try {

        const response = await fetch(
          "http://10.234.104.244:8000/api/cuaca-semarang"
        );

        const data = await response.json();

        console.log("DATA BMKG:", data);

        if (!data.data) {
          return;
        }

        const hasil = data.data.map((item) => {

          return {

            desa: item.desa,
            kecamatan: item.kecamatan,

            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),

            suhu: item.t,
            cuaca: item.weather_desc,

            kelembapan: item.hu,
            angin: item.ws,

            waktu: item.local_datetime,

            prakiraan: item.prakiraan || [],

          };

        });

        setCuacaList(hasil);

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);

      }

    };

    fetchCuaca();

  }, []);

  return (

    <>

      <PublicNavbar />

      <div
        className="min-vh-100 py-4 px-3 px-md-4"
        style={{
          background:
            "linear-gradient(to bottom, #f8fafc, #eef2ff)",
        }}
      >

        <div
          className="rounded-5 overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.92)",
            border:
              "1px solid rgba(0,0,0,0.06)",
            boxShadow:
              "0 10px 40px rgba(15,23,42,0.06)",
          }}
        >

          {/* HEADER */}
          <div className="p-4 p-md-5 pb-0">

            <div className="d-flex justify-content-between align-items-start flex-wrap gap-4">

              <div>

                <p
                  className="mb-2"
                  style={{
                    color: "#0ea5e9",
                    letterSpacing: "2px",
                    fontWeight: "700",
                    fontSize: "13px",
                  }}
                >
                  BMKG WEATHER MONITORING
                </p>

                <h1
                  className="fw-bold mb-3"
                  style={{
                    fontSize: "42px",
                    color: "#0f172a",
                  }}
                >
                  Peta Prakiraaan Cuaca Kota Semarang
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: "#64748b",
                    maxWidth: "100vh",
                    lineHeight: "1.8",
                  }}
                >
                  Monitoring prakiraan cuaca realtime
                  seluruh wilayah Kota Semarang
                  berbasis data BMKG dengan
                  visualisasi interaktif.
                </p>

              </div>

              <div
                className="rounded-4 px-4 py-3"
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid rgba(0,0,0,0.06)",
                  minWidth: "180px",
                }}
              >

                <small
                  style={{
                    color: "#64748b",
                  }}
                >
                  Total Wilayah
                </small>

                <h2
                  className="fw-bold mb-0 mt-1"
                  style={{
                    color: "#0f172a",
                  }}
                >
                  {filteredCuaca.length}
                </h2>

              </div>

            </div>

          </div>

          {/* CONTENT */}
          <div
            className="p-4 pt-0"
            style={{
              marginTop: "-20px",
            }}
          >

            <div className="row g-4">

              {/* MAP */}
              <div className="col-lg-8">

                <div
                  className="position-relative overflow-hidden"
                  style={{
                    borderRadius: "40px",
                    background:
                      "linear-gradient(to bottom, #ffffff, #f8fafc)",
                    border:
                      "1px solid rgba(0,0,0,0.06)",
                    padding: "14px",
                    boxShadow:
                      "0 20px 50px rgba(15,23,42,0.08)",
                  }}
                >

                  {/* TOP CURVE */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "120px",
                      background:
                        "linear-gradient(to bottom, rgba(14,165,233,0.08), transparent)",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />

                  {loading ? (

                    <div
                      className="d-flex align-items-center justify-content-center"
                      style={{
                        height: "700px",
                        borderRadius: "30px",
                        background: "#ffffff",
                      }}
                    >

                      <div className="text-center">

                        <div
                          className="spinner-border text-info mb-3"
                          role="status"
                        />

                        <p
                          style={{
                            color: "#64748b",
                          }}
                        >
                          Loading data cuaca...
                        </p>

                      </div>

                    </div>

                  ) : (

                  <div
                    style={{
                      borderRadius: "30px",
                      overflow: "hidden",
                    }}
                  >

                    {/* SEARCH & FILTER */}
                    <div
                      className="d-flex flex-column flex-lg-row gap-3 p-3"
                      style={{
                        background: "#ffffff",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >

                      {/* SEARCH */}
                      <div className="flex-grow-1">

                        <input
                          type="text"
                          placeholder="Cari kelurahan..."
                          className="form-control"
                          value={searchKelurahan}
                          onChange={(e) =>
                            setSearchKelurahan(e.target.value)
                          }
                          style={{
                            height: "50px",
                            borderRadius: "16px",
                            border: "1px solid rgba(0,0,0,0.08)",
                            paddingLeft: "18px",
                            fontSize: "15px",
                            boxShadow: "none",
                          }}
                        />

                      </div>

                      {/* FILTER */}
                      <div
                        style={{
                          minWidth: "240px",
                        }}
                      >

                        <select
                          className="form-select"
                          value={filterKecamatan}
                          onChange={(e) =>
                            setFilterKecamatan(e.target.value)
                          }
                          style={{
                            height: "50px",
                            borderRadius: "16px",
                            border: "1px solid rgba(0,0,0,0.08)",
                            fontSize: "15px",
                            boxShadow: "none",
                          }}
                        >

                          {kecamatanList.map((kecamatan, index) => (

                            <option
                              key={index}
                              value={kecamatan}
                            >
                              {kecamatan}
                            </option>

                          ))}

                        </select>

                      </div>

                    </div>

                    {/* MAP */}

                      <MapContainer
                        center={[-6.9667, 110.4167]}
                        zoom={11}
                        style={{
                          height: "750px",
                          width: "100%",
                        }}
                      >

                        <TileLayer
                          attribution='&copy; OpenStreetMap contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {filteredCuaca.map((item, index) => (

                          <Marker
                            key={index}
                            position={[
                              item.lat,
                              item.lon,
                            ]}
                            icon={getWeatherIcon(item.cuaca)}
                          >

                            <Popup>

                              <div
                                style={{
                                  minWidth: "220px",
                                }}
                              >

                                <h6
                                  className="fw-bold mb-1"
                                >
                                  {item.desa}
                                </h6>

                                <small
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Kecamatan {item.kecamatan}
                                </small>

                                <div className="mt-3">

                                  <div className="d-flex justify-content-between mb-2">

                                    <span>
                                      🌤️ Cuaca
                                    </span>

                                    <strong>
                                      {item.cuaca}
                                    </strong>

                                  </div>

                                  <div className="d-flex justify-content-between mb-2">

                                    <span>
                                      🌡️ Suhu
                                    </span>

                                    <strong>
                                      {item.suhu}°C
                                    </strong>

                                  </div>

                                  <div className="d-flex justify-content-between">

                                    <span>
                                      💧 Kelembapan
                                    </span>

                                    <strong>
                                      {item.kelembapan}%
                                    </strong>

                                  </div>

                                </div>

                              </div>

                            </Popup>

                          </Marker>

                        ))}

                      </MapContainer>

                    </div>

                  )}

                </div>

              </div>

              {/* SIDEBAR */}
              <div className="col-lg-4">

                <div
                  className="rounded-5 p-4 h-100"
                  style={{
                    background: "#ffffff",
                    border:
                      "1px solid rgba(0,0,0,0.06)",
                  }}
                >

                  <div className="d-flex justify-content-between align-items-center mb-4">

                    <h5
                      className="fw-bold mb-0"
                      style={{
                        color: "#0f172a",
                      }}
                    >
                      Data Wilayah
                    </h5>

                    <span
                      className="badge rounded-pill text-bg-info"
                    >
                      BMKG
                    </span>

                  </div>

                  {/* TABLE */}
                  <div
                    style={{
                      maxHeight: "220px",
                      overflowY: "auto",
                    }}
                  >

                    <table className="table align-middle">

                      <thead>

                        <tr>

                          <th>
                            Wilayah
                          </th>

                          <th>
                            Suhu
                          </th>

                          <th>
                            Aksi
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {filteredCuaca.map((item, index) => (

                          <tr key={index}>

                            <td>

                              <div
                                className="fw-semibold"
                              >
                                {item.desa}
                              </div>

                              <small
                                className="text-secondary"
                              >
                                {item.kecamatan}
                              </small>

                            </td>

                            <td>

                              <strong>
                                {item.suhu}°C
                              </strong>

                            </td>

                            <td>

                              <button
                                className={`btn btn-sm rounded-pill ${
                                  selectedWilayah?.desa === item.desa
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                                onClick={() =>
                                  setSelectedWilayah(item)
                                }
                              >
                                Lihat
                              </button>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                  {/* DETAIL PRAKIRAAN */}
                  {selectedWilayah ? (

                    <div className="mt-4">

                      <div className="mb-3">

                        <h5
                          className="fw-bold mb-1"
                          style={{
                            color: "#0f172a",
                          }}
                        >
                          {selectedWilayah.desa}
                        </h5>

                        <small
                          style={{
                            color: "#64748b",
                          }}
                        >
                          Kecamatan{" "}
                          {selectedWilayah.kecamatan}
                        </small>

                      </div>

                      {/* CARD SLIDER */}
                      <div
                        className="d-flex gap-3 overflow-auto pb-2"
                        style={{
                          scrollSnapType: "x mandatory",
                        }}
                      >

                        {selectedWilayah.prakiraan.map(
                          (jam, index) => (

                            <div
                              key={index}
                              className="flex-shrink-0 rounded-4 p-3"
                              style={{
                                width: "240px",
                                background:
                                  "linear-gradient(to bottom right, #ffffff, #f8fafc)",
                                border:
                                  "1px solid rgba(0,0,0,0.06)",
                                scrollSnapAlign:
                                  "start",
                                boxShadow:
                                  "0 4px 20px rgba(15,23,42,0.05)",
                              }}
                            >

                              <div className="mb-3">

                                <small
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Waktu
                                </small>

                                <div
                                  className="fw-bold"
                                  style={{
                                    color: "#0f172a",
                                  }}
                                >
                                  {jam.local_datetime}
                                </div>

                              </div>

                              <div
                                className="rounded-4 p-3 mb-3"
                                style={{
                                  background:
                                    "#eff6ff",
                                }}
                              >

                                <div
                                  className="fw-semibold mb-1"
                                  style={{
                                    color: "#0369a1",
                                  }}
                                >
                                  🌤️ {jam.weather_desc}
                                </div>

                                <div
                                  style={{
                                    fontSize: "32px",
                                    fontWeight: "700",
                                    color: "#0f172a",
                                  }}
                                >
                                  {jam.t}°C
                                </div>

                              </div>

                              <div className="d-flex justify-content-between mb-2">

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Kelembapan
                                </span>

                                <strong>
                                  {jam.hu}%
                                </strong>

                              </div>

                              <div className="d-flex justify-content-between mb-2">

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Angin
                                </span>

                                <strong>
                                  {jam.ws} km/jam
                                </strong>

                              </div>

                              <div className="d-flex justify-content-between">

                                <span
                                  style={{
                                    color: "#64748b",
                                  }}
                                >
                                  Jarak Pandang
                                </span>

                                <strong>
                                  {jam.vs_text || "-"}
                                </strong>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  ) : (

                    <div
                      className="mt-4 text-center py-5 rounded-4"
                      style={{
                        background: "#f8fafc",
                        border:
                          "1px dashed rgba(0,0,0,0.1)",
                      }}
                    >

                      <div
                        style={{
                          fontSize: "40px",
                        }}
                      >
                        🌤️
                      </div>

                      <h6
                        className="fw-bold mt-3"
                        style={{
                          color: "#0f172a",
                        }}
                      >
                        Pilih Wilayah
                      </h6>

                      <p
                        className="mb-0"
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                        }}
                      >
                        Klik tombol "Lihat"
                        pada tabel untuk melihat
                        prakiraan cuaca per jam.
                      </p>

                    </div>

                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </>

  );

}