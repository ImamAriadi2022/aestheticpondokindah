<?php

namespace Database\Seeders;

use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\User\User;
use Illuminate\Database\Seeder;

class NormalizeDoctorSchedulesAndReservationsSeeder extends Seeder
{
    public function run(): void
    {
        $dora = User::where('name', 'like', '%Yulita Dora%')->first()
            ?? User::where('role', 'doctor')->first();

        if (!$dora) {
            $this->command->error('Doctor user not found!');
            return;
        }

        // 1. Ensure active Doctor Schedules for Dr. Dora and other doctors in August 2026
        $activeDates = [
            '2026-08-01' => '10:00 - 13:00',
            '2026-08-02' => '14:00 - 17:00',
            '2026-08-05' => '11:00 - 14:00',
            '2026-08-07' => '15:30 - 18:30',
            '2026-08-10' => '10:00 - 13:00',
            '2026-08-12' => '16:00 - 19:00',
            '2026-08-13' => '09:00 - 12:00',
            '2026-08-14' => '13:00 - 16:00',
            '2026-08-16' => '15:00 - 17:00',
            '2026-08-18' => '15:00 - 17:00',
            '2026-08-20' => '09:00 - 12:00',
            '2026-08-22' => '11:00 - 13:00',
            '2026-08-24' => '13:00 - 16:00',
            '2026-08-26' => '15:00 - 17:00',
        ];

        $scheduleMap = [];

        foreach ($activeDates as $dateStr => $timeRange) {
            $schedule = DoctorSchedule::firstOrCreate(
                [
                    'user_id' => $dora->id,
                    'date' => $dateStr,
                ],
                [
                    'time_range' => $timeRange,
                    'location' => 'Aesthetic Pondok Indah Main Branch',
                    'total_slots' => 5,
                    'booked_slots' => 0,
                ]
            );
            $scheduleMap[$dateStr] = $schedule;
        }

        // 2. Normalize all reservations in `reservations` table to valid active August 2026 schedules
        $reservations = Reservation::orderBy('id')->get();

        // Target active schedule assignment array for test reservations
        $normalizations = [
            1  => ['date' => '2026-08-05', 'time' => '11:00 - 14:00'],
            2  => ['date' => '2026-08-10', 'time' => '10:00 - 13:00'],
            3  => ['date' => '2026-08-12', 'time' => '16:00 - 19:00'],
            4  => ['date' => '2026-08-01', 'time' => '10:00 - 13:00'],
            5  => ['date' => '2026-08-10', 'time' => '10:00 - 13:00'],
            6  => ['date' => '2026-08-14', 'time' => '13:00 - 16:00'],
            7  => ['date' => '2026-08-16', 'time' => '15:00 - 17:00'],
            8  => ['date' => '2026-08-18', 'time' => '15:00 - 17:00'],
            9  => ['date' => '2026-08-20', 'time' => '09:00 - 12:00'],
            10 => ['date' => '2026-08-22', 'time' => '11:00 - 13:00'],
            11 => ['date' => '2026-08-24', 'time' => '13:00 - 16:00'],
            12 => ['date' => '2026-08-24', 'time' => '13:00 - 16:00'],
            13 => ['date' => '2026-08-26', 'time' => '15:00 - 17:00'],
            14 => ['date' => '2026-08-26', 'time' => '15:00 - 17:00'],
            15 => ['date' => '2026-08-26', 'time' => '15:00 - 17:00'],
            16 => ['date' => '2026-08-05', 'time' => '11:00 - 14:00'],
            17 => ['date' => '2026-08-07', 'time' => '15:30 - 18:30'],
            18 => ['date' => '2026-08-05', 'time' => '11:00 - 14:00'],
            19 => ['date' => '2026-08-07', 'time' => '15:30 - 18:30'],
            20 => ['date' => '2026-08-01', 'time' => '10:00 - 13:00'],
            21 => ['date' => '2026-08-02', 'time' => '14:00 - 17:00'],
        ];

        $defaultServices = [
            'Scaling & Polishing',
            'Dental Whitening (Bleaching)',
            'Invisalign & Clear Aligners',
            'Porcelain Veneers',
            'Orthodontic (Behel Gigi)',
            'Penambalan Gigi Komposit',
            'Pencabutan Gigi Bungsu (Odontektomi)',
            'Perawatan Saluran Akar (Endodontik)',
        ];

        foreach ($reservations as $index => $r) {
            $norm = $normalizations[$r->id] ?? ['date' => '2026-08-26', 'time' => '15:00 - 17:00'];
            $targetDate = $norm['date'];
            $targetTime = $norm['time'];

            $schedule = $scheduleMap[$targetDate] ?? DoctorSchedule::where('user_id', $dora->id)->whereDate('date', $targetDate)->first();

            $r->doctor_id = $r->doctor_id ?: $dora->id;
            $r->doctor_schedule_id = $r->doctor_schedule_id ?: $schedule?->id;
            $r->date = $r->date ?: $targetDate;
            $r->preferred_time = $r->preferred_time ?: $targetTime;
            if (empty($r->treatment_interest)) {
                $r->treatment_interest = $defaultServices[$index % count($defaultServices)];
            }
            if (empty($r->branch_name)) {
                $r->branch_name = 'Aesthetic Pondok Indah Main Branch';
            }
            $r->save();
        }

        // 3. Recalculate and update `booked_slots` for all schedules
        $allSchedules = DoctorSchedule::all();
        foreach ($allSchedules as $sch) {
            $count = Reservation::where('doctor_schedule_id', $sch->id)
                ->whereIn('status', ['Baru', 'Dikonfirmasi', 'Selesai', 'Dalam Konsultasi'])
                ->count();
            $sch->booked_slots = min($count, $sch->total_slots);
            $sch->save();
        }
    }
}
