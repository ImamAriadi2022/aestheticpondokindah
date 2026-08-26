<?php

namespace App\Http\Controllers\Api\Admin\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Reservation\ReservationAudit;
use App\Services\Shared\Notification\NotificationService;
use App\Models\Shared\User\User;
use App\Services\Patient\Membership\MembershipService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationAdminController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

    public function index(Request $request): JsonResponse
    {
        $query = Reservation::query()
            ->with(['doctor', 'user', 'doctorSchedule'])
            ->where(function ($q) {
                $q->whereNull('source')
                  ->orWhereNotIn('source', ['online_consultation', 'consultation_chat', 'telehealth_chat']);
            })
            ->orderByDesc('created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                    ->orWhere('phone', 'like', '%' . $search . '%')
                    ->orWhere('email', 'like', '%' . $search . '%')
                    ->orWhere('complaint', 'like', '%' . $search . '%')
                    ->orWhere('treatment_interest', 'like', '%' . $search . '%');
            });
        }

        $userId = $request->query('user_id');
        if ($userId) {
            $user = User::find($userId);
            $query->where(function ($q) use ($userId, $user) {
                $q->where('user_id', $userId);
                if ($user) {
                    if (!empty($user->email)) {
                        $q->orWhere('email', $user->email);
                    }
                    if (!empty($user->whatsapp)) {
                        $q->orWhere('phone', $user->whatsapp);
                    }
                }
            });
        }

        $items = $query->limit(200)->get()->map(function (Reservation $r) {
            return [
                'id' => (string) $r->id,
                'code' => 'RSV-' . str_pad((string) $r->id, 6, '0', STR_PAD_LEFT),
                'user_id' => $r->user_id ? (string) $r->user_id : null,
                'name' => $r->name,
                'phone' => $r->phone,
                'email' => $r->email,
                'gender' => $r->gender,
                'birth_date' => optional($r->birth_date)->format('Y-m-d'),
                'date' => $r->date ? $r->date->format('Y-m-d') : null,
                'preferred_time' => $r->preferred_time ?? ($r->doctorSchedule?->time_range ?? '10:00'),
                'branch_name' => $r->branch_name ?? 'Aesthetic Pondok Indah Main Branch',
                'doctor_id' => $r->doctor_id ? (string) $r->doctor_id : null,
                'doctor_schedule_id' => $r->doctor_schedule_id ? (string) $r->doctor_schedule_id : null,
                'doctor' => $r->doctor?->name ?? 'Dokter Spesialis',
                'treatment_interest' => $r->treatment_interest,
                'complaint' => $r->complaint,
                'source' => $r->source ?? 'guest_web',
                'status' => match ($r->status) {
                    'Dalam Konsultasi' => 'Dikonfirmasi',
                    default => $r->status,
                },
                'signature_data' => $r->signature_data,
                'terms_accepted_at' => optional($r->terms_accepted_at)->toISOString(),
                'paymentStatus' => $r->payment_status ?? 'Belum Bayar',
                'redeem_points' => (int) ($r->redeem_points ?? 0),
                'point_discount' => (float) ($r->point_discount ?? 0),
                'service_price' => (float) ($r->service_price ?? 0),
                'final_price' => (float) ($r->final_price ?? $r->service_price ?? 0),
                'point_discount_formatted' => 'Rp ' . number_format((float) ($r->point_discount ?? 0), 0, ',', '.'),
                'service_price_formatted' => 'Rp ' . number_format((float) ($r->service_price ?? 0), 0, ',', '.'),
                'final_price_formatted' => 'Rp ' . number_format((float) ($r->final_price ?? $r->service_price ?? 0), 0, ',', '.'),
                'admin_notes' => $r->admin_notes,
                'rescheduled_at' => optional($r->rescheduled_at)->toISOString(),
                'createdAt' => optional($r->created_at)->toISOString(),
            ];
        })->values();

        return response()->json($items);
    }

    public function update(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:Baru,Dikonfirmasi,Ditolak,Dibatalkan,Selesai'],
            'paymentStatus' => ['nullable', 'in:Belum Bayar,Sudah Bayar,Bayar DP,Uang Dikembalikan,Dibatalkan'],
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'doctor_schedule_id' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
            'date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string', 'max:20'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $currentStatus = $reservation->status;
        $targetStatus = $validated['status'];

        // Enforce Status Transition Matrix
        if ($currentStatus !== $targetStatus) {
            if (!$this->isValidTransition($currentStatus, $targetStatus)) {
                return response()->json([
                    'message' => "Perubahan status dari '{$currentStatus}' ke '{$targetStatus}' tidak diperbolehkan secara aturan bisnis."
                ], 422);
            }
        }

        $adminId = $request->user()?->id;

        // Handle Reschedule / Doctor Update
        $newDoctorId = $validated['doctor_id'] ?? $reservation->doctor_id;
        $newDate = $validated['date'] ?? optional($reservation->date)->format('Y-m-d');
        $newScheduleId = $validated['doctor_schedule_id'] ?? $reservation->doctor_schedule_id;

        if (!empty($validated['date']) || !empty($validated['preferred_time']) || !empty($validated['doctor_id']) || !empty($validated['doctor_schedule_id'])) {
            if (!empty($validated['date']) && $validated['date'] !== optional($reservation->date)->format('Y-m-d')) {
                $reservation->date = $validated['date'];
                $reservation->rescheduled_at = now();
            }
            if (!empty($validated['preferred_time'])) {
                $reservation->preferred_time = $validated['preferred_time'];
            }
            if (!empty($validated['doctor_id'])) {
                $reservation->doctor_id = $validated['doctor_id'];
            }
        }

        if (array_key_exists('admin_notes', $validated)) {
            $reservation->admin_notes = $validated['admin_notes'];
        }

        // Auto-match doctor schedule if not explicitly assigned
        if (!$newScheduleId && $newDoctorId && $newDate) {
            $matchedSchedule = DoctorSchedule::where('user_id', $newDoctorId)
                ->whereDate('date', $newDate)
                ->first();
            if ($matchedSchedule) {
                $newScheduleId = $matchedSchedule->id;
            }
        }

        // DOCTOR SCHEDULE BOOKED SLOTS SYNCHRONIZATION
        $oldScheduleId = $reservation->doctor_schedule_id;

        if ($newScheduleId) {
            $newSchedule = DoctorSchedule::find($newScheduleId);
            if ($newSchedule && $newSchedule->is_full && ($oldScheduleId !== $newScheduleId || $currentStatus !== 'Dikonfirmasi') && $targetStatus === 'Dikonfirmasi') {
                return response()->json([
                    'message' => 'Jadwal dokter yang dipilih sudah penuh (kuota habis). Silakan pilih dokter atau jadwal praktik lain.'
                ], 422);
            }
        }

        $reservation->doctor_schedule_id = $newScheduleId;

        if ($currentStatus !== $targetStatus || $oldScheduleId !== $newScheduleId) {
            // Case 1: Status changed to Dikonfirmasi (Confirming)
            if ($targetStatus === 'Dikonfirmasi') {
                if ($oldScheduleId && $oldScheduleId !== $newScheduleId && $currentStatus === 'Dikonfirmasi') {
                    $oldSchedule = DoctorSchedule::find($oldScheduleId);
                    if ($oldSchedule && $oldSchedule->booked_slots > 0) {
                        $oldSchedule->decrement('booked_slots');
                    }
                }

                if ($newScheduleId) {
                    $newSchedule = DoctorSchedule::find($newScheduleId);
                    if ($newSchedule) {
                        $newSchedule->increment('booked_slots');
                    }
                }
            }
            // Case 2: Status changed from Dikonfirmasi to Dibatalkan / Ditolak
            elseif ($currentStatus === 'Dikonfirmasi' && in_array($targetStatus, ['Dibatalkan', 'Ditolak'], true)) {
                if ($oldScheduleId) {
                    $oldSchedule = DoctorSchedule::find($oldScheduleId);
                    if ($oldSchedule && $oldSchedule->booked_slots > 0) {
                        $oldSchedule->decrement('booked_slots');
                    }
                }
            }
        }

        // Audit Status Change
        if ($reservation->status !== $targetStatus) {
            ReservationAudit::create([
                'reservation_id' => $reservation->id,
                'user_id' => $adminId,
                'action' => 'update_status',
                'field' => 'status',
                'old_value' => $reservation->status,
                'new_value' => $targetStatus,
            ]);
            $reservation->status = $targetStatus;
        }

        // Audit Payment Status Change
        if (array_key_exists('paymentStatus', $validated) && $validated['paymentStatus'] !== null) {
            // If marking as Sudah Bayar, automatically advance status to Selesai if not already cancelled/rejected
            if ($validated['paymentStatus'] === 'Sudah Bayar' && !in_array($targetStatus, ['Dibatalkan', 'Ditolak'])) {
                $targetStatus = 'Selesai';
                $reservation->status = 'Selesai';
            }

            $oldPaymentStatus = $reservation->payment_status;
            $newPaymentStatus = $validated['paymentStatus'];

            if ($oldPaymentStatus !== $newPaymentStatus) {
                ReservationAudit::create([
                    'reservation_id' => $reservation->id,
                    'user_id' => $adminId,
                    'action' => 'update_payment',
                    'field' => 'payment_status',
                    'old_value' => $oldPaymentStatus,
                    'new_value' => $newPaymentStatus,
                ]);
                $reservation->payment_status = $newPaymentStatus;

                // AUTOMATIC POINT RULES TRIGGER WHEN PAYMENT IS PAID OR RESERVATION COMPLETED
                if ($newPaymentStatus === 'Sudah Bayar' && $reservation->user_id) {
                    app(\App\Services\Patient\Membership\MembershipPointRuleService::class)
                        ->processAutomaticPointsForCompletedReservation($reservation);
                }
            }
        }

                $reservation->save();

        $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        // Dispatch Backend Notifications to Patient and Doctor
        try {
            // 1. If status is Dikonfirmasi -> notify patient
            if ($targetStatus === 'Dikonfirmasi' && !empty($reservation->user_id)) {
                NotificationService::send(
                    (int) $reservation->user_id,
                    '🎉 Janji Temu Dikonfirmasi',
                    'Reservasi ' . $code . ' bersama ' . ($reservation->doctor?->name ?? 'Dokter Spesialis') . ' telah disetujui oleh Admin.',
                    'appointment',
                    '/#/dashboard/user?tab=reservasi',
                    ['reservation_id' => $reservation->id, 'code' => $code]
                );
            }

            // 2. If assigned to doctor -> notify specific doctor
            if (!empty($reservation->doctor_id)) {
                NotificationService::send(
                    (int) $reservation->doctor_id,
                    '🩺 Jadwal Pasien Dikonfirmasi',
                    'Pasien ' . $reservation->name . ' dijadwalkan pada ' . optional($reservation->date)->format('d M Y') . ' (' . $reservation->preferred_time . ' WIB).',
                    'appointment',
                    '/#/dashboard/doctor?tab=reservasi',
                    ['reservation_id' => $reservation->id, 'code' => $code]
                );
            }
        } catch (\Throwable $e) {
            // Non-blocking
        }

        return response()->json([
            'id' => (string) $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'name' => $reservation->name,
            'phone' => $reservation->phone,
            'email' => $reservation->email,
            'date' => $reservation->date ? $reservation->date->format('Y-m-d') : null,
            'preferred_time' => $reservation->preferred_time,
            'doctor_id' => $reservation->doctor_id ? (string) $reservation->doctor_id : null,
            'doctor_schedule_id' => $reservation->doctor_schedule_id ? (string) $reservation->doctor_schedule_id : null,
            'doctor' => $reservation->doctor?->name ?? '-',
            'complaint' => $reservation->complaint,
            'treatment_interest' => $reservation->treatment_interest,
            'status' => $reservation->status,
            'paymentStatus' => $reservation->payment_status ?? 'Belum Bayar',
            'admin_notes' => $reservation->admin_notes,
            'rescheduled_at' => optional($reservation->rescheduled_at)->toISOString(),
            'createdAt' => optional($reservation->created_at)->toISOString(),
        ]);
    }

    private function isValidTransition(string $current, string $target): bool
    {
        if ($current === $target) {
            return true;
        }

        switch ($current) {
            case 'Baru':
                return in_array($target, ['Dikonfirmasi', 'Ditolak', 'Dibatalkan', 'Selesai'], true);
            case 'Dikonfirmasi':
                return in_array($target, ['Selesai', 'Dibatalkan', 'Ditolak'], true);
            case 'Ditolak':
            case 'Dibatalkan':
            case 'Selesai':
                return false;
            default:
                return false;
        }
    }

    /**
     * Dedicated Offline Payment Confirmation & Automatic Point Awarding
     */
    public function confirmPayment(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $reservation = \App\Models\Shared\Reservation\Reservation::findOrFail($id);
        $admin = $request->user();

        $validated = $request->validate([
            'payment_method' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $oldPaymentStatus = $reservation->payment_status;
        $reservation->payment_status = 'Sudah Bayar';
        if ($reservation->status !== 'Selesai' && !in_array($reservation->status, ['Dibatalkan', 'Ditolak'])) {
            $reservation->status = 'Selesai';
        }
        $reservation->save();

        // Audit Payment Confirmation
        \App\Models\Shared\Reservation\ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $admin?->id,
            'action' => 'confirm_payment',
            'field' => 'payment_status',
            'old_value' => $oldPaymentStatus,
            'new_value' => 'Sudah Bayar',
        ]);

        // Calculate amount and update patient transaction volume
        $amount = $validated['amount'] ?? null;
        if (!$amount && $reservation->treatment_interest) {
            $service = \App\Models\Guest\Service\ClinicService::where('title', 'like', "%{$reservation->treatment_interest}%")->first();
            if ($service && $service->price) {
                $amount = $service->price;
            }
        }

        $pointEntry = null;
        if ($reservation->user_id) {
            $patient = \App\Models\Shared\User\User::find($reservation->user_id);
            if ($patient) {
                if ($amount && $amount > 0) {
                    $patient->increment('total_transactions', (int) $amount);
                }
                $patient->increment('completed_treatments');
            }

            // Trigger Dynamic Point Rules Engine
            $pointEntry = app(\App\Services\Patient\Membership\MembershipPointRuleService::class)
                ->processAutomaticPointsForCompletedReservation($reservation);
        }

        // Send patient notification
        if ($reservation->user_id) {
            $code = $reservation->code ?: 'RSV-' . str_pad((string)$reservation->id, 6, '0', STR_PAD_LEFT);
            $pointsInfo = ($pointEntry && $pointEntry->points > 0) ? " dan mendapatkan +{$pointEntry->points} Poin Reward!" : "!";
            try {
                \App\Services\Shared\Notification\NotificationService::send(
                    (int) $reservation->user_id,
                    '🎉 Pembayaran Kasir Dikonfirmasi',
                    "Pembayaran reservasi {$code} ({$reservation->treatment_interest}) telah dikonfirmasi oleh Kasir{$pointsInfo}",
                    'appointment',
                    '/#/dashboard/user?tab=reservasi',
                    ['reservation_id' => $reservation->id, 'code' => $code]
                );
            } catch (\Throwable $e) {}
        }

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran reservasi berhasil dikonfirmasi dan poin reward otomatis diberikan.',
            'data' => [
                'reservation' => $reservation->fresh(['doctor', 'user']),
                'point_awarded' => $pointEntry ? $pointEntry->points : 0,
                'point_entry' => $pointEntry,
            ],
        ]);
    }

}