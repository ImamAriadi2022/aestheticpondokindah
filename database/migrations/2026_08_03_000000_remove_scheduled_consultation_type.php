<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Update any existing scheduled consultations to quick
        DB::table('consultations')
            ->where('type', 'scheduled')
            ->update(['type' => 'quick']);

        // 2. Update status Dijadwalkan to Menunggu
        DB::table('consultations')
            ->where('status', 'Dijadwalkan')
            ->update(['status' => 'Menunggu']);

        // 3. Ensure type column defaults to 'quick'
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('type')->default('quick')->change();
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->string('type')->default('quick')->change();
        });
    }
};
