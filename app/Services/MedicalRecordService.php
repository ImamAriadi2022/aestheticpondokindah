<?php

namespace App\Services;

use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Doctor\Visit\Visit;
use InvalidArgumentException;
use RuntimeException;

class MedicalRecordService
{
    /**
     * Find existing medical record for a visit or create a new one automatically
     */
    public function findOrCreateFromVisit(Visit $visit): MedicalRecord
    {
        $existing = MedicalRecord::where('visit_id', $visit->id)->first();
        if ($existing) {
            return $existing;
        }

        $recordNumber = 'MR-' . date('Ymd') . '-' . str_pad((string) $visit->id, 6, '0', STR_PAD_LEFT);

        return MedicalRecord::create([
            'record_number' => $recordNumber,
            'visit_id' => $visit->id,
            'patient_id' => $visit->patient_id,
            'doctor_id' => $visit->doctor_id,
            'status' => 'draft',
        ]);
    }

    /**
     * Transition medical record status with lifecycle & lock validation rules
     */
    public function transitionStatus(MedicalRecord $record, string $targetStatus, ?string $summaryNotes = null): MedicalRecord
    {
        $allowedStatuses = ['draft', 'in_progress', 'finalized', 'locked'];
        if (!in_array($targetStatus, $allowedStatuses, true)) {
            throw new InvalidArgumentException("Status rekam medis '{$targetStatus}' tidak valid.");
        }

        // Lock Guard: Locked records cannot be edited!
        if ($record->isLocked()) {
            throw new RuntimeException("Rekam medis #{$record->record_number} telah dikunci (locked) dan tidak dapat diubah lagi.");
        }

        // State Machine Rule: Only finalized records may become locked!
        if ($targetStatus === 'locked' && $record->status !== 'finalized') {
            throw new InvalidArgumentException("Rekam medis hanya dapat dikunci jika sudah berstatus 'finalized'. Current status: '{$record->status}'.");
        }

        $record->status = $targetStatus;
        if ($summaryNotes !== null) {
            $record->summary_notes = $summaryNotes;
        }

        if ($targetStatus === 'finalized' && !$record->finalized_at) {
            $record->finalized_at = now();
        }

        if ($targetStatus === 'locked' && !$record->locked_at) {
            $record->locked_at = now();
        }

        $record->save();

        return $record->fresh(['visit', 'patient', 'doctor']);
    }
}
