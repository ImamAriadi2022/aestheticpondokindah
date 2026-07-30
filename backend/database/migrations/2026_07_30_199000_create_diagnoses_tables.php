<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('icd10_codes')) {
            Schema::create('icd10_codes', function (Blueprint $table) {
                $table->id();
                $table->string('code')->unique();
                $table->string('description');
                $table->string('category')->nullable();
                $table->timestamps();
            });

            // Seed initial common dental ICD-10 codes
            DB::table('icd10_codes')->insert([
                ['code' => 'K02.1', 'description' => 'Caries of dentine (Karies Dentin)', 'category' => 'Dental Caries', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K04.0', 'description' => 'Pulpitis (Pulpitis Reversibel/Irreversibel)', 'category' => 'Diseases of Pulp', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K04.1', 'description' => 'Necrosis of pulp (Nekrosis Pulpa)', 'category' => 'Diseases of Pulp', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K05.1', 'description' => 'Chronic gingivitis (Gingivitis Kronis)', 'category' => 'Gingival Diseases', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K05.3', 'description' => 'Chronic periodontitis (Periodontitis Kronis)', 'category' => 'Periodontal Diseases', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K01.1', 'description' => 'Impacted teeth (Impaksi Gigi)', 'category' => 'Anomalies of Tooth Position', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K00.6', 'description' => 'Disturbances in tooth eruption (Persistensi Gigi Sulung)', 'category' => 'Tooth Development', 'created_at' => now(), 'updated_at' => now()],
                ['code' => 'K03.6', 'description' => 'Deposits [accretions] on teeth (Karang Gigi / Calculus)', 'category' => 'Hard Tissues of Teeth', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        if (!Schema::hasTable('diagnoses')) {
            Schema::create('diagnoses', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medical_record_id')->constrained('medical_records')->cascadeOnDelete();
                $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
                $table->string('name');
                $table->string('type')->default('primary'); // primary, secondary, differential
                $table->text('notes')->nullable();
                $table->string('icd10_code')->nullable();
                $table->string('icd10_description')->nullable();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->foreignId('updated_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('diagnoses');
        Schema::dropIfExists('icd10_codes');
    }
};
