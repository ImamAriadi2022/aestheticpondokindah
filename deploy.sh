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

# 1. Publish the React build while preserving the root .htaccess.
#
# The root .htaccess owns the /api -> Laravel rewrite.  `public_html/.htaccess`
# is only for hosts whose document root is public_html, so it must never replace
# the root rule during Plesk Git deployment.  Do not use `cp -n` here: it leaves
# old images/assets on the server and makes a successful deploy appear stale.
if [ -d public_html ]; then
    find public_html -mindepth 1 -maxdepth 1 ! -name '.htaccess' -exec cp -a {} . \;
fi

# 2. Laravel is now the repository root. Reconcile dependencies and caches.
COMPOSER_BIN="$(command -v composer || true)"
if [ -n "$COMPOSER_BIN" ]; then
    "$PHP_BIN" "$COMPOSER_BIN" install --no-dev --prefer-dist --optimize-autoloader --no-interaction
elif [ -f vendor/autoload.php ]; then
    echo "Composer tidak tersedia; menggunakan vendor/ yang sudah diunggah."
else
    echo "ERROR: Composer tidak ditemukan dan vendor/autoload.php tidak ada. Upload vendor/ dari composer install --no-dev atau aktifkan Composer di hosting." >&2
    exit 1
fi

# A malformed APP_KEY causes every API request to fail before the controller is
# reached (often surfaced by the browser as a generic 400). Fail deployment
# early with an actionable error instead of caching a broken configuration.
if ! "$PHP_BIN" -r '$env = parse_ini_file(".env", false, INI_SCANNER_RAW); $key = $env["APP_KEY"] ?? ""; $raw = str_starts_with($key, "base64:") ? base64_decode(substr($key, 7), true) : $key; exit(is_string($raw) && strlen($raw) === 32 ? 0 : 1);'; then
    echo "ERROR: APP_KEY tidak valid. Jalankan php artisan key:generate --force sekali di root aplikasi, lalu deploy ulang." >&2
    exit 1
fi

# A previous broken config cache can retain an invalid APP_KEY even after .env
# has been corrected. Delete only this generated cache before Artisan boots.
rm -f bootstrap/cache/config.php
"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan migrate --force
"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

echo "Deploy finished successfully!"
