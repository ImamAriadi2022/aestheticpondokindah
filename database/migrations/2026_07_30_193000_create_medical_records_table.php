<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('medical_records')) {
            Schema::create('medical_records', function (Blueprint $table) {
                $table->id();
                $table->string('record_number')->unique();
                $table->foreignId('visit_id')->constrained('visits')->cascadeOnDelete();
                $table->foreignId('patient_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('doctor_id')->constrained('users')->cascadeOnDelete();
                $table->string('status')->default('draft'); // draft, in_progress, finalized, locked
                $table->text('summary_notes')->nullable();
                $table->timestamp('finalized_at')->nullable();
                $table->timestamp('locked_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('medical_records');
    }
};
