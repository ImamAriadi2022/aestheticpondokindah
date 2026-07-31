#!/bin/bash
# Script Eksekusi Otomatis untuk Plesk Git Deployment

set -eu

# Plesk can keep an old system PHP as the default CLI binary. Laravel's
# dependencies require PHP 8.2+, so always select Plesk's supported PHP CLI
# explicitly instead of relying on `php` from PATH.
PHP_BIN=""
for candidate in \
    /opt/plesk/php/8.4/bin/php \
    /opt/plesk/php/8.3/bin/php \
    /opt/plesk/php/8.2/bin/php; do
    if [ -x "$candidate" ]; then
        PHP_BIN="$candidate"
        break
    fi
done

if [ -z "$PHP_BIN" ]; then
    echo "ERROR: PHP 8.2+ CLI tidak ditemukan. Aktifkan PHP 8.2 atau lebih baru pada Plesk." >&2
    exit 1
fi

if ! "$PHP_BIN" -r "exit(version_compare(PHP_VERSION, '8.2.0', '>=') ? 0 : 1);"; then
    echo "ERROR: PHP CLI yang dipilih harus versi 8.2 atau lebih baru." >&2
    exit 1
fi

echo "Using PHP CLI: $($PHP_BIN -r 'echo PHP_VERSION;')"

# 1. Salin isi public_html ke root domain
cp -rn public_html/* . 2>/dev/null || true
cp -f public_html/index.html . 2>/dev/null || true
cp -f public_html/.htaccess . 2>/dev/null || true

# 2. Install dependensi backend dan refresh cache Laravel. Dengan ini perubahan
#    .env (termasuk kredensial Midtrans) langsung terbaca tanpa akses terminal.
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "vendor" ]; then
        COMPOSER_BIN="$(command -v composer || true)"
        if [ -z "$COMPOSER_BIN" ]; then
            echo "ERROR: Composer tidak ditemukan pada server deployment." >&2
            exit 1
        fi
        "$PHP_BIN" "$COMPOSER_BIN" install --no-dev --prefer-dist --optimize-autoloader --no-interaction
    fi

    "$PHP_BIN" artisan optimize:clear
    "$PHP_BIN" artisan config:cache
    "$PHP_BIN" artisan route:cache
    "$PHP_BIN" artisan view:cache
    cd ..
fi

echo "Deploy finished successfully!"
