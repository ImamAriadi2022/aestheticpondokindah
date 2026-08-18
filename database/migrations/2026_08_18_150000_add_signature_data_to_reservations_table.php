<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'signature_data')) {
                $table->longText('signature_data')->nullable()->after('admin_notes');
            }
            if (!Schema::hasColumn('reservations', 'terms_accepted_at')) {
                $table->timestamp('terms_accepted_at')->nullable()->after('signature_data');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (Schema::hasColumn('reservations', 'signature_data')) {
                $table->dropColumn('signature_data');
            }
            if (Schema::hasColumn('reservations', 'terms_accepted_at')) {
                $table->dropColumn('terms_accepted_at');
            }
        });
    }
};
