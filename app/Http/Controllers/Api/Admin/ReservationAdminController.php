<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\DoctorSchedule;
use App\Models\Reservation;
use App\Models\ReservationAudit;
use App\Models\User;
use App\Services\MembershipService;
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

        $status = trim((string) $request->query('status', ''));
        if ($status !== '' && $status !== 'Semua' && $status !== 'all') {
            $query->where('status', $status);
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
                'paymentStatus' => $r->payment_status ?? 'Belum Bayar',
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
            // Business rule: only allow payment status change if Selesai, except if setting to Belum Bayar/Dibatalkan
            if ($reservation->status !== 'Selesai' && !in_array($validated['paymentStatus'], ['Belum Bayar', 'Dibatalkan'])) {
                return response()->json(['message' => 'Status pembayaran hanya bisa diubah jika reservasi sudah Selesai.'], 422);
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

                // TRIGGER MEMBERSHIP ENGINE WHEN PAYMENT IS PAID
                if ($newPaymentStatus === 'Sudah Bayar' && $reservation->user_id) {
                    $patient = User::find($reservation->user_id);
                    if ($patient) {
                        $this->membershipService->addPoints(
                            $patient,
                            50,
                            'earned',
                            "Poin dari Reservasi Perawatan #" . $reservation->id,
                            (string) $reservation->id,
                            'reservation'
                        );
                    }
                }
            }
        }

        $reservation->save();

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
}
