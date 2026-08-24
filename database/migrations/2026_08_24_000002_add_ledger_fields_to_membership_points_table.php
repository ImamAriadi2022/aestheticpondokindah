<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('membership_points', function (Blueprint $table) {
            if (!Schema::hasColumn('membership_points', 'balance_before')) {
                $table->integer('balance_before')->default(0)->after('points');
            }
            if (!Schema::hasColumn('membership_points', 'balance_after')) {
                $table->integer('balance_after')->default(0)->after('balance_before');
            }
            if (!Schema::hasColumn('membership_points', 'admin_id')) {
                $table->foreignId('admin_id')->nullable()->after('reference_type')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('membership_points', function (Blueprint $table) {
            if (Schema::hasColumn('membership_points', 'balance_before')) {
                $table->dropColumn('balance_before');
            }
            if (Schema::hasColumn('membership_points', 'balance_after')) {
                $table->dropColumn('balance_after');
            }
            if (Schema::hasColumn('membership_points', 'admin_id')) {
                $table->dropForeign(['admin_id']);
                $table->dropColumn('admin_id');
            }
        });
    }
};
