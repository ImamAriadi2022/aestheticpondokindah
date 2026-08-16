<?php

namespace App\Http\Controllers\Api\Patient\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Reservation\ReservationAudit;
use App\Models\Shared\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = Reservation::query()
            ->with(['doctor', 'doctorSchedule'])
            ->where('user_id', $user->id)
            ->orderByDesc('date')
            ->orderByDesc('created_at');

        $search = trim((string) $request->query('search', ''));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('complaint', 'like', "%{$search}%")
                  ->orWhere('treatment_interest', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        $statusFilter = trim((string) $request->query('status', ''));
        if ($statusFilter !== '' && $statusFilter !== 'all') {
            $mappedStatus = match ($statusFilter) {
                'pending' => 'Baru',
                'confirmed' => 'Dikonfirmasi',
                'completed' => 'Selesai',
                'cancelled' => 'Dibatalkan',
                'rejected' => 'Ditolak',
                default => $statusFilter,
            };
            $query->where('status', $mappedStatus);
        }

        $reservations = $query->get()
            ->map(fn (Reservation $reservation) => $this->toMobileDto($reservation))
            ->values();

        return response()->json(['reservations' => $reservations]);
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $reservation = Reservation::with(['doctor', 'doctorSchedule'])->find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Ownership IDOR Protection Check
        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi ini.'], 403);
        }

        return response()->json(['reservation' => $this->toMobileDto($reservation)]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'doctor_schedule_id' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
            'date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string', 'max:20'],
            'treatment_interest' => ['nullable', 'string', 'max:255'],
            'complaint' => ['nullable', 'string', 'max:500'],
            'source' => ['nullable', 'string', 'max:50'],
        ]);

        $user = $request->user();
        $scheduleId = $validated['doctor_schedule_id'] ?? null;
        $doctorId = $validated['doctor_id'] ?? null;
        $date = $validated['date'] ?? null;
        $preferredTime = $validated['preferred_time'] ?? '10:00';

        if ($scheduleId) {
            $schedule = DoctorSchedule::with('user')->find($scheduleId);
            if (!$schedule) {
                return response()->json(['message' => 'Jadwal praktik dokter tidak ditemukan.'], 422);
            }
            if ($schedule->is_full) {
                return response()->json(['message' => 'Jadwal praktik dokter pada tanggal dan jam ini sudah penuh. Silakan pilih jadwal lain.'], 422);
            }
            $doctorId = $schedule->user_id;
            $date = $schedule->date->format('Y-m-d');
            $preferredTime = $validated['preferred_time'] ?? $schedule->time_range;
        } elseif ($doctorId && $date) {
            $schedule = DoctorSchedule::with('user')
                ->where('user_id', $doctorId)
                ->whereDate('date', $date)
                ->first();

            if ($schedule) {
                if ($schedule->is_full) {
                    return response()->json(['message' => 'Jadwal praktik dokter pada tanggal dan jam ini sudah penuh. Silakan pilih jadwal lain.'], 422);
                }
                $scheduleId = $schedule->id;
                $preferredTime = $validated['preferred_time'] ?? $schedule->time_range;
            }
        }

        if (!$date) {
            $date = now()->addDay()->format('Y-m-d');
        }

        $reservation = Reservation::create([
            'user_id' => $user->id,
            'doctor_id' => $doctorId,
            'doctor_schedule_id' => $scheduleId,
            'name' => $user->name,
            'phone' => $user->whatsapp ?? $user->phone,
            'email' => $user->email,
            'gender' => $user->gender,
            'birth_date' => $user->birth_date,
            'treatment_interest' => $validated['treatment_interest'] ?? null,
            'complaint' => $validated['complaint'] ?? ($validated['treatment_interest'] ?? 'Permintaan Reservasi Pasien'),
            'date' => $date,
            'preferred_time' => $preferredTime,
            'branch_name' => 'Aesthetic Pondok Indah Main Branch',
            'source' => $validated['source'] ?? 'user_dashboard',
            'status' => 'Baru',
            'payment_status' => 'Belum Bayar',
        ]);

        return response()->json([
            'message' => 'Permintaan reservasi berhasil dikirim dan tersinkronisasi dengan jadwal dokter.',
            'reservation' => $this->toMobileDto($reservation->fresh(['doctor', 'doctorSchedule']))
        ], 201);
    }

    public function cancel(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json(['message' => 'Reservasi tidak ditemukan.'], 404);
        }

        // Ownership IDOR Protection Check
        if ((int) $reservation->user_id !== (int) $user->id) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke reservasi ini.'], 403);
        }

        // Business Rule: Cancellation Restrictions
        if ($reservation->status === 'Selesai') {
            return response()->json(['message' => 'Reservasi yang sudah Selesai tidak dapat dibatalkan.'], 422);
        }
        if ($reservation->status === 'Ditolak') {
            return response()->json(['message' => 'Reservasi yang sudah Ditolak tidak dapat dibatalkan.'], 422);
        }
        if ($reservation->status === 'Dibatalkan') {
            return response()->json(['message' => 'Reservasi sudah dibatalkan sebelumnya.'], 422);
        }

        // Perform cancellation
        $oldStatus = $reservation->status;
        $reservation->status = 'Dibatalkan';
        $reservation->save();

        // Decrement doctor schedule booked slots if previously confirmed
        if ($oldStatus === 'Dikonfirmasi' && $reservation->doctor_schedule_id) {
            $schedule = DoctorSchedule::find($reservation->doctor_schedule_id);
            if ($schedule && $schedule->booked_slots > 0) {
                $schedule->decrement('booked_slots');
            }
        }

        // Audit Trail
        ReservationAudit::create([
            'reservation_id' => $reservation->id,
            'user_id' => $user->id,
            'action' => 'user_cancel',
            'field' => 'status',
            'old_value' => $oldStatus,
            'new_value' => 'Dibatalkan',
        ]);

        return response()->json([
            'message' => 'Reservasi berhasil dibatalkan.',
            'reservation' => $this->toMobileDto($reservation->fresh(['doctor', 'doctorSchedule'])),
        ]);
    }

    private function toMobileDto(Reservation $reservation): array
    {
        $status = match ($reservation->status) {
            'Dikonfirmasi' => 'confirmed',
            'Selesai' => 'completed',
            'Dibatalkan' => 'cancelled',
            'Ditolak' => 'rejected',
            default => 'pending',
        };

        return [
            'id' => (string) $reservation->id,
            'code' => 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT),
            'user_id' => $reservation->user_id ? (string) $reservation->user_id : null,
            'patient_name' => $reservation->name,
            'phone' => $reservation->phone,
            'email' => $reservation->email,
            'gender' => $reservation->gender,
            'birth_date' => optional($reservation->birth_date)->format('Y-m-d'),
            'service_name' => $reservation->treatment_interest ?? $reservation->complaint,
            'treatment_interest' => $reservation->treatment_interest,
            'doctor_id' => $reservation->doctor_id ? (string) $reservation->doctor_id : null,
            'doctor_schedule_id' => $reservation->doctor_schedule_id ? (string) $reservation->doctor_schedule_id : null,
            'doctor_name' => $reservation->doctor?->name ?? 'Dokter Spesialis',
            'scheduled_date' => $reservation->date?->format('Y-m-d'),
            'scheduled_time' => $reservation->preferred_time ?? ($reservation->doctorSchedule?->time_range ?? '10:00'),
            'branch_name' => $reservation->branch_name,
            'status' => $status,
            'raw_status' => $reservation->status,
            'payment_status' => $reservation->payment_status ?? 'Belum Bayar',
            'notes' => $reservation->complaint,
            'admin_notes' => $reservation->admin_notes,
            'rescheduled_at' => optional($reservation->rescheduled_at)->toISOString(),
            'created_at' => optional($reservation->created_at)->toISOString(),
            'updated_at' => optional($reservation->updated_at)->toISOString(),
        ];
    }
}
