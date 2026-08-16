<?php

namespace App\Http\Controllers\Api\Doctor\MedicalRecord;

use App\Http\Controllers\Controller;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Services\MedicalRecordService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class MedicalRecordController extends Controller
{
    protected MedicalRecordService $recordService;

    public function __construct(MedicalRecordService $recordService)
    {
        $this->recordService = $recordService;
    }

    /**
     * Get patient's medical records list (Read-Only access)
     */
    public function patientIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        $records = MedicalRecord::with(['visit', 'doctor:id,name'])
            ->where('patient_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * Get patient's medical record detail with IDOR check
     */
    public function patientShow(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $record = MedicalRecord::with(['visit', 'doctor:id,name'])->find($id);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Patient IDOR Check
        if ((int) $record->patient_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke rekam medis ini.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
        ]);
    }

    /**
     * Get doctor's assigned medical records list
     */
    public function doctorIndex(Request $request): JsonResponse
    {
        $doctor = $request->user();
        $records = MedicalRecord::with(['visit', 'patient:id,name,email,whatsapp'])
            ->where('doctor_id', $doctor->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $records,
        ]);
    }

    /**
     * Get doctor's assigned medical record detail with IDOR check
     */
    public function doctorShow(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $record = MedicalRecord::with(['visit', 'patient:id,name,email,whatsapp'])->find($id);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke rekam medis dokter ini.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
        ]);
    }

    /**
     * Update medical record status or summary notes
     */
    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:draft,in_progress,finalized,locked',
            'summary_notes' => 'nullable|string',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($id);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke rekam medis dokter ini.'], 403);
        }

        try {
            $updated = $this->recordService->transitionStatus(
                $record,
                $request->input('status'),
                $request->input('summary_notes')
            );

            return response()->json([
                'success' => true,
                'message' => "Status rekam medis berhasil diperbarui menjadi '{$updated->status}'.",
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
     * Finalize medical record
     */
    public function finalize(Request $request, int|string $id): JsonResponse
    {
        $request->merge(['status' => 'finalized']);
        return $this->updateStatus($request, $id);
    }

    /**
     * Lock medical record
     */
    public function lock(Request $request, int|string $id): JsonResponse
    {
        $request->merge(['status' => 'locked']);
        return $this->updateStatus($request, $id);
    }
}
