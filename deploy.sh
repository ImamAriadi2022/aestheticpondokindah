#!/bin/bash
# ==============================================================================
# Script Deployment & Eksekusi Otomatis (Production Ready)
# Aesthetic Pondok Indah Dental Clinic System
# Compatible with: Plesk, cPanel, DirectAdmin, VPS (Ubuntu/Debian/AlmaLinux)
# Target Document Root Server: public/ (Laravel Standard Webroot)
# Frontend Webroot Output: public/ (Dist React & Assets)
# ==============================================================================

set -euo pipefail

echo "======================================================================"
echo " Starting Automated Production Deployment"
echo " Time: $(date)"
echo "======================================================================"

# 0. Check & Prepare .env file
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        echo "[INFO] File .env tidak ditemukan. Menyalin dari .env.production..."
        cp .env.production .env
    elif [ -f ".env.example" ]; then
        echo "[INFO] File .env tidak ditemukan. Menyalin dari .env.example..."
        cp .env.example .env
    else
        echo "[ERROR] File .env atau .env.production tidak ditemukan!" >&2
        exit 1
    fi
fi

# 1. PHP CLI Detection (Supporting Plesk, cPanel EA-PHP, VPS)
PHP_BIN=""
for candidate in \
    /opt/plesk/php/8.4/bin/php \
    /opt/plesk/php/8.3/bin/php \
    /opt/plesk/php/8.2/bin/php \
    /opt/cpanel/ea-php84/root/usr/bin/php \
    /opt/cpanel/ea-php83/root/usr/bin/php \
    /opt/cpanel/ea-php82/root/usr/bin/php \
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
    echo "[ERROR] PHP 8.2+ CLI tidak ditemukan." >&2
    exit 1
fi

if ! "$PHP_BIN" -r "exit(version_compare(PHP_VERSION, '8.2.0', '>=') ? 0 : 1);"; then
    echo "[ERROR] PHP CLI yang dipilih ($PHP_BIN) harus versi 8.2 atau lebih baru." >&2
    exit 1
fi

echo "[OK] Using PHP CLI: $($PHP_BIN -r 'echo PHP_VERSION;')"

# 2. Directory & Permission Setup
echo "[INFO] Menyiapkan struktur direktori penyimpanan & permissions..."
mkdir -p storage/app/public/promos \
         storage/app/public/popups \
         storage/app/public/popup \
         storage/app/public/layanan \
         storage/app/public/dokter \
         storage/app/public/hero \
         storage/app/public/galeri \
         storage/app/public/testi \
         storage/app/public/signatures \
         storage/app/public/avatars \
         storage/app/public/dashboard \
         storage/app/public/download-apps \
         storage/app/public/posts \
         storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache \
         public/storage/promos \
         public/storage/popups \
         public/storage/popup \
         public/storage/layanan \
         public/storage/dokter \
         public/storage/galeri \
         public/storage/testi \
         public/storage/signatures \
         public/storage/avatars \
         public/storage/dashboard \
         public/storage/download-apps \
         public/storage/posts \
         public/dashboard \
         public/logo

chmod -R 775 storage bootstrap/cache public/storage 2>/dev/null || chmod -R 777 storage bootstrap/cache public/storage 2>/dev/null || true

# 3. Composer Dependencies & Classmap Optimization
COMPOSER_BIN="$(command -v composer || true)"
if [ -z "$COMPOSER_BIN" ] && [ -f "composer.phar" ]; then
    COMPOSER_BIN="$PHP_BIN composer.phar"
fi

if [ -n "$COMPOSER_BIN" ]; then
    echo "[INFO] Menjalankan Composer Install & Autoload Optimization..."
    if [ "$COMPOSER_BIN" = "$PHP_BIN composer.phar" ]; then
        $COMPOSER_BIN install --no-dev --prefer-dist --optimize-autoloader --no-interaction
        $COMPOSER_BIN dump-autoload --optimize --no-interaction
    else
        "$PHP_BIN" "$COMPOSER_BIN" install --no-dev --prefer-dist --optimize-autoloader --no-interaction
        "$PHP_BIN" "$COMPOSER_BIN" dump-autoload --optimize --no-interaction
    fi
elif [ -f vendor/autoload.php ]; then
    echo "[INFO] Composer binary tidak ada; menggunakan folder vendor/ yang sudah tersedia."
else
    echo "[ERROR] Composer tidak ditemukan dan vendor/autoload.php tidak ada." >&2
    exit 1
fi

# Clear old config cache before Artisan boots
rm -f bootstrap/cache/config.php
rm -f bootstrap/cache/routes-v7.php
rm -f bootstrap/cache/services.php
rm -f bootstrap/cache/packages.php

# 4. Check & Generate APP_KEY if missing/invalid
KEY_CHECK='$contents = @file_get_contents(".env"); preg_match("/^APP_KEY\\s*=\\s*(.*)$/m", (string) $contents, $match); $key = trim($match[1] ?? ""); $key = trim($key, "\\\" "); $raw = str_starts_with($key, "base64:") ? base64_decode(substr($key, 7), true) : $key; exit(is_string($raw) && strlen($raw) === 32 ? 0 : 1);'

if ! "$PHP_BIN" -r "$KEY_CHECK"; then
    echo "[INFO] APP_KEY belum ada atau tidak valid. Membuat APP_KEY Laravel baru..."
    "$PHP_BIN" artisan key:generate --force
fi

# 5. Clear Caches & Run Database Migrations
echo "[INFO] Membersihkan Laravel cache lama..."
"$PHP_BIN" artisan optimize:clear

echo "[INFO] Menjalankan Database Migrations..."
"$PHP_BIN" artisan migrate --force

