# 🏥 Model: Branch (`Shared/Branch`)

## 1. File Model
- `Branch.php`: Data cabang fisik klinik gigi Aesthetic Pondok Indah.

## 2. Aktor yang Berkomunikasi
- **Tamu / Pasien**: Memilih cabang saat membuat janji temu atau konsultasi.
- **Admin**: Mengelola alamat, kode, telepon, dan status aktif cabang.

## 3. Arah & Alur Data
- **Admin ➔ `BranchController` ➔ Model `Branch` ➔ Tabel `branches` ➔ Booking Form Cabang Picker.**
