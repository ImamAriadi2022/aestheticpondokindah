<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ClinicalProcedure;
use App\Models\Consultation;
use App\Models\Diagnosis;
use App\Models\MedicalRecord;
use App\Models\SoapNote;
use App\Models\Visit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorConsultationController extends Controller
{
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
                    ->orWhere('doctor_name', 'like', '%' . $user->name . '%')
                    ->orWhere('type', 'quick');
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
            ->map(function (Consultation $c) {
                return $this->toDto($c);
            })
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
                ->orWhere('doctor_name', 'like', '%' . $user->name . '%')
                ->orWhere('type', 'quick');
        };

        $query = Consultation::query()->with(['user', 'doctorSchedule.user'])->where($scope);

        $today = $query->clone()
            ->whereDate('created_at', now()->toDateString())
            ->count();

        $waiting = Consultation::query()->where($scope)
            ->where('type', 'quick')
            ->where('status', 'Menunggu')
            ->count();

        $current = Consultation::query()->where($scope)
            ->where('status', 'Menunggu')
            ->where(function ($q) use ($user) {
                $q->where('doctor_id', $user->id);
            })
            ->count();

        $completed = Consultation::query()->where($scope)
            ->where('status', 'Selesai')
            ->count();

        $recent = Consultation::query()->where($scope)
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function (Consultation $c) {
                return $this->toDto($c);
            })
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
        $consultation = Consultation::with(['user', 'doctorSchedule.user'])->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        return response()->json(['consultation' => $this->detailDto($consultation)]);
    }

    public function assign(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->type !== 'quick') {
            return response()->json(['message' => 'Hanya konsultasi cepat yang dapat diambil oleh dokter.'], 422);
        }

        if ($consultation->status === 'Selesai') {
            return response()->json(['message' => 'Konsultasi ini sudah selesai.'], 422);
        }

        if ($consultation->doctor_id && (int) $consultation->doctor_id !== (int) $doctor->id) {
            return response()->json(['message' => 'Konsultasi ini sudah ditangani dokter lain.'], 409);
        }

        $consultation->doctor_id = $doctor->id;
        $consultation->doctor_name = $doctor->name;
        $consultation->save();

        $consultation->load(['user', 'doctorSchedule.user']);

        return response()->json(['message' => 'Konsultasi berhasil diambil.', 'consultation' => $this->detailDto($consultation)]);
    }

    public function updateStatus(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $validated = $request->validate([
            'status' => ['required', 'in:Menunggu,Dijadwalkan,Selesai'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $consultation->status = $validated['status'];

        if ($validated['status'] === 'Selesai') {
            $consultation->messages()->whereNull('read_at')->update(['read_at' => now()]);
        }

        $consultation->save();
        $consultation->load(['user', 'doctorSchedule.user']);

        return response()->json(['message' => 'Status konsultasi diperbarui.', 'consultation' => $this->detailDto($consultation)]);
    }

    public function patientSummary(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::with(['user'])->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
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
            ->map(function (Consultation $c) {
                return $this->toDto($c);
            })
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

    private function toDto(Consultation $c): array
    {
        $dateStr = '-';
        if ($c->type === 'scheduled' && $c->schedule_date) {
            $dateStr = $c->schedule_date->format('j F Y');
            if ($c->schedule_time) {
                $dateStr .= ' • ' . $c->schedule_time;
            }
        } else {
            $dateStr = optional($c->created_at)->format('j F Y') ?? '-';
        }

        $doctorId = $c->doctor_id
            ? (string) $c->doctor_id
            : ($c->doctorSchedule?->user_id ? (string) $c->doctorSchedule->user_id : null);

        $unreadCount = $c->messages()
            ->where('sender_role', '!=', 'doctor')
            ->whereNull('read_at')
            ->count();

        return [
            'id' => (string) $c->id,
            'userId' => (string) $c->user_id,
            'user' => $c->user ? [
                'id' => (string) $c->user->id,
                'name' => $c->user->name,
                'email' => $c->user->email,
            ] : null,
            'doctorId' => $doctorId,
            'type' => $c->type,
            'status' => $c->status,
            'topic' => $c->topic ?: ($c->category ?: 'Konsultasi'),
            'category' => $c->category,
            'doctorName' => $c->doctorSchedule?->user?->name ?: ($c->doctor_name ?: 'Dokter Jaga'),
            'date' => $dateStr,
            'chiefComplaint' => $c->chief_complaint,
            'duration' => $c->duration,
            'painScale' => $c->pain_scale,
            'allergies' => $c->allergies,
            'medications' => $c->medications,
            'priorTreatment' => $c->prior_treatment,
            'preferredContact' => $c->preferred_contact,
            'contactNumber' => $c->contact_number,
            'expectations' => $c->expectations,
            'notes' => $c->notes,
            'scheduleDate' => optional($c->schedule_date)?->format('Y-m-d'),
            'scheduleTime' => $c->schedule_time,
            'location' => $c->location,
            'attachments' => $c->attachments ?? [],
            'unreadCount' => $unreadCount,
            'createdAt' => optional($c->created_at)->toISOString(),
        ];
    }

    private function detailDto(Consultation $c): array
    {
        $base = $this->toDto($c);

        $base['messages'] = $c->messages->map(function ($m) {
            return [
                'id' => (string) $m->id,
                'senderId' => (string) $m->sender_id,
                'senderRole' => $m->sender_role,
                'body' => $m->body,
                'attachments' => $m->attachments ?? [],
                'readAt' => optional($m->read_at)->toISOString(),
                'createdAt' => optional($m->created_at)->toISOString(),
            ];
        })->values();

        $base['meetings'] = $c->meetings->map(function ($m) {
            return [
                'id' => (string) $m->id,
                'provider' => $m->provider,
                'title' => $m->title,
                'url' => $m->url,
                'startsAt' => optional($m->starts_at)->toISOString(),
                'createdAt' => optional($m->created_at)->toISOString(),
            ];
        })->values();

        return $base;
    }
}
