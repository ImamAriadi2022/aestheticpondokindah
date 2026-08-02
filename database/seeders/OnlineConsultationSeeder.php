<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Kept only for backwards compatibility with older local development commands.
 * Consultation data must always originate from real user/guest submissions,
 * never be generated during a production seed.
 */
class OnlineConsultationSeeder extends Seeder
{
    public function run(): void
    {
        $this->command?->warn('OnlineConsultationSeeder dinonaktifkan: data konsultasi demo tidak dibuat.');
    }
}
