<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\MedicalRecord;
use App\Services\SoapService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class SoapController extends Controller
{
    protected SoapService $soapService;

    public function __construct(SoapService $soapService)
    {
        $this->soapService = $soapService;
    }

    /**
     * Patient views SOAP note for their medical record (Read-Only)
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
            return response()->json(['message' => 'Anda tidak memiliki akses ke catatan SOAP rekam medis ini.'], 403);
        }

        $soap = $this->soapService->getSoapNoteByRecord($record);

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'soap_note' => $soap,
            ],
        ]);
    }

    /**
     * Doctor views SOAP note for their assigned medical record
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
            return response()->json(['message' => 'Anda tidak memiliki akses ke catatan SOAP dokter ini.'], 403);
        }

        $soap = $this->soapService->getSoapNoteByRecord($record);

        return response()->json([
            'success' => true,
            'data' => [
                'medical_record' => $record,
                'soap_note' => $soap,
                'is_read_only' => $record->isReadOnly(),
            ],
        ]);
    }

    /**
     * Doctor creates or updates structured SOAP note
     */
    public function storeOrUpdate(Request $request, int|string $recordId): JsonResponse
    {
        $request->validate([
            'subjective' => 'nullable|string|max:5000',
            'objective' => 'nullable|string|max:5000',
            'assessment' => 'nullable|string|max:5000',
            'plan' => 'nullable|string|max:5000',
        ]);

        $doctor = $request->user();
        $record = MedicalRecord::find($recordId);

        if (!$record) {
            return response()->json(['message' => 'Rekam medis tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $record->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke catatan SOAP dokter ini.'], 403);
        }

        try {
            $soap = $this->soapService->saveOrUpdateSoap($record, $doctor, $request->only([
                'subjective', 'objective', 'assessment', 'plan'
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Catatan SOAP berhasil disimpan.',
                'data' => $soap,
            ]);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
