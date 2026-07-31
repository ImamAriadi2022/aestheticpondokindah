<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Preserve existing paid members when the retired Diamond tier is
        // consolidated into the highest supported tier, Platinum.
        DB::table('users')->where('membership_level', 'diamond')->update([
            'membership_level' => 'platinum',
            'last_paid_level' => 'platinum',
        ]);
        DB::table('membership_histories')->where('old_level', 'diamond')->update(['old_level' => 'platinum']);
        DB::table('membership_histories')->where('new_level', 'diamond')->update(['new_level' => 'platinum']);

        DB::statement("ALTER TABLE users MODIFY membership_level ENUM('bronze', 'gold', 'platinum') NOT NULL DEFAULT 'bronze'");
        DB::statement("ALTER TABLE users MODIFY last_paid_level ENUM('gold', 'platinum') NULL");
        DB::statement("ALTER TABLE membership_histories MODIFY old_level ENUM('bronze', 'gold', 'platinum', 'none') NULL");
        DB::statement("ALTER TABLE membership_histories MODIFY new_level ENUM('bronze', 'gold', 'platinum') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY membership_level ENUM('bronze', 'gold', 'platinum', 'diamond') NOT NULL DEFAULT 'bronze'");
        DB::statement("ALTER TABLE users MODIFY last_paid_level ENUM('gold', 'platinum', 'diamond') NULL");
        DB::statement("ALTER TABLE membership_histories MODIFY old_level ENUM('bronze', 'gold', 'platinum', 'diamond', 'none') NULL");
        DB::statement("ALTER TABLE membership_histories MODIFY new_level ENUM('bronze', 'gold', 'platinum', 'diamond') NOT NULL");
    }
};
