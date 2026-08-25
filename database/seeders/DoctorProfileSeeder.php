<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Shared\User\User;

class DoctorProfileSeeder extends Seeder
{
    public function run(): void
    {
        $doctorProfiles = [
            'drg. Yulita Dora' => [
                'specialization' => 'Aesthetic & Orthodontics',
                'education' => 'Universitas Indonesia',
                'experience_years' => '12',
                'bio' => 'Dokter gigi spesialis perawatan estetika dan ortodonti dengan pengalaman klinis lebih dari 12 tahun di Pondok Indah.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Yulita Dora.webp',
            ],
            'drg. Sharah Syam, Sp. Ort' => [
                'specialization' => 'Orthodontics',
                'education' => 'Universitas Gadjah Mada',
                'experience_years' => '10',
                'bio' => 'Spesialis ortodonti bersertifikasi dengan keahlian khusus Invisalign dan behel estetik modern.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Sharah Syam, Sp. Ort.webp',
            ],
            'drg. Melati Putri, Sp. Pros' => [
                'specialization' => 'Prosthodontics',
                'education' => 'Universitas Padjadjaran',
                'experience_years' => '15',
                'bio' => 'Spesialis prostodonti ahli mahkota gigi, dental bridge, dan rehabilitasi senyum menyeluruh.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Melati Putri, Sp. Pros.webp',
            ],
            'drg. Ryan Jusuf' => [
                'specialization' => 'Cosmetic & General Dentistry',
                'education' => 'Universitas Indonesia',
                'experience_years' => '8',
                'bio' => 'Dokter gigi umum & estetik terkemuka dengan fokus pada bleaching gigi, scaling, dan restorasi komposit.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Ryan Jusuf.webp',
            ],
            'drg. Eric Sulistio, Sp. Perio' => [
                'specialization' => 'Periodontics & Dental Implants',
                'education' => 'Universitas Airlangga',
                'experience_years' => '14',
                'bio' => 'Spesialis periodonsia & implan gigi terkemuka untuk rekonstruksi gusi dan penanaman implan titanium.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Eric Sulistio, Sp. Perio.webp',
            ],
            'drg. Pramodanti Jiwanakusuma, Sp.KG' => [
                'specialization' => 'Endodontics & Conservative Dentistry',
                'education' => 'Universitas Indonesia',
                'experience_years' => '11',
                'bio' => 'Spesialis konservasi gigi ahli perawatan saluran akar mikro dan restorasi veneer porselen.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Pramodanti Jiwanakusuma, Sp.KG.webp',
            ],
            'drg. Riesta Paluvi, Sp.KG' => [
                'specialization' => 'Conservative Dentistry & Endodontics',
                'education' => 'Universitas Padjadjaran',
                'experience_years' => '9',
                'bio' => 'Spesialis konservasi gigi berfokus pada perawatan saraf gigi dan penambalan estetis.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Riesta Paluvi, Sp.KG.webp',
            ],
            'drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K)' => [
                'specialization' => 'Oral & Maxillofacial Surgery',
                'education' => 'Universitas Indonesia',
                'experience_years' => '16',
                'bio' => 'Spesialis bedah mulut & maksilofasial untuk operasi gigi bungsu impaksi dan implan bedah lanjut.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Yudy Ardila Utomo, Sp.BMM, Subsp.I.DM.(K).webp',
            ],
            'drg. Della Sparringa' => [
                'specialization' => 'General & Pediatric Dentistry',
                'education' => 'Universitas Indonesia',
                'experience_years' => '7',
                'bio' => 'Dokter gigi dengan keramahan dan penanganan ramah anak serta tindakan preventif gigi.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Della Sparringa.webp',
            ],
            'drg. Achmad Riwandy' => [
                'specialization' => 'General Dentistry',
                'education' => 'Universitas Trisakti',
                'experience_years' => '6',
                'bio' => 'Dokter gigi umum berfokus pada scaling karang gigi, penambalan komposit, dan pemeliharaan kesehatan gigi.',
                'primary_branch' => 'Pondok Indah Main Branch',
                'avatar' => '/dokter/drg. Achmad Riwandy.webp',
            ],
        ];

        foreach ($doctorProfiles as $name => $data) {
            User::where('role', 'doctor')
                ->where('name', 'like', '%' . $name . '%')
                ->update($data);
        }
    }
}
