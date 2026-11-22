<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('page_visits')) {
            return;
        }

        Schema::table('page_visits', function (Blueprint $table) {
            if (!Schema::hasColumn('page_visits', 'session_id')) {
                $table->string('session_id', 100)->nullable()->after('visitor_id');
                $table->index(['session_id', 'visited_at'], 'page_visits_session_visited_idx');
            }
        });

        try {
            Schema::table('page_visits', function (Blueprint $table) {
                $table->index(['source', 'medium', 'campaign'], 'page_visits_utm_combo_idx');
            });
        } catch (\Throwable $e) {
            // Index already exists on production; safe to ignore.
        }
    }

    public function down(): void
    {
        if (!Schema::hasTable('page_visits')) {
            return;
        }

        try {
            Schema::table('page_visits', function (Blueprint $table) {
                $table->dropIndex('page_visits_utm_combo_idx');
            });
        } catch (\Throwable $e) {
            // Ignore if index does not exist.
        }

        Schema::table('page_visits', function (Blueprint $table) {
            if (Schema::hasColumn('page_visits', 'session_id')) {
                $table->dropIndex('page_visits_session_visited_idx');
                $table->dropColumn('session_id');
            }
        });
    }
};
