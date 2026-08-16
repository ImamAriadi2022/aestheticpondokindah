<?php

namespace App\Http\Controllers\Api\Doctor\Consultation;

use App\Http\Controllers\Controller;
use App\Models\Shared\Consultation\Consultation;
use App\Models\Shared\Consultation\ConsultationMeeting;
use App\Services\ConsultationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsultationMeetingController extends Controller
{
    public function index(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($user)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $meetings = $consultation->meetings->map(fn ($m) => ConsultationService::meetingDto($m))->values();

        return response()->json(['meetings' => $meetings]);
    }

    public function store(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            return response()->json(['message' => 'Pasien tidak dapat membuat link meeting.'], 403);
        }

        $validated = $request->validate([
            'provider' => ['required', 'in:zoom,google_meet,microsoft_teams,custom'],
            'title' => ['nullable', 'string', 'max:255'],
            'url' => ['required', 'url'],
            'startsAt' => ['nullable', 'date'],
        ]);

        $consultation = Consultation::find($id);

        if (!$consultation || !$consultation->isParticipant($user)) {
            return response()->json(['message' => 'Konsultasi tidak ditemukan.'], 404);
        }

        $meeting = $consultation->meetings()->create([
            'provider' => $validated['provider'],
            'title' => $validated['title'] ?? null,
            'url' => $validated['url'],
            'starts_at' => $validated['startsAt'] ?? null,
            'created_by' => $user->id,
        ]);

        return response()->json(['meeting' => ConsultationService::meetingDto($meeting)], 201);
    }

    public function update(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            return response()->json(['message' => 'Pasien tidak dapat mengubah link meeting.'], 403);
        }

        $meeting = ConsultationMeeting::with('consultation')->find($id);

        if (!$meeting || !$meeting->consultation->isParticipant($user)) {
            return response()->json(['message' => 'Link meeting tidak ditemukan.'], 404);
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

        return response()->json(['meeting' => ConsultationService::meetingDto($meeting->fresh())]);
    }

    public function destroy(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();

        if ($user->role === 'patient') {
            return response()->json(['message' => 'Pasien tidak dapat menghapus link meeting.'], 403);
        }

        $meeting = ConsultationMeeting::with('consultation')->find($id);

        if (!$meeting || !$meeting->consultation->isParticipant($user)) {
            return response()->json(['message' => 'Link meeting tidak ditemukan.'], 404);
        }

        $meeting->delete();

        return response()->json(['message' => 'Link meeting dihapus.']);
    }
}
