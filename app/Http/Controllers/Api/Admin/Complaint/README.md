# 📢 Controller: Admin Complaint (`Admin/Complaint`)

## 1. File Controller
- `ComplaintAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Meninjau tiket pengaduan pasien, menulis tanggapan solusi resmi, dan memperbarui status komplain menjadi `resolved`.
- **Pasien**: Menerima balasan dan klarifikasi dari pihak klinik.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/complaints`, `PUT /api/admin/complaints/{complaint}`.
- **Proses**: Simpan respons admin ke tabel `complaints`.
