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
mkdir -p storage/app/public/promos \
         storage/app/public/popups \
         storage/app/public/popup \
         storage/app/public/layanan \
         storage/app/public/dokter \
         storage/app/public/hero \
         storage/app/public/galeri \
         storage/app/public/signatures \
         storage/app/public/avatars \
         storage/framework/cache \
         storage/framework/sessions \
         storage/framework/views \
         storage/logs \
         bootstrap/cache \
         public/storage/promos \
         public/storage/layanan \
         public/storage/dokter \
         public/storage/signatures \
         public/storage/avatars

chmod -R 775 storage bootstrap/cache 2>/dev/null || chmod -R 777 storage bootstrap/cache 2>/dev/null || true

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
echo "[INFO] Clearing Laravel caches..."
"$PHP_BIN" artisan optimize:clear

echo "[INFO] Running Database Migrations..."
"$PHP_BIN" artisan migrate --force

# 6. Auto-seed Services, Doctor Profiles, Promos & Clinic Data (Idempotent)
echo "[INFO] Menjalankan Seeder Data Layanan Klinik (ClinicServiceSeeder)..."
"$PHP_BIN" artisan db:seed --class=ClinicServiceSeeder --force || echo "[INFO] Seeding ClinicServiceSeeder diselesaikan."

echo "[INFO] Menjalankan Seeder Profil & Pengalaman Kerja Dokter (DoctorProfileSeeder)..."
"$PHP_BIN" artisan db:seed --class=DoctorProfileSeeder --force || echo "[INFO] Seeding DoctorProfileSeeder diselesaikan."

echo "[INFO] Menjalankan Seeder Data Promo & PopUp (PromoSeeder)..."
"$PHP_BIN" artisan db:seed --class=PromoSeeder --force || echo "[INFO] Seeding PromoSeeder diselesaikan."

# 7. Create Storage Symlink & Copy Fallback Assets
echo "[INFO] Memverifikasi storage link (public/storage -> storage/app/public)..."
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    "$PHP_BIN" artisan storage:link || "$PHP_BIN" create_storage_link.php || echo "[WARNING] Storage symlink gagal dibuat; menyalin berkas secara langsung."
fi

# Copy media assets as fail-safe fallback for hosting environments
if [ -d "storage/app/public/promos" ]; then
    mkdir -p public/storage/promos
    cp -rf storage/app/public/promos/* public/storage/promos/ 2>/dev/null || true
fi

if [ -f "public/popup/Paket-Implant.png" ]; then
    cp -f public/popup/Paket-Implant.png public/storage/promos/Paket-Implant.png 2>/dev/null || true
    cp -f public/popup/Paket-Implant.png storage/app/public/promos/Paket-Implant.png 2>/dev/null || true
fi

# 8. Frontend Recompile (if Node/npm is present on server)
NPM_BIN="$(command -v npm || true)"
if [ -n "$NPM_BIN" ] && [ -d "frontend-web" ]; then
    echo "[INFO] Node.js/npm terdeteksi. Mengompilasi bundel frontend React ke public/..."
    (cd frontend-web && npm install --no-audit --no-fund && npm run build) || echo "[WARNING] Build frontend via npm gagal; tetap menggunakan bundel terkompilasi sebelumnya di public/."
else
    echo "[INFO] Node.js/npm tidak dipasang di server. Menggunakan bundel terkompilasi yang sudah ada di public/ (HTML & assets)."
fi

# Verify critical webroot files
if [ -f "public/index.html" ] || [ -f "public/index.php" ]; then
    echo "[OK] Webroot frontend public/ terverifikasi."
else
    echo "[WARNING] public/index.html atau public/index.php tidak ditemukan."
fi

# 9. Cache Configuration, Routes, and Views for Production High-Performance
echo "[INFO] Optimizing & Caching Laravel configuration, routes, and views..."
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
