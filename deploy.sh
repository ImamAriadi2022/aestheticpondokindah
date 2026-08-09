#!/bin/bash
# Script Eksekusi Otomatis untuk Deployment Production (Plesk / cPanel / Shared Hosting / VPS)

set -eu

# Plesk / cPanel can keep an old system PHP as the default CLI binary.
# Select supported PHP 8.2+ CLI explicitly instead of relying on `php` from PATH.
PHP_BIN=""
for candidate in \
    /opt/plesk/php/8.4/bin/php \
    /opt/plesk/php/8.3/bin/php \
    /opt/plesk/php/8.2/bin/php \
    /usr/local/bin/php \
    /usr/bin/php; do
    if [ -x "$candidate" ]; then
        PHP_BIN="$candidate"
        break
    fi
done

if [ -z "$PHP_BIN" ]; then
    PHP_BIN="$(command -v php || true)"
fi

if [ -z "$PHP_BIN" ]; then
    echo "ERROR: PHP 8.2+ CLI tidak ditemukan." >&2
    exit 1
fi

if ! "$PHP_BIN" -r "exit(version_compare(PHP_VERSION, '8.2.0', '>=') ? 0 : 1);"; then
    echo "ERROR: PHP CLI yang dipilih harus versi 8.2 atau lebih baru." >&2
    exit 1
fi

echo "Using PHP CLI: $($PHP_BIN -r 'echo PHP_VERSION;')"

# 1. Reconcile Composer dependencies
COMPOSER_BIN="$(command -v composer || true)"
if [ -n "$COMPOSER_BIN" ]; then
    "$PHP_BIN" "$COMPOSER_BIN" install --no-dev --prefer-dist --optimize-autoloader --no-interaction
elif [ -f vendor/autoload.php ]; then
    echo "Composer tidak tersedia; menggunakan vendor/ yang sudah ada."
else
    echo "ERROR: Composer tidak ditemukan dan vendor/autoload.php tidak ada." >&2
    exit 1
fi

# Clear old config cache before Artisan boots
rm -f bootstrap/cache/config.php

# Check & Repair APP_KEY
KEY_CHECK='$contents = @file_get_contents(".env"); preg_match("/^APP_KEY\\s*=\\s*(.*)$/m", (string) $contents, $match); $key = trim($match[1] ?? ""); $key = trim($key, "\\\" "); $raw = str_starts_with($key, "base64:") ? base64_decode(substr($key, 7), true) : $key; exit(is_string($raw) && strlen($raw) === 32 ? 0 : 1);'

if ! "$PHP_BIN" -r "$KEY_CHECK"; then
    echo "APP_KEY tidak valid; membuat APP_KEY Laravel baru."
    "$PHP_BIN" artisan key:generate --force
fi

"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan migrate --force

# Auto-seed Wilayah Indonesia if database table is empty
WILAYAH_CHECK='require "vendor/autoload.php"; $app = require_once "bootstrap/app.php"; $app->make("Illuminate\\Contracts\\Console\\Kernel")->bootstrap(); $count = \Illuminate\Support\Facades\Schema::hasTable("wilayah") ? \Illuminate\Support\Facades\DB::table("wilayah")->count() : 0; exit($count > 0 ? 0 : 1);'

if ! "$PHP_BIN" -r "$WILAYAH_CHECK"; then
    echo "Mendeteksi tabel wilayah kosong. Memulai auto-seeding Data Wilayah Indonesia (Kepmendagri terbaru)..."
    "$PHP_BIN" artisan db:seed --class=WilayahSeeder --force
fi

# Public HTML Sync (If server root is public_html)
if [ -d public_html ] && [ ! public_html -ef public ]; then
    echo "Menyinkronkan aset public/ ke public_html/..."
    cp -rn public/* public_html/ 2>/dev/null || cp -r public/* public_html/ 2>/dev/null || true
fi

# Storage Link
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    "$PHP_BIN" artisan storage:link || echo "WARNING: storage link belum dapat dibuat; cek izin symlink hosting."
fi

"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

echo "Deploy finished successfully!"
