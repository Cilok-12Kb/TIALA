# model-service/main.py
#
# VERSI MULTI-STEP DIRECT FORECASTING — CNN-BiLSTM 15 HARI
# Model: cnn_bilstm_15hari_best.keras
# Fitur : 33 kolom, LOOKBACK=360 (15 hari), HORIZON=24
#
# PERUBAHAN DARI VERSI SEBELUMNYA (LOOKBACK=48):
# - LOOKBACK default diubah 48 → 360 (15 hari × 24 jam)
# - MAX_LAG_JAM tetap 24 (shift terpanjang Tinggi_-24Jam)
# - min_riwayat = 360 + 24 = 384 baris
# - Nama model path diperbarui ke cnn_bilstm_15hari_best.keras
#
# PERBAIKAN SINKRONISASI DENGAN NOTEBOOK PREPROCESSING (TERBARU):
#   FIX A - FITUR_COLS sebelumnya hanya 29 kolom, tertinggal 4 kolom
#           fitur deteksi anomali pasif yang sudah ditambahkan di
#           notebook preprocessing (Amplitudo_24j, Amplitudo_zscore,
#           Residual_harmonik, Residual_rolling6). scaler_fitur.pkl
#           di-fit dengan 33 kolom -> tanpa fix ini, scaler_fitur.transform()
#           akan error shape mismatch (29 vs 33).
#   FIX B - Amplitudo_lokal / Posisi_siklus sebelumnya dihitung dengan
#           rolling(..., center=True), yaitu memakai data 6 jam KE DEPAN.
#           Di notebook preprocessing ini sudah diperbaiki (hapus
#           center=True) karena itu data leakage. main.py versi
#           sebelumnya TIDAK ikut diperbaiki -> fitur saat inference
#           tidak konsisten dengan fitur saat training. Sudah disamakan
#           di sini: rolling hanya melihat ke belakang.
#   FIX C - Residual_harmonik butuh konstanta rata-rata Manual dari
#           SELURUH dataset training (df_clean['Manual'].mean() saat
#           preprocessing), bukan rata-rata dari window riwayat yang
#           dikirim ke API (window riwayat jauh lebih kecil & bisa bias).
#           Konstanta ini sekarang diambil dari environment variable
#           MANUAL_MEAN_TRAINING -- WAJIB diisi dengan nilai yang sama
#           seperti yang dipakai notebook preprocessing. Lihat catatan
#           di bagian KONFIGURASI di bawah.

import keras
import os
import joblib
import numpy as np
import pandas as pd
import tensorflow as tf
from fastapi import FastAPI, HTTPException, Header
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv

keras.config.enable_unsafe_deserialization()

load_dotenv()

MODEL_PATH        = os.getenv("MODEL_PATH")
SCALER_FITUR_PATH = os.getenv("SCALER_FITUR_PATH")
SCALER_LABEL_PATH = os.getenv("SCALER_LABEL_PATH")
LOOKBACK          = int(os.getenv("LOOKBACK", 73)) 
HORIZON           = int(os.getenv("HORIZON", 24))
INTERNAL_API_KEY  = os.getenv("INTERNAL_API_KEY")

# FIX C: konstanta rata-rata Manual dari SELURUH dataset training,
# dipakai untuk menghitung Residual_harmonik. Harus identik dengan
# nilai df_clean['Manual'].mean() pada notebook preprocessing saat
# scaler_fitur.pkl yang sedang dipakai di-fit.
#
# Cara mengambil nilainya: setelah menjalankan blok preprocessing
# (sebelum atau sesudah split train/val/test, asalkan dihitung dari
# df_clean penuh -- cek ulang notebook persisnya menghitung dari mana),
# jalankan: print(df_clean['Manual'].mean()) lalu salin nilainya ke
# environment variable MANUAL_MEAN_TRAINING di .env.
MANUAL_MEAN_TRAINING = os.getenv("MANUAL_MEAN_TRAINING")
if MANUAL_MEAN_TRAINING is None:
    raise RuntimeError(
        "MANUAL_MEAN_TRAINING belum diset di environment. Variabel ini WAJIB "
        "diisi dengan nilai df_clean['Manual'].mean() dari notebook "
        "preprocessing yang menghasilkan scaler_fitur.pkl saat ini, karena "
        "dipakai untuk menghitung fitur Residual_harmonik. Tanpa nilai yang "
        "benar, fitur ini akan salah dan prediksi model tidak akurat."
    )
