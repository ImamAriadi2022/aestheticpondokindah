<?php
/**
 * Script Data Setup & Admin Inisialisasi - Aesthetic Pondok Indah
 * Akses via Browser: https://domain-anda.com/data_setup.php
 */

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

$hasBackend = $backendDir !== null;
$envPath = $backendDir ? $backendDir . '/.env' : null;
$hasEnv = $envPath && file_exists($envPath);
$vendorPath = $backendDir ? $backendDir . '/vendor/autoload.php' : null;
$hasVendor = $vendorPath && file_exists($vendorPath);

$actionLog = null;
$isSuccess = false;

// Default Form Values (sesuai permintaan user)
$adminName = $_POST['admin_name'] ?? 'Admin Clinic Aesthetic';
$adminWa = $_POST['admin_wa'] ?? '085788322061';
$adminEmail = $_POST['admin_email'] ?? 'admin@aestheticpondokindah.com';
$adminPass = $_POST['admin_pass'] ?? 'admin123';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'run_setup') {
    if (!$hasBackend || !$hasEnv || !$hasVendor) {
        $actionLog = "ERROR: Root Laravel, file .env, atau vendor belum siap di server.";
    } else {
        try {
            require $vendorPath;
            $app = require_once $backendDir . '/bootstrap/app.php';
            $kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

            $output = new Symfony\Component\Console\Output\BufferedOutput();

            // 1. Generate Key & Migrate Database
            $kernel->call('key:generate', ['--force' => true], $output);
            $kernel->call('migrate', ['--force' => true], $output);

            // 2. Input / Update Admin User
            $waInput = trim($adminWa);
            $passInput = trim($adminPass);
            $nameInput = trim($adminName);
            $emailInput = trim($adminEmail);

            $user = \App\Models\User::where('whatsapp', $waInput)->first();
            if (!$user) {
                $user = new \App\Models\User();
                $user->name = $nameInput;
                $user->email = $emailInput;
                $user->whatsapp = $waInput;
                $user->role = 'clinic_admin';
                $user->status = 'active';
                $user->password = \Illuminate\Support\Facades\Hash::make($passInput);
                $user->save();
                $output->writeln("✓ BERHASIL MEMBUAT AKUN ADMIN BARU!");
            } else {
                $user->name = $nameInput;
                $user->email = $emailInput;
                $user->role = 'clinic_admin';
                $user->status = 'active';
                $user->password = \Illuminate\Support\Facades\Hash::make($passInput);
                $user->save();
                $output->writeln("✓ BERHASIL MENG-UPDATE PASSWORD & ROLE AKUN ADMIN!");
            }

            $output->writeln("---------------------------------------");
            $output->writeln("Kredensial Admin Utama Clinic:");
            $output->writeln("Nama     : " . $user->name);
            $output->writeln("WhatsApp : " . $user->whatsapp);
            $output->writeln("Password : " . $passInput);
            $output->writeln("Role     : " . $user->role);
            $output->writeln("---------------------------------------");

            // 3. Jalankan Database Seeders (Dokter, Jadwal, Promo, Content, Membership)
            $output->writeln("Menjalankan Seeder Data Awal (Dokter, Promo, Jadwal, Content)...");
            @$kernel->call('db:seed', ['--force' => true], $output);

            // 4. Clear Cache
            $kernel->call('config:clear', [], $output);

            $actionLog = $output->fetch();
            $isSuccess = true;
        } catch (\Throwable $e) {
            $actionLog = "GAGAL EKSEKUSI: " . $e->getMessage() . "\n" . $e->getTraceAsString();
        }
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inisialisasi Data Awal & Admin - Aesthetic Pondok Indah</title>
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
        }
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
        body { background: var(--bg); color: var(--text-main); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
        
        .setup-card { width: 100%; max-width: 640px; background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 32px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
        
        .brand { text-align: center; margin-bottom: 28px; }
        .brand-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.2); border-radius: 99px; font-size: 12px; font-weight: 600; color: var(--primary); margin-bottom: 12px; }
        .brand h1 { font-size: 22px; font-weight: 700; color: var(--text-main); letter-spacing: -0.5px; }
        .brand p { font-size: 13px; color: var(--text-muted); margin-top: 4px; }

        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 16px; background: #0f172a; border: 1px solid var(--card-border); border-radius: 10px; color: var(--text-main); font-size: 14px; outline: none; transition: border 0.2s; }
        .form-input:focus { border-color: var(--primary); }

        .btn-submit { width: 100%; padding: 14px 20px; background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(14, 165, 233, 0.3); margin-top: 10px; }
        .btn-submit:hover { opacity: 0.95; transform: translateY(-1px); }

        .console-box { background: #070d19; border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; margin-top: 24px; font-family: monospace; font-size: 13px; color: #34d399; max-height: 250px; overflow-y: auto; white-space: pre-wrap; word-break: break-all; }
        .success-banner { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; padding: 14px; border-radius: 12px; font-size: 13px; font-weight: 600; margin-bottom: 20px; text-align: center; }
        
        .footer-nav { margin-top: 24px; text-align: center; font-size: 13px; }
        .footer-nav a { color: var(--primary); text-decoration: none; font-weight: 600; margin: 0 8px; }
        .footer-nav a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="setup-card">
        <div class="brand">
            <div class="brand-badge">🔑 Initial Data & Admin Seeder</div>
            <h1>Aesthetic Pondok Indah</h1>
            <p>Formulir Input Akun Admin Clinic & Data Awal Website</p>
        </div>

        <?php if ($isSuccess): ?>
            <div class="success-banner">
                🎉 BERHASIL! Akun Admin & Data Awal Klinik Sukses Terinput ke Backend!
            </div>
        <?php endif; ?>

        <form method="POST" action="">
            <input type="hidden" name="action" value="run_setup">

            <div class="form-group">
                <label class="form-label">Nama Admin Clinic</label>
                <input type="text" name="admin_name" class="form-input" value="<?= htmlspecialchars($adminName) ?>" required>
            </div>

            <div class="form-group">
                <label class="form-label">No. WhatsApp Admin (Username Login)</label>
                <input type="text" name="admin_wa" class="form-input" value="<?= htmlspecialchars($adminWa) ?>" required>
            </div>

            <div class="form-group">
                <label class="form-label">Email Admin</label>
                <input type="email" name="admin_email" class="form-input" value="<?= htmlspecialchars($adminEmail) ?>" required>
            </div>

            <div class="form-group">
                <label class="form-label">Password Admin</label>
                <input type="text" name="admin_pass" class="form-input" value="<?= htmlspecialchars($adminPass) ?>" required>
            </div>

            <button type="submit" class="btn-submit">
                🚀 Input Admin Baru & Inisialisasi Data Backend
            </button>
        </form>

        <?php if ($actionLog): ?>
            <div class="console-box">
                <strong>[LOG LOG SISTEM EKSEKUSI]:</strong><br>
                <?= htmlspecialchars($actionLog) ?>
            </div>
        <?php endif; ?>

        <div class="footer-nav">
            <a href="test_system.php">🔍 Cek Diagnostic System Test</a> • 
            <a href="setup_backend.php">⚡ Setup Backend Control Center</a>
        </div>
    </div>
</body>
</html>
