<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('old_level', ['gold', 'platinum', 'diamond', 'none'])->nullable();
            $table->enum('new_level', ['gold', 'platinum', 'diamond']);
            $table->string('reason')->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('new_level');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_histories');
    }
};
