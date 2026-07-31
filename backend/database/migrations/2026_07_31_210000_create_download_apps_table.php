<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('download_apps', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('version')->nullable();
            $table->string('platform')->nullable();
            $table->string('apk_path')->nullable();
            $table->string('download_link')->nullable();
            $table->bigInteger('file_size')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_development')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('download_apps');
    }
};
