<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Personal Information
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('city')->nullable();
            
            // Dental Profile
            $table->json('dental_concerns')->nullable();
            $table->json('treatment_interests')->nullable();
            $table->json('dental_conditions')->nullable();
            $table->date('last_dental_visit')->nullable();
            
            // Lifestyle
            $table->json('lifestyle_interests')->nullable();
            $table->json('personal_goals')->nullable();
            
            // Preferences
            $table->json('communication_preferences')->nullable();
            $table->json('content_preferences')->nullable();
            
            $table->timestamps();
            
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_profiles');
    }
};
