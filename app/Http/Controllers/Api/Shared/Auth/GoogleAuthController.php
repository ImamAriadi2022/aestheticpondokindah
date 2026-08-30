<?php

namespace App\Http\Controllers\Api\Shared\Auth;

use App\Http\Controllers\Controller;
use App\Models\Shared\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    /**
     * Handle Google Login / Registration
     */
    public function handleGoogleAuth(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'credential' => 'nullable|string',
            'access_token' => 'nullable|string',
            'code' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => 'Token Google wajib disertakan.', 'errors' => $validator->errors()], 422);
        }

        $googleUser = $this->verifyGoogleToken($request);

        if (!$googleUser) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi token Google gagal. Silakan coba login kembali.',
            ], 401);
        }

        $googleId = $googleUser['sub'] ?? $googleUser['id'] ?? null;
        $email = $googleUser['email'] ?? null;
        $name = $googleUser['name'] ?? ($googleUser['given_name'] ? $googleUser['given_name'] . ' ' . ($googleUser['family_name'] ?? '') : explode('@', (string) $email)[0]);
        $avatar = $googleUser['picture'] ?? null;
        $emailVerified = filter_var($googleUser['email_verified'] ?? true, FILTER_VALIDATE_BOOLEAN);

        if (empty($googleId) || empty($email)) {
            return response()->json([
                'success' => false,
                'message' => 'Data profil Google tidak lengkap (Email / ID tidak ditemukan).',
            ], 422);
        }

        $mode = $request->input('mode', 'login');
        $isNewUser = false;

        // 1. Search by google_id
        /** @var User|null $user */
        $user = User::where('google_id', $googleId)->first();

        // 2. Search by email if not found by google_id
        if (!$user && !empty($email)) {
            $user = User::where('email', $email)->first();
            if ($user) {
                $user->google_id = $googleId;
                if (empty($user->avatar) && !empty($avatar)) {
                    $user->avatar = $avatar;
                }
                if (!$user->email_verified_at && $emailVerified) {
                    $user->email_verified_at = now();
                }
                $user->save();
            }
        }

        // Mode LOGIN: Tolak jika akun belum terdaftar
        if ($mode === 'login' && !$user) {
            return response()->json([
                'success' => false,
                'message' => 'Email belum terdaftar. Silakan lakukan pendaftaran akun terlebih dahulu melalui tab Daftar.',
                'code' => 'EMAIL_NOT_REGISTERED',
            ], 404);
        }

        // Mode REGISTER: Tolak jika akun sudah terdaftar
        if ($mode === 'register' && $user) {
            return response()->json([
                'success' => false,
                'message' => 'Email sudah terdaftar. Silakan masuk melalui halaman login.',
                'code' => 'EMAIL_ALREADY_REGISTERED',
            ], 409);
        }

        // 3. Register new patient jika mode register dan user belum ada
        if (!$user) {
            $isNewUser = true;
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'google_id' => $googleId,
                'password' => Hash::make(Str::random(32)),
                'role' => 'patient',
                'status' => 'active',
                'membership_level' => 'bronze',
                'membership_status' => 'active',
                'membership_points' => 0,
                'email_verified_at' => $emailVerified ? now() : null,
                'avatar' => $avatar,
            ]);
        }

        // Guard status
        if (($user->status ?? 'active') !== 'active' && $user->role !== 'doctor') {
            return response()->json([
                'success' => false,
                'message' => 'Akun dinonaktifkan. Silakan hubungi admin klinik.',
            ], 403);
        }

        $deviceName = $request->input('device_name') ?: 'web_google';
        $token = $user->createToken($deviceName, ['*'], now()->addDays(10))->plainTextToken;

        $authController = new AuthController();
        $user->loadMissing('profile');

        return response()->json([
            'success' => true,
            'message' => $isNewUser ? 'Pendaftaran akun dengan Google berhasil.' : 'Login dengan Google berhasil.',
            'token' => $token,
            'is_new_user' => $isNewUser,
            'user' => $authController->serializeUser($user),
        ]);
    }

    /**
     * Link Google Account to Authenticated User
     */
    public function linkGoogle(Request $request): JsonResponse
    {
        $googleUser = $this->verifyGoogleToken($request);

        if (!$googleUser) {
            return response()->json([
                'success' => false,
                'message' => 'Verifikasi akun Google gagal. Silakan coba kembali.',
            ], 401);
        }

        $googleId = $googleUser['sub'] ?? $googleUser['id'] ?? null;
        $avatar = $googleUser['picture'] ?? null;
        $googleEmail = $googleUser['email'] ?? null;

        if (empty($googleId)) {
            return response()->json([
                'success' => false,
                'message' => 'ID Google tidak valid.',
            ], 422);
        }

        /** @var User $currentUser */
        $currentUser = $request->user();

        // Check if another user is already linked with this Google ID
        $existing = User::where('google_id', $googleId)
            ->where('id', '!=', $currentUser->id)
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => "Akun Google ({$googleEmail}) sudah terhubung ke akun pengguna lain.",
            ], 422);
        }

        $currentUser->google_id = $googleId;
        if (empty($currentUser->avatar) && !empty($avatar)) {
            $currentUser->avatar = $avatar;
        }
        $currentUser->save();

        $authController = new AuthController();
        $currentUser->loadMissing('profile');

        return response()->json([
            'success' => true,
            'message' => "Akun Google ({$googleEmail}) berhasil dihubungkan ke profil Anda.",
            'user' => $authController->serializeUser($currentUser),
        ]);
    }

    /**
     * Unlink Google Account
     */
    public function unlinkGoogle(Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        if (empty($currentUser->google_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Akun Google belum terhubung.',
            ], 400);
        }

        $currentUser->google_id = null;
        $currentUser->save();

        $authController = new AuthController();
        $currentUser->loadMissing('profile');

        return response()->json([
            'success' => true,
            'message' => 'Koneksi akun Google berhasil diputuskan.',
            'user' => $authController->serializeUser($currentUser),
        ]);
    }

    /**
     * Get Google Connection Status
     */
    public function getGoogleStatus(Request $request): JsonResponse
    {
        /** @var User $currentUser */
        $currentUser = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'has_google' => !empty($currentUser->google_id),
                'google_id' => $currentUser->google_id,
                'email' => $currentUser->email,
            ],
        ]);
    }

    /**
     * Verify Google ID token or Access token with Google servers
     */
    private function verifyGoogleToken(Request $request): ?array
    {
        $credential = $request->input('credential');
        $accessToken = $request->input('access_token');
        $code = $request->input('code');

        // 1. Verify ID Token (Google Identity Services standard)
        if (!empty($credential)) {
            try {
                $response = Http::timeout(10)
                    ->get("https://oauth2.googleapis.com/tokeninfo", [
                        'id_token' => $credential,
                    ]);

                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data['sub']) && !empty($data['email'])) {
                        return $data;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Google ID Token verification failed: ' . $e->getMessage());
            }
        }

        // 2. Verify Access Token (Google userinfo endpoint)
        if (!empty($accessToken)) {
            try {
                $response = Http::timeout(10)
                    ->withToken($accessToken)
                    ->get('https://www.googleapis.com/oauth2/v3/userinfo');

                if ($response->successful()) {
                    $data = $response->json();
                    if (!empty($data['sub']) && !empty($data['email'])) {
                        return $data;
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Google Userinfo verification failed: ' . $e->getMessage());
            }
        }

        // 3. Exchange Code for Tokens if auth code provided
        if (!empty($code)) {
            try {
                $clientId = config('services.google.client_id') ?? env('GOOGLE_CLIENT_ID');
                $clientSecret = config('services.google.client_secret') ?? env('GOOGLE_CLIENT_SECRET');
                $redirectUri = config('services.google.redirect') ?? 'postmessage';

                $tokenRes = Http::timeout(10)->asForm()->post('https://oauth2.googleapis.com/token', [
                    'code' => $code,
                    'client_id' => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri' => $redirectUri,
                    'grant_type' => 'authorization_code',
                ]);

                if ($tokenRes->successful()) {
                    $tokenData = $tokenRes->json();
                    if (!empty($tokenData['id_token'])) {
                        return $this->verifyGoogleToken(new Request(['credential' => $tokenData['id_token']]));
                    } elseif (!empty($tokenData['access_token'])) {
                        return $this->verifyGoogleToken(new Request(['access_token' => $tokenData['access_token']]));
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Google Code exchange failed: ' . $e->getMessage());
            }
        }

        return null;
    }
}