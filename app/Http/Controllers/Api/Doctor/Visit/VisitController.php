<?php

namespace App\Http\Controllers\Api\Doctor\Visit;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Visit\Visit;
use App\Services\Doctor\Visit\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class VisitController extends Controller
{
    protected VisitService $visitService;

    public function __construct(VisitService $visitService)
    {
        $this->visitService = $visitService;
    }

    /**
     * Get patient's visits list
     */
    public function patientIndex(Request $request): JsonResponse
    {
        $user = $request->user();
        $visits = Visit::with(['doctor:id,name', 'reservation'])
            ->where('patient_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Get patient's visit detail with IDOR check
     */
    public function patientShow(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $visit = Visit::with(['doctor:id,name', 'reservation'])->find($id);

        if (!$visit) {
            return response()->json(['message' => 'Data kunjungan tidak ditemukan.'], 404);
        }

        // Strict Patient IDOR Check
        if ((int) $visit->patient_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data kunjungan ini.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $visit,
        ]);
    }

    /**
     * Get doctor's assigned visits list
     */
    public function doctorIndex(Request $request): JsonResponse
    {
        $doctor = $request->user();
        $visits = Visit::with(['patient:id,name,email,whatsapp', 'reservation'])
            ->where('doctor_id', $doctor->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $visits,
        ]);
    }

    /**
     * Get doctor's assigned visit detail with IDOR check
     */
    public function doctorShow(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $visit = Visit::with(['patient:id,name,email,whatsapp', 'reservation'])->find($id);

        if (!$visit) {
            return response()->json(['message' => 'Data kunjungan tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $visit->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data kunjungan dokter ini.'], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $visit,
        ]);
    }

    /**
     * Update visit status (Doctor action)
     */
    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:scheduled,waiting,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $doctor = $request->user();
        $visit = Visit::find($id);

        if (!$visit) {
            return response()->json(['message' => 'Data kunjungan tidak ditemukan.'], 404);
        }

        // Strict Doctor IDOR Check
        if ((int) $visit->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke data kunjungan dokter ini.'], 403);
        }

        try {
            $updated = $this->visitService->transitionStatus(
                $visit,
                $request->input('status'),
                $request->input('notes')
            );

            return response()->json([
                'success' => true,
                'message' => 'Status kunjungan berhasil diperbarui.',
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
