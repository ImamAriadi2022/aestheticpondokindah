<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\DoctorSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ConsultationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Consultation::query()
            ->where('user_id', $user->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Consultation $c) {
                return $this->transform($c);
            })
            ->values();

        return response()->json($items);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:quick,scheduled'],
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
            'doctorName' => ['nullable', 'string', 'max:255'],
            'scheduleDate' => ['nullable', 'date'],
            'scheduleTime' => ['nullable', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:255'],
            'attachments' => ['nullable', 'array'],
            'doctorScheduleId' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
        ]);

        if ($validated['type'] === 'scheduled' && empty($validated['doctorScheduleId'])) {
            return response()->json(['message' => 'Jadwal dokter wajib dipilih'], 422);
        }

        $consultation = DB::transaction(function () use ($request, $validated) {
            $doctorScheduleId = $validated['doctorScheduleId'] ?? null;
            $schedule = null;

            if ($validated['type'] === 'scheduled' && $doctorScheduleId) {
                $schedule = DoctorSchedule::query()
                    ->with('user')
                    ->lockForUpdate()
                    ->find($doctorScheduleId);

                if (!$schedule) {
                    return response()->json(['message' => 'Jadwal dokter tidak ditemukan'], 404);
                }

                if ($schedule->is_full) {
                    return response()->json(['message' => 'Slot jadwal dokter sudah penuh'], 422);
                }

                $schedule->booked_slots += 1;
                $schedule->save();
            }

            $created = Consultation::create([
                'user_id' => $request->user()->id,
                'type' => $validated['type'],
                'status' => $validated['type'] === 'scheduled' ? 'Dijadwalkan' : 'Menunggu',
                'topic' => $validated['topic'] ?? null,
                'category' => $validated['category'] ?? null,
                'chief_complaint' => $validated['chiefComplaint'],
                'duration' => $validated['duration'] ?? null,
                'pain_scale' => $validated['painScale'] ?? null,
                'allergies' => $validated['allergies'] ?? null,
                'medications' => $validated['medications'] ?? null,
                'prior_treatment' => $validated['priorTreatment'] ?? null,
                'preferred_contact' => $validated['preferredContact'] ?? null,
                'contact_number' => $validated['contactNumber'] ?? null,
                'expectations' => $validated['expectations'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'doctor_name' => $schedule ? ($schedule->user?->name ?? null) : ($validated['doctorName'] ?? null),
                'schedule_date' => $schedule ? $schedule->date : ($validated['scheduleDate'] ?? null),
                'schedule_time' => $schedule ? $schedule->time_range : ($validated['scheduleTime'] ?? null),
                'location' => $schedule ? $schedule->location : ($validated['location'] ?? null),
                'attachments' => $validated['attachments'] ?? null,
                'doctor_schedule_id' => $doctorScheduleId,
            ]);

            return $created;
        });

        if ($consultation instanceof JsonResponse) {
            return $consultation;
        }

        return response()->json($this->transform($consultation), 201);
    }

    private function transform(Consultation $c): array
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

        return [
            'id' => (string) $c->id,
            'userId' => (string) $c->user_id,
            'type' => $c->type,
            'status' => $c->status,
            'topic' => $c->topic ?: ($c->category ?: 'Konsultasi'),
            'category' => $c->category,
            'doctorName' => $c->doctor_name ?: 'Dokter Jaga',
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
            'createdAt' => optional($c->created_at)->toISOString(),
            'user' => $c->user ? ['id' => (string) $c->user->id, 'name' => $c->user->name, 'email' => $c->user->email] : null,
        ];
    }
}
