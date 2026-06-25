<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\ProfileController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\WeatherController;
use App\Models\Weather;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PasangSurutController;
use App\Http\Controllers\WilayahRobController;
use App\Http\Controllers\ChatController;

// ── Test ──────────────────────────────────────────────────────────────────────
Route::get('/test', function () {
    return response()->json(['message' => 'My_Ocean API Connected']);
});

// ── Auth ──────────────────────────────────────────────────────────────────────
Route::post('/ocean-control-center/login', [AuthController::class, 'login']);

// ── Protected routes (semua user yang sudah login) ────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Profil
    Route::get('/admin/profile', [ProfileController::class, 'show']);
    Route::put('/admin/profile', [ProfileController::class, 'update']);
    Route::put('/admin/profile/password', [ProfileController::class, 'updatePassword']);

    // Dashboard stats
    Route::get('/admin/dashboard/stats', function () {
        return response()->json([
            'stasiun_aktif' => 12,
            'stasiun_offline' => 2,
            'alert_aktif' => 3,
            'alert_bahaya' => 1,
            'rata_tinggi_air' => 1.4,
            'delta_air' => 12,
            'prediksi_1jam' => 1.8,
            'prediksi_status' => 'waspada',
        ]);
    });

    // Alerts
    Route::get('/admin/alerts', function () {
        return response()->json([
            'data' => [
                ['id' => 1, 'lokasi' => 'Pantai Marina Semarang', 'waktu' => '07:20 WIB', 'tinggi' => 1.92, 'level' => 'bahaya'],
                ['id' => 2, 'lokasi' => 'Pelabuhan Tanjung Emas', 'waktu' => '07:05 WIB', 'tinggi' => 1.71, 'level' => 'waspada'],
                ['id' => 3, 'lokasi' => 'Pantai Boom Rembang', 'waktu' => '06:50 WIB', 'tinggi' => 1.18, 'level' => 'normal'],
            ]
        ]);
    });

    // Weather summary
    Route::get('/weather/summary', function () {
        $latest = Weather::latest()->first();
        return response()->json([
            'suhu' => $latest?->temperature ?? null,
            'angin' => $latest?->wind_speed ?? null,
            'kelembapan' => $latest?->humidity ?? null,
            'gelombang' => $latest?->wave_height ?? null,
        ]);
    });

});

// ── Super Admin only ──────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:super_admin'])->group(function () {

    Route::get('/super-admin-only', function () {
        return response()->json(['message' => 'Hanya super admin yang bisa akses']);
    });

    // ── Manajemen Pengguna ────────────────────────────────────────────────────
    Route::prefix('admin/users')->group(function () {
        Route::get('/', [UserManagementController::class, 'index']);          // daftar
        Route::post('/', [UserManagementController::class, 'store']);          // tambah
        Route::put('/{id}', [UserManagementController::class, 'update']);         // edit nama/email/role
        Route::patch('/{id}/password', [UserManagementController::class, 'updatePassword']); // ganti password
        Route::patch('/{id}/toggle', [UserManagementController::class, 'toggle']);         // aktif/nonaktif
    });

    // Route lama — tetap ada agar tidak break
    Route::post('/admin/create-staff', [UserManagementController::class, 'createStaff']);

});

// ── Cuaca publik ──────────────────────────────────────────────────────────────
Route::get('/cuaca-semarang', function () {
    return response()->json([
        'total' => Weather::count(),
        'data' => Weather::all(),
    ]);
});

// ── Pasang Surut ──────────────────────────────────────────────────────────────
Route::get('/pasang-surut', function () {
    $robAreas = [
        'Tambakharjo',
        'Tawangsari',
        'Tawangmas',
        'Panggung Lor',
        'Bandarharjo',
        'Tanjung Mas',
        'Kemijen',
        'Tambakrejo',
        'Terboyo Kulon',
        'Terboyo Wetan',
        'Trimulyo',
    ];

    $data = Weather::whereIn('desa', $robAreas)
        ->orderBy('desa', 'asc')
        ->orderBy('local_datetime', 'desc')
        ->get()
        ->unique('desa')
        ->values()
        ->map(function ($item, $index) {
            $tideHeight = round(
                1.5 + sin($index / 2) * 0.8 + ($item->ws ?? 0) / 100,
                2
            );

            return [
                'id' => $item->id,
                'lokasi' => $item->desa . ', ' . $item->kecamatan,
                'desa' => $item->desa,
                'kecamatan' => $item->kecamatan,

                'lat' => $item->lat,
                'lon' => $item->lon,

                'datetime' => $item->local_datetime,
                'tide_height' => $tideHeight,
                'status' => $tideHeight >= 1.8 ? 'Pasang' : 'Surut',
                'kenaikan_air' => $tideHeight,
            ];
        });

    return response()->json([
        'total' => $data->count(),
        'data' => $data,
    ]);
});

Route::get('/weather/rata-rata', [WeatherController::class, 'rataRata']);

Route::get('/pasang-surut', [PasangSurutController::class, 'index']);
Route::get('/pasang-surut/rob-wilayah', [PasangSurutController::class, 'robPerWilayah']);

// Admin (wajib login via Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/admin/pasang-surut', [PasangSurutController::class, 'adminIndex']);
    Route::post('/admin/pasang-surut', [PasangSurutController::class, 'store']);
    Route::put('/admin/pasang-surut/{pasangSurut}', [PasangSurutController::class, 'update']);
    Route::delete('/admin/pasang-surut/{pasangSurut}', [PasangSurutController::class, 'destroy']);

    Route::get('/admin/wilayah-rob', [WilayahRobController::class, 'index']);
    Route::post('/admin/wilayah-rob', [WilayahRobController::class, 'store']);
    Route::put('/admin/wilayah-rob/{wilayahRob}', [WilayahRobController::class, 'update']);
    Route::delete('/admin/wilayah-rob/{wilayahRob}', [WilayahRobController::class, 'destroy']);
});

Route::post('/admin/pasang-surut/generate-prediksi', [PasangSurutController::class, 'generatePrediksi']);

Route::get('/wilayah-rob', [WilayahRobController::class, 'index']);
Route::get('/peta/rob-data', [WilayahRobController::class, 'petaData']);

// ── Admin (sesuaikan middleware dengan yang dipakai di route admin lain) ──
Route::prefix('admin/wilayah-rob')->group(function () {
    Route::get('/', [WilayahRobController::class, 'adminIndex']);
    Route::post('/', [WilayahRobController::class, 'store']);
    Route::put('/{wilayahRob}', [WilayahRobController::class, 'update']);
    Route::delete('/{wilayahRob}', [WilayahRobController::class, 'destroy']);
    Route::put('/{wilayahRob}/geojson', [WilayahRobController::class, 'updateGeojson']);
});


Route::post('/chat', [ChatController::class, 'chat']);