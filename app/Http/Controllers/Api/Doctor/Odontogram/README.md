# 🦷 Controller: Doctor Odontogram (`Doctor/Odontogram`)

## 1. File Controller
- `OdontogramController.php`

## 2. Aktor yang Berkomunikasi
- **Dokter**: Memperbarui status permukaan gigi per elemen (11-48) atau secara massal (*bulk update*).
- **Pasien**: Melihat visualisasi kondisi gigi di rekam medis.

## 3. Arah & Alur Data
- **Request**: `GET /api/doctor/medical-records/{id}/odontogram`, `POST /api/doctor/medical-records/{id}/odontogram/tooth`, `POST /api/doctor/medical-records/{id}/odontogram/bulk`.
- **Proses**: Simpan ke tabel `odontograms` dan `tooth_states`.
