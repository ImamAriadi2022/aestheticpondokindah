<?php

namespace App\Services;

use App\Models\MedicalRecord;
use App\Models\Odontogram;
use App\Models\ToothState;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OdontogramService
{
    /**
     * List of valid FDI tooth numbers (Adult: 11-18, 21-28, 31-38, 41-48 | Primary: 51-55, 61-65, 71-75, 81-85)
     */
    public const VALID_FDI_TEETH = [
        // Permanent / Adult Teeth
        '18', '17', '16', '15', '14', '13', '12', '11',
        '21', '22', '23', '24', '25', '26', '27', '28',
        '48', '47', '46', '45', '44', '43', '42', '41',
        '31', '32', '33', '34', '35', '36', '37', '38',
        // Primary / Deciduous Teeth
        '55', '54', '53', '52', '51',
        '61', '62', '63', '64', '65',
        '85', '84', '83', '82', '81',
        '71', '72', '73', '74', '75',
    ];

    public const ALLOWED_CONDITIONS = [
        'normal', 'caries', 'restoration', 'missing',
        'crown', 'root_canal', 'bridge', 'implant',
        'fracture', 'sealant',
    ];

    /**
     * Find or create Odontogram for a medical record
     */
    public function findOrCreateFromMedicalRecord(MedicalRecord $record, User $doctor): Odontogram
    {
        $existing = Odontogram::with('toothStates')->where('medical_record_id', $record->id)->first();
        if ($existing) {
            return $existing;
        }

        return Odontogram::create([
            'medical_record_id' => $record->id,
            'patient_id' => $record->patient_id,
            'doctor_id' => $record->doctor_id,
            'created_by' => $doctor->id,
            'updated_by' => $doctor->id,
        ])->load('toothStates');
    }

    /**
     * Update single tooth state
     */
    public function updateToothState(MedicalRecord $record, User $doctor, array $data): ToothState
    {
        // Read-Only Enforcement Rule
        if ($record->isReadOnly()) {
            throw new RuntimeException("Odontogram tidak dapat diubah karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        $toothNumber = (string) ($data['tooth_number'] ?? '');
        if (!in_array($toothNumber, self::VALID_FDI_TEETH, true)) {
            throw new InvalidArgumentException("Nomor gigi FDI '{$toothNumber}' tidak valid.");
        }

        $condition = strtolower($data['condition'] ?? 'normal');
        if (!in_array($condition, self::ALLOWED_CONDITIONS, true)) {
            throw new InvalidArgumentException("Kondisi gigi '{$condition}' tidak valid.");
        }

        $surface = isset($data['surface']) ? trim(strip_tags($data['surface'])) : null;
        $notes = isset($data['notes']) ? trim(strip_tags($data['notes'])) : null;

        $odontogram = $this->findOrCreateFromMedicalRecord($record, $doctor);

        $toothState = ToothState::firstOrNew([
            'odontogram_id' => $odontogram->id,
            'tooth_number' => $toothNumber,
        ]);

        $toothState->condition = $condition;
        $toothState->surface = $surface;
        $toothState->notes = $notes;
        $toothState->updated_by = $doctor->id;
        $toothState->save();

        return $toothState->fresh('odontogram');
    }

    /**
     * Bulk update tooth states
     */
    public function bulkUpdateToothStates(MedicalRecord $record, User $doctor, array $teethData): array
    {
        if ($record->isReadOnly()) {
            throw new RuntimeException("Odontogram tidak dapat diubah karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        return DB::transaction(function () use ($record, $doctor, $teethData) {
            $updated = [];
            foreach ($teethData as $tData) {
                if (!empty($tData['tooth_number']) && !empty($tData['condition'])) {
                    $updated[] = $this->updateToothState($record, $doctor, $tData);
                }
            }
            return $updated;
        });
    }
}
