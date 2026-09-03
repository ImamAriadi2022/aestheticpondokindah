<?php

namespace Database\Seeders;

use App\Models\Shared\User\JobOption;
use Illuminate\Database\Seeder;

class JobOptionSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            'Belum/Tidak Bekerja', 'Mengurus Rumah Tangga', 'Pelajar/Mahasiswa', 'Pensiunan',
            'Pegawai Negeri Sipil (PNS)', 'Tentara Nasional Indonesia (TNI)', 'Kepolisian RI (POLRI)',
            'Perdagangan', 'Petani/Pekebun', 'Peternak', 'Nelayan/Perikanan', 'Industri', 'Konstruksi',
            'Transportasi', 'Karyawan Swasta', 'Karyawan BUMN', 'Karyawan BUMD', 'Karyawan Honorer',
            'Buruh Harian Lepas', 'Buruh Tani/Perkebunan', 'Buruh Nelayan/Perikanan', 'Buruh Peternakan',
            'Pembantu Rumah Tangga', 'Tukang Cukur', 'Tukang Listrik', 'Tukang Batu', 'Tukang Kayu',
            'Tukang Sol Sepatu', 'Tukang Las/Pandai Besi', 'Tukang Jahit', 'Tukang Gigi', 'Penata Rias',
            'Penata Busana', 'Penata Rambut', 'Mekanik', 'Seniman', 'Artis', 'Dokter', 'Perawat', 'Bidan',
            'Apoteker', 'Dosen', 'Guru', 'Pilot', 'Pengacara', 'Notaris', 'Arsitek', 'Akuntan', 'Konsultan',
            'Dokter Gigi', 'Wartawan', 'Psikolog', 'Pelukis', 'Penyanyi', 'Pengusaha', 'Wiraswasta', 'Lainnya',
        ];

        foreach ($jobs as $sortOrder => $name) {
            JobOption::query()->updateOrCreate(
                ['name' => $name],
                ['sort_order' => $sortOrder, 'is_active' => true]
            );
        }
    }
}
