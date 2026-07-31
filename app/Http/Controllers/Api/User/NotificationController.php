<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\UserDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $notifications = Notification::where('user_id', $user->id)
            ->orWhereNull('user_id')
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json([
            'notifications' => $notifications->items(),
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'total' => $notifications->total(),
            'unread_count' => Notification::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            })->unread()->count(),
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)->orWhereNull('user_id');
        })->unread()->count();

        return response()->json(['unread_count' => $count]);
    }

    public function markAsRead(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::where('id', $id)
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)->orWhereNull('user_id');
            })->first();

        if (!$notification) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notification->update(['read_at' => now()]);

        return response()->json([
            'message' => 'Notifikasi ditandai dibaca',
            'notification' => $notification
        ]);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::where(function ($q) use ($user) {
            $q->where('user_id', $user->id)->orWhereNull('user_id');
        })->whereNull('read_at')->update(['read_at' => now()]);

        return response()->json(['message' => 'Seluruh notifikasi ditandai dibaca']);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $user = $request->user();

        $notification = Notification::where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notifikasi berhasil dihapus']);
    }

    public function clearAll(Request $request): JsonResponse
    {
        $user = $request->user();

        Notification::where('user_id', $user->id)->delete();

        return response()->json(['message' => 'Riwayat notifikasi berhasil dibersihkan']);
    }

    public function storeDeviceToken(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'device_token' => 'required|string',
            'platform' => 'nullable|string|in:web,android,ios',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $token = UserDeviceToken::updateOrCreate(
            [
                'user_id' => $user->id,
                'device_token' => $request->input('device_token'),
            ],
            [
                'platform' => $request->input('platform', 'web'),
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Device token registered successfully',
            'token' => $token
        ]);
    }

    public function deleteDeviceToken(Request $request): JsonResponse
    {
        $user = $request->user();
        $deviceToken = $request->input('device_token');

        if ($deviceToken) {
            UserDeviceToken::where('user_id', $user->id)
                ->where('device_token', $deviceToken)
                ->delete();
        } else {
            UserDeviceToken::where('user_id', $user->id)->delete();
        }

        return response()->json(['message' => 'Device token removed']);
    }
}
