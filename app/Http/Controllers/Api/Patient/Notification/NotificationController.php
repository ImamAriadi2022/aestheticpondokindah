<?php

namespace App\Http\Controllers\Api\Patient\Notification;

use App\Http\Controllers\Controller;
use App\Models\Patient\Notification\Notification;
use App\Models\Patient\Profile\UserDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $baseQuery = Notification::query();

        // Jika user adalah dokter, HANYA berikan notifikasi terkait appointment pasien yang memilih dokter ini
        $isDoctor = ($user->role === 'doctor') || (method_exists($user, 'hasRole') && $user->hasRole('doctor'));
        $isAdmin = in_array($user->role, ['clinic', 'admin', 'clinic_admin', 'developer']) || (method_exists($user, 'hasRole') && $user->hasRole('admin'));

        if ($isDoctor) {
            $baseQuery->where('type', 'appointment')
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('data->doctor_id', $user->id)
                      ->orWhere('data->doctor_id', (string)$user->id)
                      ->orWhereHas('user', function ($uq) use ($user) {
                          $uq->where('id', $user->id);
                      });
                });
        } elseif ($isAdmin) {
            // Admin menerima notifikasi umum atau notifikasi yang ditujukan ke admin/user_id null
            $baseQuery->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            });
        } else {
            // Pasien biasa
            $baseQuery->where('user_id', $user->id);
        }

        $notifications = (clone $baseQuery)
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 30));

        $unreadCount = (clone $baseQuery)->unread()->count();

        return response()->json([
            'notifications' => $notifications->items(),
            'current_page' => $notifications->currentPage(),
            'last_page' => $notifications->lastPage(),
            'total' => $notifications->total(),
            'unread_count' => $unreadCount,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Notification::query();

        $isDoctor = ($user->role === 'doctor') || (method_exists($user, 'hasRole') && $user->hasRole('doctor'));
        $isAdmin = in_array($user->role, ['clinic', 'admin', 'clinic_admin', 'developer']) || (method_exists($user, 'hasRole') && $user->hasRole('admin'));

        if ($isDoctor) {
            $query->where('type', 'appointment')
                ->where(function ($q) use ($user) {
                    $q->where('user_id', $user->id)
                      ->orWhere('data->doctor_id', $user->id)
                      ->orWhere('data->doctor_id', (string)$user->id)
                      ->orWhereHas('user', function ($uq) use ($user) {
                          $uq->where('id', $user->id);
                      });
                });
        } elseif ($isAdmin) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhereNull('user_id');
            });
        } else {
            $query->where('user_id', $user->id);
        }

        $count = $query->unread()->count();

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

        $query = Notification::where('id', $id);

        $isDoctor = ($user->role === 'doctor') || (method_exists($user, 'hasRole') && $user->hasRole('doctor'));

        if ($isDoctor) {
            $query->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('data->doctor_id', $user->id)
                  ->orWhere('data->doctor_id', (string)$user->id);
            });
        } else {
            $query->where('user_id', $user->id);
        }

        $notification = $query->first();

        if (!$notification) {
            return response()->json(['message' => 'Notifikasi tidak ditemukan'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notifikasi berhasil dihapus']);
    }

    public function clearAll(Request $request): JsonResponse
    {
        $user = $request->user();

        $isDoctor = ($user->role === 'doctor') || (method_exists($user, 'hasRole') && $user->hasRole('doctor'));

        if ($isDoctor) {
            Notification::where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                  ->orWhere('data->doctor_id', $user->id)
                  ->orWhere('data->doctor_id', (string)$user->id);
            })->delete();
        } else {
            Notification::where('user_id', $user->id)->delete();
        }

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
