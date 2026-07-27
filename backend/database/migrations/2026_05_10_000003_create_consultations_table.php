<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['quick', 'scheduled'])->default('quick');
            $table->enum('status', ['Menunggu', 'Dijadwalkan', 'Selesai'])->default('Menunggu');
            $table->string('topic')->nullable();
            $table->string('category')->nullable();
            $table->text('chief_complaint');
            $table->string('duration')->nullable();
            $table->tinyInteger('pain_scale')->unsigned()->nullable();
            $table->text('allergies')->nullable();
            $table->text('medications')->nullable();
            $table->text('prior_treatment')->nullable();
            $table->string('preferred_contact')->nullable();
            $table->string('contact_number')->nullable();
            $table->text('expectations')->nullable();
            $table->text('notes')->nullable();
            $table->string('doctor_name')->nullable();
            $table->date('schedule_date')->nullable();
            $table->string('schedule_time')->nullable();
            $table->string('location')->nullable();
            $table->json('attachments')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('consultations');
    }
};
