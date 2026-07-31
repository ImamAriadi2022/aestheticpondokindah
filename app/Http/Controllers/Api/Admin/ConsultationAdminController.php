<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ConsultationAdminController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Consultation::query()->with(['user', 'doctorSchedule'])->orderByDesc('created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('topic', 'like', '%' . $search . '%')
                    ->orWhere('chief_complaint', 'like', '%' . $search . '%')
                    ->orWhere('doctor_name', 'like', '%' . $search . '%')
                    ->orWhereHas('user', function ($uq) use ($search) {
                        $uq->where('name', 'like', '%' . $search . '%')
                            ->orWhere('email', 'like', '%' . $search . '%');
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

        $items = $query->limit(200)->get()->map(function (Consultation $c) {
            $user = $c->user;
            $dateStr = '-';
            if ($c->type === 'scheduled' && $c->schedule_date) {
                $dateStr = $c->schedule_date->format('Y-m-d');
                if ($c->schedule_time) {
                    $dateStr .= ' • ' . $c->schedule_time;
                }
            } else {
                $dateStr = optional($c->created_at)->format('Y-m-d') ?? '-';
            }

            $doctorId = null;
            if ($c->doctorSchedule) {
                $doctorId = (string) $c->doctorSchedule->user_id;
            }

            return [
                'id' => (string) $c->id,
                'userId' => (string) $c->user_id,
                'user' => $user ? [
                    'id' => (string) $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null,
                'type' => $c->type,
                'status' => $c->status,
                'topic' => $c->topic ?: ($c->category ?: 'Konsultasi'),
                'category' => $c->category,
                'doctorName' => $c->doctor_name ?: 'Dokter Jaga',
                'doctorId' => $doctorId,
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
        })->values();

        return response()->json($items);
    }

    public function show(Consultation $consultation): JsonResponse
    {
        $consultation->loadMissing(['user', 'doctorSchedule']);
        $user = $consultation->user;
        $dateStr = '-';
        if ($consultation->type === 'scheduled' && $consultation->schedule_date) {
            $dateStr = $consultation->schedule_date->format('Y-m-d');
            if ($consultation->schedule_time) {
                $dateStr .= ' • ' . $consultation->schedule_time;
            }
        } else {
            $dateStr = optional($consultation->created_at)->format('Y-m-d') ?? '-';
        }

        $doctorId = null;
        if ($consultation->doctorSchedule) {
            $doctorId = (string) $consultation->doctorSchedule->user_id;
        }

        return response()->json([
            'id' => (string) $consultation->id,
            'userId' => (string) $consultation->user_id,
            'user' => $user ? [
                'id' => (string) $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ] : null,
            'type' => $consultation->type,
            'status' => $consultation->status,
            'topic' => $consultation->topic ?: ($consultation->category ?: 'Konsultasi'),
            'category' => $consultation->category,
            'doctorName' => $consultation->doctor_name ?: 'Dokter Jaga',
            'doctorId' => $doctorId,
            'date' => $dateStr,
            'chiefComplaint' => $consultation->chief_complaint,
            'duration' => $consultation->duration,
            'painScale' => $consultation->pain_scale,
            'allergies' => $consultation->allergies,
            'medications' => $consultation->medications,
            'priorTreatment' => $consultation->prior_treatment,
            'preferredContact' => $consultation->preferred_contact,
            'contactNumber' => $consultation->contact_number,
            'expectations' => $consultation->expectations,
            'notes' => $consultation->notes,
            'scheduleDate' => optional($consultation->schedule_date)?->format('Y-m-d'),
            'scheduleTime' => $consultation->schedule_time,
            'location' => $consultation->location,
            'attachments' => $consultation->attachments ?? [],
            'createdAt' => optional($consultation->created_at)->toISOString(),
        ]);
    }

    public function update(Request $request, Consultation $consultation): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Menunggu,Dijadwalkan,Selesai'],
        ]);

        $consultation->status = $validated['status'];
        $consultation->save();

        return $this->show($consultation);
    }
}
