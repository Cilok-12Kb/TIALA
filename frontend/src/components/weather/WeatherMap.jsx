import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

import LoadingScreen from "./LoadingScreen";
import WeatherPopup from "./WeatherPopup";
import { getWeatherIcon } from "../../utils/weatherIcons";

export default function WeatherMapView({
  filteredCuaca,
  loading,
  countdown,
  searchKelurahan,
  setSearchKelurahan,
  filterKecamatan,
  setFilterKecamatan,
  kecamatanList,
  onWeatherSelect,
  showFilters = true,
}) {

  return (

    <div
      className="position-relative overflow-hidden"
      style={{
        borderRadius: "40px",
        background: "linear-gradient(to bottom, #ffffff, #f8fafc)",
        border: "1px solid rgba(0,0,0,0.06)",
        padding: "14px",
        boxShadow: "0 20px 50px rgba(15,23,42,0.08)",
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
          background: "linear-gradient(to bottom, rgba(14,165,233,0.08), transparent)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {loading ? (

        <LoadingScreen />

      ) : (

        <div style={{ borderRadius: "30px", overflow: "hidden" }}>

          {/* STATUS BAR */}
          <div className="d-flex justify-content-between align-items-center px-3 pt-3">

            <div className="d-flex align-items-center gap-2">

              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "#22c55e",
                  animation: "pulse 1.5s infinite",
                }}
              />

              <small style={{ color: "#16a34a", fontWeight: "600" }}>
                Sinkronisasi realtime aktif
              </small>

            </div>

            <small style={{ color: "#64748b", fontSize: "12px", fontWeight: "500" }}>
              Update berikutnya dalam{" "}
              <span style={{ color: "#0ea5e9", fontWeight: "700" }}>
                {countdown}s
              </span>
            </small>

          </div>

          {/* SEARCH & FILTER */}
          {showFilters && (

            <div
              className="d-flex flex-column flex-lg-row gap-3 p-3"
              style={{
                background: "#ffffff",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >

              <div className="flex-grow-1">

                <input
                  type="text"
                  placeholder="Cari kelurahan..."
                  className="form-control"
                  value={searchKelurahan}
                  onChange={(e) => setSearchKelurahan(e.target.value)}
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

              <div
                style={{
                  width: window.innerWidth < 768 ? "200px" : "240px",
                }}
              >

                <select
                  className="form-select"
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                  style={{
                    height: "50px",
                    borderRadius: "16px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    fontSize: "15px",
                    boxShadow: "none",
                  }}
                >

                  {kecamatanList.map((kecamatan, index) => (
                    <option key={index} value={kecamatan}>
                      {kecamatan}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          )}

          {/* LEAFLET MAP */}
          <MapContainer
            center={[-6.9667, 110.4167]}
            zoom={11}
            style={{ height: "500px", width: "100%" }}
          >

            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {filteredCuaca.map((item, index) => (

              <Marker
                key={index}
                position={[item.lat, item.lon]}
                icon={getWeatherIcon(item.cuaca)}
                eventHandlers={{
                  click: () => {
                    onWeatherSelect?.(item);
                  },
                }}
              >

                <Popup>
                  <WeatherPopup item={item} />
                </Popup>

              </Marker>

            ))}

          </MapContainer>

        </div>

      )}

    </div>

  );

}