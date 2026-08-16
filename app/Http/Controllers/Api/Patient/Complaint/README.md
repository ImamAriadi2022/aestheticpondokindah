# 📢 Controller: Patient Complaint (`Patient/Complaint`)

## 1. File Controller
- `ComplaintController.php`

## 2. Aktor yang Berkomunikasi
- **Pasien**: Mengirimkan tiket keluhan/komplain dan memantau status penyelesaian.
- **Admin**: Membaca dan membalas komplain.

## 3. Arah & Alur Data
- **Pasien ➔ `POST /api/user/complaints` ➔ Tabel `complaints` ➔ Panel Admin.**
