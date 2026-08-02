<?php

namespace Database\Seeders;

use App\Models\Consultation;
use App\Models\ConsultationMeeting;
use App\Models\ConsultationMessage;
use App\Models\DoctorSchedule;
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

        $createdAt = now()->subMinutes(45);

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

        // 2. Instant consultation already claimed by the doctor with an active chat
        $activePatient = $patients[2] ?? $patients->first();
        if ($activePatient) {
            $active = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $activePatient->id,
                    'type' => 'quick',
                    'status' => 'Menunggu',
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

        // 3. Scheduled consultations (connected to doctor schedule) with meeting links
        if ($schedule) {
            $scheduled = Consultation::query()->updateOrCreate(
                [
                    'user_id' => $patients->first()->id,
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
                    'created_at' => $createdAt->copy()->subDays(1),
                    'updated_at' => $createdAt->copy()->subDays(1),
                ]
            );

            $this->seedChat($scheduled, $doctor, $patients->first(), [
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
}
