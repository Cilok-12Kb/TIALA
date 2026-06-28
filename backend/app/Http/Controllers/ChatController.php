<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\PasangSurut;
use App\Models\Weather;
use App\Models\WilayahRob;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        // ── 1. Ambil data pasang surut hari ini ──────────────────────────────
        $today = now()->toDateString();

        $pasangSurut = PasangSurut::where('tanggal', $today)
            ->orderBy('jam')
            ->get(['jam', 'tide_height_digital', 'tide_height_manual', 'tide_height_prediction']);

        $pasangSurutText = $pasangSurut->isEmpty()
            ? 'Tidak ada data pasang surut untuk hari ini.'
            : $pasangSurut->map(fn($p) =>
                "  Jam {$p->jam}:00 — "
                . "Digital: {$p->tide_height_digital} cm, "
                . "Manual: {$p->tide_height_manual} cm, "
                . "Prediksi: {$p->tide_height_prediction} cm"
              )->join("\n");

        // ── 2. Ambil data cuaca terbaru ──────────────────────────────────────
        $weather = Weather::latest('utc_datetime')->first();

        $weatherText = 'Tidak ada data cuaca tersedia.';
        if ($weather) {
            $prakiraan = is_array($weather->prakiraan)
                ? json_encode($weather->prakiraan, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT)
                : $weather->prakiraan;

            $weatherText = implode("\n", array_filter([
                "  Waktu analisis : " . optional($weather->analysis_date)->format('d M Y'),
                "  Waktu lokal    : " . optional($weather->local_datetime)->format('d M Y H:i'),
                "  Prakiraan      : " . $prakiraan,
            ]));
        }

        // ── 3. Ambil daftar wilayah rob & potensi terdampak ─────────────────
        $wilayahRob = WilayahRob::all(['nama_wilayah', 'tinggi_tanah']);

        $wilayahText = $wilayahRob->isEmpty()
            ? 'Tidak ada data wilayah rob.'
            : $wilayahRob->map(fn($w) =>
                "  - {$w->nama_wilayah} (tinggi tanah: {$w->tinggi_tanah} m)"
              )->join("\n");

        // Tandai wilayah yang berpotensi terdampak berdasarkan tinggi air saat ini
        $tinggiAirTerkini = optional(
            $pasangSurut->sortByDesc('jam')->first()
        )->tide_height_digital;

        $wilayahTerdampak = '';
        if ($tinggiAirTerkini !== null) {
            $terdampak = $wilayahRob->filter(
                fn($w) => ($w->tinggi_tanah * 100) <= $tinggiAirTerkini  // konversi m → cm
            );

            $wilayahTerdampak = $terdampak->isEmpty()
                ? "\n  Tidak ada wilayah yang berpotensi terdampak banjir rob saat ini."
                : "\n  Wilayah berpotensi terdampak rob (tinggi air {$tinggiAirTerkini} cm):\n"
                  . $terdampak->map(fn($w) => "    ⚠ {$w->nama_wilayah}")->join("\n");
        }

        // ── 4. Susun prompt dengan konteks database ──────────────────────────
        $prompt = <<<PROMPT
Kamu adalah Marin Minamo — asisten AI perempuan muda yang ceria, hangat, dan peduli untuk sistem monitoring MY_OCEAN milik BMKG.

Kepribadianmu:
- Bicara seperti teman perempuan yang ramah, imut dan perhatian, bukan robot
- Gunakan bahasa sehari-hari yang santai tapi tetap informatif
- Boleh pakai kata-kata seperti "Hei!", "Wah,", "Iya nih,", "Tenang ya,", "Kamu", dll
- Sesekali tambahkan ekspresi empati atau kepedulian ("Hati-hati ya!", "Semoga harinya menyenangkan!", "Jangan lupa bawa payung~")
- Jika ada potensi bahaya (rob, cuaca buruk), sampaikan dengan nada serius tapi tetap menenangkan
- JANGAN gunakan format markdown seperti **bold**, *italic*, atau bullet point bertanda bintang/dash — tulis natural seperti pesan chat biasa
- Jawab singkat dan to the point, tidak perlu bertele-tele
- Selalu dalam Bahasa Indonesia

Gunakan data real-time berikut sebagai referensi utama jawabanmu.

═══════════════════════════════════════
DATA PASANG SURUT — {$today}
═══════════════════════════════════════
{$pasangSurutText}

═══════════════════════════════════════
DATA CUACA MARITIM TERBARU
═══════════════════════════════════════
{$weatherText}

═══════════════════════════════════════
DATA WILAYAH ROB
═══════════════════════════════════════
{$wilayahText}
{$wilayahTerdampak}

═══════════════════════════════════════
PERTANYAAN PENGGUNA
═══════════════════════════════════════
{$request->message}
PROMPT;

        // ── 5. Kirim ke Gemini ───────────────────────────────────────────────
        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
            . config('services.gemini.api_key'),
            [
                "contents" => [
                    [
                        "parts" => [
                            ["text" => $prompt]
                        ]
                    ]
                ]
            ]
        );

        $data = $response->json();

        return response()->json([
            'reply' =>
                $data['candidates'][0]['content']['parts'][0]['text']
                ?? 'Tidak ada jawaban dari AI.'
        ]);
    }
}