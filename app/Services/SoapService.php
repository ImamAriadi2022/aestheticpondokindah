<?php

namespace App\Services;

use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Doctor\MedicalRecord\SoapNote;
use App\Models\Shared\User\User;
use RuntimeException;

class SoapService
{
    /**
     * Save or update structured SOAP note with read-only & sanitization rules
     */
    public function saveOrUpdateSoap(MedicalRecord $record, User $doctor, array $data): SoapNote
    {
        // Read-Only Enforcement Rule
        if ($record->isReadOnly()) {
            throw new RuntimeException("Catatan SOAP tidak dapat diubah karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        // Sanitize and trim structured fields
        $subjective = isset($data['subjective']) ? trim(strip_tags($data['subjective'])) : null;
        $objective = isset($data['objective']) ? trim(strip_tags($data['objective'])) : null;
        $assessment = isset($data['assessment']) ? trim(strip_tags($data['assessment'])) : null;
        $plan = isset($data['plan']) ? trim(strip_tags($data['plan'])) : null;

        $existing = SoapNote::where('medical_record_id', $record->id)->first();

        if ($existing) {
            $existing->subjective = $subjective;
            $existing->objective = $objective;
            $existing->assessment = $assessment;
            $existing->plan = $plan;
            $existing->revision_number = ($existing->revision_number ?? 1) + 1;
            $existing->updated_by = $doctor->id;
            $existing->save();

            return $existing->fresh(['medicalRecord', 'patient', 'doctor', 'updatedBy']);
        }

        return SoapNote::create([
            'medical_record_id' => $record->id,
            'patient_id' => $record->patient_id,
            'doctor_id' => $record->doctor_id,
            'subjective' => $subjective,
            'objective' => $objective,
            'assessment' => $assessment,
            'plan' => $plan,
            'revision_number' => 1,
            'created_by' => $doctor->id,
            'updated_by' => $doctor->id,
        ])->load(['medicalRecord', 'patient', 'doctor', 'createdBy']);
    }

    /**
     * Get SOAP note for a medical record
     */
    public function getSoapNoteByRecord(MedicalRecord $record): ?SoapNote
    {
        return SoapNote::with(['medicalRecord', 'patient', 'doctor', 'createdBy', 'updatedBy'])
            ->where('medical_record_id', $record->id)
            ->first();
    }
}
