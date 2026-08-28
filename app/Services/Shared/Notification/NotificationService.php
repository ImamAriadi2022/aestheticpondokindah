<?php

namespace App\Services\Shared\Notification;

use App\Models\Patient\Notification\Notification;
use App\Models\Shared\User\User;

class NotificationService
{
    public static function send(
        int $userId,
        string $title,
        string $body,
        string $type = 'consultation',
        ?string $deepLink = null,
        array $data = []
    ): ?Notification {
        if (!User::query()->whereKey($userId)->where('status', 'active')->exists()) {
            return null;
        }

        $notification = Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'deep_link' => $deepLink,
            'data' => $data,
        ]);

        // Automatically dispatch Web Push to User's devices (HP, Laptop) in the background
        try {
            WebPushNotificationService::sendToUser(
                $userId,
                $title,
                $body,
                $deepLink,
                [
                    'type' => $type,
                    'bookingCode' => $data['code'] ?? $data['bookingCode'] ?? null,
                ]
            );
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return $notification;
    }

    /**
     * Notify every active clinic admin (optionally excluding one user).
     */
    public static function sendToAdmins(
        string $title,
        string $body,
        string $type = 'consultation',
        ?string $deepLink = null,
        array $data = [],
        ?int $exceptUserId = null
    ): void {
        $adminIds = User::query()
            ->whereIn('role', ['admin', 'clinic_admin', 'clinic'])
            ->where('status', 'active')
            ->when($exceptUserId, fn ($q) => $q->where('id', '!=', $exceptUserId))
            ->pluck('id');

        // Create in-app notifications in database for all admins
        foreach ($adminIds as $adminId) {
            try {
                Notification::create([
                    'user_id' => $adminId,
                    'title' => $title,
                    'body' => $body,
                    'type' => $type,
                    'deep_link' => $deepLink,
                    'data' => $data,
                ]);
            } catch (\Throwable $e) {
                // Non-blocking
            }
        }

        // Single batch dispatch to all admin WebPush subscriptions
        try {
            WebPushNotificationService::sendToAdmins(
                $title,
                $body,
                $deepLink,
                [
                    'type' => $type,
                    'bookingCode' => $data['code'] ?? $data['bookingCode'] ?? null,
                ]
            );
        } catch (\Throwable $e) {
            // Non-blocking
        }
    }
}
