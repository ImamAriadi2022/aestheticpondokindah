<?php
/**
 * Script to create storage link for shared hosting deployment
 * Run this script on the server after deployment
 *
 * Arsitektur baru: Laravel berada di root repo, webroot adalah public_html/.
 * Script ini dideploy di public_html/ (atau di-merge ke root oleh deploy.sh),
 * sehingga root Laravel dicari secara dinamis.
 */

// Cari lokasi root Laravel secara dinamis
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

$laravelRoot = findLaravelRoot();
if (!$laravelRoot) {
    die("ERROR: Root Laravel tidak ditemukan.\n");
}

$target = $laravelRoot . '/storage/app/public';

// Link diletakkan di webroot (public_html/storage). Jika script ini berada
// tepat di root Laravel (hasil merge deploy.sh), gunakan public/storage
// sesuai konvensi Laravel agar tidak bertabrakan dengan folder storage/ asli.
$link = (realpath(__DIR__) === $laravelRoot)
    ? $laravelRoot . '/public/storage'
    : __DIR__ . '/storage';

// Hapus storage link yang SALAH di Laravel public directory.
$wrongLink = __DIR__ . '/storage';
if (is_link($wrongLink) && $wrongLink !== $link) {
    echo "MENGHAPUS storage link yang SALAH: $wrongLink\n";
    unlink($wrongLink);
    echo "Storage link salah berhasil dihapus.\n\n";
}

// Buat storage link yang BENAR di webroot (public_html/storage)
// Check if target exists
if (!file_exists($target)) {
    die("ERROR: Target directory does not exist: $target\n");
}

// Remove existing link if it exists
if (is_link($link)) {
    echo "Menghapus link yang sudah ada: $link\n";
    unlink($link);
} elseif (file_exists($link)) {
    @unlink($link);
}

// Create symbolic link
if (@symlink($target, $link)) {
    echo "SUCCESS: Storage link created successfully!\n";
    echo "Target: $target\n";
    echo "Link: $link\n";
} else {
    echo "ERROR: Failed to create storage link via symlink.\n";
}
?>
