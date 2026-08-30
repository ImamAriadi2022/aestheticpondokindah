<?php

namespace App\Http\Controllers\Api\Guest\Reservation;

use App\Http\Controllers\Controller;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\User\User;
use App\Services\Shared\Notification\NotificationService;
use App\Services\Shared\WhatsApp\ZestaWhatsAppService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'treatment_interest' => ['nullable', 'string', 'max:255'],
            'doctor_id' => ['nullable', 'integer', 'exists:users,id'],
            'doctor_schedule_id' => ['nullable', 'integer', 'exists:doctor_schedules,id'],
            'date' => ['nullable', 'date'],
            'preferred_time' => ['nullable', 'string', 'max:20'],
            'complaint' => ['nullable', 'string', 'max:500'],
            'source' => ['nullable', 'string', 'max:50'],
            'signature_data' => ['nullable', 'string'],
        ]);

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

        $reservation = DB::transaction(function () use ($validated, $doctorId, $scheduleId, $date, $preferredTime) {
            return Reservation::create([
                'user_id' => null,
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'treatment_interest' => $validated['treatment_interest'] ?? null,
                'doctor_id' => $doctorId,
                'doctor_schedule_id' => $scheduleId,
                'date' => $date,
                'preferred_time' => $preferredTime,
                'complaint' => $validated['complaint'] ?? ($validated['treatment_interest'] ?? 'Permintaan Reservasi Guest'),
                'branch_name' => 'Aesthetic Pondok Indah Main Branch',
                'source' => $validated['source'] ?? 'guest_web',
                'status' => 'Baru',
                'payment_status' => 'Belum Bayar',
                'signature_data' => $validated['signature_data'] ?? null,
                'terms_accepted_at' => !empty($validated['signature_data']) ? now() : null,
            ]);
        });

                $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);

        // Dispatch Backend Notification to Admins
        try {
            NotificationService::sendToAdmins(
                '🔔 Reservasi Masuk dari Guest',
                'Pasien: ' . $reservation->name . ' - ' . ($reservation->treatment_interest ?? 'Layanan Gigi'),
                'appointment',
                '/#/dashboard/clinic?tab=reservasi',
                ['reservation_id' => $reservation->id, 'code' => $code]
            );

            // Dispatch targeted notification to assigned doctor if exists
            if (!empty($doctorId)) {
                NotificationService::send(
                    (int) $doctorId,
                    '🩺 Pasien Baru Ditugaskan',
                    'Pasien: ' . $reservation->name . ' - ' . ($reservation->treatment_interest ?? 'Layanan Gigi') . ' pada ' . optional($reservation->date)->format('d M Y'),
                    'appointment',
                    '/#/dashboard/doctor?tab=reservasi',
                    ['reservation_id' => $reservation->id, 'code' => $code]
                );
            }

            // Dispatch Official WhatsApp Notification to Patient via Zesta Gateway
            if (!empty($reservation->phone)) {
                $docName = $reservation->doctor?->name ?? 'Dokter Spesialis';
                $formattedDate = optional($reservation->date)->format('d/m/Y') ?? (string) $reservation->date;
                $timeSlot = $reservation->preferred_time ?? '10:00 WIB';
                $treatment = $reservation->treatment_interest ?? 'Pemeriksaan Gigi';
                $pName = $reservation->name ?? 'Bapak/Ibu';

                $waText = "Halo *{$pName}*,\n\nTerima kasih telah melakukan reservasi di *Aesthetic Pondok Indah Dental Clinic*.\n\nBerikut rincian jadwal janji temu Anda:\n📋 *Kode Booking:* {$code}\n🩺 *Layanan:* {$treatment}\n👨‍⚕️ *Dokter:* {$docName}\n📅 *Tanggal:* {$formattedDate}\n⏰ *Waktu:* {$timeSlot}\n📍 *Lokasi:* Aesthetic Pondok Indah Dental Clinic\n\n📌 *Status:* Menunggu Konfirmasi Tim Klinik\n\nSilakan tunjukkan kode booking ini kepada staf resepsionis saat kedatangan di klinik. Sampai jumpa!";

                ZestaWhatsAppService::sendTextMessage($reservation->phone, $waText, $pName);
            }
        } catch (\Throwable $e) {
            // Non-blocking notification dispatch
        }

        return response()->json([
            'id' => (string) $reservation->id,
            'code' => $code,
            'name' => $reservation->name,
            'phone' => $reservation->phone,
            'email' => $reservation->email,
            'treatment_interest' => $reservation->treatment_interest,
            'doctor_id' => $reservation->doctor_id ? (string) $reservation->doctor_id : null,
            'doctor_schedule_id' => $reservation->doctor_schedule_id ? (string) $reservation->doctor_schedule_id : null,
            'date' => optional($reservation->date)->format('Y-m-d'),
            'preferred_time' => $reservation->preferred_time,
            'complaint' => $reservation->complaint,
            'signature_data' => $reservation->signature_data,
            'status' => $reservation->status,
            'source' => $reservation->source,
            'message' => 'Reservasi Guest berhasil dibuat dan tersinkronisasi dengan jadwal dokter.',
            'registration_encouragement' => [
                'title' => 'Bergabunglah Menjadi Member Aesthetic Pondok Indah!',
                'benefits' => [
                    'Lacak status reservasi dan riwayat rekam medis digital secara real-time',
                    'Dapatkan poin membership tiap perawatan untuk ditukar promo menarik',
                    'Prioritas booking jadwal periksa dengan dokter spesialis',
                ],
                'register_link' => '/login?mode=register',
            ]
        ], 201);
    }
}
