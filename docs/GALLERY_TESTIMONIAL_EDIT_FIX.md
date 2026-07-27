# Perbaikan Masalah Edit/Save Galeri dan Testimoni

## Masalah
Galeri dan testimoni tidak bisa disimpan ketika diedit. Ketika admin mencoba mengedit item galeri atau testimoni yang sudah ada, perubahan tidak tersimpan.

## Root Cause
Masalah disebabkan oleh konfigurasi route yang tidak mendukung method spoofing dengan benar:

1. **Frontend mengirim FormData dengan `_method: PUT`**
   - Frontend menggunakan FormData untuk upload file
   - FormData tidak mendukung method PUT/PATCH secara langsung di semua browser
   - Frontend menggunakan POST dengan parameter `_method: PUT` untuk method spoofing

2. **Backend route hanya mendefinisikan POST untuk update**
   - Route sebelumnya: `Route::post('/gallery-items/{galleryItem}', ...)`
   - Route sebelumnya: `Route::post('/testimonials/{testimonial}', ...)`
   - Laravel method spoofing mungkin tidak berfungsi dengan benar untuk API routes
   - Ketika method spoofing gagal, request POST tidak mencapai method update di controller

## Perbaikan yang Dilakukan

### Update Routes untuk Mendukung PUT
**File:** `backend/routes/api.php`

**Galeri Routes:**
```php
Route::get('/gallery-items', [GalleryAdminController::class, 'index']);
Route::post('/gallery-items', [GalleryAdminController::class, 'store']);
Route::post('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'update']);
Route::put('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'update']);  // Baru ditambahkan
Route::delete('/gallery-items/{galleryItem}', [GalleryAdminController::class, 'destroy']);
```

**Testimoni Routes:**
```php
Route::get('/testimonials', [TestimonialAdminController::class, 'index']);
Route::post('/testimonials', [TestimonialAdminController::class, 'store']);
Route::post('/testimonials/{testimonial}', [TestimonialAdminController::class, 'update']);
Route::put('/testimonials/{testimonial}', [TestimonialAdminController::class, 'update']);  // Baru ditambahkan
Route::delete('/testimonials/{testimonial}', [TestimonialAdminController::class, 'destroy']);
```

**Penjelasan:**
- Menambahkan route PUT untuk update method
- Mendukung dua cara request:
  1. POST dengan `_method: PUT` (method spoofing - untuk FormData)
  2. PUT langsung (untuk request JSON tanpa file)
- Ini memastikan update akan berfungsi terlepas dari method spoofing

## Langkah Deployment ke Server

### Step 1: Update File di Server
Upload file berikut ke server:
- `backend/routes/api.php` (sudah diperbarui)

### Step 2: Clear Cache
Jalankan perintah berikut via SSH:
```bash
cd ~/public_html/backend
php artisan route:clear
php artisan cache:clear
```

### Step 3: Verifikasi
Test editing galeri dan testimoni di admin dashboard:
1. Login sebagai admin (clinic_admin)
2. Buka dashboard admin
3. Masuk ke menu Galeri
4. Edit item galeri yang sudah ada
5. Ubah title, kategori, atau upload gambar baru
6. Klik Simpan
7. Pastikan perubahan tersimpan
8. Ulangi langkah yang sama untuk Testimoni

## Troubleshooting

### Masalah: Masih Tidak Bisa Simpan
1. Pastikan route cache sudah di-clear: `php artisan route:clear`
2. Cek browser network tab untuk detail request/response
3. Pastikan user login memiliki role `clinic_admin`
4. Cek Laravel logs: `backend/storage/logs/laravel.log`

### Masalah: Error 404/405
1. Pastikan file `routes/api.php` sudah di-upload dengan benar
2. Clear route cache: `php artisan route:clear`
3. Cek apakah route sudah terdaftar: `php artisan route:list --path=admin/gallery-items`

### Masalah: Error Validasi
1. Cek browser console untuk error message
2. Pastikan semua required field diisi
3. Pastikan file upload tidak melebihi batas (max 5MB)
4. Pastikan file adalah gambar (jpg, jpeg, png, gif, bmp, webp)

## Catatan Penting

- **Method spoofing** adalah teknik untuk mengirim PUT/PATCH request menggunakan POST dengan parameter `_method`
- **FormData** tidak mendukung method PUT/PATCH secara langsung di semua browser
- **Route PUT ditambahkan** sebagai fallback jika method spoofing tidak berfungsi
- **Cache clearing** penting setelah mengubah routes agar perubahan berlaku

## Verifikasi Akhir

Setelah perbaikan diterapkan, test fitur berikut di admin dashboard:

### Galeri:
1. **Edit Item Galeri:**
   - Buka menu Galeri
   - Klik edit pada item yang sudah ada
   - Ubah title, kategori, atau deskripsi
   - Upload gambar baru (opsional)
   - Klik Simpan
   - Pastikan perubahan tersimpan dan muncul di list

2. **Tambah Item Galeri Baru:**
   - Klik tambah item galeri baru
   - Isi semua field
   - Upload gambar
   - Klik Simpan
   - Pastikan item baru muncul di list

### Testimoni:
1. **Edit Testimoni:**
   - Buka menu Testimoni
   - Klik edit pada testimoni yang sudah ada
   - Ubah nama, rating, atau quote
   - Upload foto baru (opsional)
   - Klik Simpan
   - Pastikan perubahan tersimpan dan muncul di list

2. **Tambah Testimoni Baru:**
   - Klik tambah testimoni baru
   - Isi semua field
   - Upload foto (opsional)
   - Klik Simpan
   - Pastikan testimoni baru muncul di list

Jika semua fitur berfungsi dengan benar, perbaikan selesai!
