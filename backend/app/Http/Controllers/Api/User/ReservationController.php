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
        $reservations = Reservation::query()->where('user_id', $request->user()->id)->latest()->get()
            ->map(fn (Reservation $reservation) => $this->toMobileDto($reservation))->values();

        return response()->json(['reservations' => $reservations]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'complaint' => ['required', 'string', 'max:255'],
            'date' => ['nullable', 'date', 'after_or_equal:today'],
        ]);
        $user = $request->user();
        $reservation = Reservation::create([
            'user_id' => $user->id, 'name' => $user->name, 'phone' => $user->phone,
            'complaint' => $validated['complaint'], 'date' => $validated['date'] ?? null,
            'source' => 'android_native', 'status' => 'Baru',
        ]);

        return response()->json(['message' => 'Permintaan booking berhasil dikirim.', 'reservation' => $this->toMobileDto($reservation)], 201);
    }

    private function toMobileDto(Reservation $reservation): array
    {
        $status = match ($reservation->status) {
            'Dikonfirmasi' => 'confirmed', 'Selesai' => 'completed', 'Dibatalkan' => 'cancelled', default => 'pending',
        };
        return [
            'id' => $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'service_name' => 'Permintaan Konsultasi', 'doctor_name' => null,
            'scheduled_date' => $reservation->date?->format('Y-m-d'), 'scheduled_time' => null,
            'status' => $status, 'notes' => $reservation->complaint, 'price' => null,
            'created_at' => optional($reservation->created_at)->toISOString(),
        ];
    }
}
