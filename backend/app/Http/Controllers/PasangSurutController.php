<?php

namespace App\Http\Controllers;

use App\Models\PasangSurut;
use App\Models\WilayahRob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PasangSurutController extends Controller
{
    // Untuk grafik — ambil 24 data (jam 0-23) sesuai tanggal yang dipilih
    public function index(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $data = PasangSurut::where('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        return response()->json(['data' => $data]);
    }

    // Untuk tabel — hitung tinggi rob per wilayah sesuai tanggal & jam
    // Catatan: jam harus PERSIS cocok (bukan fallback ke jam sebelumnya).
    // Kalau data untuk jam tsb belum ada, kembalikan array kosong supaya
    // frontend bisa menampilkan status "data belum tersedia".
    public function robPerWilayah(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $jamParam = $request->query('jam');
        $jam = $jamParam !== null ? (int) explode(':', $jamParam)[0] : Carbon::now()->hour;

        $air = PasangSurut::where('tanggal', $tanggal)
            ->where('jam', $jam)
            ->first();

        if (!$air) {
            return response()->json(['data' => []]);
        }

        $wilayah = WilayahRob::all();

        $result = $wilayah->map(function ($w) use ($air) {
            $tinggiRob = round($air->tide_height_digital - $w->tinggi_tanah, 2);

            return [
                'nama_wilayah'        => $w->nama_wilayah,
                'tinggi_tanah'        => $w->tinggi_tanah,
                'tide_height_digital' => $air->tide_height_digital,
                'tinggi_rob'          => max($tinggiRob, 0),
                'tergenang'           => $tinggiRob > 0,
                'status'              => $air->status,
                'tanggal'             => $air->tanggal->toDateString(),
                'jam'                 => $air->jam,
            ];
        });

        return response()->json(['data' => $result]);
    }

    // ── CRUD untuk admin ──────────────────────────────────────────────

    // Daftar lengkap data pasang surut untuk tabel kelola admin
    // (beda dari index() yang khusus grafik — ini bisa difilter tanggal juga)
    public function adminIndex(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $data = PasangSurut::where('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal'                => 'required|date',
            'jam'                    => 'required|integer|min:0|max:23',
            'tide_height_digital'    => 'required|numeric',
            'tide_height_manual'     => 'nullable|numeric',
            'tide_height_prediction' => 'nullable|numeric',
        ]);

        // Cegah duplikat tanggal+jam (sesuai constraint unique di migration)
        $exists = PasangSurut::where('tanggal', $validated['tanggal'])
            ->where('jam', $validated['jam'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Data untuk tanggal dan jam ini sudah ada. Gunakan fitur edit.',
            ], 422);
        }

        $data = PasangSurut::create($validated);

        return response()->json(['data' => $data], 201);
    }

    public function update(Request $request, PasangSurut $pasangSurut)
    {
        $validated = $request->validate([
            'tanggal'                => 'required|date',
            'jam'                    => 'required|integer|min:0|max:23',
            'tide_height_digital'    => 'required|numeric',
            'tide_height_manual'     => 'nullable|numeric',
            'tide_height_prediction' => 'nullable|numeric',
        ]);

        // Cegah bentrok dengan baris lain (selain dirinya sendiri)
        $exists = PasangSurut::where('tanggal', $validated['tanggal'])
            ->where('jam', $validated['jam'])
            ->where('id', '!=', $pasangSurut->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Data untuk tanggal dan jam ini sudah ada di baris lain.',
            ], 422);
        }

        $pasangSurut->update($validated);

        return response()->json(['data' => $pasangSurut]);
    }

    public function destroy(PasangSurut $pasangSurut)
    {
        $pasangSurut->delete();

        return response()->json(['message' => 'Data berhasil dihapus']);
    }

    // ── Generate prediksi 24 jam untuk tanggal target, menggunakan model BiLSTM ──
    // Riwayat diambil otomatis dari 2 hari sebelum tanggal target
    // (contoh: target 2026-06-20 → riwayat diambil dari 2026-06-18 dan 2026-06-19).
    public function generatePrediksi(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
        ]);

        $tanggalTarget = Carbon::parse($validated['tanggal'])->startOfDay();

        // ============================
        // MODEL BARU
        // LOOKBACK = 360
        // Lag maksimum = 24 jam
        // Maka perlu 72 jam historis
        // ============================

        $LOOKBACK = 72;
        $LAG_MAX  = 24;
        $TOTAL_HISTORY = $LOOKBACK + $LAG_MAX;

        // ambil tepat 72 jam sebelum tanggal target
        $mulai = $tanggalTarget->copy()->subHours($TOTAL_HISTORY);

        $selesai = $tanggalTarget->copy()->subHour();

        $riwayat = PasangSurut::where(function ($q) use ($mulai, $selesai) {

            $q->whereRaw("
                TIMESTAMP(tanggal, MAKETIME(jam,0,0))
                BETWEEN ? AND ?
            ", [
                $mulai->format('Y-m-d H:i:s'),
                $selesai->format('Y-m-d H:i:s')
            ]);

        })
        ->orderBy('tanggal')
        ->orderBy('jam')
        ->get();

        if ($riwayat->count() != $TOTAL_HISTORY) {

            return response()->json([
                'message' =>
                    "Data historis tidak lengkap.\n\n".
                    "Model membutuhkan {$TOTAL_HISTORY} jam berturut-turut.\n".
                    "Didapat {$riwayat->count()} jam."
            ],422);

        }

        // ============================
        // cek tidak ada jam yang hilang
        // ============================

        $expected = $mulai->copy();

        foreach ($riwayat as $row) {

            $actual = Carbon::parse(
                $row->tanggal->toDateString()
                .' '
                .sprintf('%02d:00:00',$row->jam)
            );

            if (!$actual->equalTo($expected)) {

                return response()->json([
                    'message' =>
                        "Data tidak berurutan.\n".
                        "Seharusnya ada data ".
                        $expected->format('Y-m-d H:i').
                        " tetapi ditemukan ".
                        $actual->format('Y-m-d H:i')
                ],422);

            }

            $expected->addHour();

        }

        // ============================
        // kirim ke Python
        // ============================

        $payload = [

            'riwayat' => $riwayat->map(function ($row) {

                return [

                    'datetime' =>
                        $row->tanggal->toDateString().
                        ' '.
                        sprintf('%02d:00:00',$row->jam),

                    'manual' =>
                        (float)(
                            $row->tide_height_manual
                            ?? $row->tide_height_digital
                        ) * 100,

                    'sensor' =>
                        (float)$row->tide_height_digital * 100,

                ];

            })->values(),

        ];

        try {

            $response = Http::withHeaders([
                    'X-API-Key' => config('services.model_service.api_key'),
                ])
                ->timeout(60)
                ->post(
                    config('services.model_service.url').'/predict',
                    $payload
                );

        } catch (\Exception $e) {

            Log::error($e->getMessage());

            return response()->json([
                'message' =>
                    'Tidak dapat terhubung ke model service.'
            ],503);

        }

        if (!$response->successful()) {

            Log::error($response->body());

            return response()->json([
                'message' =>
                    'Model error : '.
                    ($response->json('detail')
                    ?? $response->body())
            ],502);

        }

        $hasil = $response->json('hasil');

        $disimpan = 0;

        foreach ($hasil as $prediksi) {

            $tanggal = substr($prediksi['datetime'],0,10);

            $jam = $prediksi['jam'];

            $meter = round(
                $prediksi['prediksi_cm']/100,
                3
            );

            PasangSurut::updateOrCreate(

                [
                    'tanggal'=>$tanggal,
                    'jam'=>$jam,
                ],

                [
                    'tide_height_prediction'=>$meter,
                ]

            );

            $disimpan++;

        }

        return response()->json([

            'message' =>
                "Berhasil generate {$disimpan} prediksi.",

            'count'=>$disimpan,

            'tanggal_target'=>$tanggalTarget->toDateString(),

            'data'=>$hasil

        ]);

    }
}