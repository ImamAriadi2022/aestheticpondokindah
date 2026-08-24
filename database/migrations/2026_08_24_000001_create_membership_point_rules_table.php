<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('membership_point_rules')) {
            Schema::create('membership_point_rules', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->foreignId('service_id')->nullable()->constrained('clinic_services')->nullOnDelete();
                $table->string('service_name')->nullable();
                $table->integer('points')->default(0);
                $table->boolean('is_active')->default(true);
                $table->text('description')->nullable();
                $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
                $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamps();

                $table->index('is_active');
                $table->index('service_id');
            });

            // Seed default dynamic point rules
            $now = now();
            DB::table('membership_point_rules')->insert([
                [
                    'name' => 'Scaling & Polishing (Pembersihan Karang Gigi)',
                    'service_name' => 'Scaling & Polishing',
                    'points' => 50,
                    'is_active' => true,
                    'description' => 'Perolehan poin standar untuk setiap tindakan scaling gigi yang telah selesai.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Dental Fillings, Inlays & Onlays (Tambal Gigi)',
                    'service_name' => 'Dental Fillings, Inlays & Onlays',
                    'points' => 75,
                    'is_active' => true,
                    'description' => 'Perolehan poin untuk penambalan gigi estetik dan restorasi gigi.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Dental Extraction & Wisdom Tooth (Cabut Gigi & Odontektomi)',
                    'service_name' => 'Dental Extraction and Wisdom Tooth Removal',
                    'points' => 100,
                    'is_active' => true,
                    'description' => 'Perolehan poin untuk tindakan ekstraksi gigi atau operasi gigi bungsu.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Dental Whitening (Bleaching Gigi)',
                    'service_name' => 'Dental Whitening',
                    'points' => 150,
                    'is_active' => true,
                    'description' => 'Perolehan poin premium untuk perawatan pemutihan gigi.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'name' => 'Pemeriksaan & Konsultasi Dokter Gigi Umum',
                    'service_name' => 'Oral Care',
                    'points' => 25,
                    'is_active' => true,
                    'description' => 'Perolehan poin dasar untuk konsultasi dan check-up kesehatan gigi rutin.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_point_rules');
    }
};
