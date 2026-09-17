<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            if (!Schema::hasColumn('promos', 'headline')) {
                $table->string('headline')->nullable()->after('title');
            }

            if (!Schema::hasColumn('promos', 'discount_text')) {
                $table->string('discount_text')->nullable()->after('description');
            }

            if (!Schema::hasColumn('promos', 'target_tier')) {
                $table->string('target_tier')->nullable()->after('category');
            }
        });
    }

    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table) {
            foreach (['headline', 'discount_text', 'target_tier'] as $column) {
                if (Schema::hasColumn('promos', $column)) {
                    $table->dropColumn($column);
                }
            }
        });
    }
};
