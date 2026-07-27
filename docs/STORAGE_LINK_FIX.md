# Cara Membuat Storage Link di Shared Hosting via SSH

## Masalah: "Invalid Link" Error

Jika Anda melihat error "invalid link" di file manager hosting setelah menjalankan `php artisan storage:link`, ini karena symbolic link tidak terbentuk dengan benar di environment shared hosting.

## Masalah: Storage Link di Lokasi Salah

Jika Anda melihat storage link di `backend/public/storage`, ini **SALAH**. Link ini harus dihapus karena:
- Laravel default membuat link di `public/storage` (relatif ke folder Laravel)
- Karena backend di `public_html/backend`, link terbentuk di `backend/public/storage`
- Yang dibutuhkan adalah link di `public_html/storage` yang mengarah ke `backend/storage/app/public`

## Struktur Project yang BENAR

```
public_html/
├── backend/
│   ├── storage/
│   │   └── app/
│   │       └── public/  ← File gambar sebenarnya ada di sini
│   └── public/           ← JANGAN ada storage link di sini!
├── storage -> backend/storage/app/public  ← Symbolic link harus di sini
```

## Struktur yang SALAH (Perlu Diperbaiki)

```
public_html/
├── backend/
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   └── public/
│       └── storage -> ../storage/app/public  ← SALAH! Hapus ini!
├── storage -> backend/storage/app/public  ← BENAR
```

## Metode 1: Menggunakan PHP Artisan (Rekomendasi Pertama)

### Step 0: HAPUS Storage Link yang SALAH di backend/public

**PENTING**: Jika ada storage link di `backend/public/storage`, hapus dulu:

```bash
cd ~/public_html/backend/public
rm -f storage
```

Verifikasi sudah terhapus:
```bash
ls -la storage
```
Harus menampilkan: "No such file or directory"

### Step 1: Login ke Hosting via SSH

```bash
ssh username@hostname
# Masukkan password
```

### Step 2: Navigasi ke folder backend

```bash
cd ~/public_html/backend
```

### Step 3: Cek apakah link sudah ada di public_html

```bash
ls -la ../storage
```

Jika ada output seperti `storage -> backend/storage/app/public` tapi statusnya "invalid link", hapus dulu:

```bash
cd ~/public_html
rm -f storage
```

### Step 4: Jalankan storage:link

```bash
cd ~/public_html/backend
php artisan storage:link
```

### Step 5: Verifikasi link berhasil

```bash
cd ~/public_html
ls -la storage
```

Output yang benar:
```
storage -> backend/storage/app/public
```

### Step 6: Cek permissions

```bash
ls -la backend/storage/app/public
```

Pastikan permissions: `755` atau `777`

---

## Metode 2: Manual Symbolic Link (Jika Metode 1 Gagal)

### Step 1: Hapus link yang rusak (jika ada)

```bash
cd ~/public_html
rm -f storage
```

### Step 2: Buat symbolic link manual

```bash
cd ~/public_html
ln -s backend/storage/app/public storage
```

### Step 3: Verifikasi

```bash
ls -la storage
```

Harus menampilkan:
```
storage -> backend/storage/app/public
```

---

## Metode 3: Menggunakan Absolute Path (Jika Relative Path Gagal)

### Step 1: Cari absolute path

```bash
pwd
```

Contoh output: `/home/u503475479/public_html`

### Step 2: Hapus link lama

```bash
cd ~/public_html
rm -f storage
```

### Step 3: Buat link dengan absolute path

```bash
cd ~/public_html
ln -s /home/u503475479/public_html/backend/storage/app/public storage
```

**Ganti `/home/u503475479/public_html` dengan path actual dari hosting Anda**

### Step 4: Verifikasi

```bash
ls -la storage
```

---

## Metode 4: Menggunakan PHP Script (Jika SSH Tidak Tersedia)

Jika Anda tidak punya akses SSH, buat file PHP sementara:

