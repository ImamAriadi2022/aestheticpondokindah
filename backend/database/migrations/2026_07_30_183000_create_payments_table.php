<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->string('payment_number')->unique();
                $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('gateway_name')->default('simulation');
                $table->string('gateway_reference')->unique();
                $table->decimal('amount', 12, 2);
                $table->string('payment_method')->default('qris');
                $table->string('status')->default('pending'); // pending, settlement, expire, cancel, deny, failure
                $table->json('gateway_response')->nullable();
                $table->timestamp('settled_at')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
