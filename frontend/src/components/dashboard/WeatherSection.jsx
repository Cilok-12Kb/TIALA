// src/components/dashboard/WeatherSection.jsx
import { useEffect, useState } from "react";
import WeatherMapView from "../weather/WeatherMap";
import WeatherSummaryBar from "../weather/WeatherSummaryBar";
import { LocationPinIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons";

function formatTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WeatherSection({
  selectedWeather,
  setSelectedWeather,
  filteredCuaca,
  loading,
  countdown,
  rata,
  loadingRata,
}) {
  const [slideIndex, setSlideIndex] = useState(0);

  // Reset slide index kalau data cuaca berubah (misal abis fetch ulang)
  useEffect(() => {
    setSlideIndex(0);
  }, [filteredCuaca.length]);

  // Auto-slide tiap 3 detik
  useEffect(() => {
    if (filteredCuaca.length <= 1) return;

    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % filteredCuaca.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [filteredCuaca.length]);

  const current = filteredCuaca[slideIndex] || selectedWeather;

  function goPrev() {
    setSlideIndex((prev) =>
      prev === 0 ? filteredCuaca.length - 1 : prev - 1
    );
  }

  function goNext() {
    setSlideIndex((prev) => (prev + 1) % filteredCuaca.length);
  }

  return (
    <div className="db-card">
      <WeatherSummaryBar rata={rata} loading={loadingRata} />

      <div className="db-weather-map-wrap">
        <WeatherMapView
          filteredCuaca={filteredCuaca}
          loading={loading}
          countdown={countdown}
          onWeatherSelect={setSelectedWeather}
          showFilters={false}
        />
      </div>

      <div className="db-weather-slider">
        <button
          type="button"
          className="db-weather-slider__nav db-weather-slider__nav--prev"
          onClick={goPrev}
          aria-label="Kelurahan sebelumnya"
        >
          <ChevronLeftIcon />
        </button>

        <div className="db-weather-main-card">
          <div className="db-weather-main-card__bg" />
          <div className="db-weather-main-card__content">
            <div className="db-weather-main-card__loc">
              <LocationPinIcon size={12} strokeWidth={2.5} />
              {current?.desa || "Semarang"}
            </div>
            <div className="db-weather-main-card__temp">
              {current?.t ?? "-"}°
            </div>
            <div className="db-weather-main-card__desc">
              {current?.weather_desc ?? current?.cuaca ?? "Cerah Berawan"}
            </div>
            <div className="db-weather-main-card__row">
              <span>💧 {current?.hu ?? "-"}%</span>
              <span>🌬 {current?.ws ?? "-"} km/j</span>
              <span>🕐 {formatTime(current?.local_datetime)}</span>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="db-weather-slider__nav db-weather-slider__nav--next"
          onClick={goNext}
          aria-label="Kelurahan berikutnya"
        >
          <ChevronRightIcon />
        </button>
      </div>

      {filteredCuaca.length > 1 && (
        <div className="db-weather-slider__dots">
          {filteredCuaca.map((_, i) => (
            <span
              key={i}
              className={`db-weather-slider__dot ${i === slideIndex ? "db-weather-slider__dot--active" : ""}`}
              onClick={() => setSlideIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}