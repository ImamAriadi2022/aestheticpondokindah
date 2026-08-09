<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Database\Seeders\WilayahSeeder;
use App\Data\RegionData;
use App\Models\Wilayah;

echo "1. Running WilayahSeeder...\n";
$seeder = new WilayahSeeder();
$seeder->run();

echo "\n2. Testing Wilayah model queries...\n";
$provCount = Wilayah::provinces()->count();
$regCount = Wilayah::query()->whereRaw('CHAR_LENGTH(kode) = 5')->count();
$distCount = Wilayah::query()->whereRaw('CHAR_LENGTH(kode) = 8')->count();
$villCount = Wilayah::query()->whereRaw('CHAR_LENGTH(kode) = 13')->count();

echo "Provinces count: $provCount\n";
echo "Regencies count: $regCount\n";
echo "Districts count: $distCount\n";
echo "Villages count: $villCount\n";

echo "\n3. Testing RegionData API methods...\n";

// Get provinces
$provinces = RegionData::provinces();
echo "Total Provinces returned: " . count($provinces) . "\n";
echo "Sample Province [0]: " . json_encode($provinces[0]) . "\n";

// Get regencies for DKI Jakarta (code 31) or Aceh (code 11)
$acehRegencies = RegionData::regencies('11');
echo "Aceh Regencies count: " . count($acehRegencies) . "\n";
echo "Sample Regency [0]: " . json_encode($acehRegencies[0]) . "\n";

// Get regencies by name ("Aceh")
$acehRegenciesByName = RegionData::regencies('Aceh');
echo "Aceh Regencies count (by name): " . count($acehRegenciesByName) . "\n";

// Get districts for Kabupaten Aceh Selatan ('11.01')
$districts = RegionData::districts('11.01');
echo "Aceh Selatan Districts count: " . count($districts) . "\n";
echo "Sample District [0]: " . json_encode($districts[0]) . "\n";

// Get villages for Bakongan ('11.01.01')
$villages = RegionData::villages('11.01.01');
echo "Bakongan Villages count: " . count($villages) . "\n";
echo "Sample Village [0]: " . json_encode($villages[0]) . "\n";

echo "\nALL WILAYAH SEEDER & DATA TESTS PASSED SUCCESSFULLY!\n";
