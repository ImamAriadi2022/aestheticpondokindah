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
            if (!Schema::hasColumn('reservations', 'redeem_points')) {
                $table->integer('redeem_points')->default(0)->after('payment_status');
            }
            if (!Schema::hasColumn('reservations', 'point_discount')) {
                $table->decimal('point_discount', 12, 2)->default(0)->after('redeem_points');
            }
            if (!Schema::hasColumn('reservations', 'service_price')) {
                $table->decimal('service_price', 12, 2)->default(0)->after('point_discount');
            }
            if (!Schema::hasColumn('reservations', 'final_price')) {
                $table->decimal('final_price', 12, 2)->default(0)->after('service_price');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $columns = ['redeem_points', 'point_discount', 'service_price', 'final_price'];
            foreach ($columns as $column) {
                if (Schema::hasColumn('reservations', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
