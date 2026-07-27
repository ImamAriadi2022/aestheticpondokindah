<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Membership level fields
            $table->enum('membership_level', ['gold', 'platinum', 'diamond'])->default('gold')->after('membership_status');
            $table->integer('membership_points')->default(0)->after('membership_level');
            $table->decimal('total_transactions', 15, 2)->default(0)->after('membership_points');
            $table->integer('completed_treatments')->default(0)->after('total_transactions');
            $table->boolean('membership_profile_completed')->default(false)->after('completed_treatments');
            
            // Indexes
            $table->index('membership_level');
            $table->index('membership_points');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'membership_level',
                'membership_points',
                'total_transactions',
                'completed_treatments',
                'membership_profile_completed',
            ]);
        });
    }
};