### Step 1: Buat file `mklink.php` di `public_html/`

```php
<?php
$target = __DIR__ . '/backend/storage/app/public';
$link = __DIR__ . '/storage';

// Hapus link jika sudah ada
if (is_link($link)) {
    unlink($link);
}

// Buat symbolic link
if (symlink($target, $link)) {
    echo "SUCCESS: Storage link created successfully!\n";
    echo "Target: $target\n";
    echo "Link: $link\n";
} else {
    echo "ERROR: Failed to create storage link\n";
    echo "Target exists: " . (file_exists($target) ? 'YES' : 'NO') . "\n";
    echo "Link exists: " . (is_link($link) ? 'YES' : 'NO') . "\n";
}
?>
```

### Step 2: Akses via browser

```
https://aestheticpondokindah.web.id/mklink.php
```

### Step 3: Hapus file setelah berhasil

```bash
cd ~/public_html
rm mklink.php
```

---

## Troubleshooting

### Masalah 1: Permission Denied

Jika error "Permission denied", coba:

```bash
chmod -R 755 ~/public_html/backend/storage
chmod -R 755 ~/public_html/backend/storage/app/public
```

Atau jika masih gagal:

```bash
chmod -R 777 ~/public_html/backend/storage
chmod -R 777 ~/public_html/backend/storage/app/public
```

### Masalah 2: Target Directory Tidak Ada

Cek apakah folder target ada:

```bash
ls -la ~/public_html/backend/storage/app/public
```

Jika tidak ada, buat dulu:

```bash
mkdir -p ~/public_html/backend/storage/app/public
chmod -R 755 ~/public_html/backend/storage/app/public
```

### Masalah 3: Link Tetap Invalid di File Manager

Kadang file manager hosting tidak menampilkan symlink dengan benar. Cek via command line:

```bash
cd ~/public_html
ls -la storage
readlink storage
```

Jika `readlink` menampilkan path yang benar, link sebenarnya sudah valid meskipun file manager menampilkan "invalid".

### Masalah 4: Safe Mode Restriction

Jika hosting punya `safe_mode` atau `open_basedir` restriction, metode PHP script mungkin tidak jalan. Gunakan metode manual via SSH.

---

## Verifikasi Akhir

Setelah membuat link, verifikasi dengan:

### 1. Cek via command line

```bash
cd ~/public_html
ls -la storage
readlink storage
```

### 2. Cek via browser

Upload test gambar ke `backend/storage/app/public/test.jpg` lalu akses:
```
https://aestheticpondokindah.web.id/storage/test.jpg
```

Jika gambar tampil, storage link berhasil!

### 3. Cek di Laravel

```bash
cd ~/public_html/backend
php artisan storage:link
```

Jika output: "The [public/storage] link has been created.", berarti sudah benar.

---

## Struktur yang Benar Setelah Berhasil

```
public_html/
├── backend/
│   ├── storage/
│   │   └── app/
│   │       └── public/
│   │           ├── galeri/
│   │           ├── testi/
│   │           └── popup/
├── storage -> backend/storage/app/public/  ← Symbolic link
├── index.html
└── assets/
```

## Catatan Penting

- **Jangan hapus folder `backend/storage/app/public`** - ini adalah folder asli tempat file disimpan
- **Hanya hapus symbolic link `storage` di `public_html`** jika perlu dibuat ulang
- Setelah link berhasil, file yang di-upload ke `storage/app/public` akan otomatis accessible via `/storage/` di URL
- Pastikan `APP_URL` di `.env` sudah benar: `https://aestheticpondokindah.web.id`

---

## Konfigurasi Laravel (Opsional)

Jika masih ada masalah, cek `backend/config/filesystems.php`:

```php
'links' => [
    public_path('storage') => storage_path('app/public'),
],
```

Pastikan konfigurasi ini sudah ada dan benar.
