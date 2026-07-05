# TIALA

Platform monitoring cuaca, pasang surut, dan potensi banjir rob berbasis web, dilengkapi AI Assistant **Marin Minamo**. Terdiri dari tiga komponen utama: **backend** (Laravel REST API), **frontend** (React + Vite), dan **model-service** (FastAPI, inference model CNN-BiLSTM untuk prediksi pasang surut 15 hari ke depan).

---

## 📂 Struktur Repository

```
TIALA/
├── backend/          # REST API (Laravel)
├── frontend/         # Aplikasi web (React + Vite)
├── Model/            # Notebook & artefak training model
└── model-service/    # Service FastAPI untuk inference model CNN-BiLSTM
```

---

## 🧩 Fitur Utama

- 🌦️ Monitoring cuaca (publik & admin)
- 🌊 Monitoring & prediksi pasang surut
- ⚠️ Peta & tabel potensi banjir rob per wilayah (dengan status siaga)
- 🗺️ Visualisasi peta wilayah rob (polygon, legend, ringkasan prediksi)
- 🤖 AI Assistant kelautan **Marin Minamo** (chat, riwayat, tabel perbandingan)
- 👤 Manajemen pengguna & role (Super Admin / Admin)
- 🔐 Autentikasi (login, forgot password, reset password)

---

## 🖥️ Frontend (`frontend/`)

**Stack:** React + Vite

### Struktur Folder

```
frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── images/
│   │   │   └── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── icons.jsx
│   │   │   ├── RobAlertBanner.jsx
│   │   │   ├── SectionHeader.jsx
│   │   │   ├── SectionHeaderCard.jsx
│   │   │   ├── SummaryStats.jsx
│   │   │   └── WeatherSection.jsx
│   │   ├── dashboardAdmin/
│   │   │   ├── dashboardStyles.js
│   │   │   ├── EmptyState.jsx
│   │   │   ├── index.js
│   │   │   ├── MonitoringGrid.jsx
│   │   │   ├── RobMonitorCard.jsx
│   │   │   ├── SiagaAreasCard.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatsGrid.jsx
│   │   │   ├── TideMonitorCard.jsx
│   │   │   ├── TideStatsRow.jsx
│   │   │   ├── TideTrendCard.jsx
│   │   │   ├── TideTrendChart.jsx
│   │   │   └── WeatherMonitorCard.jsx
│   │   ├── marinMinamo/
│   │   │   ├── BotAvatar.jsx
│   │   │   ├── ChatHeader.jsx
│   │   │   ├── ChatInputBar.jsx
│   │   │   ├── ChatMessageContent.jsx
│   │   │   ├── ChatSidebar.jsx
│   │   │   ├── ComparisonTable.jsx
│   │   │   ├── index.js
│   │   │   ├── MessageBubble.jsx
│   │   │   ├── MessageList.jsx
│   │   │   └── TypingIndicator.jsx
│   │   ├── PasangSurut/
│   │   │   ├── ModalGeneratePrediksi....jsx
│   │   │   ├── ModalPasangSurut.jsx
│   │   │   ├── Modalpetawilayah.jsx
│   │   │   ├── ModalWilayahRob.jsx
│   │   │   ├── TideChart.jsx
│   │   │   └── TideTable.jsx
│   │   ├── pengguna/
│   │   │   ├── PasswordModal.jsx
│   │   │   ├── RoleBadge.jsx
│   │   │   ├── Toast.jsx
│   │   │   ├── ToggleConfirmModal.jsx
│   │   │   └── UserModal.jsx
│   │   ├── potensi_rob/
│   │   │   ├── AdminPetaMap.jsx
│   │   │   ├── MapLegend.jsx
│   │   │   ├── RingkasanPrediksiRob.jsx
│   │   │   ├── RobPolygonLayer.jsx
│   │   │   ├── RobPotentialMap.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── TabelWilayahSection.jsx
│   │   │   └── WilayahTable.jsx
│   │   └── weather/
│   │       ├── EndminNavbar.jsx
│   │       ├── EndminTopbar.jsx
│   │       ├── ProtectedRoute.jsx
│   │       ├── PublicNavbar.jsx
│   │       └── SuperAdminRoute.jsx
│   ├── hooks/
│   │   ├── useDashboardData.js
│   │   ├── useMarinMinamoChat.js
│   │   ├── useUsers.js
│   │   ├── useWeather.js
│   │   └── useWeatherRataRata.js
│   ├── layouts/
│   ├── pages/
│   │   ├── Admin/
│   │   │   ├── Cuaca.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Forgotpassword.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PasangSurutAdmin.jsx
│   │   │   ├── Pengguna.jsx
│   │   │   ├── PetaAdmin.jsx
│   │   │   ├── Profil.jsx
│   │   │   └── Resetpassword.jsx
│   │   └── Public/
│   │       ├── Cuaca.jsx
│   │       ├── Dashboard.jsx
│   │       ├── MarinMinamo.jsx
│   │       ├── PasangSurut.jsx
│   │       └── Peta.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   ├── Dashboard.css
│   │   ├── PasangSurut.css
│   │   ├── Peta.css
│   │   ├── RobPotentialMap.css
│   │   └── weather.css
│   ├── utils/
│   │   ├── chatMessageHelpers.js
│   │   ├── dashboardHelpers.js
│   │   ├── tideHelpers.js
│   │   └── weatherIcons.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── eslint.config.js
├── index.html
├── package.json
└── vite.config.js
```

