<?php

namespace App\Http\Controllers\Api\Patient\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Reservation\ReservationAudit;
use App\Models\Guest\Service\ClinicService;
use App\Models\Admin\Settings\ClinicSetting;
use App\Services\Shared\Notification\NotificationService;
use App\Services\Patient\Membership\MembershipService;
use App\Models\Shared\User\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

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
            'signature_data' => ['nullable', 'string'],
            'redeem_points' => ['nullable', 'integer', 'min:0'],
            'service_price' => ['nullable', 'numeric', 'min:0'],
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

        // Calculate Service Price & Point Redemption
        $servicePrice = (float) ($validated['service_price'] ?? 0);
        if ($servicePrice <= 0 && !empty($validated['treatment_interest'])) {
            $svc = ClinicService::where('title', $validated['treatment_interest'])
                ->orWhere('slug', $validated['treatment_interest'])
                ->first();
            if ($svc && $svc->price) {
                $servicePrice = (float) $svc->price;
            } else {
                $servicePrice = 500000;
            }
        }

        $redeemPoints = (int) ($validated['redeem_points'] ?? 0);
        $pointDiscount = 0;
        $finalPrice = $servicePrice;

        if ($redeemPoints > 0) {
            if ($user->membership_points < $redeemPoints) {
                return response()->json([
                    'message' => "Saldo poin Anda ({$user->membership_points} Pts) tidak mencukupi untuk menukarkan {$redeemPoints} poin."
                ], 422);
            }

            $conversionRate = (int) ClinicSetting::getValue('point_conversion_rate', 1000);
            $minRedeem = (int) ClinicSetting::getValue('min_redeem_points', 10);
            $maxDiscountPct = (int) ClinicSetting::getValue('max_discount_percentage', 100);

            if ($redeemPoints < $minRedeem) {
                return response()->json([
                    'message' => "Minimal penukaran poin adalah {$minRedeem} poin."
                ], 422);
            }

            $calculatedDiscount = $redeemPoints * $conversionRate;
            $maxAllowedDiscount = ($servicePrice * $maxDiscountPct) / 100;
            $pointDiscount = min($calculatedDiscount, $maxAllowedDiscount, $servicePrice);
            $finalPrice = max(0, $servicePrice - $pointDiscount);
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
            'payment_status' => $finalPrice <= 0 ? 'Lunas (Poin Penuh)' : 'Belum Bayar',
            'redeem_points' => $redeemPoints,
            'point_discount' => $pointDiscount,
            'service_price' => $servicePrice,
            'final_price' => $finalPrice,
            'signature_data' => $validated['signature_data'] ?? null,
            'terms_accepted_at' => !empty($validated['signature_data']) ? now() : null,
        ]);

        $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        // Execute Point Deduction from User Balance & Record Ledger Mutation
        if ($redeemPoints > 0) {
            try {
                $treatmentLabel = $reservation->treatment_interest ?? 'Perawatan Gigi';
                $this->membershipService->redeemPoints(
                    $user,
                    $redeemPoints,
                    "Penukaran {$redeemPoints} poin reward (potongan Rp " . number_format($pointDiscount, 0, ',', '.') . ") untuk reservasi #{$code} ({$treatmentLabel})",
                    (string) $reservation->id
                );
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::error("Failed to deduct points on booking: " . $e->getMessage());
            }
        }

        // Dispatch Backend Notification to Admins
        try {
            NotificationService::sendToAdmins(
                '🔔 Reservasi Masuk dari Pasien',
                'Pasien: ' . $user->name . ' - ' . ($reservation->treatment_interest ?? 'Layanan Gigi') . ($redeemPoints > 0 ? " (Diskon Poin: Rp " . number_format($pointDiscount, 0, ',', '.') . ")" : ""),
                'appointment',
                '/#/dashboard/clinic?tab=reservasi',
                ['reservation_id' => $reservation->id, 'code' => $code]
            );

            // Dispatch targeted notification to assigned doctor if exists
            if (!empty($doctorId)) {
                NotificationService::send(
                    (int) $doctorId,
                    '🩺 Pasien Baru Ditugaskan',
                    'Pasien: ' . $user->name . ' - ' . ($reservation->treatment_interest ?? 'Layanan Gigi') . ' pada ' . optional($reservation->date)->format('d M Y'),
                    'appointment',
                    '/#/dashboard/doctor?tab=reservasi',
                    ['reservation_id' => $reservation->id, 'code' => $code]
                );
            }
        } catch (\Throwable $e) {
            // Non-blocking notification dispatch
        }

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

        $servicePrice = (float) ($reservation->service_price ?? 0);
        $pointDiscount = (float) ($reservation->point_discount ?? 0);
        $finalPrice = (float) ($reservation->final_price ?? $servicePrice);
        $redeemPoints = (int) ($reservation->redeem_points ?? 0);

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
            'redeem_points' => $redeemPoints,
            'point_discount' => $pointDiscount,
            'service_price' => $servicePrice,
            'final_price' => $finalPrice,
            'point_discount_formatted' => 'Rp ' . number_format($pointDiscount, 0, ',', '.'),
            'service_price_formatted' => 'Rp ' . number_format($servicePrice, 0, ',', '.'),
            'final_price_formatted' => 'Rp ' . number_format($finalPrice, 0, ',', '.'),
            'notes' => $reservation->complaint,
            'admin_notes' => $reservation->admin_notes,
            'signature_data' => $reservation->signature_data,
            'terms_accepted_at' => optional($reservation->terms_accepted_at)->toISOString(),
            'rescheduled_at' => optional($reservation->rescheduled_at)->toISOString(),
            'created_at' => optional($reservation->created_at)->toISOString(),
            'updated_at' => optional($reservation->updated_at)->toISOString(),
        ];
    }
}
