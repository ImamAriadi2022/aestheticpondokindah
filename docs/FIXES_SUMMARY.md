# Perbaikan Masalah Popup, Galeri, Testimoni, dan Registrasi

## Ringkasan Masalah
1. Gambar popup tidak muncul setelah diupload
2. Tidak bisa simpan perubahan untuk galeri (tambah/edit)
3. Tidak bisa simpan perubahan untuk testimoni (tambah/edit)
4. Storage link tidak berfungsi untuk menampilkan gambar
5. Error SQL saat registrasi: "Column 'is_coffee_drinker' cannot be null"

## Perbaikan yang Sudah Dilakukan

### 1. Membuat Direktori 'popups' yang Hilang
**Masalah:** Direktori `backend/storage/app/public/popups` tidak ada, sehingga upload gambar popup gagal.

**Solusi:** Direktori sudah dibuat secara lokal.

**Di Server:** Jalankan perintah berikut via SSH:
```bash
cd ~/public_html/backend/storage/app/public
mkdir -p popups
chmod 755 popups
```

### 2. Memperbaiki Konfigurasi Filesystem URL
**Masalah:** URL di `backend/config/filesystems.php` menggunakan `/backend/public/storage` yang tidak sesuai dengan struktur deployment.

**Solusi:** URL sudah diubah menjadi `/storage` agar sesuai dengan storage link.

**File yang diubah:** `backend/config/filesystems.php`
- Line 44: `'url' => env('APP_URL', 'http://localhost').'/storage',`

### 3. Memperbaiki Error SQL Registrasi
**Masalah:** Error "Column 'is_coffee_drinker' cannot be null" saat registrasi user baru.

**Solusi:** Membuat migration baru untuk membuat kolom `is_coffee_drinker` dan `is_smoker` nullable di tabel users.

**File yang dibuat/diubah:**
- `backend/database/migrations/2026_05_08_114924_add_extended_profile_fields_to_users_table.php` (diupdate untuk future migrations)
- `backend/database/migrations/2026_05_13_170952_make_is_coffee_drinker_and_is_smoker_nullable_in_users_table.php` (migration baru)

**Di Server:** Upload migration baru dan jalankan:
```bash
cd ~/public_html/backend
php artisan migrate
```

### 4. Memperbaiki Upload Gambar Popup di Frontend
**Masalah:** Tombol simpan popup tidak mengirim file gambar ke server, sehingga gambar tidak tersimpan.

**Solusi:** Menambahkan state `imageFile` dan mengirim file gambar dalam FormData saat menyimpan popup.

**File yang diubah:** `src/react-app/pages/dashboard/ClinicDashboard.tsx`
- Line 886: Menambahkan `imageFile: null as File | null` ke state `popupPromo`
- Line 642: Reset `imageFile` saat memuat data popup yang ada
- Line 3541-3543: Menambahkan logika untuk mengirim file gambar jika ada
- Line 3548-3550: Menambahkan `_method: PUT` untuk update
- Line 3605: Menyimpan file gambar saat user mengupload

### 5. Menghapus Storage Link dari backend/public
**Masalah:** Storage link ada di `backend/public/storage` yang tidak sesuai dengan struktur deployment.

**Solusi:** Menghapus storage link dari `backend/public/storage` karena storage link yang benar harus ada di `public_html/storage`.

**Di Server:** Jalankan perintah berikut via SSH:
```bash
cd ~/public_html/backend/public
rm -rf storage
```

### 6. Membersihkan Cache Laravel
**Masalah:** Perubahan konfigurasi filesystems.php tidak diterapkan karena cache.

**Solusi:** Membersihkan cache aplikasi dan konfigurasi Laravel.

**Di Lokal:** Sudah dijalankan:
```bash
cd backend
php artisan cache:clear
php artisan config:clear
```

**Di Server:** Jalankan perintah berikut via SSH:
```bash
cd ~/public_html/backend
php artisan cache:clear
php artisan config:clear
```

### 7. Membuat Script untuk Storage Link
**Masalah:** Storage link dari `public_html/storage` ke `backend/storage/app/public` belum ada.

**Solusi:** Script PHP sudah dibuat di `create_storage_link.php`

**Di Server:** Upload file `create_storage_link.php` ke root directory (sejajar dengan public_html dan backend), lalu akses via browser:
```
https://aestheticpondokindah.web.id/create_storage_link.php
```

Atau jalankan via SSH:
```bash
cd ~/public_html
php create_storage_link.php
```

**Setelah berhasil:** Hapus file script:
```bash
rm ~/create_storage_link.php
```

## Langkah-Langkah Deployment ke Server

