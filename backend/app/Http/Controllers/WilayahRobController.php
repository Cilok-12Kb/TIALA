<?php

namespace App\Http\Controllers;

use App\Models\WilayahRob;
use App\Models\PasangSurut;
use Illuminate\Http\Request;
use Carbon\Carbon;

class WilayahRobController extends Controller
{
    // ── Offset MSL terhadap Chart Datum/LWS stasiun pasut yang dipakai. ──
    // Data "tide_height_digital" dari tabel PasangSurut direferensikan ke
    // Chart Datum (0 = air terendah teoritis stasiun tsb), sedangkan
    // "tinggi_tanah" direferensikan ke MSL (standar topografi nasional).
    // Nilai ini WAJIB dikurangkan dari tinggi_air sebelum dibandingkan
    // dengan tinggi_tanah, supaya kedua nilai berada dalam datum yang sama.
    //
    // TODO: pindahkan ke config/env (atau kolom per-stasiun di DB kalau nanti
    // multi-stasiun) supaya tidak hardcode dan tidak berisiko out-of-sync
    // dengan MSL_VALUE di frontend (src/utils/tideHelpers.js).
    const MSL_VALUE = 1.5; // meter

    // ── Publik: daftar wilayah untuk tabel di halaman peta ──
    public function index()
    {
        $wilayah = WilayahRob::orderBy('nama_wilayah')->get([
            'id', 'nama_wilayah', 'tinggi_tanah',
        ]);

        return response()->json(['data' => $wilayah]);
    }

    // ── Publik: data peta — wilayah + geometry + tinggi_rob real-time ──
    // Digabungkan dengan data pasang surut terkini (jam paling baru hari ini).
    // Frontend memakai endpoint ini untuk render polygon + warna risiko.
    public function petaData()
    {
        $wilayah = WilayahRob::orderBy('nama_wilayah')->get();

        // Ambil data pasang surut terkini (jam terakhir hari ini, atau hari sebelumnya)
        $air = PasangSurut::whereNotNull('tide_height_digital')
            ->orderByDesc('tanggal')
            ->orderByDesc('jam')
            ->first();

        $result = $wilayah->map(function ($w) use ($air) {
            $tinggiRob    = 0;
            $tinggiAir    = null;
            $tinggiAirMsl = null;

            if ($air) {
                $tinggiAir    = $air->tide_height_digital;
                // Konversi tinggi air dari Chart Datum ke MSL dulu, baru
                // dibandingkan dengan tinggi_tanah (yang sudah dalam MSL).
                $tinggiAirMsl = $tinggiAir - self::MSL_VALUE;
                $tinggiRob    = max(round($tinggiAirMsl - $w->tinggi_tanah, 2), 0);
            }

            // Decode geojson hanya kalau ada, biarkan null kalau belum diisi
            $geometry = null;
            if ($w->geojson) {
                $geometry = json_decode($w->geojson, true);
            }

            return [
                'id'            => $w->id,
                'nama_wilayah'  => $w->nama_wilayah,
                'tinggi_tanah'  => $w->tinggi_tanah,
                'tinggi_air'    => $tinggiAir,     // raw value, skala Chart Datum (untuk display/referensi)
                'tinggi_air_msl'=> $tinggiAirMsl,  // sudah dikonversi ke skala MSL (dipakai untuk kalkulasi)
                'tinggi_rob'    => $tinggiRob,
                'tergenang'     => $tinggiRob > 0,
                'geometry'      => $geometry, // null kalau belum ada GeoJSON
                'data_air_at'   => $air ? ($air->tanggal->toDateString() . ' ' . str_pad($air->jam, 2, '0', STR_PAD_LEFT) . ':00') : null,
            ];
        });

        return response()->json(['data' => $result]);
    }

    // ── Admin: daftar lengkap (termasuk ada/tidaknya geojson) ──
    public function adminIndex()
    {
        $wilayah = WilayahRob::orderBy('nama_wilayah')->get()->map(function ($w) {
            return [
                'id'            => $w->id,
                'nama_wilayah'  => $w->nama_wilayah,
                'tinggi_tanah'  => $w->tinggi_tanah,
                'has_geojson'   => !empty($w->geojson),
            ];
        });

        return response()->json(['data' => $wilayah]);
    }

