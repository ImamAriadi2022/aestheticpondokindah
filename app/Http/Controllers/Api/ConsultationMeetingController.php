<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\ConsultationMeeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationMeetingController extends Controller
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

        $meetings = $consultation->meetings()->get()->map(function (ConsultationMeeting $m) {
            return $this->toDto($m);
        })->values();

        return response()->json(['meetings' => $meetings]);
    }

    public function store(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $validated = $request->validate([
            'provider' => ['required', 'in:zoom,google_meet,microsoft_teams,custom'],
            'title' => ['nullable', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'startsAt' => ['nullable', 'date'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        if (!$consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke konsultasi ini.'], 403);
        }

        $meeting = $consultation->meetings()->create([
            'provider' => $validated['provider'],
            'title' => $validated['title'] ?? null,
            'url' => $validated['url'],
            'starts_at' => $validated['startsAt'] ?? null,
            'created_by' => $doctor->id,
        ]);

        return response()->json(['meeting' => $this->toDto($meeting)], 201);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $meeting = ConsultationMeeting::with('consultation')->find($id);

        if (!$meeting) {
            return response()->json(['message' => 'Link meeting tidak ditemukan.'], 404);
        }

        if (!$meeting->consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke meeting ini.'], 403);
        }

        $validated = $request->validate([
            'provider' => ['sometimes', 'in:zoom,google_meet,microsoft_teams,custom'],
            'title' => ['nullable', 'string', 'max:255'],
            'url' => ['sometimes', 'required', 'url'],
            'startsAt' => ['nullable', 'date'],
        ]);

        if (array_key_exists('provider', $validated)) {
            $meeting->provider = $validated['provider'];
        }
        if (array_key_exists('title', $validated)) {
            $meeting->title = $validated['title'];
        }
        if (array_key_exists('url', $validated)) {
            $meeting->url = $validated['url'];
        }
        if (array_key_exists('startsAt', $validated)) {
            $meeting->starts_at = $validated['startsAt'];
        }

        $meeting->save();

        return response()->json(['meeting' => $this->toDto($meeting->fresh())]);
    }

    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $doctor = $request->user();
        $meeting = ConsultationMeeting::with('consultation')->find($id);

        if (!$meeting) {
            return response()->json(['message' => 'Link meeting tidak ditemukan.'], 404);
        }

        if (!$meeting->consultation->isManagedBy($doctor)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke meeting ini.'], 403);
        }

        $meeting->delete();

        return response()->json(['message' => 'Link meeting dihapus.']);
    }

    private function toDto(ConsultationMeeting $m): array
    {
        return [
            'id' => (string) $m->id,
            'consultationId' => (string) $m->consultation_id,
            'provider' => $m->provider,
            'title' => $m->title,
            'url' => $m->url,
            'startsAt' => optional($m->starts_at)->toISOString(),
            'createdAt' => optional($m->created_at)->toISOString(),
        ];
    }
}
