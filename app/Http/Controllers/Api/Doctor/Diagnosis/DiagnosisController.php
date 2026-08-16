<?php

namespace App\Http\Controllers\Api\Doctor\Diagnosis;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Diagnosis\Diagnosis;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Services\DiagnosisService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class DiagnosisController extends Controller
{
    protected DiagnosisService $diagnosisService;

    public function __construct(DiagnosisService $diagnosisService)
    {
        $this->diagnosisService = $diagnosisService;
    }

    /**
     * Search ICD-10 codes
     */
    public function searchIcd10(Request $request): JsonResponse
    {
        $query = $request->input('query', '');
        $codes = $this->diagnosisService->searchIcd10($query);

        return response()->json([
            'success' => true,
            'data' => $codes,
        ]);
    }

    /**
     * Patient views diagnoses for their medical record (Read-Only)
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
            return response()->json(['message' => 'Anda tidak memiliki akses ke diagnosis rekam medis ini.'], 403);
        }

        $diagnoses = Diagnosis::where('medical_record_id', $record->id)
            ->orderByRaw("FIELD(type, 'primary', 'secondary', 'differential')")
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'diagnoses' => $diagnoses,
            ],
        ]);
    }

    /**
     * Doctor views diagnoses for assigned medical record
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
            return response()->json(['message' => 'Anda tidak memiliki akses ke diagnosis rekam medis dokter ini.'], 403);
        }

        $diagnoses = Diagnosis::where('medical_record_id', $record->id)
            ->orderByRaw("FIELD(type, 'primary', 'secondary', 'differential')")
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'diagnoses' => $diagnoses,
                'is_read_only' => $record->isReadOnly(),
            ],
        ]);
    }

    /**
     * Doctor creates new clinical diagnosis
     */
    public function store(Request $request, int|string $recordId): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|in:primary,secondary,differential',
            'notes' => 'nullable|string|max:2000',
            'icd10_code' => 'nullable|string|max:20',
            'icd10_description' => 'nullable|string|max:255',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke diagnosis rekam medis dokter ini.'], 403);
        }

        try {
            $diagnosis = $this->diagnosisService->createDiagnosis(
                $record,
                $doctor,
                $request->only(['name', 'type', 'notes', 'icd10_code', 'icd10_description'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis klinis berhasil ditambahkan.',
                'data' => $diagnosis,
            ], 201);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Doctor updates existing diagnosis
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:primary,secondary,differential',
            'notes' => 'nullable|string|max:2000',
            'icd10_code' => 'nullable|string|max:20',
            'icd10_description' => 'nullable|string|max:255',
        ]);

        $doctor = $request->user();
        $diagnosis = Diagnosis::with('medicalRecord')->find($id);

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $diagnosis->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke diagnosis dokter ini.'], 403);
        }

        try {
            $updated = $this->diagnosisService->updateDiagnosis(
                $diagnosis,
                $doctor,
                $request->only(['name', 'type', 'notes', 'icd10_code', 'icd10_description'])
            );

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis klinis berhasil diperbarui.',
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
     * Doctor deletes diagnosis
     */
    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $diagnosis = Diagnosis::with('medicalRecord')->find($id);

        if (!$diagnosis) {
            return response()->json(['message' => 'Diagnosis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $diagnosis->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke diagnosis dokter ini.'], 403);
        }

        try {
            $this->diagnosisService->deleteDiagnosis($diagnosis, $doctor);

            return response()->json([
                'success' => true,
                'message' => 'Diagnosis klinis berhasil dihapus.',
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
