# Panduan Sistem Membership & Loyalty Points — Aesthetic Pondok Indah

Dokumen ini menjelaskan arsitektur **Membership & Loyalty Points System**, aturan bisnis perolehan poin & upgrade tier, REST API Laravel backend, alur **Simulasi Pembayaran (Payment Gateway Deferred)**, dan skema database.

---

## 1. Arsitektur Membership & Leveling

Sistem Membership Klinik terdiri dari 4 Tier:

| Tier Level | Persyaratan Kumulatif / Berbayar | Bonus Poin Instant | Benefit Utama |
| :--- | :---: | :---: | :--- |
| **Bronze (Basic)** | Rp 0 (Otomatis saat daftar) | 0 Pts | Pengingat kontrol & promo member dasar. |
| **Gold (Premium)** | Rp 499.000 / Transaksi Rp 5jt | 100 Pts | Diskon perawatan 5%, pengingat prioritas. |
| **Platinum (Priority)** | Rp 1.500.000 / Transaksi Rp 15jt | 300 Pts | Diskon 10%, prioritas dokter & scaling gratis 1x/thn. |
| **Diamond (VIP)** | Rp 5.000.000 / Transaksi Rp 30jt | 1.000 Pts | Diskon 15%, VIP Customer Care 24/7, evaluasi senyum tahunan. |

---

## 2. Aturan Bisnis Poin (Loyalty Points System)

1. **Perolehan Poin (Earn Points)**:
   * **Penyelesaian Treatment**: Poin dihitung otomatis dari nilai transaksi perawatan gigi.
   * **Paid Upgrade Bonus**: Instant bonus (100 Pts untuk Gold, 300 Pts untuk Platinum, 1000 Pts untuk Diamond).
   * **Promosi Khusus**: Poin bonus promosi event klinik.
2. **Penukaran Poin (Redeem Points)**:
   * Poin dapat ditukarkan untuk potongan biaya transaksi perawatan via `POST /api/membership/redeem-points`.
   * Sistem memvalidasi saldo poin secara tepat: penukaran gagal jika saldo tidak mencukupi atau jumlah poin negatif.
3. **Kadaluarsa Poin (Point Expiration)**:
   * Setiap poin yang diperoleh memiliki masa berlaku 1 tahun (365 hari) secara default.

---

## 3. Simulasi Pembayaran (Payment Gateway Status)

> [!NOTE]
> **Status Payment Gateway**: **🟡 Deferred (Ditangguhkan)**. Integrasi Midtrans live production ditangguhkan untuk tahap rilis berikutnya.

Untuk memastikan seluruh logika backend (Upgrade tier, kalkulasi poin, pencatatan transaksi invoice, dan riwayat status) berjalan 100% secara nyata, sistem menyediakan **Payment Gateway Simulation Service**:

* **Success Scenario**: `POST /api/membership/payment/simulate/{id}` dengan status `success` -> Mengubah transaksi menjadi `completed`, menaikkan tier membership user, mencatat transaksi invoice `UPG-XXXXX`, dan memberikan bonus poin.
* **Failed / Cancelled Scenario**: Mengubah transaksi menjadi `failed` / `cancelled` tanpa mengubah tier membership user.
* **Pending Scenario**: Menjaga transaksi pada status `pending`.

---

## 4. Endpoints API Laravel

* `GET /api/membership` — Profil membership user, status tier, dan poin balance.
* `GET /api/membership/tiers` — Informasi harga & benefit tier publik.
* `GET /api/membership/profile` & `POST /api/membership/profile` — Profil data kesehatan & minat pasien.
* `GET /api/membership/points` — Riwayat poin earned, redeemed, & expired.
* `GET /api/membership/history` — Riwayat perubahan tier membership.
* `GET /api/membership/transactions` — Riwayat transaksi & invoice pembayaran.
* `POST /api/membership/upgrade` — Request upgrade tier membership.
* `POST /api/membership/renew` — Perpanjang masa berlaku membership.
* `POST /api/membership/cancel` — Pembatalan membership.
* `POST /api/membership/redeem-points` — Penukaran poin loyalty.
* `POST /api/membership/payment/create` — Pembuatan invoice & transaksi pembayaran.
* `POST /api/membership/payment/simulate/{id}` — Eksekusi simulasi pembayaran.
