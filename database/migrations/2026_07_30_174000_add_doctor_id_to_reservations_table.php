<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('reservations', 'doctor_id')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->foreignId('doctor_id')->nullable()->after('user_id')->constrained('users')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('reservations', 'doctor_id')) {
            Schema::table('reservations', function (Blueprint $table) {
                $table->dropForeign(['doctor_id']);
                $table->dropColumn('doctor_id');
            });
        }
    }
};
