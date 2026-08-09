<?php
$sqlPath = dirname(__DIR__) . '/wilayah/db/wilayah.sql';
if (!file_exists($sqlPath)) {
    echo "SQL file not found at $sqlPath\n";
    exit(1);
}

$lines = file($sqlPath);
$countProv = 0;
$countKab = 0;
$countKec = 0;
$countDesa = 0;

foreach ($lines as $line) {
    if (preg_match_all("/\('([^']+)',\s*'([^']+)'\)/", $line, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $m) {
            $kode = $m[1];
            $len = strlen($kode);
            if ($len === 2) $countProv++;
            elseif ($len === 5) $countKab++;
            elseif ($len === 8) $countKec++;
            elseif ($len === 13) $countDesa++;
        }
    }
}

echo "Provinces (len 2): $countProv\n";
echo "Regencies/Cities (len 5): $countKab\n";
echo "Districts (len 8): $countKec\n";
echo "Villages (len 13): $countDesa\n";
echo "Total records parsed: " . ($countProv + $countKab + $countKec + $countDesa) . "\n";