### Instalasi & Menjalankan

```bash
cd frontend
npm install
npm run dev
```

Buat file `.env` (sesuaikan dengan kebutuhan `src/services/api.js`), contoh:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

### Routing (garis besar)

Diatur di `src/routes/AppRoutes.jsx`, dengan pemisahan:

- **Public** — Dashboard, Cuaca, Pasang Surut, Peta, Marin Minamo
- **Admin** — Dashboard, Cuaca, Pasang Surut, Peta, Pengguna, Profil, Login, Forgot/Reset Password

Akses halaman admin dilindungi oleh `ProtectedRoute.jsx` dan `SuperAdminRoute.jsx` (role based access).

---

## ⚙️ Backend (`backend/`)

**Stack:** Laravel

### Struktur Folder

```
backend/
├── app/
│   ├── Console/
│   ├── Http/
│   │   └── Controllers/
│   │       ├── Admin/
│   │       │   ├── ForgotpasswordController.php
│   │       │   ├── ProfileController.php
│   │       │   └── UserManagementController.php
│   │       ├── Auth/
│   │       │   └── AuthController.php
│   │       ├── ChatController.php
│   │       ├── Controller.php
│   │       ├── PasangSurutController.php
│   │       ├── WeatherController.php
│   │       └── WilayahRobController.php
│   ├── Models/
│   │   ├── PasangSurut.php
│   │   ├── User.php
│   │   ├── Weather.php
│   │   └── WilayahRob.php
│   └── Providers/
├── bootstrap/
├── config/
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
├── public/
│   ├── .htaccess
│   ├── favicon.ico
│   ├── index.php
│   └── robots.txt
├── resources/
│   ├── css/
│   ├── js/
│   └── views/
│       └── emails/
│           ├── admin_reset_password....blade.php
│           └── welcome.blade.php
├── routes/
│   ├── api.php
│   ├── console.php
│   └── web.php
├── storage/
├── tests/
├── vendor/
├── .env.example
├── artisan
├── composer.json
└── phpunit.xml
```

### Modul / Controller

| Controller                    | Fungsi                                              |
| ------------------------------ | ---------------------------------------------------- |
| `Auth/AuthController`          | Login, autentikasi, logout                          |
| `Admin/ForgotpasswordController` | Alur lupa password (kirim email reset)            |
| `Admin/ProfileController`      | Kelola profil admin                                 |
| `Admin/UserManagementController` | Manajemen pengguna & role                        |
| `ChatController`                | Endpoint chat untuk AI Assistant Marin Minamo       |
| `PasangSurutController`        | Data & prediksi pasang surut                        |
| `WeatherController`             | Data cuaca                                          |
| `WilayahRobController`          | Data wilayah & potensi banjir rob                   |

