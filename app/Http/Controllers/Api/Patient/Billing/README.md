# 💳 Controller: Patient Billing (`Patient/Billing`)

## 1. File Controller
- `PaymentController.php`

## 2. Aktor yang Berkomunikasi
- **Pasien**: Melihat daftar tagihan invoice perawatan dan mengonfirmasi pembayaran.
- **Kasir / Admin**: Memverifikasi penerimaan dana.

## 3. Arah & Alur Data
- **Request**: `GET /api/user/payments`, `POST /api/user/invoices/{id}/payment`.
- **Proses**: Simpan bukti pembayaran ke tabel `payments`.
