<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ProfileController extends Controller
{
    // GET /api/admin/profile
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'name'    => $user->name,
            'email'   => $user->email,
            'phone'   => $user->phone,
            'jabatan' => $user->jabatan,
            'role'    => $user->getRoleNames()->first(),
        ]);
    }

    // PUT /api/admin/profile
    public function update(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:100',
            'email'   => 'required|email|unique:users,email,' . $request->user()->id,
            'phone'   => 'nullable|string|max:20',
            'jabatan' => 'nullable|string|max:100',
        ]);

        $user = $request->user();
        $user->update($request->only('name', 'email', 'phone', 'jabatan'));

        return response()->json([
            'message' => 'Profil berhasil diperbarui.',
            'user'    => [
                'name'    => $user->name,
                'email'   => $user->email,
                'phone'   => $user->phone,
                'jabatan' => $user->jabatan,
                'role'    => $user->getRoleNames()->first(),
            ],
        ]);
    }

    // PUT /api/admin/profile/password
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed', // butuh new_password_confirmation
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Password saat ini salah.'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);

        // Revoke semua token lama, buat token baru
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Password berhasil diubah.',
            'token'   => $token,
        ]);
    }
}