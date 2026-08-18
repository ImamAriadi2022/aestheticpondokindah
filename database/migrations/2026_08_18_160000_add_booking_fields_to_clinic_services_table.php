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
        Schema::table('clinic_services', function (Blueprint $table) {
            if (!Schema::hasColumn('clinic_services', 'category')) {
                $table->string('category')->nullable()->default('Umum')->after('slug');
            }
            if (!Schema::hasColumn('clinic_services', 'price')) {
                $table->decimal('price', 12, 2)->nullable()->default(500000)->after('intro');
            }
            if (!Schema::hasColumn('clinic_services', 'duration')) {
                $table->string('duration')->nullable()->default('45–60 mnt')->after('price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinic_services', function (Blueprint $table) {
            $cols = [];
            foreach (['category', 'price', 'duration'] as $c) {
                if (Schema::hasColumn('clinic_services', $c)) {
                    $cols[] = $c;
                }
            }
            if (!empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
