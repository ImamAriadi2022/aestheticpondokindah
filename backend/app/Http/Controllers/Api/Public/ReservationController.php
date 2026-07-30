<?php

namespace App\Http\Controllers\Api\Public;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'complaint' => ['required', 'string', 'max:255'],
            'date' => ['nullable', 'date'],
            'source' => ['nullable', 'string', 'max:50'],
        ]);

        $reservation = \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
            return Reservation::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'complaint' => $validated['complaint'],
                'date' => $validated['date'] ?? null,
                'source' => $validated['source'] ?? null,
                'status' => 'Baru',
            ]);
        });

        $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        return response()->json([
            'id' => (string) $reservation->id,
            'code' => $code,
            'name' => $reservation->name,
            'phone' => $reservation->phone,
            'complaint' => $reservation->complaint,
            'date' => optional($reservation->date)->format('Y-m-d'),
            'status' => $reservation->status,
            'message' => 'Reservasi berhasil dibuat.',
        ], 201);
    }
}
