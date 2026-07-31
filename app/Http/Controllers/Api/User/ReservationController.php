<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Reservation::query()->where('user_id', $user->id)->latest();

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('complaint', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $statusFilter = trim((string) $request->query('status', ''));
        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $mappedStatus = match ($statusFilter) {
                'pending' => 'Baru',
                'confirmed' => 'Dikonfirmasi',
                'completed' => 'Selesai',
                'cancelled' => 'Dibatalkan',
                'rejected' => 'Ditolak',
                default => $statusFilter,
            };
            $query->where('status', $mappedStatus);
        }

        $reservations = $query->get()
            ->map(fn (Reservation $reservation) => $this->toMobileDto($reservation))
            ->values();

        return response()->json(['reservations' => $reservations]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Ownership IDOR Protection Check
        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi ini.'], 403);
        }

        return response()->json(['reservation' => $this->toMobileDto($reservation)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'complaint' => ['required', 'string', 'max:255'],
            'date' => ['nullable', 'date', 'after_or_equal:today'],
        ]);
        $user = $request->user();
        $reservation = Reservation::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'phone' => $user->whatsapp ?? $user->phone,
            'complaint' => $validated['complaint'],
            'date' => $validated['date'] ?? null,
            'source' => 'android_native',
            'status' => 'Baru',
        ]);

        return response()->json(['message' => 'Permintaan booking berhasil dikirim.', 'reservation' => $this->toMobileDto($reservation)], 201);
    }

    public function cancel(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Ownership IDOR Protection Check
        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi ini.'], 403);
        }

        // Business Rule: Cancellation Restrictions
        if ($reservation->status === 'Selesai') {
            return response()->json(['message' => 'Reservasi yang sudah Selesai tidak dapat dibatalkan.'], 422);
        }
        if ($reservation->status === 'Ditolak') {
            return response()->json(['message' => 'Reservasi yang sudah Ditolak tidak dapat dibatalkan.'], 422);
        }
        if ($reservation->status === 'Dibatalkan') {
            return response()->json(['message' => 'Reservasi sudah dibatalkan sebelumnya.'], 422);
        }

        // Perform cancellation
        $oldStatus = $reservation->status;
        $reservation->status = 'Dibatalkan';
        $reservation->save();

        // Audit Trail
        \App\Models\ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $user->id,
            'action' => 'user_cancel',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => 'Dibatalkan',
        ]);

        return response()->json([
            'message' => 'Reservasi berhasil dibatalkan.',
            'reservation' => $this->toMobileDto($reservation->fresh()),
        ]);
    }

    private function toMobileDto(Reservation $reservation): array
    {
        $status = match ($reservation->status) {
            'Dikonfirmasi' => 'confirmed',
            'Selesai' => 'completed',
            'Dibatalkan' => 'cancelled',
            'Ditolak' => 'rejected',
            default => 'pending',
        };
        return [
            'id' => (string) $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'user_id' => (string) $reservation->user_id,
            'patient_name' => $reservation->name,
            'phone' => $reservation->phone,
            'service_name' => 'Permintaan Konsultasi',
            'doctor_name' => null,
            'scheduled_date' => $reservation->date?->format('Y-m-d'),
            'scheduled_time' => null,
            'status' => $status,
            'raw_status' => $reservation->status,
            'notes' => $reservation->complaint,
            'price' => null,
            'created_at' => optional($reservation->created_at)->toISOString(),
            'updated_at' => optional($reservation->updated_at)->toISOString(),
        ];
    }
}
