<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            // Allow guest (anonymous) consultations: no registered user required.
            $table->dropForeign(['user_id']);
            $table->unsignedBigInteger('user_id')->nullable()->change();

            $table->string('guest_name')->nullable()->after('user_id');
            $table->string('guest_phone')->nullable()->after('guest_name');
            $table->string('guest_email')->nullable()->after('guest_phone');
            $table->string('access_token')->nullable()->unique()->after('guest_email');

            // Admin who currently handles the consultation (accept / transfer).
            $table->unsignedBigInteger('admin_id')->nullable()->after('doctor_id');

            // Link scheduled consultations to the originating reservation
            // so the doctor can drive Visit + Medical Record from the chat room.
            $table->unsignedBigInteger('reservation_id')->nullable()->after('doctor_schedule_id');

            // Visit created when the doctor starts a scheduled consultation.
            $table->unsignedBigInteger('visit_id')->nullable()->after('reservation_id');

            $table->enum('status', ['Menunggu', 'Dijadwalkan', 'Dibuka', 'Selesai', 'Ditolak'])
                ->default('Menunggu')
                ->change();
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('admin_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('reservation_id')->references('id')->on('reservations')->nullOnDelete();
            $table->foreign('visit_id')->references('id')->on('visits')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('consultations', function (Blueprint $table) {
            $table->dropForeign(['visit_id']);
            $table->dropForeign(['reservation_id']);
            $table->dropForeign(['admin_id']);
            $table->dropForeign(['user_id']);

            $table->dropColumn(['visit_id', 'reservation_id', 'admin_id', 'access_token', 'guest_email', 'guest_phone', 'guest_name']);

            $table->enum('status', ['Menunggu', 'Dijadwalkan', 'Selesai'])
                ->default('Menunggu')
                ->change();

            $table->unsignedBigInteger('user_id')->nullable(false)->change();
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }
};
