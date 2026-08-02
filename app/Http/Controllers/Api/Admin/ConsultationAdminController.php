<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\DoctorSchedule;
use App\Models\MedicalRecord;
use App\Models\User;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationAdminController extends Controller
{
    public function __construct(private readonly ConsultationService $consultationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = Consultation::query()
            ->with(['user', 'doctorSchedule.user', 'doctor'])
            ->orderByDesc('created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('topic', 'like', '%' . $search . '%')
                    ->orWhere('chief_complaint', 'like', '%' . $search . '%')
                    ->orWhere('doctor_name', 'like', '%' . $search . '%')
                    ->orWhere('guest_name', 'like', '%' . $search . '%')
                    ->orWhere('guest_phone', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%')
                            ->orWhere('whatsapp', 'like', '%' . $search . '%');
                    });
            });
        }

        $status = trim((string) $request->query('status', ''));
        if ($status !== '' && $status !== 'Semua') {
            $query->where('status', $status);
        }

        $type = trim((string) $request->query('type', ''));
        if ($type !== '' && $type !== 'Semua') {
            $query->where('type', $type);
        }

        $items = $query->limit(200)->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        return response()->json($items);
    }

    /**
     * Instant consultation queue: waiting items + summary counts.
     */
    public function queue(Request $request): JsonResponse
    {
        $waiting = Consultation::query()
            ->with(['user', 'doctorSchedule.user'])
            ->where('type', 'quick')
            ->whereIn('status', ['Menunggu', 'Dibuka'])
            ->orderByRaw("FIELD(status, 'Menunggu', 'Dibuka')")
            ->orderBy('created_at')
            ->limit(100)
            ->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        $counts = [
            'waiting' => Consultation::query()->where('type', 'quick')->where('status', 'Menunggu')->count(),
            'active' => Consultation::query()->where('type', 'quick')->where('status', 'Dibuka')->count(),
            'completed' => Consultation::query()->where('type', 'quick')->where('status', 'Selesai')->count(),
            'rejected' => Consultation::query()->where('type', 'quick')->where('status', 'Ditolak')->count(),
            'scheduled' => Consultation::query()->where('type', 'scheduled')->where('status', 'Dijadwalkan')->count(),
        ];

        return response()->json(['queue' => $waiting, 'counts' => $counts]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $admin = $request->user();
        $consultation = Consultation::with(['user', 'doctorSchedule.user', 'doctor', 'admin', 'messages.sender', 'meetings'])->find($id);

        if (!$consultation || !$consultation->isParticipant($admin)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $dto = ConsultationService::dto($consultation);
        $dto['messages'] = $consultation->messages->map(fn ($m) => ConsultationService::messageDto($m))->values();
        $dto['meetings'] = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();
        $dto['medicalRecord'] = $this->medicalRecordDto($consultation);

        return response()->json(['consultation' => $dto]);
    }

    public function update(Request $request, Consultation $consultation): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Menunggu,Dijadwalkan,Dibuka,Selesai,Ditolak'],
        ]);

        $consultation->status = $validated['status'];
        $consultation->save();

        return $this->show($request, $consultation->id);
    }

    public function accept(Request $request, int|string $id): JsonResponse
    {
        $consultation = Consultation::with(['user', 'doctorSchedule.user'])->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi ini sudah ditutup.'], 422);
        }

        $consultation = $this->consultationService->accept($consultation, $request->user());

        return response()->json(['message' => 'Konsultasi diterima.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function reject(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi ini sudah ditutup.'], 422);
        }

        $consultation = $this->consultationService->reject($consultation, $request->user(), $validated['reason'] ?? null);

        return response()->json(['message' => 'Konsultasi ditolak.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function transfer(Request $request, int|string $id): JsonResponse
    {
        $validated = $request->validate([
            'doctorId' => ['required', 'integer', 'exists:users,id'],
        ]);

        $doctor = User::query()->whereKey($validated['doctorId'])->where('role', 'doctor')->first();
        if (!$doctor) {
            return response()->json(['message' => 'Dokter tidak ditemukan.'], 404);
        }

        $consultation = Consultation::find($id);
        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi ini sudah ditutup.'], 422);
        }

        if ($consultation->type === 'quick') {
            return response()->json([
                'message' => 'Konsultasi instan ditangani sampai selesai oleh admin dan tidak dapat diteruskan ke dokter.',
            ], 422);
        }

        $consultation = $this->consultationService->transferToDoctor($consultation, $doctor);

        return response()->json(['message' => 'Konsultasi diteruskan ke dokter.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function close(Request $request, int|string $id): JsonResponse
    {
        $consultation = Consultation::with(['user', 'doctorSchedule.user'])->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $consultation = $this->consultationService->complete($consultation);

        return response()->json(['message' => 'Konsultasi ditutup.', 'consultation' => ConsultationService::dto($consultation->load(['user', 'doctorSchedule.user']))]);
    }

    public function sendMessage(Request $request, int|string $id): JsonResponse
    {
        $admin = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($admin)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi sudah ditutup, tidak dapat mengirim pesan lagi.'], 422);
        }

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $message = $this->consultationService->sendMessage(
            $consultation,
            $admin,
            'admin',
            $validated['body'],
            $validated['attachments'] ?? null
        );

        return response()->json(['message' => ConsultationService::messageDto($message)], 201);
    }

    public function markRead(Request $request, int|string $id): JsonResponse
    {
        $admin = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($admin)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $count = $consultation->messages()
            ->where('sender_role', 'patient')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['read' => (int) $count]);
    }

    /**
     * Doctors available for transfer. A doctor must remain selectable even
     * without an upcoming schedule because instant consultations are not tied
     * to a doctor's schedule.
     */
    public function doctorsAvailability(Request $request): JsonResponse
    {
        $items = User::query()
            ->where('role', 'doctor')
            ->orderBy('name')
            ->get()
            ->map(function (User $doctor) {
                $schedules = DoctorSchedule::query()
                    ->where('user_id', $doctor->id)
                    ->whereDate('date', '>=', now()->toDateString())
                    ->orderBy('date')
                    ->limit(10)
                    ->get()
                    ->map(fn (DoctorSchedule $s) => [
                        'id' => (string) $s->id,
                        'date' => optional($s->date)->format('Y-m-d'),
                        'time_range' => $s->time_range,
                        'location' => $s->location,
                        'slots_left' => $s->slots_left,
                        'total_slots' => $s->total_slots,
                    ]);

                return [
                    'id' => (string) $doctor->id,
                    'name' => $doctor->name,
                    'status' => $doctor->status,
                    'specialization' => $doctor->specialization,
                    'primary_branch' => $doctor->primary_branch,
                    'schedules' => $schedules,
                ];
            })
            ->values();

        return response()->json($items);
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
