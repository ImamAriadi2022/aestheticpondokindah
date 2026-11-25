<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'ktp_number')) {
                $table->string('ktp_number', 50)->nullable()->after('whatsapp');
            }
            if (!Schema::hasColumn('users', 'ihs_id')) {
                $table->string('ihs_id', 50)->nullable()->after('ktp_number');
            }
            if (!Schema::hasColumn('users', 'title_prefix')) {
                $table->string('title_prefix', 50)->nullable()->after('name');
            }
            if (!Schema::hasColumn('users', 'title_suffix')) {
                $table->string('title_suffix', 100)->nullable()->after('title_prefix');
            }
            if (!Schema::hasColumn('users', 'subspecialist')) {
                $table->string('subspecialist', 255)->nullable()->after('specialization');
            }
            if (!Schema::hasColumn('users', 'job_category')) {
                $table->string('job_category', 100)->nullable()->after('subspecialist');
            }
            if (!Schema::hasColumn('users', 'str_institution')) {
                $table->string('str_institution', 255)->nullable()->after('str_number');
            }
            if (!Schema::hasColumn('users', 'str_expiry')) {
                $table->date('str_expiry')->nullable()->after('str_institution');
            }
            if (!Schema::hasColumn('users', 'str_lifetime')) {
                $table->boolean('str_lifetime')->default(true)->after('str_expiry');
            }
            if (!Schema::hasColumn('users', 'sip_institution')) {
                $table->string('sip_institution', 255)->nullable()->after('sip_number');
            }
            if (!Schema::hasColumn('users', 'sip_expiry')) {
                $table->date('sip_expiry')->nullable()->after('sip_institution');
            }
            if (!Schema::hasColumn('users', 'consultation_duration')) {
                $table->integer('consultation_duration')->default(30)->after('consultation_fee');
            }
            if (!Schema::hasColumn('users', 'weekly_schedules')) {
                $table->json('weekly_schedules')->nullable()->after('consultation_duration');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $cols = [
                'ktp_number',
                'ihs_id',
                'title_prefix',
                'title_suffix',
                'subspecialist',
                'job_category',
                'str_institution',
                'str_expiry',
                'str_lifetime',
                'sip_institution',
                'sip_expiry',
                'consultation_duration',
                'weekly_schedules',
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
