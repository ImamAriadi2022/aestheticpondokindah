<?php

namespace App\Http\Controllers\Api\Doctor;

use App\Http\Controllers\Controller;
use App\Models\ClinicalProcedure;
use App\Models\Consultation;
use App\Models\Diagnosis;
use App\Models\MedicalRecord;
use App\Models\SoapNote;
use App\Models\Visit;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorConsultationController extends Controller
{
    public function __construct(private readonly ConsultationService $consultationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Consultation::query()
            ->with(['user', 'doctorSchedule.user'])
            ->where(function ($q) use ($user) {
                $q->where('doctor_id', $user->id)
                    ->orWhereHas('doctorSchedule', function ($sq) use ($user) {
                        $sq->where('user_id', $user->id);
                    })
                    ->orWhere('doctor_name', 'like', '%' . $user->name . '%');
            });

        $type = trim((string) $request->query('type', ''));
        if ($type !== '') {
            $query->where('type', $type);
        }

        $status = trim((string) $request->query('status', ''));
        if ($status !== '') {
            $query->where('status', $status);
        }

        $items = $query->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        return response()->json($items);
    }

    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $scope = function ($q) use ($user) {
            $q->where('doctor_id', $user->id)
                ->orWhereHas('doctorSchedule', function ($sq) use ($user) {
                    $sq->where('user_id', $user->id);
                })
                ->orWhere('doctor_name', 'like', '%' . $user->name . '%');
        };

        $query = Consultation::query()->with(['user', 'doctorSchedule.user'])->where($scope);

        $today = $query->clone()
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $waiting = Consultation::query()->where($scope)
            ->where('status', 'Menunggu')
            ->count();

        $current = Consultation::query()->where($scope)
            ->where('status', 'Dibuka')
            ->count();

        $completed = Consultation::query()->where($scope)
            ->where('status', 'Selesai')
            ->count();

        $recent = Consultation::query()->where($scope)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        return response()->json([
            'summary' => [
                'today' => $today,
                'waiting' => $waiting,
                'current' => $current,
                'completed' => $completed,
            ],
            'recent' => $recent,
        ]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::with(['user', 'doctorSchedule.user', 'messages.sender', 'meetings'])->find($id);

        if (!$consultation || !$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $dto = ConsultationService::dto($consultation);
        $dto['messages'] = $consultation->messages->map(fn ($m) => ConsultationService::messageDto($m))->values();
        $dto['meetings'] = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();
        $dto['medicalRecord'] = $this->medicalRecordDto($consultation);

        return response()->json(['consultation' => $dto]);
    }

    public function assign(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi ini sudah ditutup.'], 422);
        }

        if ($consultation->doctor_id && (int) $consultation->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Konsultasi ini sudah ditangani dokter lain.'], 409);
        }

        $consultation = $this->consultationService->transferToDoctor($consultation, $doctor);

        return response()->json(['message' => 'Konsultasi berhasil diambil.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function start(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::with(['user', 'doctorSchedule.user', 'reservation'])->find($id);

        if (!$consultation || !$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $consultation = $this->consultationService->start($consultation, $doctor);

        $dto = ConsultationService::dto($consultation);
        $dto['medicalRecord'] = $this->medicalRecordDto($consultation);

        return response()->json(['message' => 'Konsultasi dimulai.', 'consultation' => $dto]);
    }

    public function complete(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::with(['user', 'doctorSchedule.user'])->find($id);

        if (!$consultation || !$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $consultation = $this->consultationService->complete($consultation);

        $dto = ConsultationService::dto($consultation);
        $dto['medicalRecord'] = $this->medicalRecordDto($consultation);

        return response()->json(['message' => 'Konsultasi diselesaikan.', 'consultation' => $dto]);
    }

    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $validated = $request->validate([
            'status' => ['required', 'in:Menunggu,Dijadwalkan,Dibuka,Selesai'],
        ]);

        $consultation = Consultation::with(['user', 'doctorSchedule.user'])->find($id);

        if (!$consultation || !$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($validated['status'] === 'Selesai') {
            $consultation = $this->consultationService->complete($consultation);
        } else {
            $consultation->status = $validated['status'];
            $consultation->save();
        }

        return response()->json(['message' => 'Status konsultasi diperbarui.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function patientSummary(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::with(['user'])->find($id);

        if (!$consultation || !$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $patient = $consultation->user;
        if (!$patient) {
            return response()->json(['message' => 'Data pasien tidak ditemukan.'], 404);
        }

        $visits = Visit::query()
            ->with(['doctor'])
            ->where('patient_id', $patient->id)
            ->orderByDesc('visit_date')
            ->limit(20)
            ->get()
            ->map(function (Visit $v) {
                return [
                    'id' => (string) $v->id,
                    'visit_number' => $v->visit_number,
                    'status' => $v->status,
                    'visit_date' => optional($v->visit_date)->format('Y-m-d H:i'),
                    'chief_complaint' => $v->chief_complaint,
                    'doctor_name' => $v->doctor?->name,
                ];
            })
            ->values();

        $medicalRecords = MedicalRecord::query()
            ->with(['doctor', 'diagnoses', 'clinicalProcedures'])
            ->where('patient_id', $patient->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(function (MedicalRecord $mr) {
                return [
                    'id' => (string) $mr->id,
                    'record_number' => $mr->record_number,
                    'status' => $mr->status,
                    'summary_notes' => $mr->summary_notes,
                    'finalized_at' => optional($mr->finalized_at)->toISOString(),
                    'doctor_name' => $mr->doctor?->name,
                    'diagnoses' => $mr->diagnoses->map(function (Diagnosis $d) {
                        return ['name' => $d->name, 'type' => $d->type, 'icd10_code' => $d->icd10_code];
                    })->values(),
                    'procedures' => $mr->clinicalProcedures->map(function (ClinicalProcedure $p) {
                        return ['name' => $p->catalog?->name ?? 'Prosedur', 'status' => $p->status, 'tooth_number' => $p->tooth_number];
                    })->values(),
                ];
            })
            ->values();

        $history = Consultation::query()
            ->where('user_id', $patient->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        return response()->json([
            'patient' => [
                'id' => (string) $patient->id,
                'name' => $patient->name,
                'email' => $patient->email,
                'whatsapp' => $patient->whatsapp,
                'gender' => $patient->gender,
                'birth_date' => optional($patient->birth_date)->format('Y-m-d'),
                'blood_type' => $patient->blood_type,
                'job' => $patient->job,
                'address' => trim(implode(', ', array_filter([$patient->address_line, $patient->city, $patient->province]))),
                'membership_level' => $patient->membership_level,
            ],
            'visits' => $visits,
            'medical_records' => $medicalRecords,
            'history' => $history,
        ]);
    }

    private function medicalRecordDto(Consultation $consultation): ?array
    {
        $visit = $consultation->visit;
        if (!$visit) {
            return null;
        }

        $record = MedicalRecord::query()->where('visit_id', $visit->id)->first();
        if (!$record) {
            return null;
        }

        return [
            'id' => (string) $record->id,
            'recordNumber' => $record->record_number,
            'status' => $record->status,
            'summaryNotes' => $record->summary_notes,
            'visitId' => (string) $visit->id,
            'finalizedAt' => optional($record->finalized_at)->toISOString(),
        ];
    }
}
