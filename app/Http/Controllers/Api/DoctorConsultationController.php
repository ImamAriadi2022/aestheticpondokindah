<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorConsultationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $items = Consultation::query()
            ->with(['user', 'doctorSchedule.user'])
            ->where(function ($q) use ($user) {
                $q->whereHas('doctorSchedule', function ($sq) use ($user) {
                    $sq->where('user_id', $user->id);
                })
                ->orWhere('doctor_name', 'like', '%' . $user->name . '%')
                ->orWhere('type', 'quick');
            })
            ->orderByDesc('created_at')
            ->limit(200)
            ->get()
            ->map(function (Consultation $c) {
                $dateStr = '-';
                if ($c->schedule_date) {
                    $dateStr = $c->schedule_date->format('j F Y');
                    if ($c->schedule_time) {
                        $dateStr .= ' • ' . $c->schedule_time;
                    }
                }

                return [
                    'id' => (string) $c->id,
                    'userId' => (string) $c->user_id,
                    'user' => $c->user ? [
                        'id' => (string) $c->user->id,
                        'name' => $c->user->name,
                        'email' => $c->user->email,
                    ] : null,
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
                    'createdAt' => optional($c->created_at)->toISOString(),
                ];
            })
            ->values();

        return response()->json($items);
    }
}
