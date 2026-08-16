# 🦷 Model: Odontogram (`Doctor/Odontogram`)

## 1. File Model
- `Odontogram.php`: Diagram pemetaan kondisi seluruh 32 gigi pasien.
- `ToothState.php`: Detail kondisi spesifik setiap elemen gigi (permukaan mesial, distal, oklusal, labial, lingual).

## 2. Aktor yang Berkomunikasi
- **Dokter**: Memperbarui status gigi secara visual (misal: gigi 16 karies media, gigi 36 tambalan komposit).
- **Pasien**: Melihat peta visual riwayat perawatan giginya.

## 3. Arah & Alur Data
- **Dokter Klik Gigi ➔ `OdontogramController::updateTooth` ➔ Model `ToothState` ➔ Tabel `tooth_states` & `odontograms` ➔ Visualisasi Odontogram Canvas.**
