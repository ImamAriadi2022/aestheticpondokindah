<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\DoctorSchedule;
use App\Models\MedicalRecord;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    public function __construct(private readonly ConsultationService $consultationService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Consultation::query()
            ->with(['user', 'doctorSchedule.user'])
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Consultation $c) => ConsultationService::dto($c))
            ->values();

        return response()->json($items);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $patient = $request->user();
        $consultation = Consultation::with(['user', 'doctorSchedule.user', 'messages.sender', 'meetings'])->find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isParticipant($patient)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $consultation->messages()
            ->where('sender_role', '!=', 'patient')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $dto = ConsultationService::dto($consultation);
        $dto['messages'] = $consultation->messages->map(fn ($m) => ConsultationService::messageDto($m))->values();
        $dto['meetings'] = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();
        $dto['medicalRecord'] = $this->medicalRecordDto($consultation);

        return response()->json(['consultation' => $dto]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['nullable', 'string', 'in:quick'],
            'topic' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'chiefComplaint' => ['required', 'string'],
            'duration' => ['nullable', 'string', 'max:255'],
            'painScale' => ['nullable', 'integer', 'min:0', 'max:10'],
            'allergies' => ['nullable', 'string'],
            'medications' => ['nullable', 'string'],
            'priorTreatment' => ['nullable', 'string'],
            'preferredContact' => ['nullable', 'string', 'max:50'],
            'contactNumber' => ['nullable', 'string', 'max:50'],
            'expectations' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $validated['type'] = 'quick';
        $consultation = $this->consultationService->createQuick($validated, $request->user());

        return response()->json(ConsultationService::dto($consultation->load(['user'])), 201);
    }

    public function sendMessage(Request $request, int|string $id): JsonResponse
    {
        $patient = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($patient)) {
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
            $patient,
            'patient',
            $validated['body'],
            $validated['attachments'] ?? null
        );

        return response()->json(['message' => ConsultationService::messageDto($message)], 201);
    }

    public function markRead(Request $request, int|string $id): JsonResponse
    {
        $patient = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($patient)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $count = $consultation->messages()
            ->where('sender_role', '!=', 'patient')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['read' => (int) $count]);
    }

    public function meetings(Request $request, int|string $id): JsonResponse
    {
        $patient = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($patient)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $meetings = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();

        return response()->json(['meetings' => $meetings]);
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
