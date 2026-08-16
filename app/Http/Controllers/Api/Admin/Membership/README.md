# 👑 Controller: Admin Membership (`Admin/Membership`)

## 1. File Controller
- `MembershipAdminController.php`

## 2. Aktor yang Berkomunikasi
- **Administrator Klinik**: Meninjau permohonan upgrade membership manual, menyetujui/menolak, mengonfirmasi bukti transfer bank, menyesuaikan saldo poin, dan memantau analitik distribusi level.
- **Pasien**: Menerima persetujuan kenaikan level (Gold/Platinum) dan poin reward.

## 3. Arah & Alur Data
- **Request**: `GET /api/admin/membership`, `POST /api/admin/membership/upgrade-requests/{id}/approve`, `PATCH /api/admin/membership/{id}/level`.
- **Proses**: Mutasi data di tabel `membership_transactions`, `membership_histories`, dan `users`.
