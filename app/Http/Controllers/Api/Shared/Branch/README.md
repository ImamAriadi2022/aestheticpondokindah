# 🏥 Fitur: Cabang Klinik (`Shared/Branch`)

## 1. Deskripsi Fitur
Menyajikan daftar cabang klinik yang aktif untuk publik dan pasien saat reservasi, serta manajemen data cabang oleh Admin Klinik.

## 2. Aktor yang Berkomunikasi
- **Tamu & Pasien**: Melihat daftar lokasi, alamat, telepon cabang untuk booking klinik.
- **Admin Klinik**: Menambah cabang baru, mengubah informasi cabang, dan menonaktifkan cabang.

## 3. Alur & Arah Data (Data Flow)
- **Publik (`GET /api/public/branches`)**: Guest/Patient ➔ `BranchController::index` ➔ `Branch::active()` ➔ Tabel `branches` ➔ JSON.
- **Admin CRUD (`POST/PUT/DELETE /api/admin/branches`)**: Admin ➔ `BranchController` ➔ Tabel `branches`.
