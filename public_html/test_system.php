<?php
/**
 * System Diagnostics & Fullstack Integration Tester
 * Aesthetic Pondok Indah Dental Clinic
 * Akses via Browser: https://domain-anda.com/test_system.php
 */

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$results = [
    'frontend' => [],
    'backend' => [],
    'database' => [],
    'storage' => [],
    'overall' => true,
    'passed_count' => 0,
    'total_count' => 0,
];

function addTestResult(&$group, $title, $passed, $message, $meta = '') {
    global $results;
    $results['total_count']++;
    if ($passed) $results['passed_count']++;
    else $results['overall'] = false;

    $group[] = [
        'title' => $title,
        'passed' => $passed,
        'message' => $message,
        'meta' => $meta
    ];
}

// 1. Dapatkan Path Root & Public
$publicHtmlDir = __DIR__;
$backendDir = null;

// Cari lokasi root Laravel secara dinamis (arsitektur baru: backend di root repo).
// File ini dideploy di public_html/ (webroot) dan disalin dari public/ Laravel,
// sehingga root Laravel berada di __DIR__ (saat dideploy di root) atau
// dirname(__DIR__) (saat file berada di dalam folder public_html/).
$possibleBackendPaths = [
    __DIR__,
    dirname(__DIR__),
    dirname(dirname(__DIR__)),
];

foreach ($possibleBackendPaths as $path) {
    if (
        is_dir($path)
        && file_exists($path . '/artisan')
        && file_exists($path . '/bootstrap/app.php')
        && is_dir($path . '/vendor')
    ) {
        $backendDir = realpath($path);
        break;
    }
}

// ==================== A. FRONTEND TESTS ====================
// Test 1: index.html
$hasIndexHtml = file_exists($publicHtmlDir . '/index.html');
addTestResult(
    $results['frontend'],
    'File Utama index.html',
    $hasIndexHtml,
    $hasIndexHtml ? 'index.html ditemukan dan siap melayani pengunjung' : 'File index.html tidak ditemukan di folder web root',
    'Path: ' . basename($publicHtmlDir) . '/index.html'
);

// Test 2: .htaccess SPA Rewrite
$hasHtaccess = file_exists($publicHtmlDir . '/.htaccess');
addTestResult(
    $results['frontend'],
    'Konfigurasi Routing (.htaccess)',
    $hasHtaccess,
    $hasHtaccess ? '.htaccess aktif untuk Single Page Application (SPA)' : 'File .htaccess tidak ditemukan. Routing halaman mungkin Error 404.',
    'Path: ' . basename($publicHtmlDir) . '/.htaccess'
);

// Test 3: Asset Bundles (Vite Build)
$hasAssetsDir = is_dir($publicHtmlDir . '/assets');
$assetFilesCount = $hasAssetsDir ? count(glob($publicHtmlDir . '/assets/*.js')) : 0;
$hasAssetBundles = $hasAssetsDir && $assetFilesCount > 0;
addTestResult(
    $results['frontend'],
    'Bundle JS/CSS (Vite Build)',
    $hasAssetBundles,
    $hasAssetBundles ? "Ditemukan $assetFilesCount file Javascript/CSS hasil build produksi" : 'Folder assets kosong atau belum di-build',
    'Asset Count: ' . $assetFilesCount . ' JS Files'
);

// Test 4: Folder Media/Gambar Utama
$mediaFolders = ['dokter', 'carousels', 'galeri', 'about'];
$missingFolders = [];
foreach ($mediaFolders as $mf) {
    if (!is_dir($publicHtmlDir . '/' . $mf) && !is_dir(dirname($publicHtmlDir) . '/' . $mf)) {
        $missingFolders[] = $mf;
    }
}
$hasMediaFolders = empty($missingFolders);
addTestResult(
    $results['frontend'],
    'Folder Media & Asset Gambar',
    $hasMediaFolders,
    $hasMediaFolders ? 'Seluruh folder media gambar (dokter, carousels, galeri, about) lengkap' : 'Folder media berikut tidak ditemukan: ' . implode(', ', $missingFolders),
    'Folders Checked: ' . implode(', ', $mediaFolders)
);


