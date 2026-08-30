<?php

namespace App\Http\Controllers\Api\Shared\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shared\User\User;
use App\Services\Shared\WhatsApp\ZestaWhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class OtpController extends Controller
{
    /**
     * Send OTP via Zesta WhatsApp API.
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'whatsapp' => ['required', 'string', 'max:30'],
            'type' => ['nullable', 'string', 'in:register,login,verify'],
            'name' => ['nullable', 'string', 'max:255'],
        ], [
            'whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rawWa = (string) $request->input('whatsapp');
        $normalizedWa = ZestaWhatsAppService::normalizePhone($rawWa);

        if (strlen($normalizedWa) < 10) {
            return response()->json(['message' => 'Format nomor WhatsApp tidak valid.'], 422);
        }

        $type = $request->input('type', 'register');

        // Check if phone number already registered for register mode
        if ($type === 'register') {
            $exists = User::query()->where('whatsapp', $normalizedWa)->exists();
            if ($exists) {
                return response()->json([
                    'message' => 'Nomor WhatsApp ini sudah terdaftar. Silakan login ke akun Anda.',
                ], 422);
            }
        }

        // Rate-limiting check: 1 OTP request every 30 seconds per phone number
        $rateLimitKey = "otp_throttle:{$normalizedWa}";
        if (Cache::has($rateLimitKey)) {
            $secondsLeft = (int) Cache::get($rateLimitKey) - time();
            if ($secondsLeft > 0) {
                return response()->json([
                    'message' => "Mohon tunggu {$secondsLeft} detik sebelum meminta kode OTP kembali.",
                ], 429);
            }
        }

        // Generate 6-digit OTP code
        $otp = (string) random_int(100000, 999999);
        $cacheKey = "otp:{$normalizedWa}";

        Cache::put($cacheKey, [
            'code' => $otp,
            'attempts' => 0,
            'created_at' => time(),
        ], now()->addMinutes(5));

        Cache::put($rateLimitKey, time() + 30, now()->addSeconds(30));

        $displayName = $request->input('name') ?: 'Pasien';

        // Dispatch via Zesta WhatsApp API
        $res = ZestaWhatsAppService::sendOtp($normalizedWa, $otp, $displayName);

        if (!$res['success']) {
            Log::warning("[OtpController] Failed to send OTP to {$normalizedWa}: " . ($res['message'] ?? 'Unknown error'));
        }

        $responsePayload = [
            'success' => true,
            'message' => 'Kode OTP berhasil dikirimkan ke nomor WhatsApp Anda.',
            'whatsapp' => $normalizedWa,
        ];

        // If local/debug mode, include debug_otp for testing convenience
        if (config('app.debug') || app()->environment('local')) {
            $responsePayload['debug_otp'] = $otp;
        }

        return response()->json($responsePayload);
    }

    /**
     * Verify OTP code sent to WhatsApp number.
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'whatsapp' => ['required', 'string', 'max:30'],
            'otp' => ['required', 'string', 'size:6'],
        ], [
            'whatsapp.required' => 'Nomor WhatsApp wajib diisi.',
            'otp.required' => 'Kode OTP wajib diisi.',
            'otp.size' => 'Kode OTP harus berupa 6 digit angka.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $rawWa = (string) $request->input('whatsapp');
        $normalizedWa = ZestaWhatsAppService::normalizePhone($rawWa);
        $inputOtp = trim((string) $request->input('otp'));

        $cacheKey = "otp:{$normalizedWa}";
        $cached = Cache::get($cacheKey);

        if (!$cached || !isset($cached['code'])) {
            return response()->json([
                'message' => 'Kode OTP sudah kedaluwarsa atau belum diminta. Silakan minta kode OTP baru.',
            ], 422);
        }

        if (($cached['attempts'] ?? 0) >= 5) {
            Cache::forget($cacheKey);
            return response()->json([
                'message' => 'Terlalu banyak percobaan salah. Silakan minta kode OTP baru.',
            ], 422);
        }

        if ($cached['code'] !== $inputOtp) {
            $cached['attempts'] = ($cached['attempts'] ?? 0) + 1;
            Cache::put($cacheKey, $cached, now()->addMinutes(5));

            $remaining = 5 - $cached['attempts'];
            return response()->json([
                'message' => "Kode OTP salah. Sisa percobaan: {$remaining} kali.",
            ], 422);
        }

        // Successfully verified
        Cache::forget($cacheKey);
        Cache::put("otp_verified:{$normalizedWa}", true, now()->addMinutes(15));

        return response()->json([
            'success' => true,
            'message' => 'Nomor WhatsApp berhasil diverifikasi.',
            'whatsapp' => $normalizedWa,
        ]);
    }
}
