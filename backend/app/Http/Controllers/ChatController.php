<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\PasangSurut;
use App\Models\Weather;
use App\Models\WilayahRob;
use Carbon\Carbon;

class ChatController extends Controller
{
    // ── Offset MSL terhadap Chart Datum/LWS stasiun pasut yang dipakai. ──
    // Harus SAMA dengan MSL_VALUE di WilayahRobController &
    // PasangSurutController (dan src/utils/tideHelpers.js di frontend).
    // Tanpa offset ini, tinggi_rob yang dihitung untuk konteks chatbot
    // akan 1.5 m lebih tinggi dari yang seharusnya, sehingga Marin bisa
    // menyebutkan wilayah terdampak yang BEDA dari yang ditampilkan di
    // peta/dashboard.
    //
    // TODO: sama seperti controller lain, pindahkan ke config/env supaya
    // hanya didefinisikan sekali dan tidak berisiko out-of-sync.
    const MSL_VALUE = 1.5; // meter

    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        $pasangSurutText = $this->buildPasangSurutText();
        $weatherText     = $this->buildWeatherText();
        [$wilayahText, $wilayahTerdampakText] = $this->buildWilayahRobText();

        $prompt = $this->buildPrompt(
            $pasangSurutText,
            $weatherText,
            $wilayahText,
            $wilayahTerdampakText,
            $validated['message']
        );

