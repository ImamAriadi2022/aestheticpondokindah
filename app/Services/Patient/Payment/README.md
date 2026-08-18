# 💳 Service: Integrasi Pembayaran (`Patient/Payment`)

## 1. File Service
- `MidtransService.php`: Integrasi resmi API Midtrans Payment Gateway (Snap Token Generator & Verifikasi Signature Webhook).
- `SimulationPaymentService.php`: Layanan simulasi transaksi lokal untuk pengujian tanpa gateway nyata.

## 2. Aktor yang Terlibat
- **Pasien**: Melakukan pembayaran via Virtual Account, QRIS (GoPay/OVO/ShopeePay), atau Kartu Kredit.
- **Midtrans Gateway**: Memproses transaksi dan mengirimkan HTTP Callback Notification (Webhook).
- **Kasir Klinik**: Menerima status pelunasan transaksi otomatis.

## 3. Arah & Alur Logika Data
- **Buat Snap Token**: Pasien klik bayar ➔ `MidtransService::createSnapTransaction` ➔ Request ke Midtrans API ➔ Menerima Snap Token & Redirect URL ➔ Frontend Pop-up Snap Modal.
- **Proses Webhook**: Midtrans kirim HTTP Post ke `/api/membership/payment/webhook` ➔ `MidtransService::verifyNotification` (Validasi SHA512 signature hash) ➔ Jika `settlement`: Update status `invoices` & `membership_transactions` menjadi `paid` ➔ Trigger event `PaymentSettled`.
