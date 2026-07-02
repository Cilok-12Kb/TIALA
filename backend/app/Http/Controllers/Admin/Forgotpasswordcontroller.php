<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ForgotPasswordController extends Controller
{
    // ── POST /api/admin/forgot-password ──────────────────────────────────────
    // Hanya super_admin yang bisa request reset password
    public function sendResetLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Selalu kembalikan response sukses agar tidak bocor info user
        // User tidak ditemukan
        if (!$user) {
            return response()->json([
                'message' => 'Email tidak terdaftar.',
            ], 404);
        }

        // User bukan Super Admin
        if (!$user->hasRole('super_admin')) {
            return response()->json([
                'message' => 'Akun ini bukan Super Admin sehingga tidak dapat melakukan reset password.',
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Akun Anda tidak aktif. Hubungi administrator lain.',
            ], 403);
        }

        // Hapus token lama milik user ini
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email'      => $request->email,
            'token'      => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        $resetUrl = config('app.frontend_url')
            . '/ocean-reset-password?token=' . $token
            . '&email=' . urlencode($request->email);

        // Kirim email
        Mail::send('emails.admin_reset_password', [
            'user'     => $user,
            'resetUrl' => $resetUrl,
            'expiry'   => 60, // menit
        ], function ($mail) use ($user) {
            $mail->to($user->email, $user->name)
                 ->subject('[TIALA] Reset Password Admin');
        });

        return response()->json([
            'message' => 'Jika email terdaftar sebagai Super Admin, link reset password telah dikirim.',
        ]);
    }

    // ── POST /api/admin/reset-password ───────────────────────────────────────
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => 'required|string',
            'email'    => 'required|email',
            'password' => 'required|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        // Validasi token & kedaluwarsa (60 menit)
        if (
            !$record ||
            !Hash::check($request->token, $record->token) ||
            Carbon::parse($record->created_at)->addMinutes(60)->isPast()
        ) {
            return response()->json([
                'message' => 'Link reset password tidak valid atau telah kedaluwarsa.',
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->hasRole('super_admin')) {
            return response()->json([
                'message' => 'Akun tidak ditemukan atau tidak memiliki akses.',
            ], 403);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Hapus token setelah dipakai (one-time use)
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'message' => 'Password berhasil diperbarui. Silakan login dengan password baru.',
        ]);
    }

    // ── GET /api/admin/reset-password/validate ───────────────────────────────
    // Dipakai frontend untuk cek apakah token masih valid sebelum render form
    public function validateToken(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        $valid = $record &&
            Hash::check($request->token, $record->token) &&
            !Carbon::parse($record->created_at)->addMinutes(60)->isPast();

        if (!$valid) {
            return response()->json([
                'valid'   => false,
                'message' => 'Link reset password tidak valid atau telah kedaluwarsa.',
            ], 422);
        }

        return response()->json(['valid' => true]);
    }
}