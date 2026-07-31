<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();

            $table->json('dental_complaints')->nullable();
            $table->json('desired_services')->nullable();
            $table->json('current_dental_conditions')->nullable();
            $table->string('last_dental_visit', 50)->nullable();

            $table->json('lifestyle_interests')->nullable();
            $table->json('treatment_goals')->nullable();
            $table->json('preferred_communication_channels')->nullable();

            $table->timestamps();

            $table->unique('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
