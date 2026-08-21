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

        return Notification::create([
            'user_id' => $userId,
            'title' => $title,
            'body' => $body,
            'type' => $type,
            'deep_link' => $deepLink,
            'data' => $data,
        ]);
    }

    /**
     * Notify every active clinic admin (optionally excluding one user).
     */
    public static function sendToAdmins(string $title, string $body, string $type = 'consultation', ?string $deepLink = null, array $data = [], ?int $exceptUserId = null): void
    {
        User::query()
            ->whereIn('role', ['admin', 'clinic_admin', 'clinic'])
            ->where('status', 'active')
            ->when($exceptUserId, fn ($q) => $q->where('id', '!=', $exceptUserId))
            ->pluck('id')
            ->each(fn (int $adminId) => self::send($adminId, $title, $body, $type, $deepLink, $data));
    }
}
