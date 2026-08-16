# 💳 Model: Billing & Invoice (`Patient/Billing`)

## 1. File Model
- `Invoice.php`: Tagihan resmi biaya perawatan atau keanggotaan klinik.
- `Payment.php`: Catatan penerimaan pembayaran (tunai, transfer, gateway).

## 2. Aktor yang Berkomunikasi
- **Pasien**: Melihat rincian tagihan invoice dan melakukan pembayaran.
- **Kasir / Admin**: Menerbitkan invoice berdasarkan tindakan medis dan mengonfirmasi pembayaran.

## 3. Arah & Alur Data
- **Tindakan Medis Selesai ➔ Admin Terbitkan Invoice ➔ Model `Invoice` ➔ Pasien Bayar ➔ Model `Payment` ➔ Tabel `invoices` & `payments` ➔ Status Lunas.**
