<?php

namespace App\Http\Controllers\Api\Doctor\Consultation;

use App\Http\Controllers\Controller;
use App\Models\Shared\Consultation\Consultation;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationMessageController extends Controller
{
    public function __construct(private readonly ConsultationService $consultationService)
    {
    }

    public function index(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $consultation = Consultation::with('messages.sender')->find($id);

        if (!$consultation || !$consultation->isParticipant($user)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $consultation->messages()
            ->where('sender_role', '!=', $this->roleFor($user))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $consultation->messages->map(fn ($m) => ConsultationService::messageDto($m))->values();

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'body' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($user)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if ($consultation->status === 'Selesai' || $consultation->status === 'Ditolak') {
            return response()->json(['message' => 'Konsultasi sudah ditutup, tidak dapat mengirim pesan lagi.'], 422);
        }

        $message = $this->consultationService->sendMessage(
            $consultation,
            $user,
            $this->roleFor($user),
            $validated['body'],
            $validated['attachments'] ?? null
        );

        return response()->json(['message' => ConsultationService::messageDto($message)], 201);
    }

    public function markRead(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($user)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $count = $consultation->messages()
            ->where('sender_role', '!=', $this->roleFor($user))
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['read' => (int) $count]);
    }

    private function roleFor($user): string
    {
        if ($user->role === 'clinic_admin') {
            return 'admin';
        }

        if ($user->role === 'doctor') {
            return 'doctor';
        }

        return 'patient';
    }
}