// ==================== B. BACKEND TESTS ====================
// Test 5: Folder Backend
$hasBackend = $backendDir !== null;
addTestResult(
    $results['backend'],
    'Struktur Root Laravel',
    $hasBackend,
    $hasBackend ? 'Root Laravel terdeteksi di ' . '.../' . basename(dirname($backendDir ?? '')) . '/' . basename($backendDir ?? '') : 'Root Laravel tidak ditemukan',
    $hasBackend ? realpath($backendDir) : ''
);

// Test 6: File .env
$envPath = $backendDir ? $backendDir . '/.env' : null;
$hasEnv = $envPath && file_exists($envPath);
addTestResult(
    $results['backend'],
    'File Konfigurasi (.env)',
    $hasEnv,
    $hasEnv ? 'File environment .env root Laravel tersedia' : 'File .env belum dibuat di root Laravel. Silakan rename .env.example menjadi .env',
    'Path: .env (root Laravel)'
);

// Test 7: Vendor Autoload
$vendorPath = $backendDir ? $backendDir . '/vendor/autoload.php' : null;
$hasVendor = $vendorPath && file_exists($vendorPath);
addTestResult(
    $results['backend'],
    'Library Composer (vendor)',
    $hasVendor,
    $hasVendor ? 'Folder vendor autoload tersedia dan terpasang' : 'Folder vendor belum ada. Upload vendor.zip atau jalankan composer install di Plesk',
    'Path: vendor/autoload.php (root Laravel)'
);

// Test 11: Direct API Endpoint Response
$protocol = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https') ? 'https' : 'http';
$apiTestUrl = $protocol . '://' . ($_SERVER['HTTP_HOST'] ?? 'localhost') . '/api/public/posts';
$apiPassed = false;
$apiMsg = '';

$ch = curl_init($apiTestUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 5);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 DiagnosticTester');
$apiBody = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
curl_close($ch);

if ($httpCode === 200 && str_contains(strtolower($contentType ?? ''), 'json')) {
    $apiPassed = true;
    $apiMsg = 'API Endpoint Backend merespons JSON 200 OK dengan sukses!';
} else {
    $apiPassed = false;
    $apiMsg = 'API Endpoint merespons HTTP ' . $httpCode . ' (' . ($contentType ?: 'Format HTML/Teks') . ').' ;
}
$apiMeta = 'URL: ' . $apiTestUrl . ' | Snippet: ' . substr(strip_tags($apiBody ?? ''), 0, 75);

addTestResult(
    $results['backend'],
    'Respon API Endpoint Backend (/api)',
    $apiPassed,
    $apiMsg,
    $apiMeta
);


// ==================== C. DATABASE TESTS ====================
$pdo = null;
$dbConfig = [];
if ($hasEnv) {
    $envContent = file_get_contents($envPath);
    preg_match('/DB_HOST=(.*)/', $envContent, $mHost);
    preg_match('/DB_PORT=(.*)/', $envContent, $mPort);
    preg_match('/DB_DATABASE=(.*)/', $envContent, $mDb);
    preg_match('/DB_USERNAME=(.*)/', $envContent, $mUser);
    preg_match('/DB_PASSWORD=(.*)/', $envContent, $mPass);

    $dbConfig['host'] = trim($mHost[1] ?? '127.0.0.1', "\"'\r\n");
    $dbConfig['port'] = trim($mPort[1] ?? '3306', "\"'\r\n");
    $dbConfig['database'] = trim($mDb[1] ?? '', "\"'\r\n");
    $dbConfig['username'] = trim($mUser[1] ?? '', "\"'\r\n");
    $dbConfig['password'] = trim($mPass[1] ?? '', "\"'\r\n");
}

// Test 8: Koneksi MySQL PDO
$dbConnected = false;
$dbErrorMsg = '';
if (!empty($dbConfig['database']) && !empty($dbConfig['username'])) {
    try {
        $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
        $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [PDO::ATTR_TIMEOUT => 3]);
        $dbConnected = true;
    } catch (Throwable $e) {
        $dbErrorMsg = $e->getMessage();
    }
}
addTestResult(
    $results['database'],
    'Koneksi Database MySQL',
    $dbConnected,
    $dbConnected ? 'Koneksi ke database `' . htmlspecialchars($dbConfig['database']) . '` BERHASIL' : ($dbErrorMsg ? 'Gagal terkoneksi: ' . htmlspecialchars($dbErrorMsg) : 'Kredensial database belum dikonfigurasi di file .env'),
    'Host: ' . ($dbConfig['host'] ?? '-')
);

