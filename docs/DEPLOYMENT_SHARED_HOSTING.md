# Panduan Deploy ke Shared Hosting

## Informasi Hosting
- **Domain**: aestheticpondokindah.web.id
- **Database**: u503475479_aespi
- **Username Database**: u503475479_aespi

## Langkah-langkah Deployment

### 1. Struktur Folder

**Laravel di Root Repository (Struktur yang Digunakan)**
- Laravel ditaruh di root repository/deployment
- Membutuhkan `.htaccess` proteksi tambahan untuk folder backend
- Cocok untuk shared hosting yang tidak mengizinkan akses di luar `public_html`
- **Perlu konfigurasi keamanan ekstra dengan .htaccess**

Struktur:
```
public_html/
├── backend/
├── assets/
└── index.html
```

---

### 2. Upload File ke Hosting

**Via File Manager (cPanel):**
1. Login ke cPanel hosting Anda
2. Buka **File Manager**
3. Masuk ke folder `public_html`
4. Upload semua file dari folder `public_html` di lokal ke `public_html` di hosting
5. Upload folder `backend` ke dalam `public_html` (sejajar dengan folder `assets`)

**Via FTP:**
1. Gunakan FileZilla atau FTP client lain
2. Upload isi folder `public_html` lokal ke `public_html` hosting
3. Upload folder `backend` ke dalam `public_html` hosting

### 3. Konfigurasi File .env

1. Di hosting, buka folder `backend`
2. Rename file `.env.example` menjadi `.env`
3. Edit file `.env` dan sesuaikan dengan konfigurasi berikut:

```env
APP_NAME="Aesthetic Pondok Indah"
APP_ENV=production
APP_KEY=base64:GENERATE_KEY_DISINI
APP_DEBUG=false
APP_URL=https://aestheticpondokindah.web.id

APP_LOCALE=id
APP_FALLBACK_LOCALE=id
APP_FAKER_LOCALE=id_ID

# Konfigurasi struktur folder
# Set ke true karena backend ditaruh di dalam public_html
BACKEND_INSIDE_PUBLIC_HTML=true

APP_MAINTENANCE_DRIVER=file

BCRYPT_ROUNDS=12

LOG_CHANNEL=stack
LOG_STACK=single
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=u503475479_aespi
DB_USERNAME=u503475479_aespi
DB_PASSWORD=PASSWORD_DATABASE_ANDA

SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=.aestheticpondokindah.web.id

BROADCAST_CONNECTION=log
FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

CACHE_STORE=database

MEMCACHED_HOST=127.0.0.1

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=log
MAIL_SCHEME=null
MAIL_HOST=127.0.0.1
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_FROM_ADDRESS="info@aestheticpondokindah.web.id"
MAIL_FROM_NAME="${APP_NAME}"

VITE_APP_NAME="${APP_NAME}"
```

**PENTING**:
- Ganti `PASSWORD_DATABASE_ANDA` dengan password database Anda yang sebenarnya
- `BACKEND_INSIDE_PUBLIC_HTML=true` sudah diset karena backend di dalam public_html

### 4. Generate Application Key

Jalankan perintah berikut di terminal SSH hosting:

```bash
cd ~/backend
php artisan key:generate
```

### 5. Setup Database

1. Login ke phpMyAdmin di cPanel
2. Pilih database `u503475479_aespi`
3. Import file database jika ada, atau jalankan migrasi:

```bash
cd ~/backend
php artisan migrate --force
```

Jika ada seeder:

```bash
php artisan db:seed --force
```

### 6. Setup Storage Link (PENTING untuk Gambar)

Untuk membuat gambar bisa tampil, jalankan perintah ini:

```bash
cd ~/public_html/backend
php artisan storage:link
```

Perintah ini akan membuat symbolic link dari `backend/storage/app/public` ke `public_html/storage`.

**Jika perintah di atas gagal**, lakukan manual:

```bash
cd ~/public_html
ln -s backend/storage/app/public storage
```

**Via File Manager cPanel:**
1. Masuk ke folder `public_html`
2. Buat folder bernama `storage` (jika belum ada)
3. Gunakan terminal SSH atau coba buat symlink melalui File Manager (beberapa hosting mendukung ini)

### 7. Set Permissions

Jalankan perintah berikut untuk set permission yang benar:

```bash
cd ~/public_html/backend
chmod -R 755 storage
chmod -R 755 bootstrap/cache
chown -R $(whoami):$(whoami) storage bootstrap/cache
```

### 8. Clear Cache

```bash
cd ~/public_html/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### 9. Optimasi untuk Production

```bash
cd ~/public_html/backend
php artisan optimize
composer install --optimize-autoloader --no-dev
```

### 10. Proteksi Folder Backend

**PENTING**: Pastikan file `.htaccess` sudah ada di folder `backend` untuk proteksi keamanan. File ini sudah disertakan dalam project Anda.

Jika file `.htaccess` tidak ada atau terhapus, buat file baru di `public_html/backend/.htaccess` dengan isi:

```apache
# Proteksi folder backend dari akses publik
# File ini mencegah akses langsung ke file-file sensitif Laravel

