<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$startTime = microtime(true);

Schema::create('wilayah', function ($table) {
    $table->string('kode', 13)->primary();
    $table->string('nama', 100);
    $table->index('nama');
});

$sqlPath = base_path('wilayah/db/wilayah.sql');
$handle = fopen($sqlPath, 'r');
if (!$handle) {
    die("Failed to open file: $sqlPath\n");
}

$chunk = [];
$total = 0;
DB::table('wilayah')->truncate();

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

$elapsed = round(microtime(true) - $startTime, 2);
echo "Successfully seeded $total records in $elapsed seconds!\n";
echo "DB Count: " . DB::table('wilayah')->count() . "\n";
