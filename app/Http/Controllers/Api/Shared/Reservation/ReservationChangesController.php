<?php

namespace App\Http\Controllers\Api\Shared\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Shared\Reservation\Reservation;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationChangesController extends Controller
{
    /**
     * Incremental Change Polling Endpoint
     * Returns created, updated, and deleted records since the given checkpoint.
     */
    public function changes(Request $request): JsonResponse
    {
        $user = $request->user('sanctum') ?? auth('sanctum')->user() ?? $request->user();
        $role = $user?->role ?? 'guest';
        $sinceParam = $request->query('since');
        $limit = min((int) $request->query('limit', 200), 500);

        $nowCheckpoint = Carbon::now()->toISOString();

        $query = Reservation::withTrashed()->with(['doctor', 'doctorSchedule', 'user']);

        // 1. Scoping according to user role
        if ($role === 'clinic' || $role === 'admin' || $role === 'clinic_admin') {
            // Clinic sees all regular reservations
            $query->where(function ($q) {
                $q->whereNull('source')
                  ->orWhereNotIn('source', ['online_consultation', 'consultation_chat', 'telehealth_chat']);
            });
        } elseif ($role === 'doctor') {
            $cleanName = trim(preg_replace('/^(drg\.|dr\.|drg|dr)\s*/i', '', $user->name ?? ''));
            $query->where(function ($q) use ($user, $cleanName) {
                $q->where('doctor_id', $user->id)
                  ->orWhereHas('doctor', function ($dq) use ($user, $cleanName) {
                      $dq->where('id', $user->id)
                         ->orWhere('name', $user->name)
                         ->orWhere('name', 'LIKE', '%' . $cleanName . '%');
                  })
                  ->orWhereHas('doctorSchedule', function ($sq) use ($user, $cleanName) {
                      $sq->where('user_id', $user->id)
                         ->orWhereHas('user', function ($uq) use ($user, $cleanName) {
                             $uq->where('id', $user->id)
                                ->orWhere('name', $user->name)
                                ->orWhere('name', 'LIKE', '%' . $cleanName . '%');
                         });
                  });
            });

            // Doctor focuses on Dikonfirmasi & Selesai
            $query->whereIn('status', ['Dikonfirmasi', 'Selesai', 'confirmed', 'completed', 'in_progress']);
        } elseif ($role === 'user' || $role === 'patient') {
            $query->where('user_id', $user->id);
        } else {
            // Guest access (unauthenticated / public token)
            $phone = $request->query('phone');
            $code = $request->query('code');
            if (!empty($phone) || !empty($code)) {
                $query->where(function ($q) use ($phone, $code) {
                    if ($phone) $q->where('phone', $phone);
                    if ($code) {
                        $id = (int) preg_replace('/\D/', '', $code);
                        if ($id > 0) $q->orWhere('id', $id);
                    }
                });
            } else {
                // If no user and no guest filter, return empty
                return response()->json([
                    'checkpoint' => $nowCheckpoint,
                    'has_more' => false,
                    'created' => [],
                    'updated' => [],
                    'deleted' => [],
                ]);
            }
        }

        // 2. Evaluate Changes since Checkpoint
        if (empty($sinceParam)) {
            // INITIAL SNAPSHOT: Return active items
            $activeItems = (clone $query)->whereNull('deleted_at')
                ->orderByDesc('date')
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get()
                ->map(fn(Reservation $r) => $this->toDto($r))
                ->values();

            return response()->json([
                'checkpoint' => $nowCheckpoint,
                'has_more' => false,
                'created' => $activeItems,
                'updated' => [],
                'deleted' => [],
            ]);
        }

        // Parse 'since' timestamp reliably
        try {
            $sinceDate = Carbon::parse($sinceParam);
        } catch (\Throwable $e) {
            $sinceDate = Carbon::now()->subMinutes(10);
        }

        // Fetch changed or deleted records since checkpoint
        $records = $query->where(function ($q) use ($sinceDate) {
            $q->where('updated_at', '>', $sinceDate)
              ->orWhere('deleted_at', '>', $sinceDate)
              ->orWhere('created_at', '>', $sinceDate);
        })
        ->orderBy('updated_at')
        ->limit($limit + 1)
        ->get();

        $hasMore = $records->count() > $limit;
        if ($hasMore) {
            $records = $records->slice(0, $limit);
        }

        $created = [];
        $updated = [];
        $deleted = [];

        foreach ($records as $r) {
            if ($r->trashed()) {
                $deleted[] = (string) $r->id;
            } elseif ($r->created_at && $r->created_at->gt($sinceDate)) {
                $created[] = $this->toDto($r);
            } else {
                $updated[] = $this->toDto($r);
            }
        }

        return response()->json([
            'checkpoint' => $nowCheckpoint,
            'has_more' => $hasMore,
            'created' => $created,
            'updated' => $updated,
            'deleted' => $deleted,
        ]);
    }

    private function toDto(Reservation $r): array
    {
        return [
            'id' => (string) $r->id,
            'code' => 'RSV-' . str_pad((string) $r->id, 6, '0', STR_PAD_LEFT),
            'user_id' => $r->user_id ? (string) $r->user_id : null,
            'patient_id' => $r->user_id ? (string) $r->user_id : null,
            'patient_name' => $r->name,
            'patient_phone' => $r->phone,
            'patient_email' => $r->email,
            'name' => $r->name,
            'phone' => $r->phone,
            'email' => $r->email,
            'gender' => $r->gender,
            'birth_date' => optional($r->birth_date)->format('Y-m-d'),
            'date' => $r->date ? $r->date->format('Y-m-d') : null,
            'displayDate' => $r->date ? $r->date->format('d F Y') : '-',
            'preferred_time' => $r->preferred_time,
            'time' => $r->preferred_time,
            'time_slot' => $r->preferred_time,
            'doctor_id' => $r->doctor_id ? (string) $r->doctor_id : null,
            'doctorId' => $r->doctor_id ? (string) $r->doctor_id : null,
            'doctor_schedule_id' => $r->doctor_schedule_id ? (string) $r->doctor_schedule_id : null,
            'doctor' => $r->doctor?->name ?? 'Belum Ditentukan',
            'doctor_name' => $r->doctor?->name ?? 'Belum Ditentukan',
            'doctorName' => $r->doctor?->name ?? 'Belum Ditentukan',
            'complaint' => $r->complaint,
            'treatment_interest' => $r->treatment_interest,
            'service' => $r->treatment_interest,
            'treatment' => $r->treatment_interest,
            'branch_name' => $r->branch_name ?? 'Aesthetic Pondok Indah Main Branch',
            'branch' => $r->branch_name ?? 'Aesthetic Pondok Indah Main Branch',
            'source' => $r->source ?? 'clinic_booking',
            'status' => $r->status,
            'payment_status' => $r->payment_status ?? 'Belum Bayar',
            'paymentStatus' => $r->payment_status ?? 'Belum Bayar',
            'admin_notes' => $r->admin_notes,
            'signature_data' => $r->signature_data,
            'terms_accepted_at' => optional($r->terms_accepted_at)->toISOString(),
            'rescheduled_at' => optional($r->rescheduled_at)->toISOString(),
            'created_at' => optional($r->created_at)->toISOString(),
            'createdAt' => optional($r->created_at)->toISOString(),
            'updated_at' => optional($r->updated_at)->toISOString(),
            'updatedAt' => optional($r->updated_at)->toISOString(),
        ];
    }
}
