<?php
/**
 * Script to create storage link for shared hosting deployment
 * Run this script on the server after deployment
 */

$backendDir = null;
$rootDir = __DIR__;

if (is_dir(__DIR__ . '/backend/storage/app/public')) {
    $backendDir = __DIR__ . '/backend';
} elseif (is_dir(dirname(__DIR__) . '/backend/storage/app/public')) {
    $backendDir = dirname(__DIR__) . '/backend';
    $rootDir = dirname(__DIR__);
}

if (!$backendDir) {
    die("ERROR: Target backend directory does not exist.\n");
}

// Hapus storage link yang SALAH di backend/public/storage
$wrongLink = $backendDir . '/public/storage';
if (is_link($wrongLink)) {
    echo "MENGHAPUS storage link yang SALAH: $wrongLink\n";
    unlink($wrongLink);
    echo "Storage link salah berhasil dihapus.\n\n";
}

// Buat storage link yang BENAR di public_html/storage atau httpdocs/storage
$target = $backendDir . '/storage/app/public';
$link = __DIR__ . '/storage';

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
