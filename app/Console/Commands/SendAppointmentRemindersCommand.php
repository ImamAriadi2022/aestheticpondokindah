<?php

namespace App\Console\Commands;

use App\Models\Shared\Reservation\Reservation;
use App\Services\Shared\Notification\NotificationService;
use App\Services\Shared\WhatsApp\ZestaWhatsAppService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SendAppointmentRemindersCommand extends Command
{
    protected $signature = 'appointments:send-reminders {--dry-run : Tampilkan daftar tanpa mengirim pesan}';

    protected $description = 'Kirim pengingat otomatis H-1 janji temu (WhatsApp + In-App/WebPush) dan tindak lanjut H+3 pasca perawatan';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $tomorrow = Carbon::tomorrow()->toDateString();
        $threeDaysAgo = Carbon::today()->subDays(3)->toDateString();

        // 1. Pengingat H-1 Janji Temu (Status: Dikonfirmasi)
        $upcoming = Reservation::query()
            ->with(['doctor', 'user'])
            ->where('status', 'Dikonfirmasi')
            ->whereDate('date', $tomorrow)
            ->get();

        $reminderSent = 0;
        foreach ($upcoming as $reservation) {
            $cacheKey = "reminder:h1:reservation:{$reservation->id}:{$tomorrow}";
            if (Cache::has($cacheKey)) {
                continue;
            }

            $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);
            $doctorName = $reservation->doctor?->name ?? 'Dokter Spesialis';
            $patientName = $reservation->name ?: 'Bapak/Ibu';
            $timeSlot = $reservation->preferred_time ?: '10:00 WIB';
            $dateFormatted = Carbon::parse($reservation->date)->format('d/m/Y');

            if ($dryRun) {
                $this->line("[DRY-RUN H-1] {$code} - {$patientName} ({$dateFormatted} {$timeSlot})");
                continue;
            }

            try {
                if (!empty($reservation->user_id)) {
                    NotificationService::send(
                        (int) $reservation->user_id,
                        '⏰ Pengingat Janji Temu Besok',
                        "Janji temu {$code} bersama {$doctorName} dijadwalkan besok ({$dateFormatted}) pukul {$timeSlot}. Mohon hadir 10-15 menit lebih awal.",
                        'appointment',
                        '/#/dashboard/user?tab=reservasi',
                        ['reservation_id' => $reservation->id, 'code' => $code]
                    );
                }

                if (!empty($reservation->phone)) {
                    $waText = "Halo *{$patientName}*,\n\nIni adalah pengingat janji temu perawatan gigi Anda besok di *Aesthetic Pondok Indah Dental Clinic*:\n\n📋 *Kode Booking:* {$code}\n👨‍⚕️ *Dokter:* {$doctorName}\n📅 *Tanggal:* {$dateFormatted}\n⏰ *Waktu:* {$timeSlot}\n\nMohon hadir 10-15 menit lebih awal. Sampai jumpa besok! ✨";
                    ZestaWhatsAppService::sendTextMessage($reservation->phone, $waText, $patientName);
                }

                Cache::put($cacheKey, true, now()->addDays(3));
                $reminderSent++;
            } catch (\Throwable $e) {
                Log::warning("[SendAppointmentReminders] Failed H-1 reminder for reservation #{$reservation->id}: " . $e->getMessage());
            }
        }

        // 2. Tindak Lanjut Pasca Perawatan H+3 (Status: Selesai)
        $completed = Reservation::query()
            ->with(['doctor'])
            ->where('status', 'Selesai')
            ->whereDate('updated_at', $threeDaysAgo)
            ->get();

        $followUpSent = 0;
        foreach ($completed as $reservation) {
            $cacheKey = "followup:h3:reservation:{$reservation->id}";
            if (Cache::has($cacheKey)) {
                continue;
            }

            $code = 'RSV-' . str_pad((string) $reservation->id, 6, '0', STR_PAD_LEFT);
            $patientName = $reservation->name ?: 'Bapak/Ibu';

            if ($dryRun) {
                $this->line("[DRY-RUN H+3] {$code} - {$patientName}");
                continue;
            }

            try {
                if (!empty($reservation->user_id)) {
                    NotificationService::send(
                        (int) $reservation->user_id,
                        '💛 Tindak Lanjut Pasca Perawatan',
                        "Halo {$patientName}, bagaimana kondisi gigi Anda pasca perawatan {$code}? Hubungi kami kapan saja jika ada keluhan atau ingin menjadwalkan kontrol.",
                        'appointment',
                        '/#/dashboard/user?tab=konsultasi',
                        ['reservation_id' => $reservation->id, 'code' => $code]
                    );
                }

                if (!empty($reservation->phone)) {
                    $waText = "Halo *{$patientName}*,\n\nKami dari *Aesthetic Pondok Indah Dental Clinic* ingin menanyakan kabar kondisi gigi Anda pasca perawatan (*{$code}*). 😊\n\nJika ada keluhan atau ingin menjadwalkan sesi kontrol lanjutan, silakan balas pesan ini atau gunakan fitur Konsultasi di aplikasi kami. Terima kasih!";
                    ZestaWhatsAppService::sendTextMessage($reservation->phone, $waText, $patientName);
                }

                Cache::put($cacheKey, true, now()->addDays(30));
                $followUpSent++;
            } catch (\Throwable $e) {
                Log::warning("[SendAppointmentReminders] Failed H+3 follow-up for reservation #{$reservation->id}: " . $e->getMessage());
            }
        }

        $this->info("Pengingat H-1 terkirim: {$reminderSent}, Tindak lanjut H+3 terkirim: {$followUpSent}.");

        return self::SUCCESS;
    }
}
