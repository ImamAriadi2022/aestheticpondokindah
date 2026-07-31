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
        // 1. Update users table - add bronze to membership_level enum, change default to bronze
        Schema::table('users', function (Blueprint $table) {
            // MySQL requires dropping and recreating the enum to add a new value
            // For PostgreSQL/SQLite, this might need different handling
            $table->enum('membership_level', ['bronze', 'gold', 'platinum', 'diamond'])
                  ->default('bronze')
                  ->after('membership_status')
                  ->change();

            // 2. Add last_paid_level column
            $table->enum('last_paid_level', ['gold', 'platinum', 'diamond'])
                  ->nullable()
                  ->after('membership_level');
        });

        // 3. Update membership_histories table - add bronze to enum
        Schema::table('membership_histories', function (Blueprint $table) {
            $table->enum('old_level', ['bronze', 'gold', 'platinum', 'diamond', 'none'])
                  ->nullable()
                  ->change();
            $table->enum('new_level', ['bronze', 'gold', 'platinum', 'diamond'])
                  ->change();
        });

        // 4. Data migration - set last_paid_level for existing paid members
        // This ensures grandfathered members can be renewed to their original level
        DB::statement("
            UPDATE users
            SET last_paid_level = membership_level
            WHERE membership_level IN ('gold', 'platinum', 'diamond')
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // 1. Remove last_paid_level
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('last_paid_level');
        });

        // 2. Revert membership_level enum back to 3 tiers
        Schema::table('users', function (Blueprint $table) {
            $table->enum('membership_level', ['gold', 'platinum', 'diamond'])
                  ->default('gold')
                  ->change();
        });

        // 3. Revert membership_histories enums
        Schema::table('membership_histories', function (Blueprint $table) {
            $table->enum('old_level', ['gold', 'platinum', 'diamond', 'none'])
                  ->nullable()
                  ->change();
            $table->enum('new_level', ['gold', 'platinum', 'diamond'])
                  ->change();
        });

        // 4. Note: Users who were 'bronze' will become 'gold' on rollback
        // This is acceptable for development, but be careful in production
    }
};
