<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $afterColumn = Schema::hasColumn('users', 'whatsapp')
            ? 'whatsapp'
            : 'email_verified_at';

        Schema::table('users', function (Blueprint $table) use ($afterColumn) {
            $table->timestamp('phone_verified_at')->nullable()->after($afterColumn);
            $table->string('address_line')->nullable()->after('phone_verified_at');
            $table->string('city')->nullable()->after('address_line');
            $table->string('postal_code', 20)->nullable()->after('city');
            $table->timestamp('profile_completed_at')->nullable()->after('postal_code');

            $table->string('membership_status', 20)->default('inactive')->after('profile_completed_at');
            $table->timestamp('membership_started_at')->nullable()->after('membership_status');
            $table->timestamp('membership_expires_at')->nullable()->after('membership_started_at');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone_verified_at',
                'address_line',
                'city',
                'postal_code',
                'profile_completed_at',
                'membership_status',
                'membership_started_at',
                'membership_expires_at',
            ]);
        });
    }
};
