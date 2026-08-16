# 🩺 Model: Clinic Services (`Guest/Service`)

## 1. File Model
- `ClinicService.php`: Katalog layanan medis gigi (Bleaching, Veneer, Ortho, Implan, dll.).

## 2. Aktor yang Berkomunikasi
- **Tamu / Publik**: Membaca deskripsi layanan, estimasi langkah perawatan, dan dokter spesialis terkait.
- **Admin**: Menambah, memperbarui tarif, dan mengatur urutan tampilan layanan.

## 3. Arah & Alur Data
- **Admin CMS ➔ `ClinicServiceAdminController` ➔ Model `ClinicService` ➔ Tabel `clinic_services` ➔ `ClinicServicePublicController` ➔ Public Landing Page.**
