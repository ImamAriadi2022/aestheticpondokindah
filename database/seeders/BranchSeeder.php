<?php

namespace Database\Seeders;

use App\Models\Shared\Branch\Branch;
use Illuminate\Database\Seeder;

class BranchSeeder extends Seeder
{
    public function run(): void
    {
        $defaultBranches = [
            [
                'name' => 'Aesthetic Pondok Indah Main Branch',
                'code' => 'API-PI',
                'address' => 'Jl. Metro Pondok Indah No. 12, Kebayoran Lama, Jakarta Selatan 12310',
                'phone' => '021-7654321',
                'status' => 'active',
            ],
            [
                'name' => 'Aesthetic Clinic Senayan Branch',
                'code' => 'API-SN',
                'address' => 'Plaza Senayan Level 3 No. 302, Gelora, Tanah Abang, Jakarta Pusat 10270',
                'phone' => '021-5725000',
                'status' => 'active',
            ],
            [
                'name' => 'Aesthetic Clinic Kelapa Gading Branch',
                'code' => 'API-KG',
                'address' => 'Mall Kelapa Gading 3 G Floor, Kelapa Gading, Jakarta Utara 14240',
                'phone' => '021-4585388',
                'status' => 'active',
            ],
            [
                'name' => 'Aesthetic Clinic BSD City Branch',
                'code' => 'API-BSD',
                'address' => 'Green Office Park 9 Ground Floor, BSD City, Tangerang Selatan 15345',
                'phone' => '021-5088899',
                'status' => 'active',
            ],
        ];

        foreach ($defaultBranches as $bData) {
            Branch::updateOrCreate(
                ['code' => $bData['code']],
                $bData
            );
        }
    }
}
