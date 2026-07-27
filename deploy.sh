#!/bin/bash
# Script Eksekusi Otomatis untuk Plesk Git Deployment

# 1. Salin isi public_html ke root domain
cp -rn public_html/* . 2>/dev/null || true
cp -f public_html/index.html . 2>/dev/null || true
cp -f public_html/.htaccess . 2>/dev/null || true

# 2. Install dependensi backend composer jika vendor belum ada
if [ -d "backend" ]; then
    cd backend
    if [ ! -d "vendor" ]; then
        composer install --no-dev --optimize-autoloader || true
    fi
    cd ..
fi

echo "Deploy finished successfully!"
