# 📢 Model: Complaint (`Patient/Complaint`)

## 1. File Model
- `Complaint.php`: Tiket keluhan dan pengaduan layanan dari pasien.

## 2. Aktor yang Berkomunikasi
- **Pasien**: Mengirimkan tiket keluhan disertai lampiran foto/bukti.
- **Admin**: Membaca komplain, memberikan tanggapan/solusi, dan menandai status selesai.

## 3. Arah & Alur Data
- **Pasien ➔ `UserComplaintController` ➔ Model `Complaint` ➔ Tabel `complaints` ➔ `ComplaintAdminController` ➔ Tanggapan Admin ➔ Pasien.**
