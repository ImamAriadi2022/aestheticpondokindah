# 👑 Controller: Patient Membership (`Patient/Membership`)

## 1. File Controller
- `MembershipController.php`: Saldo poin, level keanggotaan (Bronze, Gold, Platinum), benefit, survei profil gigi, dan penukaran poin.
- `MembershipPaymentController.php`: Integrasi checkout upgrade level membership via Midtrans Snap / Webhook.

## 2. Aktor yang Berkomunikasi
- **Pasien**: Melihat status membership, riwayat poin, upgrade level.
- **Midtrans Payment Gateway**: Notifikasi status pembayaran otomatis.

## 3. Arah & Alur Data
- **Pasien Checkout ➔ Midtrans Snap Token ➔ Pembayaran Selesai ➔ Webhook Callback ➔ Update Level Pasien.**
