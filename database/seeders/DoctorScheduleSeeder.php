<?php

namespace Database\Seeders;

use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Shared\User\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Schema;

class DoctorScheduleSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's doctor schedules.
     */
    public function run(): void
    {
        // Get all doctors
        $doctors = User::where('role', 'doctor')->get();
        
        if ($doctors->isEmpty()) {
            $this->command->warn('No doctors found. Please run DoctorSeeder first.');
            return;
        }

        // Sample schedules for the next 30 days
        $locations = ['Pondok Indah', 'Kelapa Gading', 'Senayan'];
        $timeRanges = [
            '09.00-11.00',
            '11.00-13.00', 
            '13.00-15.00',
            '15.00-17.00',
        ];

        foreach ($doctors as $doctor) {
            // Create 2-3 schedules per doctor for the next 30 days
            $schedulesCount = rand(2, 3);
            
            for ($i = 0; $i < $schedulesCount; $i++) {
                $daysOffset = rand(1, 30);
                $date = now()->addDays($daysOffset)->format('Y-m-d');
                $timeRange = $timeRanges[array_rand($timeRanges)];
                $location = $locations[array_rand($locations)];
                $totalSlots = rand(2, 5);
                $bookedSlots = rand(0, $totalSlots - 1);

                DoctorSchedule::updateOrCreate(
                    [
                        'user_id' => $doctor->id,
                        'date' => $date,
                        'time_range' => $timeRange,
                    ],
                    [
                        'location' => $location,
                        'total_slots' => $totalSlots,
                        'booked_slots' => $bookedSlots,
                    ]
                );
            }
        }

        $this->command->info('Doctor schedules seeded successfully.');
    }
}
