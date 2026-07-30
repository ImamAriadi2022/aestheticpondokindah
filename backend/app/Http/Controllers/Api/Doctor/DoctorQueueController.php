<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ReservationAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorQueueController extends Controller
{
    public function queue(Request $request): JsonResponse
    {
        $doctor = $request->user();

        $query = Reservation::query()
            ->where('doctor_id', $doctor->id)
            ->latest();

        $status = trim((string) $request->query('status', ''));
        if ($status !== '' && $status !== 'all') {
            $query->where('status', $status);
        }

        $items = $query->limit(200)->get()->map(function (Reservation $r) {
            return $this->toDoctorDto($r);
        })->values();

        return response()->json(['queue' => $items]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Strict Doctor Ownership IDOR Check
        if ((int) $reservation->doctor_id !== (int) $doctor->id) {
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

        // Strict Doctor Ownership Check
        if ((int) $reservation->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi dokter ini.'], 403);
        }

        // Business Rules Verification
        if ($reservation->status === 'Selesai') {
            return response()->json(['message' => 'Konsultasi yang sudah selesai tidak dapat dimulai kembali.'], 422);
        }
        if (in_array($reservation->status, ['Dibatalkan', 'Ditolak'], true)) {
            return response()->json(['message' => 'Reservasi ini sudah dibatalkan/ditolak.'], 422);
        }
        if ($reservation->status !== 'Dikonfirmasi' && $reservation->status !== 'Dalam Konsultasi') {
            return response()->json(['message' => 'Hanya reservasi yang sudah Dikonfirmasi yang dapat dimulai konsultasinya.'], 422);
        }

        $oldStatus = $reservation->status;
        $reservation->status = 'Dalam Konsultasi';
        $reservation->save();

        // Automatic Visit Creation & Transition (Task 5.1)
        $visitService = app(\App\Services\VisitService::class);
        $visit = $visitService->findOrCreateFromReservation($reservation);
        $visitService->transitionStatus($visit, 'in_progress');

        // Audit Trail
        ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $doctor->id,
            'action' => 'doctor_start_consultation',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => 'Dalam Konsultasi',
        ]);

        return response()->json([
            'message' => 'Konsultasi berhasil dimulai.',
            'reservation' => $this->toDoctorDto($reservation->fresh()),
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

        // Strict Doctor Ownership Check
        if ((int) $reservation->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi dokter ini.'], 403);
        }

        // Business Rules Verification
        if ($reservation->status === 'Selesai') {
            return response()->json(['message' => 'Konsultasi sudah selesai sebelumnya.'], 422);
        }
        if (in_array($reservation->status, ['Dibatalkan', 'Ditolak'], true)) {
            return response()->json(['message' => 'Reservasi ini sudah dibatalkan/ditolak.'], 422);
        }

        $oldStatus = $reservation->status;
        $reservation->status = 'Selesai';
        $reservation->save();

        // Automatic Visit Completion (Task 5.1)
        $visitService = app(\App\Services\VisitService::class);
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
            'message' => 'Konsultasi berhasil diselesaikan.',
            'reservation' => $this->toDoctorDto($reservation->fresh()),
        ]);
    }

    private function toDoctorDto(Reservation $reservation): array
    {
        return [
            'id' => (string) $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'doctor_id' => (string) $reservation->doctor_id,
            'user_id' => (string) $reservation->user_id,
            'patient_name' => $reservation->name,
            'patient_phone' => $reservation->phone,
            'date' => optional($reservation->date)->format('Y-m-d'),
            'complaint' => $reservation->complaint,
            'status' => $reservation->status,
            'created_at' => optional($reservation->created_at)->toISOString(),
            'updated_at' => optional($reservation->updated_at)->toISOString(),
        ];
    }
}
