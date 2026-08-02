<?php

namespace Database\Seeders;

use App\Models\Consultation;
use App\Models\ConsultationMeeting;
use App\Models\ConsultationMessage;
use App\Models\DoctorSchedule;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class OnlineConsultationSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $doctor = User::query()->where('role', 'doctor')->orderBy('id')->first();
        if (!$doctor) {
            $this->command?->warn('Tidak ada dokter tersedia untuk OnlineConsultationSeeder.');

            return;
        }

        $patients = User::query()
            ->where('role', 'patient')
            ->orderBy('id')
            ->limit(3)
            ->get();

        if ($patients->isEmpty()) {
            $patients = User::factory()->count(3)->create(['role' => 'patient', 'status' => 'active']);
        }

        $schedule = DoctorSchedule::query()->where('user_id', $doctor->id)->first();

        $admin = User::query()->where('role', 'clinic_admin')->orderBy('id')->first();

        $createdAt = now()->subMinutes(45);

        // 0. Guest instant consultation (no registered user account)
        $guestConsultation = Consultation::query()->updateOrCreate(
            [
                'type' => 'quick',
                'guest_phone' => '+6281234567890',
                'chief_complaint' => 'Anak saya sering menggosok giginya karena gatal. Apakah perlu periksa ke dokter gigi?',
            ],
            [
                'user_id' => null,
                'status' => 'Menunggu',
                'topic' => 'Kesehatan gigi anak',
                'category' => 'Perawatan Gigi',
                'guest_name' => 'Budi Santoso',
                'guest_phone' => '+6281234567890',
                'guest_email' => 'budi.santoso@example.com',
                'access_token' => 'guest-demo-' . str_pad((string) mt_rand(0, 999999), 6, '0', STR_PAD_LEFT),
                'doctor_name' => $doctor->name,
                'created_at' => $createdAt->copy()->addMinutes(2),
                'updated_at' => $createdAt->copy()->addMinutes(2),
            ]
        );

        ConsultationMessage::query()->updateOrCreate(
            [
                'consultation_id' => $guestConsultation->id,
                'body' => 'Halo, saya mau bertanya tentang kebiasaan anak saya yang suka menggosok gigi karena gatal.',
            ],
            [
                'sender_id' => null,
                'sender_role' => 'patient',
                'created_at' => $createdAt->copy()->addMinutes(2),
                'updated_at' => $createdAt->copy()->addMinutes(2),
            ]
        );

        // 1. Instant (quick) consultations waiting in the queue (not yet assigned)
        $waiting = [
            [
                'patient' => $patients[0] ?? null,
                'topic' => 'Gigi sensitif',
                'category' => 'Perawatan Gigi',
                'chief_complaint' => 'Gigi terasa ngilu saat minum air dingin sudah sekitar 2 minggu.',
            ],
            [
                'patient' => $patients[1] ?? null,
                'topic' => 'Warna gigi menguning',
                'category' => 'Bleaching',
                'chief_complaint' => 'Ingin konsultasi pemutihan gigi untuk persiapan acara pernikahan.',
            ],
        ];

        foreach ($waiting as $data) {
            if (!$data['patient']) {
                continue;
            }

            Consultation::query()->updateOrCreate(
                [
                    'user_id' => $data['patient']->id,
                    'type' => 'quick',
                    'chief_complaint' => $data['chief_complaint'],
                ],
                [
                    'status' => 'Menunggu',
                    'topic' => $data['topic'],
                    'category' => $data['category'],
                    'doctor_name' => $doctor->name,
                    'created_at' => $createdAt->copy()->addMinutes(rand(1, 8)),
                    'updated_at' => $createdAt->copy()->addMinutes(rand(1, 8)),
                ]
            );
        }

        // 2. Instant consultation handled by admin (accepted, admin chats with patient)
        if ($admin && ($patients[1] ?? null)) {
            $adminActive = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $patients[1]->id,
                    'type' => 'quick',
                    'status' => 'Dibuka',
                ],
                [
                    'admin_id' => $admin->id,
                    'doctor_name' => $doctor->name,
                    'topic' => 'Konsultasi pemutihan gigi',
                    'category' => 'Bleaching',
                    'chief_complaint' => 'Ingin bertanya dulu tentang biaya dan proses bleaching gigi.',
                    'created_at' => $createdAt->copy()->addMinutes(10),
                    'updated_at' => $createdAt->copy()->addMinutes(10),
                ]
            );

            $this->seedChat($adminActive, $doctor, $patients[1], [
                'Halo, saya tertarik melakukan bleaching gigi. Bagaimana prosedurnya?',
                'Selamat siang. Untuk bleaching, kami akan lakukan pemeriksaan dulu oleh dokter, lalu lanjut pemutihan 1-2 sesi.',
                'Apakah aman untuk gigi sensitif?',
                'Aman, dokter akan menggunakan bahan yang sesuai dan memberi perawatan tambahan untuk gigi sensitif.',
            ], $createdAt->copy()->addMinutes(10));

            $this->seedAdminMessage($adminActive, $admin, $doctor, 'Baik, akan saya teruskan ke dokter untuk jadwal konsultasi.', $createdAt->copy()->addMinutes(25));
        }

        // 3. Instant consultation already claimed by the doctor with an active chat
        $activePatient = $patients[2] ?? $patients->first();
        if ($activePatient) {
            $active = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $activePatient->id,
                    'type' => 'quick',
                    'status' => 'Dibuka',
                ],
                [
                    'doctor_id' => $doctor->id,
                    'doctor_name' => $doctor->name,
                    'topic' => 'Nyeri gusi saat menyikat gigi',
                    'category' => 'Gusi',
                    'chief_complaint' => 'Gusi berdarah dan sedikit bengkak saat menyikat gigi.',
                    'created_at' => $createdAt->copy()->addMinutes(2),
                    'updated_at' => $createdAt->copy()->addMinutes(2),
                ]
            );

            $this->seedChat($active, $doctor, $activePatient, [
                'Halo dok, saya mau bertanya tentang gusi saya yang sering berdarah.',
                'Selamat siang. Sudah berapa lama gusi Bapak/Ibu berdarah saat menyikat gigi?',
                'Sudah sekitar 1 bulan dok. Terkadang terasa sedikit bengkak.',
                'Baik. Apakah Bapak/Ibu memiliki riwayat diabetes atau sedang dalam pengobatan tertentu?',
            ], $createdAt);
        }

        // 4. Scheduled consultations (connected to doctor schedule) with meeting links
        if ($schedule) {
            $scheduledPatient = $patients->first();
            $reservation = Reservation::query()->where('user_id', $scheduledPatient->id)->first();

            $scheduled = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $scheduledPatient->id,
                    'type' => 'scheduled',
                    'doctor_schedule_id' => $schedule->id,
                ],
                [
                    'doctor_id' => $doctor->id,
                    'status' => 'Dijadwalkan',
                    'topic' => 'Veneer gigi depan',
                    'category' => 'Veneer',
                    'chief_complaint' => 'Ingin konsultasi dan perencanaan veneer untuk 8 gigi depan.',
                    'schedule_date' => now()->addDays(1)->toDateString(),
                    'schedule_time' => $schedule->time_range,
                    'location' => $schedule->location,
                    'doctor_name' => $doctor->name,
                    'reservation_id' => $reservation?->id,
                    'created_at' => $createdAt->copy()->subDays(1),
                    'updated_at' => $createdAt->copy()->subDays(1),
                ]
            );

            $this->seedChat($scheduled, $doctor, $scheduledPatient, [
                'Selamat pagi dok, saya sudah membuat janji untuk konsultasi veneer besok.',
                'Pagi. Baik, mohon siapkan foto senyum dan daftar obat yang sedang dikonsumsi.',
                'Siap dok. Apakah nanti link meeting akan dikirim di sini?',
                'Betul, saya akan membagikan link Google Meet pada ruang konsultasi ini.',
            ], $createdAt->copy()->subDays(1));

            ConsultationMeeting::query()->updateOrCreate(
                ['consultation_id' => $scheduled->id, 'provider' => 'google_meet'],
                [
                    'title' => 'Konsultasi Veneer Gigi Depan',
                    'url' => 'https://meet.google.com/abc-defg-hij',
                    'starts_at' => now()->addDays(1)->setTime(10, 0),
                    'created_by' => $doctor->id,
                ]
            );
        }

        // 4. A completed scheduled consultation for history/recent
        $completedPatient = $patients[1] ?? $patients->first();
        if ($schedule && $completedPatient) {
            $completed = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $completedPatient->id,
                    'type' => 'scheduled',
                    'status' => 'Selesai',
                ],
                [
                    'doctor_id' => $doctor->id,
                    'doctor_name' => $doctor->name,
                    'topic' => 'Bleaching',
                    'category' => 'Bleaching',
                    'chief_complaint' => 'Konsultasi pasca bleaching dan perawatan gigi sensitif.',
                    'schedule_date' => now()->subDays(3)->toDateString(),
                    'schedule_time' => '10:00 - 11:00',
                    'location' => $schedule->location,
                    'created_at' => $createdAt->copy()->subDays(3),
                    'updated_at' => $createdAt->copy()->subDays(3),
                ]
            );

            $this->seedChat($completed, $doctor, $completedPatient, [
                'Dok, gigi saya terasa ngilu setelah bleaching, apakah normal?',
                'Normal dan umum terjadi. Gunakan pasta gigi khusus gigi sensitif selama 1 minggu.',
                'Terima kasih dok, sudah lebih baik sekarang.',
                'Sama-sama. Jika ngilu menetap lebih dari 1 minggu, silakan datang ke klinik untuk pemeriksaan.',
            ], $createdAt->copy()->subDays(3));

            ConsultationMeeting::query()->updateOrCreate(
                ['consultation_id' => $completed->id, 'provider' => 'zoom'],
                [
                    'title' => 'Konsultasi Pasca Bleaching',
                    'url' => 'https://zoom.us/j/987654321',
                    'starts_at' => $createdAt->copy()->subDays(3)->setTime(10, 0),
                    'created_by' => $doctor->id,
                ]
            );
        }
    }

    private function seedChat(
        Consultation $consultation,
        User $doctor,
        User $patient,
        array $lines,
        Carbon $base
    ): void {
        foreach ($lines as $i => $line) {
            $isDoctor = $i % 2 === 1;
            $timestamp = $base->copy()->addMinutes(($i + 1) * 5);

            ConsultationMessage::query()->updateOrCreate(
                [
                    'consultation_id' => $consultation->id,
                    'body' => $line,
                ],
                [
                    'sender_id' => $isDoctor ? $doctor->id : $patient->id,
                    'sender_role' => $isDoctor ? 'doctor' : 'patient',
                    'read_at' => $isDoctor ? $timestamp : null,
                    'created_at' => $timestamp,
                    'updated_at' => $timestamp,
                ]
            );
        }
    }

    private function seedAdminMessage(
        Consultation $consultation,
        User $admin,
        User $doctor,
        string $line,
        Carbon $base
    ): void {
        ConsultationMessage::query()->updateOrCreate(
            [
                'consultation_id' => $consultation->id,
                'body' => $line,
            ],
            [
                'sender_id' => $admin->id,
                'sender_role' => 'admin',
                'read_at' => null,
                'created_at' => $base,
                'updated_at' => $base,
            ]
        );
    }
}
