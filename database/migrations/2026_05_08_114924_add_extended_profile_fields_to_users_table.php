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
        Schema::table('users', function (Blueprint $table) {
            $table->date('birth_date')->nullable()->after('whatsapp');
            $table->string('gender', 20)->nullable()->after('birth_date');
            $table->string('blood_type', 5)->nullable()->after('gender');
            $table->string('job')->nullable()->after('blood_type');
            $table->string('province')->nullable()->after('address_line');
            $table->string('district')->nullable()->after('city');
            $table->json('interests')->nullable()->after('district');
            $table->boolean('is_coffee_drinker')->nullable()->default(false)->after('interests');
            $table->boolean('is_smoker')->nullable()->default(false)->after('is_coffee_drinker');
            $table->string('source_info')->nullable()->after('is_smoker');
            $table->string('insurance_provider')->nullable()->after('source_info');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'birth_date',
                'gender',
                'blood_type',
                'job',
                'province',
                'district',
                'interests',
                'is_coffee_drinker',
                'is_smoker',
                'source_info',
                'insurance_provider',
            ]);
        });
    }
};