    // ── Admin: tambah wilayah baru ──
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_wilayah' => 'required|string|max:100|unique:wilayah_rob,nama_wilayah',
            'tinggi_tanah' => 'required|numeric|min:0|max:10',
        ]);

        $wilayah = WilayahRob::create($validated);

        return response()->json(['data' => $wilayah], 201);
    }

    // ── Admin: update nama/tinggi tanah wilayah ──
    public function update(Request $request, WilayahRob $wilayahRob)
    {
        $validated = $request->validate([
            'nama_wilayah' => 'required|string|max:100|unique:wilayah_rob,nama_wilayah,' . $wilayahRob->id,
            'tinggi_tanah' => 'required|numeric|min:0|max:10',
        ]);

        $wilayahRob->update($validated);

        return response()->json(['data' => $wilayahRob]);
    }

    // ── Admin: hapus wilayah ──
    public function destroy(WilayahRob $wilayahRob)
    {
        $wilayahRob->delete();

        return response()->json(['message' => 'Wilayah berhasil dihapus.']);
    }

    // ── Admin: update/hapus geometri GeoJSON wilayah tertentu ──
    // Terpisah dari update() supaya form wilayah dan form peta bisa dikelola
    // secara independen tanpa harus selalu kirim keduanya sekaligus.
    public function updateGeojson(Request $request, WilayahRob $wilayahRob)
    {
        $validated = $request->validate([
            // geojson boleh null (untuk hapus geometri)
            'geojson' => 'nullable|string',
        ]);

        // Validasi format JSON kalau dikirim
        if (!empty($validated['geojson'])) {
            $decoded = json_decode($validated['geojson'], true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'Format GeoJSON tidak valid: ' . json_last_error_msg(),
                ], 422);
            }

            // Pastikan geometry-nya Polygon atau MultiPolygon
            $type = $decoded['type'] ?? '';
            if (!in_array($type, ['Polygon', 'MultiPolygon', 'Feature', 'FeatureCollection'])) {
                return response()->json([
                    'message' => 'GeoJSON harus bertipe Polygon, MultiPolygon, Feature, atau FeatureCollection.',
                ], 422);
            }
        }

        $wilayahRob->update(['geojson' => $validated['geojson'] ?? null]);

        return response()->json([
            'message'     => $validated['geojson'] ? 'Geometri berhasil disimpan.' : 'Geometri berhasil dihapus.',
            'has_geojson' => !empty($validated['geojson']),
        ]);
    }

    // ── Publik: prediksi rob per wilayah (untuk ringkasan di atas peta +
    // tabel prediksi), berdasarkan tide_height_prediction 24 jam pada tanggal
    // tsb. Beda dari petaData() yang pakai tide_height_digital (aktual, 1 jam).
    // WilayahRobController.php
    public function robPrediksiPerWilayah(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $prediksiJam = PasangSurut::where('tanggal', $tanggal)
            ->whereNotNull('tide_height_prediction')
            ->orderBy('jam')
            ->get();

        if ($prediksiJam->isEmpty()) {
            return response()->json(['data' => [], 'tanggal' => $tanggal]);
        }

        $wilayah = WilayahRob::orderBy('nama_wilayah')->get();

        $result = $wilayah->map(function ($w) use ($prediksiJam) {
            // Hitung tinggi rob prediksi tiap jam yang tersedia, sekaligus
            // simpan tinggi air mentahnya (skala Chart Datum) per jam supaya
            // bisa dipakai untuk kolom "Tinggi Air" di tabel prediksi.
            $perJam = $prediksiJam->map(function ($p) use ($w) {
                $tinggiAirMsl = $p->tide_height_prediction - self::MSL_VALUE;
                $tinggiRob    = round($tinggiAirMsl - $w->tinggi_tanah, 2);
                return [
                    'jam'         => (int) $p->jam,
                    'tinggi_air'  => $p->tide_height_prediction, // raw, skala Chart Datum
                    'tinggi_rob'  => max($tinggiRob, 0),
                    'tergenang'   => $tinggiRob > 0,
                ];
            })->values();

            $puncak = $perJam->sortByDesc('tinggi_rob')->first();

            $jamMulai = null;
            $jamSelesai = null;

            if ($puncak && $puncak['tergenang']) {
                // Ekspansi dari jam puncak ke kiri & kanan selama masih tergenang,
                // supaya rentang yang dilaporkan adalah SATU periode rob yang
                // sama (bukan gabungan beberapa periode terpisah dalam sehari).
                $byJam = $perJam->keyBy('jam');
                $jamMulai = $jamSelesai = $puncak['jam'];

                while ($byJam->has($jamMulai - 1) && $byJam[$jamMulai - 1]['tergenang']) {
                    $jamMulai--;
                }
                while ($byJam->has($jamSelesai + 1) && $byJam[$jamSelesai + 1]['tergenang']) {
                    $jamSelesai++;
                }
            }

            // Tinggi air prediksi tertinggi sepanjang hari (bukan cuma saat
            // rob puncak) — dipakai untuk kolom "Tinggi Air" tabel prediksi.
            $tinggiAirTertinggi = $perJam->max('tinggi_air');

            return [
                'nama_wilayah'              => $w->nama_wilayah,
                'tinggi_tanah'              => $w->tinggi_tanah,
                'tinggi_air_prediksi_max'   => $tinggiAirTertinggi !== null ? round($tinggiAirTertinggi, 2) : null,
                'tinggi_rob_max'            => $puncak['tinggi_rob'] ?? 0,
                'tergenang'                 => $puncak['tergenang'] ?? false,
                'jam_mulai'                 => $jamMulai,
                'jam_selesai'               => $jamSelesai,
            ];
        });

        return response()->json(['data' => $result, 'tanggal' => $tanggal]);
    }

    
}