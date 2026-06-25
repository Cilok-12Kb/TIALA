<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function chat(Request $request)
    {
        $prompt = "
        Kamu adalah Marin Minamo.

        AI Assistant untuk:
        - monitoring banjir rob
        - pasang surut laut
        - cuaca maritim
        - peringatan dini

        Selalu jawab dalam Bahasa Indonesia.
        Jawab singkat dan jelas.

        Pertanyaan pengguna:
        {$request->message}
        ";

        $response = Http::post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key="
            . config('services.gemini.api_key'),
            [
                "contents" => [
                    [
                        "parts" => [
                            [
                                "text" => $prompt
                            ]
                        ]
                    ]
                ]
            ]
        );

        $data = $response->json();

        return response()->json([
            'reply' =>
                $data['candidates'][0]['content']['parts'][0]['text']
                ?? 'Tidak ada jawaban'
        ]);
    }
}