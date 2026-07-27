<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationAudit;
use Illuminate\Http\Request;

class ReservationAdminController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::query()->orderByDesc('created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('complaint', 'like', '%' . $search . '%');
            });
        }

        $status = trim((string) $request->query('status', ''));
        if ($status !== '' && $status !== 'Semua') {
            $query->where('status', $status);
        }

        $items = $query->limit(200)->get()->map(function (Reservation $r) {
            return [
                'id' => (string) $r->id,
                'name' => $r->name,
                'phone' => $r->phone,
                'date' => $r->date ? $r->date->format('Y-m-d') : null,
                'doctor' => '-',
                'complaint' => $r->complaint,
                'status' => $r->status,
                'paymentStatus' => $r->payment_status ?? 'Belum Bayar',
                'createdAt' => optional($r->created_at)->toISOString(),
                'notes' => null,
            ];
        })->values();

        return response()->json($items);
    }

    public function update(Request $request, Reservation $reservation)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Baru,Dikonfirmasi,Selesai,Dibatalkan'],
            'paymentStatus' => ['nullable', 'in:Belum Bayar,Sudah Bayar,Bayar DP,Uang Dikembalikan,Dibatalkan'],
        ]);

        $adminId = $request->user()?->id;

        // Audit Status Change
        if ($reservation->status !== $validated['status']) {
            ReservationAudit::create([
                'reservation_id' => $reservation->id,
                'user_id' => $adminId,
                'action' => 'update_status',
                'field' => 'status',
                'old_value' => $reservation->status,
                'new_value' => $validated['status'],
            ]);
            $reservation->status = $validated['status'];
        }

        // Audit Payment Status Change
        if (array_key_exists('paymentStatus', $validated) && $validated['paymentStatus'] !== null) {
            // Business rule: only allow payment status change if Selesai, except if setting to Belum Bayar/Dibatalkan
            if ($reservation->status !== 'Selesai' && !in_array($validated['paymentStatus'], ['Belum Bayar', 'Dibatalkan'])) {
                return response()->json(['message' => 'Status pembayaran hanya bisa diubah jika reservasi sudah Selesai.'], 422);
            }

            if ($reservation->payment_status !== $validated['paymentStatus']) {
                ReservationAudit::create([
                    'reservation_id' => $reservation->id,
                    'user_id' => $adminId,
                    'action' => 'update_payment',
                    'field' => 'payment_status',
                    'old_value' => $reservation->payment_status,
                    'new_value' => $validated['paymentStatus'],
                ]);
                $reservation->payment_status = $validated['paymentStatus'];
            }
        }

        $reservation->save();

        return response()->json([
            'id' => (string) $reservation->id,
            'name' => $reservation->name,
            'phone' => $reservation->phone,
            'date' => $reservation->date ? $reservation->date->format('Y-m-d') : null,
            'doctor' => '-',
            'complaint' => $reservation->complaint,
            'status' => $reservation->status,
            'paymentStatus' => $reservation->payment_status ?? 'Belum Bayar',
            'createdAt' => optional($reservation->created_at)->toISOString(),
            'notes' => null,
        ]);
    }
}