### Model

- `User` — data pengguna & role
- `Weather` — data cuaca
- `PasangSurut` — data pasang surut
- `WilayahRob` — data wilayah rawan/potensi rob

### Instalasi & Menjalankan

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

> Backend menggunakan SQLite (`database/database.sqlite`) secara default — pastikan file tersebut sudah dibuat, atau sesuaikan koneksi database di `.env` jika ingin memakai MySQL/PostgreSQL.

Email (reset password, welcome) menggunakan Blade template di `resources/views/emails/` — konfigurasi mailer melalui variabel `MAIL_*` di `.env`.

---

## 🤖 Model Service (`model-service/`)

Komponen inti prediksi pasang surut. Dibangun dengan **FastAPI**, menyajikan model **CNN-BiLSTM** yang melakukan *multi-step direct forecasting* untuk **24 jam ke depan**, menggunakan data historis **15 hari terakhir (360 jam)** sebagai input.

### Karakteristik Model

| Parameter          | Nilai                                 |
| ------------------ | -------------------------------------- |
| Arsitektur          | CNN-BiLSTM                             |
| File model          | `cnn_bilstm_15hari_best.keras`         |
| Metode forecasting  | Multi-step direct (satu forward pass)  |
| Lookback            | 360 jam (15 hari)                      |
| Horizon prediksi    | 24 jam                                 |
| Jumlah fitur        | 33 kolom                               |

Karena forecasting dilakukan secara *direct* (satu kali forward pass menghasilkan seluruh 24 jam sekaligus), model ini tidak melakukan iterasi prediksi bertahap sehingga tidak ada akumulasi error dari prediksi sebelumnya.

### Fitur (Feature Engineering)

Model menggunakan 33 fitur turunan dari kolom `Manual` dan `Sensor`, meliputi:

- **Lag ketinggian**: `Tinggi_-1Jam`, `Tinggi_-2Jam`, `Tinggi_-6Jam`, `Tinggi_-12Jam`, `Tinggi_-24Jam`
- **Encoding waktu siklikal**: `Jam_sin/cos`, `Bulan_sin/cos`
- **Statistik rolling**: `Rolling_mean_6`, `Rolling_mean_24`, `Rolling_std_6`
- **Diferensiasi (delta)**: `Delta_1Jam`, `Delta_2Jam`, `Delta_6Jam`, `Delta_12Jam`
- **Fase & amplitudo lokal**: `Amplitudo_lokal`, `Posisi_siklus`
- **Komponen harmonik pasang surut** (M2, S2, N2, K1, O1), masing-masing dalam bentuk sin/cos
- **Deteksi anomali pasif**: `Amplitudo_24j`, `Amplitudo_zscore`, `Residual_harmonik`, `Residual_rolling6`

Seluruh perhitungan fitur ini harus identik dengan proses preprocessing yang digunakan saat training model, karena scaler (`scaler_fitur.pkl`) di-fit dengan urutan dan definisi fitur yang sama persis.

### Validasi Data

Sebelum prediksi dijalankan, service memeriksa apakah data riwayat pada **hari terakhir** sudah lengkap sampai jam tertentu (default **23:00**, dapat diatur lewat env `JAM_LENGKAP_HARI_TERAKHIR`). Jika data hari berjalan masih parsial, request akan ditolak dengan status `400` beserta pesan yang menyebutkan sampai jam berapa data tersedia. Ini mencegah fitur lag/rolling pada baris terakhir dihitung dari data yang belum representatif.

Minimal jumlah baris riwayat yang harus dikirim: `LOOKBACK (360) + MAX_LAG_JAM (24) = 384 baris`.

### Instalasi & Menjalankan

**Requirements** (`requirements.txt`):

```
fastapi==0.111.0
uvicorn[standard]==0.30.1
tensorflow==2.16.1
scikit-learn==1.6.1
joblib==1.4.2
pandas==2.2.2
numpy==1.26.4
python-dotenv==1.0.1
```