        try {
            $response = Http::timeout(30)->post(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
                . config('services.gemini.api_key'),
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                ]
            );
        } catch (\Exception $e) {
            Log::error('Gemini request gagal: ' . $e->getMessage());

            return response()->json([
                'reply' => 'Aduh, Marin lagi nggak bisa terhubung ke server AI nih. Coba lagi sebentar ya~',
            ], 503);
        }

        if (!$response->successful()) {
            Log::error('Gemini error: ' . $response->body());

            return response()->json([
                'reply' => 'Maaf, Marin lagi ada gangguan jawab pertanyaan kamu. Coba lagi ya!',
            ], 502);
        }

        $reply = $response->json('candidates.0.content.parts.0.text')
            ?? 'Maaf, Marin belum dapat jawaban dari AI buat pertanyaan ini.';

        $reply = $this->sanitizeReply($reply);

        return response()->json(['reply' => $reply]);
    }

    // ── Bersihkan markdown yang kadang masih lolos dari AI meski sudah
    //    diinstruksikan untuk tidak dipakai (bold/italic/underline/bullet
    //    bertanda bintang). Baris tabel markdown (mengandung "|") sengaja
    //    DIBIARKAN apa adanya karena frontend akan merender itu jadi
    //    tabel HTML sungguhan — bukan tabel mentah. ──
    private function sanitizeReply(string $text): string
    {
        $lines = explode("\n", $text);

        $cleaned = array_map(function ($line) {
            $trimmed = trim($line);

            // Baris tabel markdown: biarkan utuh, jangan diutak-atik.
            if (str_starts_with($trimmed, '|') && substr_count($trimmed, '|') >= 2) {
                return $line;
            }

            // **bold** atau __bold__ → teks polos
            $line = preg_replace('/\*\*(.+?)\*\*/s', '$1', $line);
            $line = preg_replace('/__(.+?)__/s', '$1', $line);

            // *italic* atau _italic_ → teks polos (hindari nabrak ** yang sudah dibersihkan)
            $line = preg_replace('/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/s', '$1', $line);
            $line = preg_replace('/(?<!_)_(?!_)(.+?)(?<!_)_(?!_)/s', '$1', $line);

            // Bullet "* item" atau "- item" di awal baris → bullet polos "• item"
            $line = preg_replace('/^[\*\-]\s+/', '• ', $line);

            return $line;
        }, $lines);

        return implode("\n", $cleaned);
    }

    // ── Ringkasan data pasang surut hari ini, fallback ke tanggal terakhir
    //    yang tersedia kalau hari ini belum ada data sama sekali ──
    private function buildPasangSurutText(): string
    {
        $today = Carbon::today()->toDateString();

        $kolom = ['tanggal', 'jam', 'tide_height_digital', 'tide_height_manual', 'tide_height_prediction', 'status'];

        $pasangSurut = PasangSurut::where('tanggal', $today)
            ->orderBy('jam')
            ->get($kolom);

        $isFallback = false;

        if ($pasangSurut->isEmpty()) {
            $latestDate = PasangSurut::max('tanggal');

            if ($latestDate) {
                $pasangSurut = PasangSurut::where('tanggal', $latestDate)
                    ->orderBy('jam')
                    ->get($kolom);
                $isFallback = true;
            }
        }

        if ($pasangSurut->isEmpty()) {
            return 'Tidak ada data pasang surut yang tersedia saat ini.';
        }

        $tanggalDipakai = $pasangSurut->first()->tanggal->toDateString();
        $label = $isFallback
            ? "data terakhir tersedia ({$tanggalDipakai}, karena belum ada data untuk hari ini)"
            : "hari ini ({$tanggalDipakai})";

        $jamSekarang = Carbon::now()->hour;

        $baris = $pasangSurut->map(function ($p) use ($jamSekarang) {
            $bagian = ["Jam {$p->jam}:00"];

            // PENTING: tide_height_digital = data AKTUAL dari sensor (paling valid).
            // tide_height_prediction = hasil PREDIKSI model BiLSTM, dipakai untuk
            // jam yang sensornya belum/tidak merekam (biasanya jam-jam ke depan).
            // Keduanya beda sumber, jadi harus ditandai jelas — jangan dianggap sama.
            if ($p->tide_height_digital !== null) {
                $bagian[] = "tinggi air AKTUAL (sensor): {$p->tide_height_digital} m";
                if ($p->tide_height_prediction !== null) {
                    $bagian[] = "prediksi model saat itu: {$p->tide_height_prediction} m";
                }
            } elseif ($p->tide_height_prediction !== null) {
                $bagian[] = "tinggi air PREDIKSI (belum ada data sensor): {$p->tide_height_prediction} m";
            } else {
                $bagian[] = "belum ada data aktual maupun prediksi untuk jam ini";
            }

            if ($p->tide_height_manual !== null) {
                $bagian[] = "manual: {$p->tide_height_manual} m";
            }
            if ($p->status) {
                $bagian[] = "status: {$p->status}";
            }
            if ($p->jam == $jamSekarang) {
                $bagian[] = "(jam saat ini)";
            }

            return '  - ' . implode(', ', $bagian);
        })->join("\n");

        return "Data pasang surut {$label} (jam sekarang: {$jamSekarang}:00):\n{$baris}";
    }

    // ── Ringkasan cuaca: rata-rata semua titik pantau + cuaca/arah angin
    //    dominan, mengikuti logika WeatherController::rataRata() ──
    private function buildWeatherText(): string
    {
        $data = Weather::all();

        if ($data->isEmpty()) {
            return 'Tidak ada data cuaca yang tersedia.';
        }

        $suhu           = round($data->avg('t'), 1);
        $kelembapan     = round($data->avg('hu'), 1);
        $kecepatanAngin = round($data->avg('ws'), 1);

        $arahAngin = $data->whereNotNull('wd')
            ->groupBy('wd')->map->count()->sortDesc()->keys()->first();

        $cuacaDominan = $data->whereNotNull('weather_desc')
            ->groupBy('weather_desc')->map->count()->sortDesc()->keys()->first();

        $terbaru = $data->sortByDesc('utc_datetime')->first();
        $waktuUpdate = optional($terbaru->local_datetime)->format('d M Y H:i');

        $baris = [
            "  Suhu rata-rata      : " . ($suhu ?? '-') . " °C",
            "  Kelembapan rata-rata: " . ($kelembapan ?? '-') . " %",
            "  Kecepatan angin     : " . ($kecepatanAngin ?? '-') . " km/jam",
            "  Arah angin dominan  : " . ($arahAngin ?? '-'),
            "  Cuaca dominan       : " . ($cuacaDominan ?? '-'),
            "  Jumlah titik pantau : {$data->count()} wilayah",
        ];

        if ($waktuUpdate) {
            $baris[] = "  Update terakhir     : {$waktuUpdate}";
        }

        return implode("\n", $baris);
    }

    // ── Daftar wilayah rob + wilayah yang berpotensi terdampak.
    //    PENTING: tide_height_digital direferensikan ke Chart Datum,
    //    sedangkan tinggi_tanah direferensikan ke MSL — HARUS dikonversi
    //    dulu pakai MSL_VALUE sebelum dibandingkan, persis seperti
    //    WilayahRobController::petaData() dan PasangSurutController::robPerWilayah().
    //    (Sebelumnya rumus ini langsung "tide_height_digital - tinggi_tanah"
    //    tanpa offset MSL, membuat chatbot bisa menyebut wilayah terdampak
    //    yang BEDA dari yang tampil di peta/dashboard — sudah diperbaiki.) ──
    private function buildWilayahRobText(): array
    {
        $wilayahRob = WilayahRob::all(['nama_wilayah', 'tinggi_tanah']);

        if ($wilayahRob->isEmpty()) {
            return ['Tidak ada data wilayah rob.', ''];
        }

        $wilayahText = $wilayahRob
            ->map(fn($w) => "  - {$w->nama_wilayah} (tinggi tanah: {$w->tinggi_tanah} m)")
            ->join("\n");

        // Pakai data air terkini (jam terbaru yang tersedia), sama seperti
        // yang dipakai WilayahRobController::petaData() untuk peta.
        $air = PasangSurut::whereNotNull('tide_height_digital')
            ->orderByDesc('tanggal')
            ->orderByDesc('jam')
            ->first();

        if (!$air) {
            return [$wilayahText, "\n  Belum bisa menentukan wilayah terdampak karena belum ada data tinggi air."];
        }

        $waktuAir = $air->tanggal->toDateString() . ' ' . str_pad($air->jam, 2, '0', STR_PAD_LEFT) . ':00';

        // Konversi ke skala MSL dulu, baru dibandingkan dengan tinggi_tanah.
        $tinggiAirMsl = $air->tide_height_digital - self::MSL_VALUE;

        $terdampak = $wilayahRob
            ->map(function ($w) use ($tinggiAirMsl) {
                $tinggiRob = round($tinggiAirMsl - $w->tinggi_tanah, 2);
                return ['nama' => $w->nama_wilayah, 'tinggi_rob' => $tinggiRob];
            })
            ->filter(fn($w) => $w['tinggi_rob'] > 0)
            ->sortByDesc('tinggi_rob');

        $wilayahTerdampakText = $terdampak->isEmpty()
            ? "\n  Tidak ada wilayah yang berpotensi terdampak rob saat ini (data jam {$waktuAir}, tinggi air {$air->tide_height_digital} m / skala MSL: " . round($tinggiAirMsl, 2) . " m)."
            : "\n  Wilayah berpotensi terdampak rob (data jam {$waktuAir}, tinggi air {$air->tide_height_digital} m / skala MSL: " . round($tinggiAirMsl, 2) . " m):\n"
              . $terdampak->map(fn($w) => "    ⚠ {$w['nama']} (tergenang ~{$w['tinggi_rob']} m)")->join("\n");

        return [$wilayahText, $wilayahTerdampakText];
    }

    private function buildPrompt(
        string $pasangSurutText,
        string $weatherText,
        string $wilayahText,
        string $wilayahTerdampakText,
        string $pertanyaan
    ): string {
        return <<<PROMPT
Kamu adalah Marin Minamo — asisten AI perempuan muda yang ceria, hangat, dan peduli untuk sistem monitoring MY_OCEAN milik BMKG.

Kepribadianmu:
- Bicara seperti teman perempuan yang ramah, imut dan perhatian, bukan robot
- Gunakan bahasa sehari-hari yang santai tapi tetap informatif
- Boleh pakai kata-kata seperti "Hei!", "Wah,", "Iya nih,", "Tenang ya,", "Kamu", dll
- Sesekali tambahkan ekspresi empati atau kepedulian ("Hati-hati ya!", "Semoga harinya menyenangkan!", "Jangan lupa bawa payung~")
- Jika ada potensi bahaya (rob, cuaca buruk), sampaikan dengan nada serius tapi tetap menenangkan
- JANGAN gunakan format markdown seperti **bold**, *italic*, underline, atau bullet bertanda bintang (*) / dash (-) — tulis natural seperti pesan chat biasa. Kalau perlu bikin daftar, gunakan tanda "•" langsung di awal baris
- KECUALI kalau pengguna minta perbandingan, daftar dengan banyak kolom data, atau sesuatu yang lebih jelas ditampilkan berdampingan — di situ kamu BOLEH pakai format tabel markdown standar, contoh:
  | Wilayah | Tinggi Rob |
  | --- | --- |
  | Tanjung Mas | 1.35 m |
  Tabel ini akan otomatis dirender rapi di layar pengguna, jadi pakai kalau memang relevan dan datanya tersedia
- Jawab singkat dan to the point, tidak perlu bertele-tele
- Selalu dalam Bahasa Indonesia
- Data pasang surut punya dua sumber berbeda: AKTUAL (dari sensor, paling akurat) dan PREDIKSI (hasil model, dipakai untuk jam yang sensornya belum merekam). Kalau ditanya soal tinggi air, SELALU sebutkan apakah angka yang kamu kasih itu data aktual atau prediksi, terutama untuk jam-jam di masa depan dari "jam sekarang" yang tertera di data

Gunakan data real-time berikut sebagai referensi utama jawabanmu.

═══════════════════════════════════════
DATA PASANG SURUT
═══════════════════════════════════════
{$pasangSurutText}

═══════════════════════════════════════
DATA CUACA MARITIM
═══════════════════════════════════════
{$weatherText}

═══════════════════════════════════════
DATA WILAYAH ROB
═══════════════════════════════════════
{$wilayahText}
{$wilayahTerdampakText}

═══════════════════════════════════════
PERTANYAAN PENGGUNA
═══════════════════════════════════════
{$pertanyaan}
PROMPT;
    }
}