### Step 1: Upload File yang Diubah
Upload file berikut ke server:
- `backend/config/filesystems.php` (sudah diperbaiki)
- `backend/storage/app/public/popups/` (direktori baru)
- `backend/database/migrations/2026_05_13_170952_make_is_coffee_drinker_and_is_smoker_nullable_in_users_table.php` (migration baru)
- `src/react-app/pages/dashboard/ClinicDashboard.tsx` (frontend popup upload fix)
- `create_storage_link.php` (script untuk membuat storage link)

### Step 2: Buat Storage Link
Jalankan salah satu metode berikut:

**Metode A: Via PHP Script (Rekomendasi)**
1. Upload `create_storage_link.php` ke root directory
2. Akses via browser: `https://aestheticpondokindah.web.id/create_storage_link.php`
3. Hapus file setelah berhasil

**Metode B: Via SSH**
```bash
cd ~/public_html
ln -s backend/storage/app/public storage
ls -la storage
# Harus menampilkan: storage -> backend/storage/app/public
```

**Metode C: Via Laravel Artisan**
```bash
cd ~/public_html/backend
php artisan storage:link
```

### Step 3: Jalankan Migration
Jalankan migration untuk memperbaiki kolom database:
```bash
cd ~/public_html/backend
php artisan migrate
```

### Step 4: Hapus Storage Link yang Salah
Hapus storage link dari backend/public:
```bash
cd ~/public_html/backend/public
rm -rf storage
```

### Step 5: Bersihkan Cache
Bersihkan cache Laravel agar perubahan konfigurasi diterapkan:
```bash
cd ~/public_html/backend
php artisan cache:clear
php artisan config:clear
```

### Step 6: Build Frontend
Build ulang frontend karena ada perubahan di ClinicDashboard.tsx:
```bash
cd src/react-app
npm run build
```
Copy hasil build ke public_html

### Step 7: Testing
Verifikasi storage link:
```bash
cd ~/public_html
readlink storage
```
Harus menampilkan: `backend/storage/app/public`

Upload test gambar ke `backend/storage/app/public/test.jpg` lalu akses:
```
https://aestheticpondokindah.web.id/storage/test.jpg
```

Test fitur berikut di admin dashboard:
- **Popup**: Upload gambar popup baru, pastikan gambar muncul di preview, simpan perubahan
- **Galeri**: Tambah item galeri baru dengan gambar, edit item galeri yang ada, pastikan gambar muncul
- **Testimoni**: Tambah testimoni baru dengan foto, edit testimoni yang ada, pastikan foto muncul

## Struktur yang Benar Setelah Perbaikan

```
public_html/
├── backend/
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           ├── popups/        ← Baru dibuat
│   │           ├── gallery/
│   │           ├── testimonials/
│   │           └── uploads/
├── storage -> backend/storage/app/public/  ← Symbolic link
├── create_storage_link.php (hapus setelah digunakan)
└── ...
```

## Troubleshooting

### Masalah: Gambar Tetap Tidak Muncul
1. Cek apakah storage link sudah dibuat dengan benar
2. Cek permissions pada direktori storage
3. Clear cache browser dan Laravel cache
4. Cek APP_URL di .env file harus: `https://aestheticpondokindah.web.id`

### Masalah: Tidak Bisa Simpan Galeri/Testimoni
1. Cek apakah user login memiliki role `clinic_admin`
2. Cek browser console untuk error JavaScript
3. Cek Laravel logs: `backend/storage/logs/laravel.log`
4. Pastikan CSRF token valid

### Masalah: Permission Denied
```bash
chmod -R 755 ~/public_html/backend/storage
chmod -R 755 ~/public_html/backend/storage/app/public
```

### Masalah: Storage Link Invalid
Jika file manager menampilkan "invalid link", cek via command line:
```bash
cd ~/public_html
ls -la storage
readlink storage
```

Jika `readlink` menampilkan path yang benar, link sebenarnya valid meskipun file manager menampilkan "invalid".

## Catatan Penting

- **Jangan hapus folder `backend/storage/app/public`** - ini adalah folder asli tempat file disimpan
- **Hanya hapus symbolic link `storage` di `public_html`** jika perlu dibuat ulang
- Setelah link berhasil, file yang di-upload ke `storage/app/public` akan otomatis accessible via `/storage/` di URL
- Pastikan `APP_URL` di `.env` sudah benar: `https://aestheticpondokindah.web.id`

## Verifikasi Akhir

Setelah semua perbaikan diterapkan, test fitur berikut di admin dashboard:

1. **Popup:**
   - Upload gambar popup baru
   - Pastikan gambar muncul di preview
   - Simpan perubahan

2. **Galeri:**
   - Tambah item galeri baru dengan gambar
   - Edit item galeri yang ada
   - Pastikan gambar muncul

3. **Testimoni:**
   - Tambah testimoni baru dengan foto
   - Edit testimoni yang ada
   - Pastikan foto muncul

Jika semua fitur berfungsi dengan benar, perbaikan selesai!
