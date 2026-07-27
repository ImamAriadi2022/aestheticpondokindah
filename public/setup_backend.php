<?php
/**
 * Script Helper Setup Backend Laravel Tanpa SSH (Web-based Setup)
 * Akses file ini via browser: https://domain-anda.com/setup_backend.php
 */

// Load Laravel Bootstrap
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);

echo "<!DOCTYPE html><html lang='id'><head><meta charset='UTF-8'><title>Setup Backend Aesthetic Pondok Indah</title>";
echo "<style>body{font-family:sans-serif;background:#f4f6f9;padding:40px;line-height:1.6;} .card{background:#fff;border-radius:8px;padding:30px;max-width:800px;margin:0 auto;box-shadow:0 4px 12px rgba(0,0,0,0.1);} pre{background:#1e1e1e;color:#569cd6;padding:15px;border-radius:6px;overflow-x:auto;}</style></head><body>";
echo "<div class='card'>";
echo "<h2>🚀 Automated Laravel Setup (Tanpa SSH)</h2>";

// Action handlers
$action = $_GET['action'] ?? 'all';

function runArtisan($kernel, $command, $params = []) {
    echo "<h3>Executing: <code>php artisan $command</code></h3>";
    $output = new Symfony\Component\Console\Output\BufferedOutput();
    try {
        $status = $kernel->call($command, $params, $output);
        echo "<pre style='color:#4ec9b0'>" . htmlspecialchars($output->fetch()) . "</pre>";
    } catch (\Throwable $e) {
        echo "<pre style='color:#f44747'>ERROR: " . htmlspecialchars($e->getMessage()) . "</pre>";
    }
}

switch ($action) {
    case 'key':
        runArtisan($kernel, 'key:generate', ['--force' => true]);
        break;
    case 'migrate':
        runArtisan($kernel, 'migrate', ['--force' => true]);
        break;
    case 'clear':
        runArtisan($kernel, 'config:clear');
        runArtisan($kernel, 'cache:clear');
        runArtisan($kernel, 'route:clear');
        runArtisan($kernel, 'view:clear');
        break;
    case 'optimize':
        runArtisan($kernel, 'config:cache');
        runArtisan($kernel, 'route:cache');
        break;
    case 'all':
    default:
        runArtisan($kernel, 'key:generate', ['--force' => true]);
        runArtisan($kernel, 'migrate', ['--force' => true]);
        runArtisan($kernel, 'config:clear');
        runArtisan($kernel, 'cache:clear');
        runArtisan($kernel, 'config:cache');
        runArtisan($kernel, 'route:cache');
        break;
}

echo "<h4>✅ Setup Selesai!</h4>";
echo "<p><strong style='color:red;'>PENTING:</strong> Setelah selesai, hapus file <code>setup_backend.php</code> dari File Manager cPanel demi keamanan website Anda.</p>";
echo "</div></body></html>";
