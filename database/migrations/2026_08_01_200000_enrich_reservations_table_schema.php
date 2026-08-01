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
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'email')) {
                $table->string('email', 255)->nullable()->after('phone');
            }
            if (!Schema::hasColumn('reservations', 'gender')) {
                $table->string('gender', 20)->nullable()->after('email');
            }
            if (!Schema::hasColumn('reservations', 'birth_date')) {
                $table->date('birth_date')->nullable()->after('gender');
            }
            if (!Schema::hasColumn('reservations', 'treatment_interest')) {
                $table->string('treatment_interest', 255)->nullable()->after('complaint');
            }
            if (!Schema::hasColumn('reservations', 'preferred_time')) {
                $table->string('preferred_time', 20)->nullable()->after('date');
            }
            if (!Schema::hasColumn('reservations', 'branch_name')) {
                $table->string('branch_name', 255)->default('Aesthetic Pondok Indah Main Branch')->after('preferred_time');
            }
            if (!Schema::hasColumn('reservations', 'admin_notes')) {
                $table->text('admin_notes')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('reservations', 'rescheduled_at')) {
                $table->timestamp('rescheduled_at')->nullable()->after('admin_notes');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $columns = [
                'email',
                'gender',
                'birth_date',
                'treatment_interest',
                'preferred_time',
                'branch_name',
                'admin_notes',
                'rescheduled_at',
            ];
            foreach ($columns as $column) {
                if (Schema::hasColumn('reservations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
