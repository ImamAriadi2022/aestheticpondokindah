<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('invoices')) {
            Schema::create('invoices', function (Blueprint $table) {
                $table->id();
                $table->string('invoice_number')->unique();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('membership_transaction_id')->nullable()->constrained('membership_transactions')->nullOnDelete();
                $table->string('target_level');
                $table->decimal('amount', 12, 2);
                $table->string('status')->default('unpaid'); // unpaid, paid, cancelled, expired
                $table->string('description');
                $table->timestamp('invoice_date');
                $table->timestamp('due_date');
                $table->json('payment_details')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
