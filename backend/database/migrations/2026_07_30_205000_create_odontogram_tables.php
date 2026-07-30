<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('odontograms')) {
            Schema::create('odontograms', function (Blueprint $table) {
                $table->id();
                $table->foreignId('medical_record_id')->unique()->constrained('medical_records')->cascadeOnDelete();
                $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
                $table->text('notes')->nullable();
                $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
                $table->foreignId('updated_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();
            });
        }

        if (!Schema::hasTable('tooth_states')) {
            Schema::create('tooth_states', function (Blueprint $table) {
                $table->id();
                $table->foreignId('odontogram_id')->constrained('odontograms')->cascadeOnDelete();
                $table->string('tooth_number'); // FDI 11-48, 51-85
                $table->string('condition')->default('normal'); // normal, caries, restoration, missing, crown, root_canal, bridge, implant, fracture, sealant
                $table->string('surface')->nullable(); // M, D, O, B, L, general
                $table->text('notes')->nullable();
                $table->foreignId('updated_by')->constrained('users')->cascadeOnDelete();
                $table->timestamps();

                $table->unique(['odontogram_id', 'tooth_number'], 'unique_tooth_per_odontogram');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tooth_states');
        Schema::dropIfExists('odontograms');
    }
};
