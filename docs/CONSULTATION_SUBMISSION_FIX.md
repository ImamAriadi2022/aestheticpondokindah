# Perbaikan Masalah Pengiriman Data Konsultasi

## Masalah
Error saat mengirim data konsultasi dari akun pengguna:
- Error message: "Gagal" dan "Unexpected token '<', "<!DOCTYPE "... is not valid JSON"
- Server mengembalikan HTML error page (404/500) bukan JSON response

## Root Cause
Masalah disebabkan oleh 2 hal:

### 1. CORS Configuration Tidak Benar
- File `backend/config/cors.php` hanya mengizinkan origin dari `FRONTEND_URL` environment variable
- Di production, `FRONTEND_URL` tidak di-set di `.env`, sehingga default ke `http://localhost:5173`
- Frontend production (`https://aestheticpondokindah.web.id`) tidak diizinkan oleh CORS
- Browser menolak request karena CORS policy violation
- Server mengembalikan HTML error page karena request tidak mencapai endpoint API

### 2. Exception Handler Tidak Mengembalikan JSON
- Ketika terjadi error di API routes, Laravel default mengembalikan HTML error page
- Frontend mengharapkan JSON response, sehingga parsing error terjadi

## Perbaikan yang Dilakukan

### 1. Update CORS Configuration
**File:** `backend/config/cors.php`

```php
'allowed_origins' => [
    env('FRONTEND_URL', 'http://localhost:5173'),
    'https://aestheticpondokindah.web.id',
],

'allowed_origins_patterns' => ['/https?:\/\/([a-z0-9-]+\.)*aestheticpondokindah\.web\.id/'],
```

**Penjelasan:**
- Menambahkan `https://aestheticpondokindah.web.id` ke allowed origins
- Menambahkan pattern regex untuk mengizinkan semua subdomain dari aestheticpondokindah.web.id
- Ini memastikan frontend production bisa mengakses API tanpa CORS error

### 2. Add FRONTEND_URL ke .env.example
**File:** `backend/.env.example`

```bash
# Frontend URL untuk CORS
FRONTEND_URL=https://aestheticpondokindah.web.id
```

**Penjelasan:**
- Menambahkan konfigurasi FRONTEND_URL ke .env.example
- Server production harus meng-set ini di file `.env` yang sebenarnya

### 3. Add Exception Handler untuk JSON Response
**File:** `backend/bootstrap/app.php`

```php
use Illuminate\Http\Request;

->withExceptions(function (Exceptions $exceptions): void {
    $exceptions->render(function (Throwable $e, Request $request) {
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'message' => $e->getMessage(),
                'error' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString(),
                ] : null,
            ], 500);
        }
    });
})->create();
```

**Penjelasan:**
- Menambahkan exception handler yang mengembalikan JSON untuk API routes
- Jika request ke `api/*` atau request mengharapkan JSON, error akan di-return sebagai JSON
- Di production (APP_DEBUG=false), hanya message yang di-return
- Di development (APP_DEBUG=true), detail error juga di-return untuk debugging

## Langkah Deployment ke Server

### Step 1: Update File di Server
Upload file berikut ke server:
- `backend/config/cors.php` (sudah diperbarui)
- `backend/.env.example` (sudah diperbarui)
- `backend/bootstrap/app.php` (sudah diperbarui)

### Step 2: Update .env di Server
Edit file `backend/.env` di server dan tambahkan:
```bash
FRONTEND_URL=https://aestheticpondokindah.web.id
```

### Step 3: Clear Cache
Jalankan perintah berikut via SSH:
```bash
cd ~/public_html/backend
php artisan config:clear
php artisan cache:clear
php artisan route:clear
```

### Step 4: Verifikasi
Test pengiriman data konsultasi dari user dashboard:
1. Login sebagai user
2. Buka dashboard user
3. Coba kirim konsultasi cepat atau terjadwal
4. Pastikan tidak ada error "Unexpected token '<'"
5. Pastikan konsultasi berhasil dibuat

## Troubleshooting

### Masalah: Masih Error CORS
1. Pastikan `FRONTEND_URL` sudah di-set di `.env` server
2. Clear config cache: `php artisan config:clear`
3. Cek browser console untuk detail CORS error
4. Pastikan tidak ada CORS middleware lain yang memblokir

### Masalah: Masih Error JSON Parsing
1. Cek Laravel logs: `backend/storage/logs/laravel.log`
2. Pastikan exception handler sudah di-load dengan benar
3. Clear cache: `php artisan cache:clear`
4. Pastikan `APP_DEBUG` di-set ke `false` di production

### Masalah: Konsultasi Tidak Tersimpan
1. Cek apakah user sudah login dan token valid
2. Cek browser network tab untuk detail request/response
3. Pastikan validation rules di controller tidak terlalu strict
4. Cek database connection di `.env`

## Catatan Penting

- **CORS configuration penting untuk security** - jangan set `allowed_origins` ke `*` di production
- **Exception handler untuk JSON** - memastikan frontend selalu menerima response yang konsisten
- **Environment variables** - pastikan semua config yang diperlukan di-set di `.env` server
- **Cache clearing** - setelah mengubah config, selalu clear cache agar perubahan berlaku

## Verifikasi Akhir

Setelah perbaikan diterapkan, test fitur berikut:

1. **Konsultasi Cepat:**
   - Isi form konsultasi cepat
   - Klik kirim
   - Pastikan tidak ada error
   - Pastikan konsultasi muncul di riwayat

2. **Konsultasi Terjadwal:**
   - Pilih jadwal dokter
   - Isi form konsultasi terjadwal
   - Klik kirim
   - Pastikan tidak ada error
   - Pastikan konsultasi muncul di riwayat dengan status "Dijadwalkan"

3. **Error Handling:**
   - Coba kirim data yang invalid
   - Pastikan error message muncul dalam format JSON
   - Pastikan tidak ada HTML error page

Jika semua fitur berfungsi dengan benar, perbaikan selesai!
