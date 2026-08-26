<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('clinic_settings')) {
            try {
                DB::statement('ALTER TABLE clinic_settings MODIFY value LONGTEXT NULL');
            } catch (\Throwable $e) {
                Schema::table('clinic_settings', function (Blueprint $table) {
                    $table->longText('value')->nullable()->change();
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('clinic_settings')) {
            try {
                DB::statement('ALTER TABLE clinic_settings MODIFY value TEXT NULL');
            } catch (\Throwable $e) {
                Schema::table('clinic_settings', function (Blueprint $table) {
                    $table->text('value')->nullable()->change();
                });
            }
        }
    }
};
