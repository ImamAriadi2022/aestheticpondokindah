<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_visits', function (Blueprint $table) {
            $table->id();
            $table->string('visitor_id', 64)->nullable();
            $table->string('source', 50)->nullable();
            $table->string('medium', 50)->nullable();
            $table->string('campaign', 100)->nullable();
            $table->text('referrer')->nullable();
            $table->string('landing_page', 255);
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('visited_at');
            $table->timestamps();

            $table->index(['visited_at']);
            $table->index(['source', 'visited_at']);
            $table->index(['visitor_id', 'visited_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_visits');
    }
};
