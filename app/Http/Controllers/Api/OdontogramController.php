<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Services\OdontogramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class OdontogramController extends Controller
{
    protected OdontogramService $odontogramService;

    public function __construct(OdontogramService $odontogramService)
    {
        $this->odontogramService = $odontogramService;
    }

    /**
     * Patient views Odontogram for their medical record (Read-Only)
     */
    public function patientShow(Request $request, int|string $recordId): JsonResponse
    {
        $user = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Patient IDOR Check
        if ((int) $record->patient_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke odontogram rekam medis ini.'], 403);
        }

        $odontogram = $this->odontogramService->findOrCreateFromMedicalRecord($record, $user);

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'odontogram' => $odontogram->load('toothStates'),
            ],
        ]);
    }

    /**
     * Doctor views Odontogram for assigned medical record
     */
    public function doctorShow(Request $request, int|string $recordId): JsonResponse
    {
        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke odontogram rekam medis dokter ini.'], 403);
        }

        $odontogram = $this->odontogramService->findOrCreateFromMedicalRecord($record, $doctor);

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'odontogram' => $odontogram->load('toothStates'),
                'is_read_only' => $record->isReadOnly(),
            ],
        ]);
    }

    /**
     * Doctor updates single tooth state
     */
    public function updateTooth(Request $request, int|string $recordId): JsonResponse
    {
        $request->validate([
            'tooth_number' => 'required|string',
            'condition' => 'required|string',
            'surface' => 'nullable|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke odontogram rekam medis dokter ini.'], 403);
        }

        try {
            $toothState = $this->odontogramService->updateToothState(
                $record,
                $doctor,
                $request->only(['tooth_number', 'condition', 'surface', 'notes'])
            );

            return response()->json([
                'success' => true,
                'message' => "Kondisi gigi #{$toothState->tooth_number} berhasil diperbarui menjadi '{$toothState->condition}'.",
                'data' => $toothState,
            ]);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Doctor bulk updates tooth states
     */
    public function bulkUpdate(Request $request, int|string $recordId): JsonResponse
    {
        $request->validate([
            'teeth' => 'required|array|min:1',
            'teeth.*.tooth_number' => 'required|string',
            'teeth.*.condition' => 'required|string',
            'teeth.*.surface' => 'nullable|string|max:20',
            'teeth.*.notes' => 'nullable|string|max:1000',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke odontogram rekam medis dokter ini.'], 403);
        }

        try {
            $updated = $this->odontogramService->bulkUpdateToothStates(
                $record,
                $doctor,
                $request->input('teeth')
            );

            return response()->json([
                'success' => true,
                'message' => 'Berhasil memperbarui ' . count($updated) . ' kondisi gigi pada odontogram.',
                'data' => $updated,
            ]);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