```bash
cd model-service
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Konfigurasi environment (`.env`):**

```env
MODEL_PATH=./models/cnn_bilstm_15hari_best.keras
SCALER_FITUR_PATH=./models/scaler_fitur.pkl
SCALER_LABEL_PATH=./models/scaler_label.pkl

LOOKBACK=360
HORIZON=24

INTERNAL_API_KEY=isi-dengan-api-key-internal

# WAJIB diisi dengan nilai df_clean['Manual'].mean() dari notebook
# preprocessing yang menghasilkan scaler_fitur.pkl saat ini.
# Dipakai untuk menghitung fitur Residual_harmonik.
MANUAL_MEAN_TRAINING=isi-dengan-nilai-mean-training

# Opsional, default 23 (jam terakhir yang wajib tersedia
# agar data hari berjalan dianggap lengkap)
JAM_LENGKAP_HARI_TERAKHIR=23
```

> ⚠️ `MANUAL_MEAN_TRAINING` bersifat wajib — service tidak akan bisa start jika variabel ini kosong. Nilainya harus identik dengan mean data `Manual` pada seluruh dataset training saat `scaler_fitur.pkl` di-fit, agar fitur `Residual_harmonik` konsisten antara training dan inference.

**Menjalankan service:**

```bash
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### API Endpoints

#### `GET /health`

Mengecek status service dan konfigurasi model yang sedang aktif.

```json
{
  "status": "ok",
  "model_loaded": true,
  "lookback_jam": 360,
  "lookback_hari": 15,
  "horizon": 24,
  "jumlah_fitur": 33
}
```

#### `POST /predict`

Melakukan prediksi ketinggian air 24 jam ke depan berdasarkan riwayat data yang dikirim.

**Header:**
| Header      | Wajib | Keterangan                                     |
| ----------- | ----- | ------------------------------------------------ |
| `x-api-key` | Ya, jika `INTERNAL_API_KEY` diset | Harus sama dengan `INTERNAL_API_KEY` di `.env` |

**Request Body:**
```json
{
  "riwayat": [
    { "datetime": "2025-06-01 00:00:00", "manual": 120.5, "sensor": 121.0 },
    { "datetime": "2025-06-01 01:00:00", "manual": 118.2, "sensor": 119.0 }
  ]
}
```

- `riwayat` harus berisi minimal **384 baris**, urut waktu naik (ascending), tanpa jam yang bolong.
- Data pada hari terakhir harus sudah lengkap sampai jam yang ditentukan oleh `JAM_LENGKAP_HARI_TERAKHIR`.

**Response Sukses (200):**
```json
{
  "count": 24,
  "hasil": [
    { "datetime": "2025-06-16 00:00:00", "jam": 0, "prediksi_cm": 132.4 },
    { "datetime": "2025-06-16 01:00:00", "jam": 1, "prediksi_cm": 130.8 }
  ]
}
```

**Response Gagal — data belum lengkap (400):**
```json
{
  "detail": "Data belum lengkap. Riwayat untuk tanggal 2025-06-15 baru tersedia sampai jam 18:00, belum mencapai jam 23:00. Mohon lengkapi data terlebih dahulu sebelum melakukan prediksi."
}
```

**Response Gagal — riwayat kurang (400):**
```json
{
  "detail": "Minimal 384 baris riwayat dibutuhkan (LOOKBACK=360 jam [15 hari] + 24 jam untuk fitur lag terpanjang), dapat 300."
}
```

**Response Gagal — API key tidak valid (401):**
```json
{
  "detail": "API key tidak valid."
}
```

---

## 🔗 Menjalankan Seluruh Sistem (Ringkasan)

| Komponen       | Perintah                          | Port default |
| -------------- | ---------------------------------- | ------------- |
| Backend        | `php artisan serve`               | 8000          |
| Frontend       | `npm run dev`                     | 5173          |
| Model Service  | `uvicorn main:app --reload`       | 8001          |

Pastikan `VITE_API_BASE_URL` (frontend) dan konfigurasi endpoint model service pada backend saling mengarah ke port yang benar.

---

## 📄 License

Internal Development Project