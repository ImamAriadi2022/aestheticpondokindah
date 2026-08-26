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
                'password' => Hash::make('Persib1933'),
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
                DB::table('users')->where('id', $user->id)->update($data);
            } else {
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
