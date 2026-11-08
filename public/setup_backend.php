<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cari lokasi root Laravel secara dinamis (arsitektur baru: backend di root repo).
// File ini dideploy di public_html/ (webroot) dan disalin dari public/ Laravel,
// sehingga root Laravel berada di __DIR__ (saat dideploy di root) atau
// dirname(__DIR__) (saat file berada di dalam folder public_html/).
function findLaravelRoot()
{
    $candidates = [
        __DIR__,
        dirname(__DIR__),
        dirname(dirname(__DIR__)),
    ];
    foreach ($candidates as $dir) {
        if (
            is_dir($dir)
            && file_exists($dir . '/artisan')
            && file_exists($dir . '/bootstrap/app.php')
            && is_dir($dir . '/vendor')
        ) {
            return realpath($dir);
        }
    }
    return null;
}

$backendDir = findLaravelRoot();

// System Health Checks
$phpVersion = PHP_VERSION;
$isPhpValid = version_compare($phpVersion, '8.2.0', '>=');

$hasBackendFolder = $backendDir !== null;
$shortBackendPath = $backendDir ? '.../' . basename(dirname($backendDir)) . '/' . basename($backendDir) : 'Tidak ditemukan';

$envPath = $backendDir ? $backendDir . '/.env' : null;
$hasEnvFile = $envPath && file_exists($envPath);
$hasAppKey = false;

// Auto-Ensure APP_KEY ada di .env
if ($hasEnvFile) {
    $envRaw = @file_get_contents($envPath);
    if (!preg_match('/^APP_KEY=(.+)$/m', (string)$envRaw, $km) || empty(trim($km[1]))) {
        $newKey = 'base64:' . base64_encode(random_bytes(32));
        if (preg_match('/^APP_KEY=/m', (string)$envRaw)) {
            $envRaw = preg_replace('/^APP_KEY=.*$/m', "APP_KEY={$newKey}", $envRaw);
        } else {
            $envRaw = "APP_KEY={$newKey}\n" . $envRaw;
        }
        @file_put_contents($envPath, $envRaw);
        // Hapus stale cache config agar APP_KEY terbaca
        if ($backendDir) {
            @unlink($backendDir . '/bootstrap/cache/config.php');
        }
        $hasAppKey = true;
    } else {
        $hasAppKey = true;
    }
}

$vendorPath = $backendDir ? $backendDir . '/vendor/autoload.php' : null;
$hasVendor = $vendorPath && file_exists($vendorPath);

// Cek Kredensial Database
$dbStatus = "UNCONFIGURED";
$dbError = null;
$dbConfig = [];

if ($hasEnvFile) {
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

    if (!empty($dbConfig['database']) && !empty($dbConfig['username'])) {
        try {
            $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['database']}";
            $pdo = new PDO($dsn, $dbConfig['username'], $dbConfig['password'], [PDO::ATTR_TIMEOUT => 3]);
            $dbStatus = "CONNECTED";
        } catch (Throwable $e) {
            $dbStatus = "FAILED";
            $dbError = $e->getMessage();
        }
    }
}

