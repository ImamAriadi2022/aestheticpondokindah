# 🦷 Service: Tindakan Klinis (`Doctor/Procedure`)

## 1. File Service
- `ProcedureService.php`

## 2. Aktor yang Terlibat
- **Dokter**: Mencatat tindakan gigi nyata pada pasien (misal: penambalan gigi 16).
- **Billing / Kasir**: Menerima daftar tindakan yang telah selesai untuk ditagihkan.

## 3. Arah & Alur Logika Data
- **Eksekusi Tindakan**: `ProcedureService::recordProcedure` ➔ Validasi `tooth_number` dan `procedure_catalog_id` ➔ Simpan ke tabel `clinical_procedures` ➔ Hubungkan ke invoice pembayaran.
