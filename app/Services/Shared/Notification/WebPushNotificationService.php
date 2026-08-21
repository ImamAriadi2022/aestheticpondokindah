<?php

namespace App\Services\Shared\Notification;

use App\Models\Shared\Notification\WebPushSubscription;
use App\Models\Shared\User\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushNotificationService
{
    private static ?WebPush $webPushInstance = null;

    /**
     * Get or initialize WebPush client
     */
    public static function getWebPush(): WebPush
    {
        if (self::$webPushInstance === null) {
            $auth = [
                'VAPID' => [
                    'subject' => config('services.vapid.subject', env('VAPID_SUBJECT', 'mailto:admin@aestheticpondokindah.local')),
                    'publicKey' => config('services.vapid.public_key', env('VAPID_PUBLIC_KEY', 'BHZFSJTgwTDw7EYkAzfgi1gtoenGg1IJsNdCQVOLvxd8TLpIPQkNccQRu1p2RXhB96M3AXEP71_9RuGkK64iM4k')),
                    'privateKey' => config('services.vapid.private_key', env('VAPID_PRIVATE_KEY', 'JjIMcuIbB_2ov4tL363cFbB_XLb5gkFp18BpoWjeY2c')),
                ],
            ];

            $options = [
                'timeout' => 15,
                'automatic_padding' => true,
            ];

            self::$webPushInstance = new WebPush($auth, $options);
            self::$webPushInstance->setReuseVAPIDHeaders(true);
        }

        return self::$webPushInstance;
    }

    /**
     * Send Web Push to specific User ID (across all their active subscribed devices: HP, Laptop, etc.)
     */
    public static function sendToUser(
        int $userId,
        string $title,
        string $body,
        ?string $url = null,
        array $options = []
    ): int {
        $subscriptions = WebPushSubscription::where('user_id', $userId)->get();
        return self::dispatchSubscriptions($subscriptions, $title, $body, $url, $options);
    }

    /**
     * Send Web Push to all Clinic Admins
     */
    public static function sendToAdmins(
        string $title,
        string $body,
        ?string $url = null,
        array $options = []
    ): int {
        $adminIds = User::whereIn('role', ['admin', 'clinic_admin', 'clinic'])
            ->where('status', 'active')
            ->pluck('id');

        $subscriptions = WebPushSubscription::whereIn('user_id', $adminIds)
            ->orWhereIn('role', ['admin', 'clinic_admin', 'clinic'])
            ->get();

        return self::dispatchSubscriptions($subscriptions, $title, $body, $url, $options);
    }

    /**
     * Send Web Push to specific Doctor ID
     */
    public static function sendToDoctor(
        int $doctorId,
        string $title,
        string $body,
        ?string $url = null,
        array $options = []
    ): int {
        $subscriptions = WebPushSubscription::where('user_id', $doctorId)
            ->orWhere(function ($q) use ($doctorId) {
                $q->where('role', 'doctor')->where('user_id', $doctorId);
            })
            ->get();

        return self::dispatchSubscriptions($subscriptions, $title, $body, $url, $options);
    }

    /**
     * Send Web Push to a single subscription instance
     */
    public static function sendToSubscription(
        WebPushSubscription $sub,
        string $title,
        string $body,
        ?string $url = null,
        array $options = []
    ): bool {
        $sentCount = self::dispatchSubscriptions(collect([$sub]), $title, $body, $url, $options);
        return $sentCount > 0;
    }

    /**
     * Internal Batch Dispatcher with Dead-Subscription Pruning
     */
    private static function dispatchSubscriptions(
        $subscriptions,
        string $title,
        string $body,
        ?string $url = null,
        array $options = []
    ): int {
        if ($subscriptions->isEmpty()) {
            return 0;
        }

        try {
            $webPush = self::getWebPush();

            $payload = json_encode([
                'title' => $title,
                'body' => $body,
                'message' => $body,
                'icon' => $options['icon'] ?? '/logo/logo.png',
                'badge' => $options['badge'] ?? '/logo/logo.png',
                'vibrate' => [200, 100, 200],
                'tag' => $options['tag'] ?? ('apig-' . time() . '-' . uniqid()),
                'url' => $url ?? '/',
                'data' => [
                    'url' => $url ?? '/',
                    'time' => time(),
                    'bookingCode' => $options['bookingCode'] ?? null,
                    'type' => $options['type'] ?? 'general',
                ],
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);

            foreach ($subscriptions as $sub) {
                $subscription = Subscription::create([
                    'endpoint' => $sub->endpoint,
                    'publicKey' => $sub->public_key,
                    'authToken' => $sub->auth_token,
                    'contentEncoding' => $sub->content_encoding ?: 'aes128gcm',
                ]);

                $webPush->queueNotification($subscription, $payload, [
                    'TTL' => 86400,
                    'urgency' => 'high',
                ]);
            }

            $successCount = 0;
            foreach ($webPush->flush() as $report) {
                $endpoint = $report->getRequest()->getUri()->__toString();
                $hash = hash('sha256', $endpoint);

                if ($report->isSuccess()) {
                    $successCount++;
                    WebPushSubscription::where('endpoint_hash', $hash)->update(['last_active_at' => now()]);
                } else {
                    $reason = $report->getReason();
                    // If endpoint is expired / 410 Gone / 404 Not Found, delete stale subscription
                    if ($report->isSubscriptionExpired() || str_contains($reason, '410') || str_contains($reason, '404')) {
                        WebPushSubscription::where('endpoint_hash', $hash)->delete();
                        Log::info("[WebPush] Removed expired subscription: {$endpoint}");
                    } else {
                        Log::warning("[WebPush] Failed delivering to {$endpoint}: {$reason}");
                    }
                }
            }

            return $successCount;
        } catch (\Throwable $e) {
            Log::error("[WebPush] Exception during push dispatch: " . $e->getMessage(), [
                'exception' => $e,
            ]);
            return 0;
        }
    }
}
