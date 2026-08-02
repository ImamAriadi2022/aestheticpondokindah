<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationMessageController extends Controller
{
    public function index(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $consultation->messages()
            ->where('sender_role', '!=', 'doctor')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $consultation->messages()->get()->map(function (ConsultationMessage $m) {
            return $this->toDto($m);
        })->values();

        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $validated = $request->validate([
            'body' => ['required', 'string'],
            'attachments' => ['nullable', 'array'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        if ($consultation->status === 'Selesai') {
            return response()->json(['message' => 'Konsultasi sudah selesai, tidak dapat mengirim pesan lagi.'], 422);
        }

        $message = $consultation->messages()->create([
            'sender_id' => $doctor->id,
            'sender_role' => 'doctor',
            'body' => $validated['body'],
            'attachments' => $validated['attachments'] ?? null,
        ]);

        return response()->json(['message' => $this->toDto($message)], 201);
    }

    public function markRead(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $count = $consultation->messages()
            ->where('sender_role', '!=', 'doctor')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['read' => (int) $count]);
    }

    private function toDto(ConsultationMessage $m): array
    {
        return [
            'id' => (string) $m->id,
            'senderId' => (string) $m->sender_id,
            'senderRole' => $m->sender_role,
            'body' => $m->body,
            'attachments' => $m->attachments ?? [],
            'readAt' => optional($m->read_at)->toISOString(),
            'createdAt' => optional($m->created_at)->toISOString(),
        ];
    }
}
