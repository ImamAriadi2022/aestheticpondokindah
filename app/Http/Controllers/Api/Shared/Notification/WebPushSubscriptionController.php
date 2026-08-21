<?php

namespace App\Http\Controllers\Api\Shared\Notification;

use App\Http\Controllers\Controller;
use App\Models\Shared\Notification\WebPushSubscription;
use App\Services\Shared\Notification\WebPushNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebPushSubscriptionController extends Controller
{
    /**
     * Get VAPID Public Key for client browser PushManager registration
     */
    public function getVapidPublicKey(): JsonResponse
    {
        $publicKey = config('services.vapid.public_key', env('VAPID_PUBLIC_KEY', 'BHZFSJTgwTDw7EYkAzfgi1gtoenGg1IJsNdCQVOLvxd8TLpIPQkNccQRu1p2RXhB96M3AXEP71_9RuGkK64iM4k'));

        return response()->json([
            'publicKey' => $publicKey,
        ]);
    }

    /**
     * Register or update a browser Web Push Subscription
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'endpoint' => 'required|string',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        $endpoint = $request->input('endpoint');
        $endpointHash = hash('sha256', $endpoint);

        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $role = $user ? $user->role : ($request->input('role') ?: 'guest');
        $userId = $user ? $user->id : null;

        $subscription = WebPushSubscription::updateOrCreate(
            ['endpoint_hash' => $endpointHash],
            [
                'user_id' => $userId,
                'role' => $role,
                'endpoint' => $endpoint,
                'public_key' => $request->input('keys.p256dh'),
                'auth_token' => $request->input('keys.auth'),
                'content_encoding' => $request->input('contentEncoding', 'aes128gcm'),
                'user_agent' => substr((string) $request->header('User-Agent'), 0, 255),
                'last_active_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Web Push subscription registered successfully.',
            'subscription_id' => $subscription->id,
            'role' => $role,
        ]);
    }

    /**
     * Unsubscribe / delete a browser Web Push Subscription
     */
    public function unsubscribe(Request $request): JsonResponse
    {
        $endpoint = $request->input('endpoint');
        if ($endpoint) {
            $endpointHash = hash('sha256', $endpoint);
            WebPushSubscription::where('endpoint_hash', $endpointHash)->delete();
        }

        return response()->json([
            'message' => 'Web Push subscription removed.',
        ]);
    }

    /**
     * Send instant background test notification to current user or endpoint
     */
    public function testPush(Request $request): JsonResponse
    {
        $endpoint = $request->input('endpoint');
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();

        if ($endpoint) {
            $endpointHash = hash('sha256', $endpoint);
            $sub = WebPushSubscription::where('endpoint_hash', $endpointHash)->first();
            if ($sub) {
                $sent = WebPushNotificationService::sendToSubscription(
                    $sub,
                    '🔔 Notifikasi Background Berhasil!',
                    'Notifikasi Web Push ini diterima langsung dari Cloud Server ke perangkat Anda.',
                    $user ? ($user->role === 'doctor' ? '/#/dashboard/doctor?tab=reservasi' : '/#/dashboard/clinic?tab=reservasi') : '/#/',
                    ['type' => 'test_push']
                );

                return response()->json([
                    'success' => $sent,
                    'message' => $sent ? 'Notifikasi background terkirim ke perangkat.' : 'Gagal mengirim ke endpoint.',
                ]);
            }
        }

        if ($user) {
            $count = WebPushNotificationService::sendToUser(
                $user->id,
                '🔔 Notifikasi Background Berhasil!',
                "Halo {$user->name}, perangkat Anda kini terhubung penuh ke sistem notifikasi background.",
                $user->role === 'doctor' ? '/#/dashboard/doctor?tab=reservasi' : '/#/dashboard/clinic?tab=reservasi',
                ['type' => 'test_push']
            );

            return response()->json([
                'success' => $count > 0,
                'delivered_devices' => $count,
                'message' => $count > 0 ? "Notifikasi background terkirim ke {$count} perangkat." : "Belum ada perangkat terdaftar untuk akun ini.",
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Tidak ada endpoint atau akun yang dapat dikirimkan notifikasi.',
        ], 400);
    }
}
