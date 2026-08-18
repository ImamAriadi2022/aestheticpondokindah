<?php

namespace App\Http\Controllers\Api\Guest\Consultation;

use App\Http\Controllers\Controller;
use App\Models\Shared\Consultation\Consultation;
use App\Services\Shared\Consultation\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuestConsultationController extends Controller
{
    public function __construct(private readonly ConsultationService $consultationService)
    {
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
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
            'attachments' => ['nullable', 'array'],
        ]);

        $consultation = $this->consultationService->createQuick(
            $validated,
            null,
            [
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
            ]
        );

        return response()->json([
            'consultation' => ConsultationService::dto($consultation->load(['user'])),
            'token' => $consultation->access_token,
        ], 201);
    }

    public function show(Request $request, string $token): JsonResponse
    {
        $consultation = Consultation::with(['user', 'doctorSchedule.user', 'messages.sender', 'meetings'])->where('access_token', $token)->first();

        if (!$consultation || !$consultation->isGuestAccessible($token)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $consultation->messages()
            ->where('sender_role', '!=', 'patient')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $dto = ConsultationService::dto($consultation);
        $dto['messages'] = $consultation->messages->map(fn ($m) => ConsultationService::messageDto($m))->values();
        $dto['meetings'] = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();

        return response()->json(['consultation' => $dto]);
    }

    public function sendMessage(Request $request, string $token): JsonResponse
    {
        $consultation = Consultation::where('access_token', $token)->first();

        if (!$consultation || !$consultation->isGuestAccessible($token)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
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
            null,
            'patient',
            $validated['body'],
            $validated['attachments'] ?? null
        );

        return response()->json(['message' => ConsultationService::messageDto($message)], 201);
    }

    public function markRead(Request $request, string $token): JsonResponse
    {
        $consultation = Consultation::where('access_token', $token)->first();

        if (!$consultation || !$consultation->isGuestAccessible($token)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $count = $consultation->messages()
            ->where('sender_role', '!=', 'patient')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['read' => (int) $count]);
    }
}
