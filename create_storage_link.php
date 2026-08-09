<?php
/**
 * Script to create storage link for standard Laravel webroot deployment
 * Target Webroot: public/storage -> storage/app/public
 */

$target = __DIR__ . '/storage/app/public';
$link = __DIR__ . '/public/storage';

if (!file_exists($target)) {
    // If running inside public/ directory directly
    if (file_exists(__DIR__ . '/../storage/app/public')) {
        $target = __DIR__ . '/../storage/app/public';
        $link = __DIR__ . '/storage';
    }
}

if (!file_exists($target)) {
    die("ERROR: Target directory does not exist: $target\n");
}

if (is_link($link)) {
    echo "Menghapus storage link lama: $link\n";
    unlink($link);
} elseif (file_exists($link)) {
    echo "WARNING: $link sudah ada.\n";
}

if (symlink($target, $link)) {
    echo "SUCCESS: Storage link created successfully!\n";
    echo "Target: $target\n";
    echo "Link: $link\n";
} else {
    echo "ERROR: Failed to create storage link via symlink(). Trying Artisan...\n";
    @exec("php artisan storage:link");
}
?>
