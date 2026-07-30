<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('procedure_catalogs')) {
            Schema::create('procedure_catalogs', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('name');
                $table->string('category')->default('General Dental');
                $table->text('description')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
            });

            // Seed common dental procedures
            DB::table('procedure_catalogs')->insert([
                ['code' => 'PROC-001', 'name' => 'Scaling & Polishing (Pembersihan Karang Gigi)', 'category' => 'Preventive', 'description' => 'Pembersihan karang dan plak gigi supragingiva & subgingiva.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'PROC-002', 'name' => 'Penambalan Gigi Komposit (Composite Filling)', 'category' => 'Restorative', 'description' => 'Restorasi kavitas gigi menggunakan bahan komposit resin.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'PROC-003', 'name' => 'Perawatan Saluran Akar (Root Canal Treatment)', 'category' => 'Endodontics', 'description' => 'Extirpasi pulpa terinfeksi & pembentukan saluran akar.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'PROC-004', 'name' => 'Pencabutan Gigi (Tooth Extraction)', 'category' => 'Oral Surgery', 'description' => 'Eksodontia gigi non-komplikasi dengan anestesi lokal.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'PROC-005', 'name' => 'Pemasangan Crown / Mahkota Gigi (Dental Crown)', 'category' => 'Prosthodontics', 'description' => 'Preparasi & pemasangan mahkota tiruan bahan porcelain/zirconia.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'PROC-006', 'name' => 'Bleaching / Teething Whitening', 'category' => 'Aesthetic', 'description' => 'Pemutihan gigi in-office menggunakan peroksida medis.', 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (!Schema::hasTable('clinical_procedures')) {
            Schema::create('clinical_procedures', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
                $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('procedure_catalog_id')->constrained('procedure_catalogs')->cascadeOnDelete();
                $table->foreignId('diagnosis_id')->nullable()->constrained('diagnoses')->nullOnDelete();
                $table->string('tooth_number')->nullable();
                $table->text('notes')->nullable();
                $table->string('status')->default('planned'); // planned, in_progress, completed, cancelled
                $table->foreignId('performed_by')->constrained('users')->cascadeOnDelete();
                $table->timestamp('performed_at')->nullable();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->foreignId('updated_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('clinical_procedures');
        Schema::dropIfExists('procedure_catalogs');
    }
};
