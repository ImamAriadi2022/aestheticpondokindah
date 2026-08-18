<?php

namespace App\Http\Controllers\Api\Doctor\Queue;

use App\Http\Controllers\Controller;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Reservation\ReservationAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorQueueController extends Controller
{
    public function queue(Request $request): JsonResponse
    {
        $doctor = $request->user();

        $query = Reservation::query()
            ->with(['doctor', 'doctorSchedule', 'user'])
            ->where(function ($q) use ($doctor) {
                $q->where('doctor_id', $doctor->id)
                  ->orWhereHas('doctorSchedule', function ($sq) use ($doctor) {
                      $sq->where('user_id', $doctor->id);
                  });
            })
            ->orderByDesc('date')
            ->orderByDesc('created_at');

        $status = trim((string) $request->query('status', ''));
        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->limit(200)->get()->map(function (Reservation $r) {
            return $this->toDoctorDto($r);
        })->values();

        return response()->json(['queue' => $items, 'reservations' => $items]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $reservation = Reservation::with(['doctor', 'doctorSchedule', 'user'])->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Doctor Access Check
        $isAssigned = (int) $reservation->doctor_id === (int) $doctor->id
            || ($reservation->doctorSchedule && (int) $reservation->doctorSchedule->user_id === (int) $doctor->id);

        if (!$isAssigned) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi dokter ini.'], 403);
        }

        return response()->json(['reservation' => $this->toDoctorDto($reservation)]);
    }

    public function start(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        $isAssigned = (int) $reservation->doctor_id === (int) $doctor->id
            || ($reservation->doctorSchedule && (int) $reservation->doctorSchedule->user_id === (int) $doctor->id);

        if (!$isAssigned) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi dokter ini.'], 403);
        }

        // Business Rules Verification
        if ($reservation->status === 'Selesai') {
            return response()->json(['message' => 'Konsultasi/Perawatan yang sudah selesai tidak dapat dimulai kembali.'], 422);
        }
        if (in_array($reservation->status, ['Dibatalkan', 'Ditolak'], true)) {
            return response()->json(['message' => 'Reservasi ini sudah dibatalkan/ditolak.'], 422);
        }

        $oldStatus = $reservation->status;
        $reservation->status = 'Dikonfirmasi';
        $reservation->save();

        // Automatic Visit Creation & Transition (Task 5.1)
        $visitService = app(\App\Services\Doctor\Visit\VisitService::class);
        $visit = $visitService->findOrCreateFromReservation($reservation);
        $visitService->transitionStatus($visit, 'in_progress');

        // Audit Trail
        ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $doctor->id,
            'action' => 'doctor_start_consultation',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => 'Dikonfirmasi',
        ]);

        return response()->json([
            'message' => 'Perawatan/Konsultasi berhasil dimulai.',
            'reservation' => $this->toDoctorDto($reservation->fresh(['doctor', 'doctorSchedule'])),
            'visit' => $visit->fresh(),
        ]);
    }

    public function complete(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        $isAssigned = (int) $reservation->doctor_id === (int) $doctor->id
            || ($reservation->doctorSchedule && (int) $reservation->doctorSchedule->user_id === (int) $doctor->id);

        if (!$isAssigned) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi dokter ini.'], 403);
        }

        if (in_array($reservation->status, ['Dibatalkan', 'Ditolak'], true)) {
            return response()->json(['message' => 'Reservasi ini sudah dibatalkan/ditolak.'], 422);
        }

        $oldStatus = $reservation->status;
        $reservation->status = 'Selesai';
        $reservation->save();

        // Automatic Visit Completion (Task 5.1)
        $visitService = app(\App\Services\Doctor\Visit\VisitService::class);
        $visit = $visitService->findOrCreateFromReservation($reservation);
        $visitService->transitionStatus($visit, 'completed');

        // Audit Trail
        ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $doctor->id,
            'action' => 'doctor_complete_consultation',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => 'Selesai',
        ]);

        return response()->json([
            'message' => 'Perawatan/Konsultasi berhasil diselesaikan.',
            'reservation' => $this->toDoctorDto($reservation->fresh(['doctor', 'doctorSchedule'])),
        ]);
    }

    private function toDoctorDto(Reservation $reservation): array
    {
        return [
            'id' => (string) $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'doctor_id' => $reservation->doctor_id ? (string) $reservation->doctor_id : null,
            'doctor_schedule_id' => $reservation->doctor_schedule_id ? (string) $reservation->doctor_schedule_id : null,
            'user_id' => $reservation->user_id ? (string) $reservation->user_id : null,
            'patient_name' => $reservation->name,
            'patient_phone' => $reservation->phone,
            'email' => $reservation->email,
            'gender' => $reservation->gender,
            'birth_date' => optional($reservation->birth_date)->format('Y-m-d'),
            'date' => optional($reservation->date)->format('Y-m-d'),
            'preferred_time' => $reservation->preferred_time ?? ($reservation->doctorSchedule?->time_range ?? '10:00'),
            'treatment_interest' => $reservation->treatment_interest,
            'complaint' => $reservation->complaint,
            'branch_name' => $reservation->branch_name ?? 'Aesthetic Pondok Indah Main Branch',
            'status' => $reservation->status,
            'payment_status' => $reservation->payment_status ?? 'Belum Bayar',
            'admin_notes' => $reservation->admin_notes,
            'source' => $reservation->source ?? 'guest_web',
            'created_at' => optional($reservation->created_at)->toISOString(),
            'updated_at' => optional($reservation->updated_at)->toISOString(),
        ];
    }
}
