<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Models\Weather;
use Illuminate\Support\Facades\Route;

// Test
Route::get('/test', function () {
    return response()->json(['message' => 'My_Ocean API Connected']);
});

// Auth
Route::post('/ocean-control-center/login', [AuthController::class, 'login']);

// Protected routes (semua user login)
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profil
    Route::get('/admin/profile', [ProfileController::class, 'show']);
    Route::put('/admin/profile', [ProfileController::class, 'update']);
    Route::put('/admin/profile/password', [ProfileController::class, 'updatePassword']);

    // Dashboard stats (dummy dulu, nanti isi logic)
    Route::get('/admin/dashboard/stats', function () {
        return response()->json([
            'stasiun_aktif'    => 12,
            'stasiun_offline'  => 2,
            'alert_aktif'      => 3,
            'alert_bahaya'     => 1,
            'rata_tinggi_air'  => 1.4,
            'delta_air'        => 12,
            'prediksi_1jam'    => 1.8,
            'prediksi_status'  => 'waspada',
        ]);
    });

    // Alerts (dummy dulu)
    Route::get('/admin/alerts', function () {
        return response()->json([
            'data' => [
                ['id' => 1, 'lokasi' => 'Pantai Marina Semarang',  'waktu' => '07:20 WIB', 'tinggi' => 1.92, 'level' => 'bahaya'],
                ['id' => 2, 'lokasi' => 'Pelabuhan Tanjung Emas',  'waktu' => '07:05 WIB', 'tinggi' => 1.71, 'level' => 'waspada'],
                ['id' => 3, 'lokasi' => 'Pantai Boom Rembang',     'waktu' => '06:50 WIB', 'tinggi' => 1.18, 'level' => 'normal'],
            ]
        ]);
    });

    // Weather summary
    Route::get('/weather/summary', function () {
        $latest = Weather::latest()->first();
        return response()->json([
            'suhu'       => $latest?->temperature ?? null,
            'angin'      => $latest?->wind_speed ?? null,
            'kelembapan' => $latest?->humidity ?? null,
            'gelombang'  => $latest?->wave_height ?? null,
        ]);
    });

});

// Super admin only
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {

    Route::get('/super-admin-only', function () {
        return response()->json(['message' => 'Hanya super admin yang bisa akses']);
    });

    Route::post('/admin/create-staff', [UserManagementController::class, 'createStaff']);

});

// Cuaca publik
Route::get('/cuaca-semarang', function () {
    return response()->json([
        'total' => Weather::count(),
        'data'  => Weather::all(),
    ]);
});