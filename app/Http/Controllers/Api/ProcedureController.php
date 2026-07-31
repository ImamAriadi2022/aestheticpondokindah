<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalProcedure;
use App\Models\MedicalRecord;
use App\Services\ProcedureService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class ProcedureController extends Controller
{
    protected ProcedureService $procedureService;

    public function __construct(ProcedureService $procedureService)
    {
        $this->procedureService = $procedureService;
    }

    /**
     * Search procedure catalog items
     */
    public function searchCatalog(Request $request): JsonResponse
    {
        $query = $request->input('query', '');
        $catalog = $this->procedureService->searchCatalog($query);

        return response()->json([
            'success' => true,
            'data' => $catalog,
        ]);
    }

    /**
     * Patient views procedures for their medical record (Read-Only)
     */
    public function patientIndex(Request $request, int|string $recordId): JsonResponse
    {
        $user = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Patient IDOR Check
        if ((int) $record->patient_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke tindakan medis rekam medis ini.'], 403);
        }

        $procedures = ClinicalProcedure::with(['catalog', 'diagnosis', 'doctor:id,name'])
            ->where('medical_record_id', $record->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'procedures' => $procedures,
            ],
        ]);
    }

    /**
     * Doctor views procedures for assigned medical record
     */
    public function doctorIndex(Request $request, int|string $recordId): JsonResponse
    {
        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke tindakan medis rekam medis dokter ini.'], 403);
        }

        $procedures = ClinicalProcedure::with(['catalog', 'diagnosis', 'patient:id,name,email,whatsapp'])
            ->where('medical_record_id', $record->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'procedures' => $procedures,
                'is_read_only' => $record->isReadOnly(),
            ],
        ]);
    }

    /**
     * Doctor creates new clinical procedure
     */
    public function store(Request $request, int|string $recordId): JsonResponse
    {
        $request->validate([
            'procedure_catalog_id' => 'required|exists:procedure_catalogs,id',
            'diagnosis_id' => 'nullable|exists:diagnoses,id',
            'tooth_number' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|in:planned,in_progress,completed,cancelled',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke tindakan medis rekam medis dokter ini.'], 403);
        }

        try {
            $procedure = $this->procedureService->createProcedure(
                $record,
                $doctor,
                $request->only(['procedure_catalog_id', 'diagnosis_id', 'tooth_number', 'notes', 'status'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Tindakan medis berhasil ditambahkan.',
                'data' => $procedure,
            ], 201);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Doctor updates existing clinical procedure / status
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'diagnosis_id' => 'nullable|exists:diagnoses,id',
            'tooth_number' => 'nullable|string|max:10',
            'notes' => 'nullable|string|max:2000',
            'status' => 'nullable|in:planned,in_progress,completed,cancelled',
        ]);

        $doctor = $request->user();
        $procedure = ClinicalProcedure::with('medicalRecord')->find($id);

        if (!$procedure) {
            return response()->json(['message' => 'Tindakan medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $procedure->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke tindakan medis dokter ini.'], 403);
        }

        try {
            $updated = $this->procedureService->updateProcedure(
                $procedure,
                $doctor,
                $request->only(['diagnosis_id', 'tooth_number', 'notes', 'status'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Tindakan medis berhasil diperbarui.',
                'data' => $updated,
            ]);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Doctor deletes clinical procedure
     */
    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $procedure = ClinicalProcedure::with('medicalRecord')->find($id);

        if (!$procedure) {
            return response()->json(['message' => 'Tindakan medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $procedure->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke tindakan medis dokter ini.'], 403);
        }

        try {
            $this->procedureService->deleteProcedure($procedure, $doctor);

            return response()->json([
                'success' => true,
                'message' => 'Tindakan medis berhasil dihapus.',
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
