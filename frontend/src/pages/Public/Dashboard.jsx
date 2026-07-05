import PublicNavbar from "../../components/PublicNavbar";
import useDashboardData from "../../hooks/useDashboardData";
import RobAlertBanner from "../../components/dashboard/RobAlertBanner";
import SummaryStats from "../../components/dashboard/SummaryStats";
import SectionHeaderCard from "../../components/dashboard/SectionHeaderCard";
import WeatherSection from "../../components/dashboard/WeatherSection";
import { CloudIcon, WaveIcon, RobPinIcon } from "../../components/dashboard/icons";
import TideChart from "../../components/PasangSurut/TideChart";
import AdminPetaMap from "../../components/potensi_rob/AdminPetaMap";
import "../../styles/Dashboard.css";

function DashboardContent() {
  const {
    selectedWeather,
    setSelectedWeather,
    weatherData,
    robData,
    prediksiData, // BARU — wajib ditambahkan di useDashboardData.js (lihat instruksi di bawah)
    loadingWeather,
    countdown,
    rata,
    loadingRata,
    selectedDate,
    setSelectedDate,
    tideChartData,
  } = useDashboardData();

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="db-page-wrapper">
      <div className="db-page">
        <div className="db-page-header">
          <div>
            <div className="db-page-header__eyebrow">Dashboard BMKG</div>
            <h1 className="db-page-header__title">
              Informasi Cuaca &amp; Potensi Rob
              <span className="db-page-header__place"> Semarang</span>
            </h1>
            <div className="db-page-header__date">{dateStr}</div>
          </div>
          <div className="db-live-badge">
            <span className="db-live-badge__dot" />
            Realtime aktif
          </div>
        </div>

        <RobAlertBanner robData={robData} prediksiData={prediksiData} />
        <SummaryStats robData={robData} weatherData={weatherData} prediksiData={prediksiData}/>

        <SectionHeaderCard
          icon={<CloudIcon />}
          title="Data Cuaca Semarang"
          subtitle={`Sinkronisasi realtime · update ${countdown}d`}
          linkTo="/cuaca"
          linkLabel="Semua Data Cuaca"
        />
        <div className="mb-4">
          <WeatherSection
            selectedWeather={selectedWeather}
            setSelectedWeather={setSelectedWeather}
            filteredCuaca={weatherData}
            loading={loadingWeather}
            countdown={countdown}
            rata={rata}
            loadingRata={loadingRata}
          />
        </div>

        <SectionHeaderCard
          icon={<WaveIcon />}
          title="Data Pasang Surut"
          subtitle="Grafik analisis ketinggian air 24 jam"
          linkTo="/pasang-surut"
          linkLabel="Detail Pasang Surut"
        />
        <div className="mb-4">
          <TideChart
            data={tideChartData}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        </div>

        <SectionHeaderCard
          icon={<RobPinIcon />}
          title="Peta Potensi Rob"
          subtitle="Sebaran wilayah terdampak di Semarang"
          linkTo="/peta"
          linkLabel="Buka Peta Lengkap"
        />
        <div className="mb-4">
          <AdminPetaMap robData={robData} prediksiData={prediksiData} />
        </div>
      </div>
    </main>
  );
}

export default function Dashboard() {
  return (
    <>
      <PublicNavbar />
      <DashboardContent />
    </>
  );
}