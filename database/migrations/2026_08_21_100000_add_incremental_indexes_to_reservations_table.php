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
            if (!Schema::hasColumn('reservations', 'deleted_at')) {
                $table->softDeletes()->after('updated_at');
            }
        });

        try {
            Schema::table('reservations', function (Blueprint $table) {
                $table->index(['updated_at', 'id'], 'reservations_updated_at_id_idx');
            });
        } catch (\Throwable $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (Schema::hasColumn('reservations', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
            try {
                $table->dropIndex('reservations_updated_at_id_idx');
            } catch (\Throwable $e) {}
        });
    }
};
