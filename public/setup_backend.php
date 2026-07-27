<?php
// Active Error Reporting agar tidak menjadi layar hitam/500 tanpa pesan
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Cari lokasi folder backend secara dinamis
$possibleBackendPaths = [
    __DIR__ . '/backend',
    dirname(__DIR__) . '/backend',
    dirname(dirname(__DIR__)) . '/backend'
];

$backendDir = null;
foreach ($possibleBackendPaths as $path) {
    if (is_dir($path)) {
        $backendDir = realpath($path);
        break;
    }
}

// Cek komponen-komponen penting
$phpVersion = PHP_VERSION;
$isPhpValid = version_compare($phpVersion, '8.2.0', '>=');

$hasBackendFolder = $backendDir !== null;
$envPath = $backendDir ? $backendDir . '/.env' : null;
$hasEnvFile = $envPath && file_exists($envPath);
$vendorPath = $backendDir ? $backendDir . '/vendor/autoload.php' : null;
$hasVendor = $vendorPath && file_exists($vendorPath);

// Cek Kredensial Database dari .env jika ada
$dbStatus = "Belum Dites";
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
    } else {
        $dbStatus = "UNCONFIGURED";
    }
}

// Penanganan Aksi (Action Handler)
$actionMessage = null;
$actionSuccess = false;

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === 'setup_db' && $hasVendor && $hasEnvFile) {
        try {
            require $vendorPath;
            $app = require_once $backendDir . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

            $output = new Symfony\Component\Console\Output\BufferedOutput();
            $kernel->call('key:generate', ['--force' => true], $output);
            $kernel->call('migrate', ['--force' => true], $output);
            $kernel->call('config:clear', [], $output);

            $actionMessage = $output->fetch();
            $actionSuccess = true;
        } catch (Throwable $e) {
            $actionMessage = "Error Eksekusi: " . $e->getMessage();
        }
    } elseif ($action === 'link_storage') {
        $target = $backendDir . '/storage/app/public';
        $link = __DIR__ . '/storage';

        if (!file_exists($target)) {
            @mkdir($target, 0775, true);
        }

        if (is_link($link) || file_exists($link)) {
            @unlink($link);
        }

        if (@symlink($target, $link)) {
            $actionMessage = "SUCCESS: Storage link berhasil dibuat ke $link";
            $actionSuccess = true;
        } else {
            $actionMessage = "Gagal membuat symlink otomatis. Anda dapat membuat folder 'storage' di public_html atau menghubungi provider hosting.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pusat Kontrol Setup Backend - Aesthetic Pondok Indah</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: #0f172a; color: #f8fafc; padding: 40px 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { max-width: 750px; width: 100%; background: #1e293b; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3); border: 1px solid #334155; }
        .header { text-align: center; margin-bottom: 32px; }
        .header h1 { font-size: 24px; font-weight: 700; color: #38bdf8; margin-bottom: 8px; }
        .header p { color: #94a3b8; font-size: 14px; }
        
        .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin-bottom: 32px; }
        .status-card { background: #0f172a; padding: 16px; border-radius: 12px; border: 1px solid #334155; display: flex; align-items: center; justify-content: space-between; }
        .status-info h4 { font-size: 14px; font-weight: 600; color: #e2e8f0; }
        .status-info p { font-size: 12px; color: #64748b; margin-top: 2px; }
        
        .badge { font-size: 11px; font-weight: 700; padding: 6px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-success { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.3); }
        .badge-danger { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .badge-warning { background: rgba(234, 179, 8, 0.15); color: #facc15; border: 1px solid rgba(234, 179, 8, 0.3); }

        .actions { display: flex; flex-direction: column; gap: 12px; }
        .btn { display: inline-flex; align-items: center; justify-content: center; padding: 14px 20px; font-weight: 600; font-size: 14px; border-radius: 10px; text-decoration: none; transition: all 0.2s; border: none; cursor: pointer; }
        .btn-primary { background: #0284c7; color: white; }
        .btn-primary:hover { background: #0369a1; }
        .btn-secondary { background: #334155; color: white; }
        .btn-secondary:hover { background: #475569; }
        
        .console { background: #020617; padding: 16px; border-radius: 10px; font-family: monospace; font-size: 13px; color: #38bdf8; margin-top: 24px; white-space: pre-wrap; word-break: break-all; border: 1px solid #1e293b; max-height: 250px; overflow-y: auto; }
        .alert-error { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); color: #f87171; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin-top: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ Dashboard Diagnostics & Setup Backend</h1>
            <p>Aesthetic Pondok Indah Dental Clinic</p>
        </div>

        <div class="status-grid">
            <div class="status-card">
                <div class="status-info">
                    <h4>Versi PHP Hosting</h4>
                    <p>Syarat minimal PHP 8.2.0</p>
                </div>
                <span class="badge <?= $isPhpValid ? 'badge-success' : 'badge-danger' ?>">
                    PHP <?= $phpVersion ?>
                </span>
            </div>

            <div class="status-card">
                <div class="status-info">
                    <h4>Folder Backend</h4>
                    <p><?= $backendDir ? htmlspecialchars($backendDir) : 'Folder tidak ditemukan' ?></p>
                </div>
                <span class="badge <?= $hasBackendFolder ? 'badge-success' : 'badge-danger' ?>">
                    <?= $hasBackendFolder ? 'TERSEDIA' : 'HILANG' ?>
                </span>
            </div>

            <div class="status-card">
                <div class="status-info">
                    <h4>File Konfigurasi (.env)</h4>
                    <p>File environment Laravel</p>
                </div>
                <span class="badge <?= $hasEnvFile ? 'badge-success' : 'badge-danger' ?>">
                    <?= $hasEnvFile ? 'TERSEDIA' : 'BELUM DIBUAT' ?>
                </span>
            </div>

            <div class="status-card">
                <div class="status-info">
                    <h4>Dependensi Vendor (Autoload)</h4>
                    <p>Framework Laravel Library</p>
                </div>
                <span class="badge <?= $hasVendor ? 'badge-success' : 'badge-danger' ?>">
                    <?= $hasVendor ? 'TERSEDIA' : 'HILANG' ?>
                </span>
            </div>

            <div class="status-card" style="grid-column: 1 / -1;">
                <div class="status-info">
                    <h4>Koneksi Database MySQL</h4>
                    <p><?= !empty($dbConfig['database']) ? 'Database: ' . htmlspecialchars($dbConfig['database']) : 'Kredensial belum diset di .env' ?></p>
                </div>
                <span class="badge <?= $dbStatus === 'CONNECTED' ? 'badge-success' : ($dbStatus === 'FAILED' ? 'badge-danger' : 'badge-warning') ?>">
                    <?= $dbStatus ?>
                </span>
            </div>
        </div>

        <?php if ($dbError): ?>
            <div class="alert-error">
                <strong>Error Database:</strong> <?= htmlspecialchars($dbError) ?><br>
                <small>Pastikan nama database, username, dan password di file <code>httpdocs/backend/.env</code> sudah sesuai dengan di Plesk.</small>
            </div>
        <?php endif; ?>

        <div class="actions">
            <?php if ($hasBackendFolder && $hasEnvFile && $hasVendor && $dbStatus === 'CONNECTED'): ?>
                <a href="?action=setup_db" class="btn btn-primary">🚀 Jalankan Generate Key & Database Migration</a>
                <a href="?action=link_storage" class="btn btn-secondary">🔗 Buat Shortcut Storage Gambar</a>
            <?php else: ?>
                <p style="color:#e2e8f0; font-size:14px; text-align:center; padding:10px;">
                    ⚠️ Complete the diagnostic checklist above to enable automatic installation.
                </p>
            <?php endif; ?>
        </div>

        <?php if ($actionMessage): ?>
            <div class="console">
                <strong>[LOG EKSEKUSI]:</strong><br>
                <?= htmlspecialchars($actionMessage) ?>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
