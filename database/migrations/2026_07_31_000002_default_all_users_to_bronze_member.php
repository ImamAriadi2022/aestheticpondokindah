<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Semua pengguna yang terdaftar otomatis menjadi Bronze member.
     * Bronze adalah tier gratis & selalu aktif (tidak perlu bayar).
     * Gold & Platinum hanya melalui pembayaran.
     */
    public function up(): void
    {
        DB::table('users')
            ->whereIn('role', ['user', 'patient'])
            ->where(function ($query) {
                $query->whereNull('membership_level')
                    ->orWhere('membership_level', 'bronze');
            })
            ->update([
                'membership_level' => 'bronze',
                'membership_status' => 'active',
                'membership_started_at' => DB::raw('COALESCE(membership_started_at, created_at)'),
                'membership_expires_at' => null,
            ]);
    }

    public function down(): void
    {
        // Tidak ada rollback otomatis; data bronze sudah menjadi default.
    }
};