MANUAL_MEAN_TRAINING = float(MANUAL_MEAN_TRAINING)

# Shift terpanjang di hitung_fitur(): Tinggi_-24Jam / Rolling_mean_24
# Baris paling awal di riwayat akan NaN sebanyak ini dan dibuang
# sebelum windowing → dipakai untuk validasi jumlah riwayat.
MAX_LAG_JAM = 24   # tidak berubah

# Catatan: Amplitudo_zscore memakai rolling window 720 jam (30 hari)
# dengan min_periods=24, jadi tidak akan NaN selama riwayat >= 24 jam.
# Tapi nilainya makin representatif (konsisten dengan distribusi saat
# training) kalau riwayat yang dikirim cukup panjang (ideal >= 720 jam
# + LOOKBACK). Ini bukan syarat keras seperti MIN_RIWAYAT di bawah,
# tapi pengaruhi akurasi fitur tersebut.

app = FastAPI(title="CNN-BiLSTM Pasang Surut Inference Service (15 Hari)")

print("Loading model & scaler...")
model        = tf.keras.models.load_model(MODEL_PATH, safe_mode=False)
scaler_fitur = joblib.load(SCALER_FITUR_PATH)
scaler_label = joblib.load(SCALER_LABEL_PATH)
print("Model & scaler siap.")

# Verifikasi output shape
output_shape = model.output_shape
print(f"Model output shape: {output_shape}")
if output_shape[-1] != HORIZON:
    print(f"PERINGATAN: output model ({output_shape[-1]}) tidak sama dengan "
          f"HORIZON yang dikonfigurasi ({HORIZON}). Cek MODEL_PATH/.env.")

FITUR_COLS = [
    'Manual', 'Sensor',
    'Tinggi_-1Jam', 'Tinggi_-2Jam',
    'Tinggi_-6Jam', 'Tinggi_-12Jam', 'Tinggi_-24Jam',
    'Jam_sin', 'Jam_cos',
    'Bulan_sin', 'Bulan_cos',
    'Rolling_mean_6',
    'Rolling_mean_24',
    'Rolling_std_6',
    'Delta_1Jam',
    'Delta_2Jam',
    'Delta_6Jam',
    'Delta_12Jam',
    'Amplitudo_lokal',
    'Posisi_siklus',
    'M2_sin', 'M2_cos',
    'S2_sin', 'S2_cos',
    'N2_sin', 'N2_cos',
    'K1_sin', 'K1_cos',
    'O1_sin', 'O1_cos',
    # FIX A — 4 fitur deteksi anomali pasif (urutan harus sama dengan
    # fitur_cols saat scaler_fitur.pkl di-fit di notebook preprocessing)
    'Amplitudo_24j',
    'Amplitudo_zscore',
    'Residual_harmonik',
    'Residual_rolling6',
]

# Referensi waktu harmonik — HARUS identik dengan notebook training
REFERENSI_WAKTU_HARMONIK = pd.Timestamp('2023-01-01')
KOMPONEN_PASUT = {
    'M2': 12.4206,   # bulan utama (terkuat)
    'S2': 12.0000,   # matahari
    'N2': 12.6583,   # elips orbit bulan
    'K1': 23.9345,   # diurnal luni-solar
    'O1': 25.8193,   # diurnal bulan
}

# ── Skema request / response ──────────────────────────────────────────────

class JamHistoris(BaseModel):
    datetime: str
    manual: float
    sensor: float


class PrediksiRequest(BaseModel):
    riwayat: List[JamHistoris]   # urut waktu naik, minimal MIN_RIWAYAT baris


class HasilJam(BaseModel):
    datetime: str
    jam: int
    prediksi_cm: float


class PrediksiResponse(BaseModel):
    count: int
    hasil: List[HasilJam]


# ── Feature engineering ───────────────────────────────────────────────────

