<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'doctor_schedule_id')) {
                $table->foreignId('doctor_schedule_id')->nullable()->after('doctor_id')->constrained('doctor_schedules')->nullOnDelete();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (Schema::hasColumn('reservations', 'doctor_schedule_id')) {
                $table->dropForeign(['doctor_schedule_id']);
                $table->dropColumn('doctor_schedule_id');
            }
        });
    }
};
