<?php
namespace App\Http\Controllers;

use App\Models\Weather;
use Illuminate\Http\JsonResponse;

class WeatherController extends Controller
{
    public function rataRata(): JsonResponse
    {
        $data = Weather::all();

        if ($data->isEmpty()) {
            return response()->json([
                'suhu'            => null,
                'kelembapan'      => null,
                'kecepatan_angin' => null,
                'arah_angin'      => null,
                'cuaca'           => null,
                'total_wilayah'   => 0,
            ]);
        }

        $suhu           = round($data->avg('t'), 1);
        $kelembapan     = round($data->avg('hu'), 1);
        $kecepatanAngin = round($data->avg('ws'), 1);

        // Arah angin dominan (modus)
        $arahAngin = $data
            ->whereNotNull('wd')
            ->groupBy('wd')
            ->map->count()
            ->sortDesc()
            ->keys()
            ->first();

        // Cuaca dominan dari weather_desc
        $cuaca = $data
            ->whereNotNull('weather_desc')
            ->groupBy('weather_desc')
            ->map->count()
            ->sortDesc()
            ->keys()
            ->first();

        return response()->json([
            'suhu'            => $suhu,
            'kelembapan'      => $kelembapan,
            'kecepatan_angin' => $kecepatanAngin,
            'arah_angin'      => $arahAngin,
            'cuaca'           => $cuaca,
            'total_wilayah'   => $data->count(),
        ]);
    }
}