def hitung_fitur(df: pd.DataFrame) -> pd.DataFrame:
    """
    Feature engineering — identik dengan notebook preprocessing & modeling.
    33 fitur: lag pendek+panjang, jam/bulan siklikal, rolling, delta,
    fase/amplitudo lokal, 5 komponen harmonik pasut, dan 4 fitur deteksi
    anomali pasif.

    df harus punya kolom: Datetime, Manual, Sensor — urut waktu naik.
    """
    df = df.copy()
    df['Datetime'] = pd.to_datetime(df['Datetime'], format="%Y-%m-%d %H:%M:%S")
    df = df.sort_values('Datetime').reset_index(drop=True)

    # --- Lag pendek & panjang ---
    df['Tinggi_-1Jam']  = df['Manual'].shift(1)
    df['Tinggi_-2Jam']  = df['Manual'].shift(2)
    df['Tinggi_-6Jam']  = df['Manual'].shift(6)
    df['Tinggi_-12Jam'] = df['Manual'].shift(12)
    df['Tinggi_-24Jam'] = df['Manual'].shift(24)

    # --- Encode jam & bulan secara siklikal ---
    df['Jam_num']   = df['Datetime'].dt.hour
    df['Bulan']     = df['Datetime'].dt.month
    df['Jam_sin']   = np.sin(2 * np.pi * df['Jam_num'] / 24)
    df['Jam_cos']   = np.cos(2 * np.pi * df['Jam_num'] / 24)
    df['Bulan_sin'] = np.sin(2 * np.pi * df['Bulan']   / 12)
    df['Bulan_cos'] = np.cos(2 * np.pi * df['Bulan']   / 12)

    # --- Rolling statistik ---
    df['Rolling_mean_6']  = df['Manual'].rolling(window=6,  min_periods=1).mean()
    df['Rolling_mean_24'] = df['Manual'].rolling(window=24, min_periods=1).mean()
    df['Rolling_std_6']   = df['Manual'].rolling(window=6,  min_periods=1).std().fillna(0)

    # --- Diferensiasi ---
    df['Delta_1Jam']  = df['Manual'].diff(1).fillna(0)
    df['Delta_2Jam']  = df['Manual'].diff(2).fillna(0)
    df['Delta_6Jam']  = df['Manual'].diff(6).fillna(0)
    df['Delta_12Jam'] = df['Manual'].diff(12).fillna(0)

    # --- Harmonik pasang surut ---
    t = (df['Datetime'] - REFERENSI_WAKTU_HARMONIK).dt.total_seconds() / 3600.0
    for nama, periode in KOMPONEN_PASUT.items():
        omega = 2 * np.pi / periode
        df[f'{nama}_sin'] = np.sin(omega * t)
        df[f'{nama}_cos'] = np.cos(omega * t)

    # --- Fase & amplitudo lokal ---
    # FIX B: hapus center=True. Versi sebelumnya memakai rolling
    # center=True (melihat 6 jam ke depan), tidak konsisten dengan
    # notebook preprocessing yang sudah diperbaiki agar hanya melihat
    # ke belakang (mencegah data leakage & menyamakan dengan training).
    rolling_max = df['Manual'].rolling(window=13, min_periods=1).max()
    rolling_min = df['Manual'].rolling(window=13, min_periods=1).min()
    df['Amplitudo_lokal'] = rolling_max - rolling_min
    df['Posisi_siklus']   = (
        (df['Manual'] - rolling_min) / (rolling_max - rolling_min + 1e-6)
    )

    # --- FIX A: fitur deteksi anomali pasif (identik dengan preprocessing) ---

    # Amplitudo tidal 24 jam terakhir (rolling max - min)
    df['Amplitudo_24j'] = (
        df['Manual'].rolling(window=24, min_periods=1).max() -
        df['Manual'].rolling(window=24, min_periods=1).min()
    )

    # Z-score amplitudo vs 30 hari terakhir
    rolling_mean_amp = df['Amplitudo_24j'].rolling(window=24 * 30, min_periods=24).mean()
    rolling_std_amp  = df['Amplitudo_24j'].rolling(window=24 * 30, min_periods=24).std()
    df['Amplitudo_zscore'] = (
        (df['Amplitudo_24j'] - rolling_mean_amp) / (rolling_std_amp + 1e-6)
    ).fillna(0)

    # Residual dari komponen harmonik dominan (M2 + K1) vs rata-rata
    # Manual dari SELURUH dataset training (konstanta MANUAL_MEAN_TRAINING)
    harmonic_pred = (
        np.sin(2 * np.pi * t / 12.4206) * 10 +
        np.cos(2 * np.pi * t / 12.4206) * 10 +
        np.sin(2 * np.pi * t / 23.9345) * 5 +
        np.cos(2 * np.pi * t / 23.9345) * 5
    )
    df['Residual_harmonik'] = df['Manual'] - (harmonic_pred + MANUAL_MEAN_TRAINING)
    residual_abs = df['Residual_harmonik'].abs()
    df['Residual_rolling6'] = residual_abs.rolling(window=6, min_periods=1).mean()

    # Buang baris awal yang NaN akibat shift terpanjang (24 jam)
    df = df.dropna(subset=[
        'Tinggi_-1Jam', 'Tinggi_-2Jam',
        'Tinggi_-6Jam', 'Tinggi_-12Jam', 'Tinggi_-24Jam',
    ]).reset_index(drop=True)

    return df


