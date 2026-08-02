<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // The old OnlineConsultationSeeder created only these local/demo
        // identities. Removing them also removes their messages and meetings
        // through the database foreign-key cascades.
        $demoUserIds = DB::table('users')
            ->where('email', 'like', '%@aestheticpondokindah.local')
            ->pluck('id');

        DB::table('consultations')
            ->whereIn('user_id', $demoUserIds)
            ->orWhere('guest_phone', '+6281234567890')
            ->delete();
    }

    public function down(): void
    {
        // Demo data is intentionally not restored.
    }
};
