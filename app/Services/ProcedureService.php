<?php

namespace App\Services;

use App\Models\Doctor\Procedure\ClinicalProcedure;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Doctor\Procedure\ProcedureCatalog;
use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Collection;
use InvalidArgumentException;
use RuntimeException;

class ProcedureService
{
    /**
     * Search active procedure catalog items
     */
    public function searchCatalog(string $query): Collection
    {
        $term = trim($query);
        if (empty($term)) {
            return ProcedureCatalog::where('active', true)->limit(20)->get();
        }

        return ProcedureCatalog::where('active', true)
            ->where(function ($q) use ($term) {
                $q->where('code', 'LIKE', "%{$term}%")
                    ->orWhere('name', 'LIKE', "%{$term}%")
                    ->orWhere('category', 'LIKE', "%{$term}%");
            })
            ->limit(20)
            ->get();
    }

    /**
     * Create clinical procedure for a medical record
     */
    public function createProcedure(MedicalRecord $record, User $doctor, array $data): ClinicalProcedure
    {
        // Read-Only Enforcement Rule
        if ($record->isReadOnly()) {
            throw new RuntimeException("Tindakan medis tidak dapat ditambahkan karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        $catalogId = $data['procedure_catalog_id'] ?? null;
        $catalog = ProcedureCatalog::find($catalogId);
        if (!$catalog || !$catalog->active) {
            throw new InvalidArgumentException("Katalog tindakan medis tidak ditemukan atau tidak aktif.");
        }

        $diagnosisId = $data['diagnosis_id'] ?? null;
        $toothNumber = isset($data['tooth_number']) ? trim(strip_tags($data['tooth_number'])) : null;
        $notes = isset($data['notes']) ? trim(strip_tags($data['notes'])) : null;
        $status = strtolower($data['status'] ?? 'planned');

        $allowedStatuses = ['planned', 'in_progress', 'completed', 'cancelled'];
        if (!in_array($status, $allowedStatuses, true)) {
            throw new InvalidArgumentException("Status tindakan '{$status}' tidak valid.");
        }

        $performedAt = ($status === 'completed') ? now() : null;

        return ClinicalProcedure::create([
            'medical_record_id' => $record->id,
            'patient_id' => $record->patient_id,
            'doctor_id' => $record->doctor_id,
            'procedure_catalog_id' => $catalog->id,
            'diagnosis_id' => $diagnosisId,
            'tooth_number' => $toothNumber,
            'notes' => $notes,
            'status' => $status,
            'performed_by' => $doctor->id,
            'performed_at' => $performedAt,
            'created_by' => $doctor->id,
            'updated_by' => $doctor->id,
        ])->load(['medicalRecord', 'patient', 'doctor', 'catalog', 'diagnosis']);
    }

    /**
     * Update existing clinical procedure
     */
    public function updateProcedure(ClinicalProcedure $procedure, User $doctor, array $data): ClinicalProcedure
    {
        $record = $procedure->medicalRecord;
        if ($record && $record->isReadOnly()) {
            throw new RuntimeException("Tindakan medis tidak dapat diubah karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        if (isset($data['tooth_number'])) {
            $procedure->tooth_number = trim(strip_tags($data['tooth_number']));
        }
        if (isset($data['notes'])) {
            $procedure->notes = trim(strip_tags($data['notes']));
        }
        if (isset($data['diagnosis_id'])) {
            $procedure->diagnosis_id = $data['diagnosis_id'];
        }

        if (isset($data['status'])) {
            $status = strtolower($data['status']);
            $allowedStatuses = ['planned', 'in_progress', 'completed', 'cancelled'];
            if (in_array($status, $allowedStatuses, true)) {
                $procedure->status = $status;
                if ($status === 'completed' && !$procedure->performed_at) {
                    $procedure->performed_at = now();
                    $procedure->performed_by = $doctor->id;
                }
            }
        }

        $procedure->updated_by = $doctor->id;
        $procedure->save();

        return $procedure->fresh(['medicalRecord', 'patient', 'doctor', 'catalog', 'diagnosis']);
    }

    /**
     * Delete clinical procedure
     */
    public function deleteProcedure(ClinicalProcedure $procedure, User $doctor): bool
    {
        $record = $procedure->medicalRecord;
        if ($record && $record->isReadOnly()) {
            throw new RuntimeException("Tindakan medis tidak dapat dihapus karena rekam medis #{$record->record_number} sudah berstatus '{$record->status}'.");
        }

        return $procedure->delete();
    }
}
