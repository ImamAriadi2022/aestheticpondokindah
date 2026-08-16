<?php

namespace App\Services;

use App\Models\Doctor\Diagnosis\Diagnosis;
use App\Models\Doctor\Diagnosis\Icd10Code;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;
use RuntimeException;

class DiagnosisService
{
    /**
     * Search ICD-10 codes by code or description
     */
    public function searchIcd10(string $query): Collection
    {
        $term = trim($query);
        if (empty($term)) {
            return Icd10Code::query()->limit(20)->get();
        }

        return Icd10Code::where('code', 'LIKE', "%{$term}%")
            ->orWhere('description', 'LIKE', "%{$term}%")
            ->orWhere('category', 'LIKE', "%{$term}%")
            ->limit(20)
            ->get();
    }

    /**
     * Create clinical diagnosis for a medical record
     */
    public function createDiagnosis(MedicalRecord $record, User $doctor, array $data): Diagnosis
    {
        // Read-Only Enforcement Rule
        if ($record->isReadOnly()) {
            throw new RuntimeException("Diagnosis tidak dapat ditambahkan karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        $name = trim(strip_tags($data['name'] ?? ''));
        if (empty($name)) {
            throw new InvalidArgumentException("Nama diagnosis klinis tidak boleh kosong.");
        }

        $type = strtolower($data['type'] ?? 'primary');
        if (!in_array($type, ['primary', 'secondary', 'differential'], true)) {
            throw new InvalidArgumentException("Tipe diagnosis '{$type}' tidak valid. Harus primary, secondary, atau differential.");
        }

        $icd10Code = isset($data['icd10_code']) ? trim(strip_tags($data['icd10_code'])) : null;
        $icd10Desc = isset($data['icd10_description']) ? trim(strip_tags($data['icd10_description'])) : null;
        $notes = isset($data['notes']) ? trim(strip_tags($data['notes'])) : null;

        // If ICD-10 code is provided, look up description if not provided
        if ($icd10Code && !$icd10Desc) {
            $icdMatch = Icd10Code::where('code', $icd10Code)->first();
            if ($icdMatch) {
                $icd10Desc = $icdMatch->description;
            }
        }

        // Duplicate Check per Medical Record
        $existingDuplicate = Diagnosis::where('medical_record_id', $record->id)
            ->where(function ($q) use ($name, $icd10Code) {
                $q->where('name', $name);
                if ($icd10Code) {
                    $q->orWhere('icd10_code', $icd10Code);
                }
            })
            ->first();

        if ($existingDuplicate) {
            throw new InvalidArgumentException("Diagnosis '{$name}' sudah tercatat pada rekam medis ini.");
        }

        // If creating a new primary diagnosis and one already exists, demote existing primary to secondary
        if ($type === 'primary') {
            Diagnosis::where('medical_record_id', $record->id)
                ->where('type', 'primary')
                ->update(['type' => 'secondary']);
        }

        return Diagnosis::create([
            'medical_record_id' => $record->id,
            'patient_id' => $record->patient_id,
            'doctor_id' => $record->doctor_id,
            'name' => $name,
            'type' => $type,
            'notes' => $notes,
            'icd10_code' => $icd10Code,
            'icd10_description' => $icd10Desc,
            'created_by' => $doctor->id,
            'updated_by' => $doctor->id,
        ])->load(['medicalRecord', 'patient', 'doctor']);
    }

    /**
     * Update existing diagnosis
     */
    public function updateDiagnosis(Diagnosis $diagnosis, User $doctor, array $data): Diagnosis
    {
        $record = $diagnosis->medicalRecord;
        if ($record && $record->isReadOnly()) {
            throw new RuntimeException("Diagnosis tidak dapat diubah karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        if (isset($data['name'])) {
            $diagnosis->name = trim(strip_tags($data['name']));
        }
        if (isset($data['type'])) {
            $type = strtolower($data['type']);
            if (in_array($type, ['primary', 'secondary', 'differential'], true)) {
                if ($type === 'primary' && $diagnosis->type !== 'primary') {
                    Diagnosis::where('medical_record_id', $diagnosis->medical_record_id)
                        ->where('type', 'primary')
                        ->update(['type' => 'secondary']);
                }
                $diagnosis->type = $type;
            }
        }
        if (isset($data['notes'])) {
            $diagnosis->notes = trim(strip_tags($data['notes']));
        }
        if (isset($data['icd10_code'])) {
            $diagnosis->icd10_code = trim(strip_tags($data['icd10_code']));
        }
        if (isset($data['icd10_description'])) {
            $diagnosis->icd10_description = trim(strip_tags($data['icd10_description']));
        }

        $diagnosis->updated_by = $doctor->id;
        $diagnosis->save();

        return $diagnosis->fresh(['medicalRecord', 'patient', 'doctor']);
    }

    /**
     * Delete diagnosis
     */
    public function deleteDiagnosis(Diagnosis $diagnosis, User $doctor): bool
    {
        $record = $diagnosis->medicalRecord;
        if ($record && $record->isReadOnly()) {
            throw new RuntimeException("Diagnosis tidak dapat dihapus karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        return $diagnosis->delete();
    }
}
