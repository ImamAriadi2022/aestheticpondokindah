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
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry (Veneers)',
            ],
            [
                'name' => 'drg. Della Sparringa',
                'email' => 'della.sparringa@aestheticpondokindah.local',
                'whatsapp' => '+62887437525311',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Ryan Jusuf',
                'email' => 'ryan.jusuf@aestheticpondokindah.local',
                'whatsapp' => '+62887437525312',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Nona Lolita T',
                'email' => 'nona.lolita@aestheticpondokindah.local',
                'whatsapp' => '+62887437525313',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry',
            ],
            [
                'name' => 'drg. Melati Putri, Sp. Pros',
                'email' => 'melati.putri@aestheticpondokindah.local',
                'whatsapp' => '+62887437525314',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Prosthodontist, Full Mouth Rehabilitations, Aesthetic Dentistry',
            ],
            [
                'name' => 'drg. Shilvy',
                'email' => 'shilvy@aestheticpondokindah.local',
                'whatsapp' => '+62887437525315',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Aesthetic Dentistry & Pediatric Dentistry',
            ],
            [
                'name' => 'drg. Achmad Riwandy',
                'email' => 'achmad.riwandy@aestheticpondokindah.local',
                'whatsapp' => '+62887437525316',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Full Denture, Partial Denture, Prosthodontist, Full Mouth Rehabilitations',
            ],
            [
                'name' => 'drg. Ramayani Ramli',
                'email' => 'ramayani.ramli@aestheticpondokindah.local',
                'whatsapp' => '+62887437525317',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Cosmetic Dentistry',
            ],
            [
                'name' => 'drg. Sharah Syam, Sp. Ort',
                'email' => 'sharah.syam@aestheticpondokindah.local',
                'whatsapp' => '+62887437525318',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Orthodontist',
            ],
            [
                'name' => 'drg. Eric Sulistio, Sp. Perio',
                'email' => 'eric.sulistio@aestheticpondokindah.local',
                'whatsapp' => '+62887437525319',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Periodontist, Full Mouth Rehabilitation, Crown Lengthening, Frenectomy',
            ],
            [
                'name' => 'drg. Pramodanti Jiwanakusuma, Sp.KG',
                'email' => 'pramodanti.jiwanakusuma@aestheticpondokindah.local',
                'whatsapp' => '+62887437525320',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Root Canal Treatment & Conservation',
            ],
            [
                'name' => 'drg. Riesta Paluvi, Sp.KG',
                'email' => 'riesta.paluvi@aestheticpondokindah.local',
                'whatsapp' => '+62887437525321',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Oral Examination, Oral Health Education, Preventive Restoration, Root Canal Treatment',
            ],
            [
                'name' => 'drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)',
                'email' => 'yudy.ardila@aestheticpondokindah.local',
                'whatsapp' => '+62887437525322',
                'role' => 'doctor',
                'status' => 'active',
                'job' => 'Oral Surgeon Consultant',
            ],
        ];

        $defaultDoctorPassword = env('SEED_DOCTOR_PASSWORD') ?: \Illuminate\Support\Str::random(20);

        foreach ($doctors as $doctorData) {
            $updateData = [
                'name' => $doctorData['name'],
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
            if ($hasJob && !empty($doctorData['job'])) {
                $updateData['job'] = $doctorData['job'];
            }
            $user = User::query()
                ->where('email', $doctorData['email'])
                ->orWhere(function ($q) use ($hasWhatsapp, $doctorData) {
                    if ($hasWhatsapp && !empty($doctorData['whatsapp'])) {
                        $q->where('whatsapp', $doctorData['whatsapp']);
                    }
                })
                ->first();

            if ($user) {
                // Never overwrite existing doctor passwords during re-deploy/re-seed
                $user->update(array_merge(['email' => $doctorData['email']], $updateData));
            } else {
                User::query()->create(array_merge(
                    [
                        'email' => $doctorData['email'],
                        'password' => Hash::make($defaultDoctorPassword),
                    ],
                    $updateData
                ));
            }
        }
    }
}