// Test 9: Integritas Tabel Database
$requiredTables = ['users', 'reservations', 'doctor_schedules', 'promos', 'consultations', 'complaints'];
$existingTables = [];
$missingTables = [];

if ($pdo) {
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        foreach ($requiredTables as $rt) {
            if (in_array($rt, $tables)) {
                $existingTables[] = $rt;
            } else {
                $missingTables[] = $rt;
            }
        }
    } catch (Throwable $e) {
        $missingTables = $requiredTables;
    }
}
$tablesValid = $dbConnected && empty($missingTables);
addTestResult(
    $results['database'],
    'Tabel-tabel Database Laravel',
    $tablesValid,
    $tablesValid ? 'Seluruh tabel utama (users, reservations, doctor_schedules, dll) LENGKAP' : ($dbConnected ? 'Tabel belum ada. Jalankan migrasi di setup_backend.php (Tabel hilang: ' . implode(', ', $missingTables) . ')' : 'Database belum terhubung'),
    'Tabel Terdeteksi: ' . count($existingTables) . '/' . count($requiredTables)
);


// ==================== D. STORAGE TESTS ====================
// Test 10: Storage Link Symlink
$storageLinkPath = $publicHtmlDir . '/storage';
$hasStorageLink = is_link($storageLinkPath) || is_dir($storageLinkPath);
addTestResult(
    $results['storage'],
    'Shortcut Storage Upload (Symlink)',
    $hasStorageLink,
    $hasStorageLink ? 'Folder shortcut storage terhubung untuk menampilkan gambar upload' : 'Shortcut storage belum dibuat. Akses create_storage_link.php untuk menghubungkan',
    'Path: ' . basename($publicHtmlDir) . '/storage'
);

