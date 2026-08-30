<?php

namespace Database\Seeders;

use App\Models\Shared\User\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $hasWhatsapp = Schema::hasColumn('users', 'whatsapp');
        $hasRole = Schema::hasColumn('users', 'role');
        $hasStatus = Schema::hasColumn('users', 'status');

        $defaultUsers = [
            [
                'name' => 'Admin Klinik',
                'email' => 'clinic@aestheticpondokindah.local',
                'whatsapp' => '+62887437525303',
                'password' => 'admin123',
                'role' => 'clinic_admin',
                'status' => 'active',
            ],
            [
                'name' => 'Pengguna',
                'email' => 'user@aestheticpondokindah.local',
                'whatsapp' => '+62887437525305',
                'password' => 'user123',
                'role' => 'patient',
                'status' => 'active',
            ],
            [
                'name' => 'Imam Ariadi (Developer)',
                'email' => 'imamariadi775@gmail.com',
                'whatsapp' => '+62887437525399',
                'password' => 'Persib1933',
                'role' => 'developer',
                'status' => 'active',
            ],
        ];

        foreach ($defaultUsers as $userData) {
            $updateData = [
                'name' => $userData['name'],
                'password' => Hash::make($userData['password']),
            ];

            if ($hasWhatsapp) {
                $updateData['whatsapp'] = $userData['whatsapp'];
            }
            if ($hasRole) {
                $updateData['role'] = $userData['role'];
            }
            if ($hasStatus) {
                $updateData['status'] = $userData['status'];
            }
            $user = User::query()
                ->where('email', $userData['email'])
                ->orWhere(function ($q) use ($hasWhatsapp, $userData) {
                    if ($hasWhatsapp && !empty($userData['whatsapp'])) {
                        $q->where('whatsapp', $userData['whatsapp']);
                    }
                })
                ->first();

            if ($user) {
                $user->update(array_merge(['email' => $userData['email']], $updateData));
            } else {
                User::query()->create(array_merge(['email' => $userData['email']], $updateData));
            }
        }

        $this->call(DoctorSeeder::class);
        $this->call(DoctorProfileSeeder::class);
        $this->call(DoctorScheduleSeeder::class);
        $this->call(ClinicServiceSeeder::class);
        $this->call(ContentSeeder::class);
        $this->call(PromoSeeder::class);
        $this->call(BranchSeeder::class);
        $this->call(WilayahSeeder::class);
        $this->call(PublicInfoSeeder::class);
        $this->call(NormalizeDoctorSchedulesAndReservationsSeeder::class);
    }
}
