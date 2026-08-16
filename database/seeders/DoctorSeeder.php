<?php

namespace Database\Seeders;

use App\Models\Shared\User\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class DoctorSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's doctors.
     */
    public function run(): void
    {
        $hasWhatsapp = Schema::hasColumn('users', 'whatsapp');
        $hasRole = Schema::hasColumn('users', 'role');
        $hasStatus = Schema::hasColumn('users', 'status');
        $hasJob = Schema::hasColumn('users', 'job');

        $doctors = [
            [
                'name' => 'drg. Yulita Dora',
                'email' => 'yulita.dora@aestheticpondokindah.local',
                'whatsapp' => '+62887437525310',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry (Veneers)',
            ],
            [
                'name' => 'drg. Della Sparringa',
                'email' => 'della.sparringa@aestheticpondokindah.local',
                'whatsapp' => '+62887437525311',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Ryan Jusuf',
                'email' => 'ryan.jusuf@aestheticpondokindah.local',
                'whatsapp' => '+62887437525312',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Nona Lolita T',
                'email' => 'nona.lolita@aestheticpondokindah.local',
                'whatsapp' => '+62887437525313',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry',
            ],
            [
                'name' => 'drg. Melati Putri, Sp. Pros',
                'email' => 'melati.putri@aestheticpondokindah.local',
                'whatsapp' => '+62887437525314',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Prosthodontist, Full Mouth Rehabilitations, Aesthetic Dentistry',
            ],
            [
                'name' => 'drg. Shilvy',
                'email' => 'shilvy@aestheticpondokindah.local',
                'whatsapp' => '+62887437525315',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Achmad Riwandy',
                'email' => 'achmad.riwandy@aestheticpondokindah.local',
                'whatsapp' => '+62887437525316',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Full Denture, Partial Denture, Prosthodontist, Full Mouth Rehabilitations',
            ],
            [
                'name' => 'drg. Ramayani Ramli',
                'email' => 'ramayani.ramli@aestheticpondokindah.local',
                'whatsapp' => '+62887437525317',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Cosmetic Dentistry',
            ],
            [
                'name' => 'drg. Sharah Syam, Sp. Ort',
                'email' => 'sharah.syam@aestheticpondokindah.local',
                'whatsapp' => '+62887437525318',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Orthodontist',
            ],
            [
                'name' => 'drg. Eric Sulistio, Sp. Perio',
                'email' => 'eric.sulistio@aestheticpondokindah.local',
                'whatsapp' => '+62887437525319',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Periodontist, Full Mouth Rehabilitation, Crown Lengthening, Frenectomy',
            ],
            [
                'name' => 'drg. Pramodanti Jiwanakusuma, Sp.KG',
                'email' => 'pramodanti.jiwanakusuma@aestheticpondokindah.local',
                'whatsapp' => '+62887437525320',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Root Canal Treatment & Conservation',
            ],
            [
                'name' => 'drg. Riesta Paluvi, Sp.KG',
                'email' => 'riesta.paluvi@aestheticpondokindah.local',
                'whatsapp' => '+62887437525321',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Oral Examination, Oral Health Education, Preventive Restoration, Root Canal Treatment',
            ],
            [
                'name' => 'drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)',
                'email' => 'yudy.ardila@aestheticpondokindah.local',
                'whatsapp' => '+62887437525322',
                'password' => 'doctor123',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Oral Surgeon Consultant',
            ],
        ];

        foreach ($doctors as $doctorData) {
            $updateData = [
                'name' => $doctorData['name'],
                'password' => Hash::make($doctorData['password']),
            ];

            if ($hasWhatsapp) {
                $updateData['whatsapp'] = $doctorData['whatsapp'];
            }
            if ($hasRole) {
                $updateData['role'] = $doctorData['role'];
            }
            if ($hasStatus) {
                $updateData['status'] = $doctorData['status'];
            }
            if ($hasJob) {
                $updateData['job'] = $doctorData['job'];
            }

            User::query()->updateOrCreate(
                ['email' => $doctorData['email']],
                $updateData
            );
        }
    }
}