// Action Handlers
$actionLog = null;
$actionSuccess = false;

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === 'setup_db' && $hasVendor && $hasEnvFile) {
        try {
            // Bersihkan file cache konfigurasi / routing basi sebelum bootstrap
            @unlink($backendDir . '/bootstrap/cache/config.php');
            @unlink($backendDir . '/bootstrap/cache/routes-v7.php');
            @unlink($backendDir . '/bootstrap/cache/services.php');
            @unlink($backendDir . '/bootstrap/cache/packages.php');

            // Siapkan direktori storage & permissions
            $dirs = [
                $backendDir . '/storage/app/public',
                $backendDir . '/storage/framework/cache',
                $backendDir . '/storage/framework/sessions',
                $backendDir . '/storage/framework/views',
                $backendDir . '/storage/logs',
                $backendDir . '/bootstrap/cache',
            ];
            foreach ($dirs as $d) {
                if (!file_exists($d)) @mkdir($d, 0777, true);
                @chmod($d, 0777);
            }

            require $vendorPath;
            $app = require_once $backendDir . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

            $output = new Symfony\Component\Console\Output\BufferedOutput();
            $kernel->call('key:generate', ['--force' => true], $output);
            $kernel->call('migrate', ['--force' => true], $output);
            $kernel->call('db:seed', ['--force' => true], $output);
            $kernel->call('optimize:clear', [], $output);

            $actionLog = $output->fetch();
            $actionSuccess = true;
        } catch (Throwable $e) {
            $actionLog = "Gagal Eksekusi: " . $e->getMessage();
        }
    } elseif ($action === 'link_storage') {
        $target = $backendDir . '/storage/app/public';
        $link = (realpath(__DIR__) === $backendDir)
            ? $backendDir . '/public/storage'
            : __DIR__ . '/storage';

        if (!file_exists($target)) {
            @mkdir($target, 0777, true);
        }

        if (is_link($link)) {
            @unlink($link);
        }

        $symlinkOk = false;
        if (!file_exists($link)) {
            $symlinkOk = @symlink($target, $link);
        }

        if ($symlinkOk || is_dir($link)) {
            $actionLog = "SUCCESS: Storage public siap dan terhubung!";
            $actionSuccess = true;
        } else {
            $actionLog = "Storage sudah terhubung atau folder storage fisik aktif.";
            $actionSuccess = true;
        }
    } elseif ($action === 'test_api') {
        try {
            ini_set('display_errors', 1);
            error_reporting(E_ALL);
            require $vendorPath;
            $app = require_once $backendDir . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
            $req = Illuminate\Http\Request::create('/api/public/posts', 'GET');
            $req->headers->set('Accept', 'application/json');
            $response = $kernel->handle($req);
            $actionLog = "STATUS CODE: " . $response->getStatusCode() . "\n"
                       . "HEADERS: " . json_encode($response->headers->all(), JSON_PRETTY_PRINT) . "\n\n"
                       . "CONTENT BODY:\n" . substr($response->getContent(), 0, 1500);
            $actionSuccess = ($response->getStatusCode() === 200);
        } catch (\Throwable $e) {
            $actionLog = "FATAL ERROR / EXCEPTION:\n"
                       . "Class: " . get_class($e) . "\n"
                       . "Message: " . $e->getMessage() . "\n"
                       . "File: " . $e->getFile() . ":" . $e->getLine() . "\n\n"
                       . "Stack Trace:\n" . $e->getTraceAsString();
        }
    } elseif ($action === 'view_log') {
        $logPath = $backendDir . '/storage/logs/laravel.log';
        if (file_exists($logPath) && is_readable($logPath)) {
            $raw = file($logPath);
            $actionLog = "LOG FILE: " . $logPath . " (" . count($raw) . " lines)\n\n"
                       . implode("", array_slice($raw, -60));
            $actionSuccess = true;
        } else {
            $actionLog = "storage/logs/laravel.log belum ada atau tidak dapat dibaca.";
        }
    } elseif ($action === 'sync_to_root') {
        $sourceDir = __DIR__;
        $targetDir = dirname(__DIR__);
        $copied = 0;
        $failed = 0;
        if (is_dir($sourceDir) && is_dir($targetDir) && $sourceDir !== $targetDir) {
            $filesToCopy = ['api.php', '.htaccess', 'index.html', 'index.php', 'setup_backend.php', 'test_system.php'];
            foreach ($filesToCopy as $f) {
                $src = $sourceDir . '/' . $f;
                $dst = $targetDir . '/' . $f;
                if (file_exists($src)) {
                    if (@copy($src, $dst)) $copied++;
                    else $failed++;
                }
            }
            $actionLog = "SYNC SELESAI: Berhasil menyalin $copied file penting dari public/ ke folder root ($targetDir). Gagal: $failed.";
            $actionSuccess = true;
        } else {
            $actionLog = "Folder source dan target sama.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Kontrol Deployment - Aesthetic Pondok Indah</title>
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
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        
        .installer-card { width: 100%; max-width: 680px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        
        .brand { text-align: center; margin-bottom: 28px; }
        .brand-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 99px; font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 12px; }
        .brand h1 { font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }
        .brand p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .diagnostics-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
        .diag-item { background: rgba(11, 19, 41, 0.6); border: 1px solid var(--card-border); border-radius: 12px; padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        
        .diag-meta { min-width: 0; flex: 1; }
        .diag-title { font-size: 14px; font-weight: 600; color: var(--text-main); }
        .diag-sub { font-size: 12px; color: var(--text-muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 380px; }

        .status-pill { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; font-size: 12px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
        .pill-success { background: rgba(16, 185, 129, 0.12); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.25); }
        .pill-danger { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.25); }
        .pill-warning { background: rgba(245, 158, 11, 0.12); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.25); }

        .actions-group { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
        .btn-action { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 20px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all 0.2s ease; }
        .btn-primary { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3); }
        .btn-primary:hover { opacity: 0.95; transform: translateY(-1px); }
        .btn-secondary { background: #1e2d4a; color: #e2e8f0; border: 1px solid var(--card-border); }
        .btn-secondary:hover { background: #26385c; }
        .btn-disabled { background: #1e293b; color: #475569; border: 1px solid #334155; cursor: not-allowed; opacity: 0.6; }

        .console-box { background: #070d19; border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; margin-top: 24px; font-family: monospace; font-size: 12px; color: #38bdf8; max-height: 200px; overflow-y: auto; white-space: pre-wrap; }
        .db-error-box { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; color: #f87171; line-height: 1.5; }
    </style>
</head>
<body>
    <div class="installer-card">
        <div class="brand">
            <div class="brand-badge">✨ Automated Installer</div>
            <h1>Aesthetic Pondok Indah</h1>
            <p>Pusat Kontrol Deployment & Diagnostic Backend</p>
        </div>

        <div class="diagnostics-list">
            <!-- Item 1: PHP -->
            <div class="diag-item">
                <div class="diag-meta">
                    <div class="diag-title">Versi PHP Hosting</div>
                    <div class="diag-sub">Syarat minimal PHP 8.2.0</div>
                </div>
                <div class="status-pill <?= $isPhpValid ? 'pill-success' : 'pill-danger' ?>">
                    PHP <?= $phpVersion ?>
                </div>
            </div>

            <!-- Item 2: Backend Folder -->
            <div class="diag-item">
                <div class="diag-meta">
                    <div class="diag-title">Folder Backend Laravel</div>
                    <div class="diag-sub" title="<?= htmlspecialchars($backendDir ?? '') ?>"><?= htmlspecialchars($shortBackendPath) ?></div>
                </div>
                <div class="status-pill <?= $hasBackendFolder ? 'pill-success' : 'pill-danger' ?>">
                    <?= $hasBackendFolder ? '✓ Ada' : '✗ Hilang' ?>
                </div>
            </div>

            <!-- Item 3: File .env -->
            <div class="diag-item">
                <div class="diag-meta">
                    <div class="diag-title">File Konfigurasi (.env)</div>
                    <div class="diag-sub">Kredensial database & kunci aplikasi</div>
                </div>
                <div class="status-pill <?= $hasEnvFile ? 'pill-success' : 'pill-warning' ?>">
                    <?= $hasEnvFile ? '✓ Ada' : '⚠️ Belum Dibuat' ?>
                </div>
            </div>

            <!-- Item 4: Vendor -->
            <div class="diag-item">
                <div class="diag-meta">
                    <div class="diag-title">Dependensi Vendor (Composer)</div>
                    <div class="diag-sub">Framework Laravel Library</div>
                </div>
                <div class="status-pill <?= $hasVendor ? 'pill-success' : 'pill-danger' ?>">
                    <?= $hasVendor ? '✓ Siap' : '✗ Belum Ada (Upload vendor.zip)' ?>
                </div>
            </div>

            <!-- Item 5: Database -->
            <div class="diag-item">
                <div class="diag-meta">
                    <div class="diag-title">Koneksi Database MySQL</div>
                    <div class="diag-sub"><?= !empty($dbConfig['database']) ? 'Database: ' . htmlspecialchars($dbConfig['database']) : 'Kredensial belum diset di .env' ?></div>
                </div>
                <div class="status-pill <?= $dbStatus === 'CONNECTED' ? 'pill-success' : ($dbStatus === 'FAILED' ? 'pill-danger' : 'pill-warning') ?>">
                    <?= $dbStatus === 'CONNECTED' ? '✓ Terhubung' : ($dbStatus === 'FAILED' ? '✗ Gagal' : '⚠️ Belum Diset') ?>
                </div>
            </div>
        </div>

        <?php if ($dbError): ?>
            <div class="db-error-box">
                <strong>⚠️ Kendala Koneksi Database:</strong><br>
                <?= htmlspecialchars($dbError) ?>
            </div>
        <?php endif; ?>

        <div class="actions-group">
            <?php if ($hasBackendFolder && $hasEnvFile && $hasVendor && $dbStatus === 'CONNECTED'): ?>
                <a href="?action=setup_db" class="btn-action btn-primary">🚀 Jalankan Migrasi Database & Key</a>
                <a href="?action=test_api" class="btn-action" style="background: #10b981; color: white;">🔍 Tes Diagnosa Endpoint API (/api/public/posts)</a>
                <a href="?action=view_log" class="btn-action" style="background: #8b5cf6; color: white;">📄 Lihat Log Error Laravel (laravel.log)</a>
                <a href="?action=sync_to_root" class="btn-action" style="background: #f59e0b; color: white;">🔄 Sinkronkan File dari public/ ke Root Folder</a>
                <a href="?action=link_storage" class="btn-action btn-secondary">🔗 Buat Storage Link Gambar</a>
            <?php elseif (!$hasVendor): ?>
                <div class="btn-action btn-disabled">
                    🔒 Upload folder vendor (hasil composer install) ke root Laravel untuk mengaktifkan tombol setup
                </div>
            <?php else: ?>
                <div class="btn-action btn-disabled">
                    🔒 Lengkapi status berwarna kuning/merah di atas untuk melanjutkan
                </div>
            <?php endif; ?>
        </div>

        <?php if ($actionLog): ?>
            <div class="console-box">
                <strong>[LOG LOG SISTEM]:</strong><br>
                <?= htmlspecialchars($actionLog) ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