# ── Inference ─────────────────────────────────────────────────────────────

def prediksi_multistep(df_fitur: pd.DataFrame) -> List[HasilJam]:
    """
    SATU forward pass: ambil LOOKBACK jam terakhir, model langsung
    mengembalikan HORIZON nilai sekaligus.
    Tidak ada iterasi, tidak ada akumulasi error.
    """
    if len(df_fitur) < LOOKBACK:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Data riwayat kurang setelah feature engineering. "
                f"Tersedia {len(df_fitur)} baris valid, butuh minimal {LOOKBACK}."
            )
        )

    window_df     = df_fitur[FITUR_COLS].iloc[-LOOKBACK:]                  # (LOOKBACK, 33)
    window_scaled = scaler_fitur.transform(window_df)
    X             = window_scaled.reshape(1, LOOKBACK, len(FITUR_COLS))    # (1, LOOKBACK, 33)

    pred_scaled = model.predict(X, verbose=0)                      # (1, 24)
    pred_cm     = scaler_label.inverse_transform(
                      pred_scaled.reshape(-1, 1)
                  ).flatten()                                       # (24,)

    last_dt = df_fitur['Datetime'].iloc[-1]
    hasil = []
    for h in range(HORIZON):
        next_dt = last_dt + pd.Timedelta(hours=h + 1)
        hasil.append(HasilJam(
            datetime=next_dt.strftime("%Y-%m-%d %H:%M:%S"),
            jam=next_dt.hour,
            prediksi_cm=round(float(pred_cm[h]), 2),
        ))

    return hasil


# ── Endpoint ──────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status"       : "ok",
        "model_loaded" : model is not None,
        "lookback_jam" : LOOKBACK,
        "lookback_hari": LOOKBACK // 24,
        "horizon"      : HORIZON,
        "jumlah_fitur" : len(FITUR_COLS),
    }


@app.post("/predict", response_model=PrediksiResponse)
def predict(payload: PrediksiRequest, x_api_key: Optional[str] = Header(None)):
    if INTERNAL_API_KEY and x_api_key != INTERNAL_API_KEY:
        raise HTTPException(status_code=401, detail="API key tidak valid.")

    # LOOKBACK + MAX_LAG_JAM = baris minimum agar fitur lag terpanjang
    # (Tinggi_-24Jam) tidak NaN tepat di awal window LOOKBACK.
    min_riwayat = LOOKBACK + MAX_LAG_JAM
    if len(payload.riwayat) < min_riwayat:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Minimal {min_riwayat} baris riwayat dibutuhkan "
                f"(LOOKBACK={LOOKBACK} jam [{LOOKBACK // 24} hari] "
                f"+ {MAX_LAG_JAM} jam untuk fitur lag terpanjang), "
                f"dapat {len(payload.riwayat)}."
            )
        )

    df = pd.DataFrame([r.dict() for r in payload.riwayat])
    df = df.rename(columns={
        'manual'  : 'Manual',
        'sensor'  : 'Sensor',
        'datetime': 'Datetime',
    })

    df_fitur = hitung_fitur(df)
    hasil    = prediksi_multistep(df_fitur)

    return PrediksiResponse(count=len(hasil), hasil=hasil)