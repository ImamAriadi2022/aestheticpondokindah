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
    for source in public_html/*; do
        [ -e "$source" ] || continue
        name="$(basename "$source")"

        # `backend` belongs to the retired shared-hosting layout. On some
        # Plesk installations it is a link to ./backend, so copying it aborts
        # the entire deploy with "are the same file".
        case "$name" in
            .htaccess|backend|storage) continue ;;
        esac

        # public_html may itself be a link to this deployment root. Do not
        # copy a file/directory onto the exact same inode in that situation.
        if [ -e "./$name" ] && [ "$source" -ef "./$name" ]; then
            continue
        fi

        cp -a "$source" .
    done
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

# A previous broken config cache can retain an invalid APP_KEY even after .env
# has been corrected. Delete only this generated cache before Artisan boots.
rm -f bootstrap/cache/config.php

# A malformed key prevents every API endpoint from being served. Generate a
# fresh key only when the existing one is invalid; a valid production key is
# never changed. This also repairs the historical case where two base64 keys
# were accidentally concatenated in .env.
if ! "$PHP_BIN" -r '$env = parse_ini_file(".env", false, INI_SCANNER_RAW); $key = $env["APP_KEY"] ?? ""; $raw = str_starts_with($key, "base64:") ? base64_decode(substr($key, 7), true) : $key; exit(is_string($raw) && strlen($raw) === 32 ? 0 : 1);'; then
    echo "APP_KEY tidak valid; membuat APP_KEY Laravel baru."
    "$PHP_BIN" artisan key:generate --force
fi

if ! "$PHP_BIN" -r '$env = parse_ini_file(".env", false, INI_SCANNER_RAW); $key = $env["APP_KEY"] ?? ""; $raw = str_starts_with($key, "base64:") ? base64_decode(substr($key, 7), true) : $key; exit(is_string($raw) && strlen($raw) === 32 ? 0 : 1);'; then
    echo "ERROR: APP_KEY tetap tidak valid. Pastikan file .env dapat ditulis oleh user deployment." >&2
    exit 1
fi

"$PHP_BIN" artisan optimize:clear
"$PHP_BIN" artisan migrate --force

# Keep Laravel's private storage directory out of the webroot. Public uploads
# are exposed only through public/storage, which Laravel creates as a link to
# storage/app/public. This is also safe on hosts where public_html/storage is
# an old/broken link from a previous deployment layout.
if [ ! -e public/storage ] && [ ! -L public/storage ]; then
    "$PHP_BIN" artisan storage:link || echo "WARNING: storage link belum dapat dibuat; cek izin symlink hosting."
fi

"$PHP_BIN" artisan config:cache
"$PHP_BIN" artisan route:cache
"$PHP_BIN" artisan view:cache

echo "Deploy finished successfully!"
