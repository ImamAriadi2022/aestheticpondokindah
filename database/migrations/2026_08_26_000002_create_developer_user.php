<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('users')) {
            $user = DB::table('users')->where('email', 'imamariadi775@gmail.com')->first();

            $data = [
                'name' => 'Imam Ariadi (Developer)',
                'email' => 'imamariadi775@gmail.com',
                'updated_at' => now(),
            ];

            if (Schema::hasColumn('users', 'role')) {
                $data['role'] = 'developer';
            }
            if (Schema::hasColumn('users', 'status')) {
                $data['status'] = 'active';
            }
            if (Schema::hasColumn('users', 'whatsapp')) {
                $data['whatsapp'] = '+62887437525399';
            }

            if ($user) {
                // Never overwrite existing developer password during migrations
                DB::table('users')->where('id', $user->id)->update($data);
            } else {
                $initialPassword = env('SEED_DEV_PASSWORD') ?: \Illuminate\Support\Str::random(24);
                $data['password'] = Hash::make($initialPassword);
                $data['created_at'] = now();
                DB::table('users')->insert($data);
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('users')) {
            DB::table('users')->where('email', 'imamariadi775@gmail.com')->delete();
        }
    }
};
