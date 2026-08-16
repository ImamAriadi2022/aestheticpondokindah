<?php

namespace App\Services;

use App\Models\Shared\Reservation\Reservation;
use App\Models\Doctor\Visit\Visit;
use InvalidArgumentException;
use RuntimeException;

class VisitService
{
    /**
     * Find existing visit for a reservation or create a new one automatically
     */
    public function findOrCreateFromReservation(Reservation $reservation): Visit
    {
        $existing = Visit::where('reservation_id', $reservation->id)->first();
        if ($existing) {
            return $existing;
        }

        $visitNumber = 'VST-' . date('Ymd') . '-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        return Visit::create([
            'visit_number' => $visitNumber,
            'patient_id' => $reservation->user_id ?? $reservation->id, // fallback if guest reservation
            'doctor_id' => $reservation->doctor_id ?? 1,
            'reservation_id' => $reservation->id,
            'status' => 'waiting',
            'visit_date' => $reservation->date ?? now(),
            'chief_complaint' => $reservation->complaint,
        ]);
    }

    /**
     * Transition visit status with lifecycle validation rules
     */
    public function transitionStatus(Visit $visit, string $targetStatus, ?string $notes = null): Visit
    {
        $allowedStatuses = ['scheduled', 'waiting', 'in_progress', 'completed', 'cancelled'];
        if (!in_array($targetStatus, $allowedStatuses, true)) {
            throw new InvalidArgumentException("Status kunjungan '{$targetStatus}' tidak valid.");
        }

        // Terminal State Guard
        if ($visit->isTerminal()) {
            throw new RuntimeException("Kunjungan pasien dengan status '{$visit->status}' sudah berada dalam kondisi terminal dan tidak dapat diubah.");
        }

        $visit->status = $targetStatus;
        if ($notes !== null) {
            $visit->notes = $notes;
        }

        if ($targetStatus === 'in_progress' && !$visit->started_at) {
            $visit->started_at = now();
            // Task 5.2 Automatic Record Creation
            app(MedicalRecordService::class)->findOrCreateFromVisit($visit);
        }

        if ($targetStatus === 'completed' && !$visit->completed_at) {
            $visit->completed_at = now();
        }

        $visit->save();

        return $visit->fresh(['patient', 'doctor', 'reservation']);
    }
}
