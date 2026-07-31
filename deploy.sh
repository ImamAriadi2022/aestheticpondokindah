#!/bin/bash
# Script Eksekusi Otomatis untuk Plesk Git Deployment

set -eu

# 1. Salin isi public_html ke root domain
cp -rn public_html/* . 2>/dev/null || true
cp -f public_html/index.html . 2>/dev/null || true
cp -f public_html/.htaccess . 2>/dev/null || true

# 2. Install dependensi backend dan refresh cache Laravel. Dengan ini perubahan
#    .env (termasuk kredensial Midtrans) langsung terbaca tanpa akses terminal.
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "vendor" ]; then
        composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
    fi

    php artisan optimize:clear
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    cd ..
fi

echo "Deploy finished successfully!"