<IfModule mod_authz_core.c>
    Require all denied
</IfModule>

<IfModule !mod_authz_core.c>
    Order Allow,Deny
    Deny from all
</IfModule>

# Mencegah listing directory
Options -Indexes

# Mencegah akses ke file-file sensitif
<FilesMatch "^\.">
    Order Allow,Deny
    Deny from all
</FilesMatch>

<FilesMatch "(^\.env|^composer\.(json|lock)|^package\.json|^package-lock\.json|^artisan|^phpunit\.xml)">
    Order Allow,Deny
    Deny from all
</FilesMatch>
```

### 11. Upload Gambar yang Sudah Ada

Jika Anda memiliki gambar di folder lokal:
1. Upload semua gambar dari `public/dokter` lokal ke `public_html/dokter` hosting
2. Upload semua gambar dari `public/carousels` lokal ke `public_html/carousels` hosting
3. Upload semua gambar dari `public/galeri` lokal ke `public_html/galeri` hosting
4. Upload semua gambar dari `public/about` lokal ke `public_html/about` hosting

### 12. Konfigurasi .htaccess

Pastikan file `.htaccess` di `public_html` berisi:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### 13. Test Website

1. Buka browser dan akses: https://aestheticpondokindah.web.id
2. Cek apakah halaman home tampil dengan benar
3. Cek apakah gambar-gambar tampil
4. Cek fitur-fitur lainnya

## Troubleshooting

### Gambar tidak tampil
- Pastikan storage link sudah dibuat: `php artisan storage:link`
- Cek permission folder storage: `chmod -R 755 storage`
- Pastikan file gambar ada di folder yang benar

### Error 500
- Cek file log di `backend/storage/logs/laravel.log`
- Pastikan .env sudah dikonfigurasi dengan benar
- Pastikan APP_KEY sudah di-generate

### Database connection error
- Pastikan kredensial database di .env sudah benar
- Pastikan database sudah dibuat di phpMyAdmin
- Cek apakah migrasi sudah dijalankan

### Permission denied
- Jalankan perintah chmod seperti di langkah 6
- Pastikan user yang menjalankan PHP memiliki akses

## Struktur Folder di Hosting

### Backend di Dalam public_html

```
public_html/
├── backend/              # Folder aplikasi Laravel
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/           # Jangan diakses langsung
│   ├── resources/
│   ├── routes/
│   ├── storage/
│   │   ├── app/
│   │   │   └── public/   # File yang akan di-link
│   ├── vendor/
│   ├── .env
│   ├── .htaccess        # WAJIB - Proteksi keamanan
│   ├── artisan
│   └── composer.json
├── assets/               # File build React/Vite
├── carousels/            # Gambar carousel
├── dokter/               # Gambar dokter
├── galeri/               # Gambar galeri
├── about/                # Gambar about
├── storage -> backend/storage/app/public  # Symlink
├── index.html
└── .htaccess
```

## Catatan Penting

1. **Jangan upload folder `node_modules`** - ini akan membuat upload sangat lambat
2. **Jangan upload folder `vendor`** jika hosting sudah memiliki composer, jalankan `composer install` di hosting
3. **Selalu backup** sebelum melakukan perubahan
4. **Gunakan HTTPS** - pastikan SSL certificate sudah aktif di domain
5. **Matikan debug mode** di production (APP_DEBUG=false)
6. **Konfigurasi Frontend API** - Pastikan file `src/react-app/lib/apiConfig.ts` sudah dikonfigurasi dengan URL backend yang benar:
   - Development: `http://localhost:8000/api`
   - Production: `https://aestheticpondokindah.web.id/backend/public/api`

## Konfigurasi Frontend API

Setelah backend di-deploy, pastikan konfigurasi API di frontend sudah benar:

File: `src/react-app/lib/apiConfig.ts`
```typescript
const getApiBaseUrl = (): string => {
  if (import.meta.env.PROD) {
    return "https://aestheticpondokindah.web.id/backend/public/api";
  }
  return "http://localhost:8000/api";
};
```

Setelah mengubah konfigurasi, rebuild aplikasi frontend:
```bash
npm run build
```

Lalu upload file build yang baru ke `public_html` di hosting.

## Maintenance

Untuk maintenance mode:

```bash
cd ~/backend
php artisan down
```

Untuk mengaktifkan kembali:

```bash
php artisan up
```

## Update Konten

Untuk update konten (gambar, dll):
1. Upload gambar baru ke folder yang sesuai di `public_html`
2. Atau upload ke `backend/storage/app/public` dan jalankan ulang storage link jika perlu
