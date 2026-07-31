<?php
/**
 * Script to create storage link for shared hosting deployment
 * Run this script on the server after deployment
 *
 * PENTING: Script ini akan:
 * 1. Hapus storage link yang SALAH di public/storage
 * 2. Membuat storage link yang BENAR di public_html/storage
 */

// Hapus storage link yang SALAH di public/storage
$wrongLink = __DIR__ . '/public/storage';
if (is_link($wrongLink)) {
    echo "MENGHAPUS storage link yang SALAH: $wrongLink\n";
    unlink($wrongLink);
    echo "Storage link salah berhasil dihapus.\n\n";
} elseif (file_exists($wrongLink)) {
    echo "WARNING: $wrongLink ada tapi bukan symbolic link. Hapus manual!\n\n";
}

// Buat storage link yang BENAR di public_html/storage
$target = __DIR__ . '/storage/app/public';
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
    die("ERROR: $link exists but is not a symbolic link. Please remove it manually.\n");
}

// Create symbolic link
if (symlink($target, $link)) {
    echo "SUCCESS: Storage link created successfully!\n";
    echo "Target: $target\n";
    echo "Link: $link\n";
    echo "\nYou can now access files at: /storage/{path}\n";
    echo "\nStruktur yang BENAR:\n";
    echo "- public_html/storage -> storage/app/public\n";
    echo "- public/storage TIDAK ADA (dihapus)\n";
} else {
    echo "ERROR: Failed to create storage link\n";
    echo "This might be due to server restrictions. Try creating it manually via SSH:\n";
    echo "cd public_html && ln -s storage/app/public storage\n";
}
?>
