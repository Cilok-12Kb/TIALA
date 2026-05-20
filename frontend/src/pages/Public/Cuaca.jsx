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

const weatherIcon = new L.Icon({
  iconUrl:
    "https://cdn-icons-png.flaticon.com/512/4834/4834559.png",
  iconSize: [34, 34],
});

export default function Cuaca() {

  const [cuacaList, setCuacaList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchCuaca = async () => {

      try {

        const response = await fetch(
          "http://127.0.0.1:8000/api/cuaca-semarang"
        );

        const data = await response.json();

        console.log("DATA BMKG:", data);

        if (!data.data) {
          return;
        }

        const hasil = data.data.map((item) => {

          const weather = item.cuaca?.[0]?.[0];

          return {

            desa: item.lokasi?.desa,
            kecamatan: item.lokasi?.kecamatan,

            lat: Number(item.lokasi?.lat),
            lon: Number(item.lokasi?.lon),

            suhu: weather?.t,
            cuaca: weather?.weather_desc,

            kelembapan: weather?.hu,
            angin: weather?.ws,

            waktu: weather?.local_datetime,

          };

        });

        console.log("HASIL:", hasil);

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
          className="
            position-relative
            overflow-hidden
            rounded-5
            shadow-sm
          "
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >

          {/* HEADER */}
          <div className="p-4 p-md-5">

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
                  BMKG REALTIME WEATHER
                </p>

                <h1
                  className="fw-bold mb-3"
                  style={{
                    fontSize: "42px",
                    color: "#0f172a",
                  }}
                >
                  Peta Cuaca Kota Semarang
                </h1>

                <p
                  className="mb-0"
                  style={{
                    color: "#64748b",
                    maxWidth: "720px",
                    lineHeight: "1.8",
                  }}
                >
                  Monitoring realtime kondisi cuaca
                  seluruh wilayah Kota Semarang
                  berbasis data BMKG dengan
                  visualisasi peta interaktif.
                </p>

              </div>

              {/* CARD INFO */}
              <div
                className="rounded-4 px-4 py-3"
                style={{
                  background: "#ffffff",
                  border:
                    "1px solid rgba(0,0,0,0.06)",
                  minWidth: "180px",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.06)",
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
                  {cuacaList.length}
                </h2>

              </div>

            </div>

          </div>

          {/* MAP */}
          <div className="px-4 pb-4">

            <div
              className="overflow-hidden rounded-5 position-relative"
              style={{
                border:
                  "1px solid rgba(0,0,0,0.06)",
              }}
            >

              {/* OVERLAY */}
              <div
                className="position-absolute top-0 start-0 w-100"
                style={{
                  height: "120px",
                  zIndex: 999,
                  background:
                    "linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)",
                  pointerEvents: "none",
                }}
              />

              {loading ? (

                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{
                    height: "700px",
                    background: "#f8fafc",
                  }}
                >

                  <div className="text-center">

                    <div
                      className="spinner-border text-info mb-3"
                      role="status"
                    />

                    <p
                      className="mb-0"
                      style={{
                        color: "#64748b",
                      }}
                    >
                      Loading data cuaca realtime...
                    </p>

                  </div>

                </div>

              ) : (

                <MapContainer
                  center={[-6.9667, 110.4167]}
                  zoom={11}
                  style={{
                    height: "560px",
                    width: "100%",
                  }}
                >

                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {cuacaList.map((item, index) => (

                    <Marker
                      key={index}
                      position={[
                        item.lat,
                        item.lon,
                      ]}
                      icon={weatherIcon}
                    >

                      <Popup>

                        <div
                          style={{
                            minWidth: "230px",
                          }}
                        >

                          <div className="d-flex align-items-center gap-2 mb-2">

                            <div
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "999px",
                                background: "#0ea5e9",
                              }}
                            />

                            <span
                              style={{
                                fontWeight: "560px",
                                fontSize: "16px",
                                color: "#0f172a",
                              }}
                            >
                              {item.desa}
                            </span>

                          </div>

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

                            <div className="d-flex justify-content-between mb-2">

                              <span>
                                💧 Kelembapan
                              </span>

                              <strong>
                                {item.kelembapan}%
                              </strong>

                            </div>

                            <div className="d-flex justify-content-between">

                              <span>
                                🌬️ Angin
                              </span>

                              <strong>
                                {item.angin} km/jam
                              </strong>

                            </div>

                          </div>

                        </div>

                      </Popup>

                    </Marker>

                  ))}

                </MapContainer>

              )}

            </div>

          </div>

        </div>

      </div>

    </>

  );

}