<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Change status column from enum to string or expanded enum
        DB::statement("ALTER TABLE `membership_transactions` MODIFY COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE `membership_transactions` MODIFY COLUMN `status` ENUM('pending','completed','cancelled','refunded') NOT NULL DEFAULT 'completed'");
    }
};
