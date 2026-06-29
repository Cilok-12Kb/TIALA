// src/hooks/useDashboardData.js
import { useEffect, useState } from "react";
import api from "../services/api";
import useWeatherRataRata from "./useWeatherRataRata";
import { toDateInputValue } from "../utils/tideHelpers";

// Hook gabungan untuk semua data yang dibutuhkan halaman Dashboard:
// cuaca Semarang, potensi rob (+geometry untuk peta), grafik pasang
// surut 24 jam, dan rata-rata cuaca — sekaligus polling realtime setiap
// 60 detik. Dipisah dari komponen Dashboard supaya komponennya cuma
// fokus render JSX, mirip pola useWeather()/useWeatherRataRata() yang
// sudah ada di project ini.
export default function useDashboardData() {
  const [selectedWeather, setSelectedWeather] = useState(null);
  const [weatherData, setWeatherData] = useState([]);
  const [robData, setRobData] = useState([]);
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [countdown, setCountdown] = useState(60);

  // Untuk grafik pasang surut (TideChart) — tanggal default hari ini,
  // bisa diganti user lewat date picker bawaan TideChart.
  const [selectedDate, setSelectedDate] = useState(() =>
    toDateInputValue(new Date())
  );
  const [tideChartData, setTideChartData] = useState([]);

  const { rata, loading: loadingRata } = useWeatherRataRata();

  async function fetchWeather() {
    try {
      const response = await api.get("/cuaca-semarang");
      const rawData = response.data.data || [];

      // Mapping tambahan: samakan dengan apa yang dilakukan useWeather()
      // di halaman Cuaca, supaya getWeatherIcon() dapat field `cuaca`
      // yang benar (ikon dinamis), dan WeatherPopup dapat field `suhu`
      // & `kelembapan` yang benar (field asli dari API adalah `t`/`hu`).
      const data = rawData.map((item) => ({
        ...item,
        cuaca: item.weather_desc,
        suhu: item.t,
        kelembapan: item.hu,
      }));

      setWeatherData(data);
      // Functional update: cuma isi default kalau belum ada pilihan
      // sebelumnya, tanpa butuh selectedWeather di dependency array.
      setSelectedWeather((prev) => prev ?? data[0] ?? null);
    } catch (error) {
      console.error("Gagal mengambil data cuaca:", error);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function fetchRobData() {
    try {
      // Pakai /peta/rob-data (WilayahRobController::petaData) karena
      // endpoint ini sudah menyertakan field `geometry` yang dibutuhkan
      // AdminPetaMap. Endpoint lama /pasang-surut/rob-wilayah tidak
      // mengirim geometry sama sekali.
      const response = await api.get("/peta/rob-data");
      setRobData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data pasang surut:", error);
    }
  }

  // Data 24 jam untuk grafik pasang surut (dipakai langsung oleh <TideChart />)
  async function fetchTideChartData(tanggal) {
    try {
      const response = await api.get("/pasang-surut", {
        params: { tanggal },
      });
      setTideChartData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data grafik pasang surut:", error);
    }
  }

  useEffect(() => {
    fetchWeather();
    fetchRobData();
  }, []);

  // Re-fetch grafik tiap kali tanggal yang dipilih berubah
  useEffect(() => {
    fetchTideChartData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchWeather();
          fetchRobData();
          fetchTideChartData(selectedDate);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [selectedDate]);

  return {
    selectedWeather: selectedWeather || weatherData?.[0] || null,
    setSelectedWeather,
    weatherData,
    robData,
    loadingWeather,
    countdown,
    rata,
    loadingRata,
    selectedDate,
    setSelectedDate,
    tideChartData,
  };
}