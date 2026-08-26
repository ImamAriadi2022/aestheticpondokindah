<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->longText('value')->nullable();
            $table->string('type')->default('text'); // text, textarea, json, boolean
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed default booking terms and conditions
        DB::table('clinic_settings')->insert([
            [
                'key'         => 'booking_terms',
                'value'       => implode("\n", [
                    "1. Reservasi ini bersifat permintaan, bukan konfirmasi pasti. Admin klinik akan menghubungi Anda untuk konfirmasi jadwal.",
                    "2. Harap datang 10 menit sebelum waktu reservasi yang dijadwalkan.",
                    "3. Jika tidak dapat hadir, mohon hubungi klinik minimal 2 jam sebelum jadwal untuk pembatalan.",
                    "4. Data pribadi Anda (nama, nomor HP, keluhan) hanya digunakan untuk keperluan layanan medis klinik.",
                    "5. Klinik berhak menolak atau mengubah jadwal reservasi apabila dokter tidak tersedia.",
                    "6. Aesthetic Pondok Indah tidak bertanggung jawab atas ketidaknyamanan akibat perubahan jadwal yang disebabkan kondisi force majeure.",
                    "7. Dengan mengirim permintaan ini, Anda menyetujui untuk dihubungi melalui WhatsApp/telepon oleh staf klinik.",
                ]),
                'type'        => 'textarea',
                'label'       => 'Syarat & Ketentuan Booking Guest',
                'description' => 'Teks syarat dan ketentuan yang ditampilkan kepada tamu sebelum mengirim permintaan reservasi.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
            [
                'key'         => 'booking_whatsapp_number',
                'value'       => '6281990114949',
                'type'        => 'text',
                'label'       => 'Nomor WhatsApp Klinik (Booking)',
                'description' => 'Nomor WhatsApp yang digunakan untuk menerima pesan booking dari tamu. Format: 62xxx tanpa tanda +.',
                'created_at'  => now(),
                'updated_at'  => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