$healthPercentage = round(($results['passed_count'] / max($results['total_count'], 1)) * 100);
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Uji Sistem Fullstack - Aesthetic Pondok Indah</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0b1329;
            --card-bg: #151f38;
            --card-border: #233154;
            --primary: #0ea5e9;
            --primary-hover: #0284c7;
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; padding: 40px 20px; display: flex; justify-content: center; }
        
        .dashboard-container { width: 100%; max-width: 820px; }

        .header-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 28px; margin-bottom: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 20px; }
        
        .header-title h1 { font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }
        .header-title p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .score-box { background: rgba(11, 19, 41, 0.8); border: 1px solid var(--card-border); border-radius: 16px; padding: 14px 24px; text-align: center; display: flex; align-items: center; gap: 16px; }
        .score-number { font-size: 32px; font-weight: 800; color: <?= $healthPercentage >= 90 ? '#34d399' : ($healthPercentage >= 60 ? '#fbbf24' : '#f87171') ?>; }
        .score-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }

        .progress-bar-bg { width: 100%; height: 8px; background: rgba(255, 255, 255, 0.08); border-radius: 99px; margin-top: 16px; overflow: hidden; }
        .progress-bar-fill { height: 100%; width: <?= $healthPercentage ?>%; background: <?= $healthPercentage >= 90 ? 'linear-gradient(90deg, #10b981, #34d399)' : ($healthPercentage >= 60 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)') ?>; transition: width 1s ease; }

        .section-title { font-size: 15px; font-weight: 700; color: #38bdf8; margin: 24px 0 12px 0; display: flex; align-items: center; gap: 8px; }
        
        .test-grid { display: flex; flex-direction: column; gap: 10px; }
        .test-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 14px; padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        
        .test-info { flex: 1; min-width: 0; }
        .test-name { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .test-desc { font-size: 12.5px; color: var(--text-muted); margin-top: 3px; line-height: 1.4; }
        .test-meta { font-size: 11px; color: #64748b; margin-top: 4px; font-family: monospace; }

        .badge-status { font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 99px; white-space: nowrap; flex-shrink: 0; }
        .badge-pass { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
        .badge-fail { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); }

        .actions-footer { margin-top: 32px; display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .btn { padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-refresh { background: #0ea5e9; color: white; }
        .btn-refresh:hover { background: #0284c7; }
        .btn-setup { background: #334155; color: #e2e8f0; border: 1px solid var(--card-border); }
        .btn-setup:hover { background: #475569; }
    </style>
</head>
<body>
    <div class="dashboard-container">
        <!-- Header & Health Score -->
        <div class="header-card">
            <div class="header-title">
                <h1>🔍 Diagnostic System Test</h1>
                <p>Pengujian Integrasi Fullstack (React JS + Laravel Backend)</p>
            </div>

            <div class="score-box">
                <div>
                    <div class="score-number"><?= $healthPercentage ?>%</div>
                    <div class="score-label">Kesehatan Sistem</div>
                </div>
            </div>

            <div style="width: 100%;">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill"></div>
                </div>
            </div>
        </div>

        <!-- Section 1: FRONTEND -->
        <div class="section-title">💻 1. Pengujian Frontend & Static Assets</div>
        <div class="test-grid">
            <?php foreach ($results['frontend'] as $test): ?>
                <div class="test-card">
                    <div class="test-info">
                        <div class="test-name"><?= htmlspecialchars($test['title']) ?></div>
                        <div class="test-desc"><?= htmlspecialchars($test['message']) ?></div>
                        <?php if ($test['meta']): ?><div class="test-meta"><?= htmlspecialchars($test['meta']) ?></div><?php endif; ?>
                    </div>
                    <div class="badge-status <?= $test['passed'] ? 'badge-pass' : 'badge-fail' ?>">
                        <?= $test['passed'] ? '✓ LULUS' : '✗ GAGAL' ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Section 2: BACKEND -->
        <div class="section-title">⚙️ 2. Pengujian Framework Backend (Laravel)</div>
        <div class="test-grid">
            <?php foreach ($results['backend'] as $test): ?>
                <div class="test-card">
                    <div class="test-info">
                        <div class="test-name"><?= htmlspecialchars($test['title']) ?></div>
                        <div class="test-desc"><?= htmlspecialchars($test['message']) ?></div>
                        <?php if ($test['meta']): ?><div class="test-meta"><?= htmlspecialchars($test['meta']) ?></div><?php endif; ?>
                    </div>
                    <div class="badge-status <?= $test['passed'] ? 'badge-pass' : 'badge-fail' ?>">
                        <?= $test['passed'] ? '✓ LULUS' : '✗ GAGAL' ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Section 3: DATABASE -->
        <div class="section-title">🗄️ 3. Pengujian Database MySQL & Tabel</div>
        <div class="test-grid">
            <?php foreach ($results['database'] as $test): ?>
                <div class="test-card">
                    <div class="test-info">
                        <div class="test-name"><?= htmlspecialchars($test['title']) ?></div>
                        <div class="test-desc"><?= htmlspecialchars($test['message']) ?></div>
                        <?php if ($test['meta']): ?><div class="test-meta"><?= htmlspecialchars($test['meta']) ?></div><?php endif; ?>
                    </div>
                    <div class="badge-status <?= $test['passed'] ? 'badge-pass' : 'badge-fail' ?>">
                        <?= $test['passed'] ? '✓ LULUS' : '✗ GAGAL' ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Section 4: STORAGE -->
        <div class="section-title">🖼️ 4. Pengujian Upload & Storage Link</div>
        <div class="test-grid">
            <?php foreach ($results['storage'] as $test): ?>
                <div class="test-card">
                    <div class="test-info">
                        <div class="test-name"><?= htmlspecialchars($test['title']) ?></div>
                        <div class="test-desc"><?= htmlspecialchars($test['message']) ?></div>
                        <?php if ($test['meta']): ?><div class="test-meta"><?= htmlspecialchars($test['meta']) ?></div><?php endif; ?>
                    </div>
                    <div class="badge-status <?= $test['passed'] ? 'badge-pass' : 'badge-fail' ?>">
                        <?= $test['passed'] ? '✓ LULUS' : '✗ GAGAL' ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Action Footer -->
        <div class="actions-footer">
            <a href="test_system.php" class="btn btn-refresh">🔄 Jalankan Pengujian Ulang</a>
            <a href="setup_backend.php" class="btn btn-setup">⚡ Buka Setup Backend Control Center</a>
        </div>
    </div>
</body>
</html>
