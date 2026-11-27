<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class OperationalSampleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Contact Messages (Pesan Masuk dari form Kontak Website)
        if (DB::table('contact_messages')->count() === 0) {
            DB::table('contact_messages')->insert([
                [
                    'name' => 'Siti Rahma',
                    'email' => 'siti.rahma@gmail.com',
                    'phone' => '+6281234567890',
                    'subject' => 'Tanya Jadwal Konsultasi Estetika',
                    'message' => 'Halo dokter, saya ingin konsultasi mengenai perawatan scaling dan bleaching gigi apakah ada promo bulan ini?',
                    'status' => 'unread',
                    'created_at' => Carbon::now()->subDays(2),
                    'updated_at' => Carbon::now()->subDays(2),
                ],
                [
                    'name' => 'Budi Santoso',
                    'email' => 'budi.santoso@yahoo.com',
                    'phone' => '+6281398765432',
                    'subject' => 'Pelayanan Pasang Behel',
                    'message' => 'Selamat siang, mau tanya rincian estimasi biaya pasang behel keramik dan sistem cicilannya. Terima kasih.',
                    'status' => 'read',
                    'created_at' => Carbon::now()->subDay(),
                    'updated_at' => Carbon::now()->subDay(),
                ]
            ]);
        }

        // 2. Promo Claims (Klaim voucher promo oleh user)
        if (DB::table('promo_claims')->count() === 0) {
            $user = DB::table('users')->where('role', 'patient')->first() ?: DB::table('users')->first();
            $admin = DB::table('users')->where('role', 'clinic_admin')->first() ?: DB::table('users')->first();

            if ($user && $admin) {
                DB::table('promo_claims')->insert([
                    [
                        'user_id' => $user->id,
                        'claimed_by_admin_id' => $admin->id,
                        'claim_type' => 'regular',
                        'notes' => 'Klaim promo perdana pasien baru',
                        'created_at' => Carbon::now()->subDays(3),
                        'updated_at' => Carbon::now()->subDays(3),
                    ]
                ]);
            }
        }
    }
}
