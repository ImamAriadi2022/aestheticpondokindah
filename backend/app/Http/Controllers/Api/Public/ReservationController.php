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

        $reservation = Reservation::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'complaint' => $validated['complaint'],
            'date' => $validated['date'] ?? null,
            'source' => $validated['source'] ?? null,
            'status' => 'Baru',
        ]);

        return response()->json([
            'id' => $reservation->id,
            'status' => $reservation->status,
        ], 201);
    }
}