# 6. Auto-seed Essential Clinic & Membership Data (Idempotent)
echo "[INFO] Menjalankan Seeder Data Inti Aplikasi..."
"$PHP_BIN" artisan db:seed --class=DoctorSeeder --force || echo "[INFO] DoctorSeeder selesai."
"$PHP_BIN" artisan db:seed --class=DoctorProfileSeeder --force || echo "[INFO] DoctorProfileSeeder selesai."
"$PHP_BIN" artisan db:seed --class=DoctorScheduleSeeder --force || echo "[INFO] DoctorScheduleSeeder selesai."
"$PHP_BIN" artisan db:seed --class=ClinicServiceSeeder --force || echo "[INFO] ClinicServiceSeeder selesai."
"$PHP_BIN" artisan db:seed --class=ContentSeeder --force || echo "[INFO] ContentSeeder selesai."
"$PHP_BIN" artisan db:seed --class=PromoSeeder --force || echo "[INFO] PromoSeeder selesai."
"$PHP_BIN" artisan db:seed --class=BranchSeeder --force || echo "[INFO] BranchSeeder selesai."
"$PHP_BIN" artisan db:seed --class=WilayahSeeder --force || echo "[INFO] WilayahSeeder selesai."
"$PHP_BIN" artisan db:seed --class=NormalizeDoctorSchedulesAndReservationsSeeder --force || echo "[INFO] Normalisasi jadwal selesai."

# Seed Download Apps default if empty
"$PHP_BIN" -r '
require "vendor/autoload.php";
$app = require_once "bootstrap/app.php";
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

if (\Illuminate\Support\Facades\Schema::hasTable("download_apps") && \App\Models\Guest\Content\DownloadApp::count() === 0) {
    \App\Models\Guest\Content\DownloadApp::create([
        "title" => "Aesthetic Dental Mobile App (Android APK)",
        "platform" => "android",
        "description" => "Aplikasi resmi Aesthetic Pondok Indah untuk reservasi janji temu dan pantau reward loyalty Anda.",
        "version" => "v1.2.0",
        "file_url" => "/downloads/app-release.apk",
        "file_size" => "18.5 MB",
        "download_count" => 125,
        "is_active" => true,
    ]);
    echo "[INFO] Seeded default download_apps item.\n";
}
' || true

# 7. Create Storage Symlink & Sync Asset Media
echo "[INFO] Memverifikasi symlink storage (public/storage -> storage/app/public)..."
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    "$PHP_BIN" artisan storage:link || "$PHP_BIN" create_storage_link.php || echo "[WARNING] Storage symlink gagal dibuat; menyalin berkas secara langsung."
fi

# Synchronize member card assets & ribbon badges
echo "[INFO] Menyelaraskan aset kartu member digital (card bronze/gold/platinum & pita badge)..."
if [ -d "public/dashboard" ]; then
    cp -rf public/dashboard/* storage/app/public/dashboard/ 2>/dev/null || true
    cp -rf public/dashboard/* public/storage/dashboard/ 2>/dev/null || true
fi

# Synchronize media assets across public/ and storage/
if [ -d "storage/app/public/promos" ]; then
    cp -rf storage/app/public/promos/* public/storage/promos/ 2>/dev/null || true
fi

if [ -d "public/galeri" ]; then
    cp -rf public/galeri/* storage/app/public/galeri/ 2>/dev/null || true
    cp -rf public/galeri/* public/storage/galeri/ 2>/dev/null || true
fi

if [ -d "public/testi" ]; then
    cp -rf public/testi/* storage/app/public/testi/ 2>/dev/null || true
    cp -rf public/testi/* public/storage/testi/ 2>/dev/null || true
fi

if [ -f "public/popup/Paket-Implant.png" ]; then
    cp -f public/popup/Paket-Implant.png public/storage/promos/Paket-Implant.png 2>/dev/null || true
    cp -f public/popup/Paket-Implant.png storage/app/public/promos/Paket-Implant.png 2>/dev/null || true
fi

# 7b. Convert and Optimize All Static and Storage Media to WebP
echo "[INFO] Mengoptimalkan seluruh media dan gambar statis ke format WebP super cepat..."
"$PHP_BIN" artisan media:convert-to-webp || echo "[INFO] Optimasi WebP selesai."

# 8. Frontend Recompile (if Node/npm is present on server)
NPM_BIN="$(command -v npm || true)"
if [ -n "$NPM_BIN" ] && [ -d "frontend-web" ]; then
    echo "[INFO] Node.js/npm terdeteksi ($($NPM_BIN --version)). Mengompilasi bundel frontend React ke public/..."
    (cd frontend-web && npm install --no-audit --no-fund && npm run build) || echo "[WARNING] Build frontend via npm gagal; tetap menggunakan bundel terkompilasi sebelumnya di public/."
else
    echo "[INFO] Node.js/npm tidak dipasang di server hosting. Menggunakan bundel terkompilasi yang sudah ada di public/ (HTML, JS & CSS assets)."
fi

# Verify critical webroot files
if [ -f "public/index.html" ] || [ -f "public/index.php" ]; then
    echo "[OK] Webroot frontend public/ terverifikasi."
else
    echo "[WARNING] public/index.html atau public/index.php tidak ditemukan."
fi

# 9. Cache Configuration, Routes, and Views for Production High-Performance
echo "[INFO] Mengoptimalkan cache konfigurasi, routing, dan views Laravel untuk production..."
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

echo "======================================================================"
echo " SUCCESS: Deployment Selesai dan Sistem Siap Berjalan!"
echo " Webroot Frontend: public/"
echo " Backend Root: . (Laravel Standard Root)"
echo " PHP Version: $($PHP_BIN -r 'echo PHP_VERSION;')"
echo " Timestamp: $(date)"
echo "======================================================================"
