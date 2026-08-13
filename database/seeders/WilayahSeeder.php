<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WilayahSeeder extends Seeder
{
    /**
     * Run the database seeds for Indonesia regions (Kepmendagri terbaru).
     */
    public function run(): void
    {
        $sqlPath = base_path('wilayah/db/wilayah.sql');
        
        if (!file_exists($sqlPath)) {
            if (isset($this->command)) {
                $this->command->warn("File SQL wilayah tidak ditemukan di: {$sqlPath}. Menggunakan data database wilayah yang sudah ada. Seeding dilewati secara aman.");
            }
            return;
        }

        if (!Schema::hasTable('wilayah')) {
            Schema::create('wilayah', function ($table) {
                $table->string('kode', 13)->primary();
                $table->string('nama', 100);
                $table->index('nama');
            });
        }

        if (isset($this->command)) {
            $this->command->info('Memulai seeding data Wilayah Indonesia...');
        }
        
        Schema::disableForeignKeyConstraints();
        DB::table('wilayah')->truncate();

        $handle = fopen($sqlPath, 'r');
        if (!$handle) {
            if (isset($this->command)) {
                $this->command->error("Gagal membuka file: {$sqlPath}");
            }
            return;
        }

        $chunk = [];
        $total = 0;

        while (($line = fgets($handle)) !== false) {
            if (strpos($line, "VALUES") !== false || strpos($line, "('") !== false) {
                if (preg_match_all("/\('([^']+)',\s*'((?:[^']|'')+)'\)/", $line, $matches, PREG_SET_ORDER)) {
                    foreach ($matches as $m) {
                        $kode = $m[1];
                        $nama = str_replace("''", "'", $m[2]);
                        $chunk[] = [
                            'kode' => $kode,
                            'nama' => $nama,
                        ];
                        $total++;

                        if (count($chunk) >= 1000) {
                            DB::table('wilayah')->insert($chunk);
                            $chunk = [];
                        }
                    }
                }
            }
        }
        fclose($handle);

        if (!empty($chunk)) {
            DB::table('wilayah')->insert($chunk);
        }

        Schema::enableForeignKeyConstraints();

        if (isset($this->command)) {
            $this->command->info("Berhasil mengimpor {$total} data Wilayah Indonesia.");
        }
    }
}
