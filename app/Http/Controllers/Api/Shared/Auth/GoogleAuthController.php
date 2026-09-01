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

    /**
     * Redirect user to Google OAuth (Universal Web & Mobile Native Bridge)
     */
    public function redirectToGoogle(Request $request)
    {
        $clientId = config('services.google.client_id') ?: env('GOOGLE_CLIENT_ID');
        $redirectUri = url('/api/auth/google/callback');
        $returnTo = $request->input('return_to', 'aestheticpondokindah://oauth2redirect');
        $mode = $request->input('mode', 'login');

        $state = base64_encode(json_encode([
            'return_to' => $returnTo,
            'mode' => $mode,
            'time' => time(),
        ]));

        $params = http_build_query([
            'client_id' => $clientId,
            'redirect_uri' => $redirectUri,
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'access_type' => 'online',
            'prompt' => 'select_account',
            'state' => $state,
        ]);

        return redirect("https://accounts.google.com/o/oauth2/v2/auth?{$params}");
    }

    /**
     * Handle Google OAuth Callback (Exchanges Code, Creates Session, Redirects back to Mobile / Web)
     */
    public function handleGoogleCallback(Request $request)
    {
        $code = $request->input('code');
        $stateRaw = $request->input('state');
        $state = json_decode(base64_decode((string)$stateRaw), true) ?: [];
        $returnTo = $state['return_to'] ?? 'aestheticpondokindah://oauth2redirect';
        $mode = $state['mode'] ?? 'login';

        if (empty($code)) {
            $errorMsg = $request->input('error_description', 'Autentikasi Google dibatalkan.');
            return $this->renderOAuthBridge($returnTo, ['error' => $errorMsg]);
        }

        $clientId = config('services.google.client_id') ?: env('GOOGLE_CLIENT_ID');
        $clientSecret = config('services.google.client_secret') ?: env('GOOGLE_CLIENT_SECRET');
        $redirectUri = url('/api/auth/google/callback');

        // Exchange code for token
        $tokenRes = Http::timeout(10)->asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri' => $redirectUri,
            'grant_type' => 'authorization_code',
        ]);

        if (!$tokenRes->successful()) {
            return $this->renderOAuthBridge($returnTo, ['error' => 'Gagal menukarkan kode otorisasi Google.']);
        }

        $accessToken = $tokenRes->json('access_token');
        $idToken = $tokenRes->json('id_token');

        $subRequest = Request::create('/api/auth/google', 'POST', [
            'access_token' => $accessToken,
            'credential' => $idToken,
            'mode' => $mode,
            'device_name' => 'mobile_native_google',
        ]);

        $authResponse = $this->handleGoogleAuth($subRequest);
        $authData = $authResponse->getData(true);

        if (empty($authData['success'])) {
            return $this->renderOAuthBridge($returnTo, ['error' => $authData['message'] ?? 'Login Google gagal.']);
        }

        return $this->renderOAuthBridge($returnTo, [
            'token' => $authData['token'] ?? '',
            'user' => json_encode($authData['user'] ?? []),
            'message' => $authData['message'] ?? 'Login berhasil',
        ]);
    }

    /**
     * Render HTML Bridge that redirects back to the Mobile Native App or Web
     */
    private function renderOAuthBridge(string $returnTo, array $params)
    {
        $queryString = http_build_query($params);
        $separator = str_contains($returnTo, '?') ? '&' : '?';
        $fullRedirectUrl = $returnTo . $separator . $queryString;

        $html = <<<HTML
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mengalihkan ke Aplikasi...</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #FAF8F5; color: #2C2416; }
        .card { background: white; padding: 32px; border-radius: 20px; border: 1px solid #E8DFC8; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.05); max-width: 360px; margin: 16px; }
        .spinner { width: 40px; height: 40px; border: 3px solid #E8DFC8; border-top: 3px solid #C9A24A; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .btn { display: inline-block; margin-top: 16px; padding: 12px 24px; background: #C9A24A; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px; }
    </style>
</head>
<body>
    <div class="card">
        <div class="spinner"></div>
        <h3 style="margin: 0 0 8px;">Autentikasi Selesai</h3>
        <p style="font-size: 13px; color: #8C8272; margin: 0;">Sedang mengalihkan kembali ke aplikasi Aesthetic Pondok Indah...</p>
        <a id="redirectLink" href="{$fullRedirectUrl}" class="btn">Buka Aplikasi</a>
    </div>
    <script>
        const targetUrl = "{$fullRedirectUrl}";
        window.location.href = targetUrl;
        setTimeout(() => {
            const link = document.getElementById('redirectLink');
            if (link) link.style.display = 'inline-block';
        }, 1200);
    </script>
</body>
</html>
HTML;

        return response($html, 200)->header('Content-Type', 'text/html; charset=UTF-8');
    }
}