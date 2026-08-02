<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'str_number')) {
                $table->string('str_number')->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'sip_number')) {
                $table->string('sip_number')->nullable()->after('str_number');
            }
            if (!Schema::hasColumn('users', 'specialization')) {
                $table->string('specialization')->nullable()->after('sip_number');
            }
            if (!Schema::hasColumn('users', 'education')) {
                $table->string('education')->nullable()->after('specialization');
            }
            if (!Schema::hasColumn('users', 'experience_years')) {
                $table->string('experience_years')->nullable()->after('education');
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('experience_years');
            }
            if (!Schema::hasColumn('users', 'primary_branch')) {
                $table->string('primary_branch')->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'consultation_fee')) {
                $table->decimal('consultation_fee', 12, 2)->nullable()->default(250000)->after('primary_branch');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = [];
            foreach (['str_number', 'sip_number', 'specialization', 'education', 'experience_years', 'bio', 'primary_branch', 'consultation_fee'] as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $columns[] = $col;
                }
            }
            if (!empty($columns)) {
                $table->dropColumn($columns);
            }
        });
    }
};
