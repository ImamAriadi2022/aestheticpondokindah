# Membership Restructure Plan: 4-Tier System

> Dokumen perencanaan restrukturisasi membership dari 3 tier (gold/platinum/diamond) ke 4 tier (bronze/gold/platinum/diamond)

Tanggal: 19 Mei 2026

---

## 1. Ringkasan Perubahan

### Saat Ini
- 3 level: `gold`, `platinum`, `diamond`
- Default level saat registrasi: `gold`
- Bronze tidak ada
- Downgrade saat expired: ke `gold` + status `inactive`

### Target
- 4 level: `bronze`, `gold`, `platinum`, `diamond`
- Default level saat registrasi: `bronze` (belum lengkapi profil) atau `bronze` (sudah lengkapi profil)
- Bronze = gratis selamanya, tidak expired
- Downgrade saat expired: ke `bronze` + simpan `last_paid_level`
- Renew: bisa kembali ke level sebelumnya

---

## 2. Struktur Tier Final

| Level | Label | Cara Dapat | Harga Langganan | Threshold Transaksi |
|-------|-------|-----------|-----------------|-------------------|
| **Bronze** | Basic Member | Lengkapi profil membership | **Gratis** | - |
| **Gold** | Premium Member | Langganan ATAU transaksi ≥ Rp 5.000.000 | Rp 499.000 – Rp 999.000/tahun | Rp 5.000.000 |
| **Platinum** | Priority Member | Langganan ATAU transaksi ≥ Rp 15.000.000 | Rp 1.500.000 – Rp 2.500.000/tahun | Rp 15.000.000 |
| **Diamond** | VIP Member | Langganan ATAU transaksi ≥ Rp 30.000.000 ATAU invitation | Rp 5.000.000 – Rp 10.000.000/tahun | Rp 30.000.000 |

### Mekanisme Hybrid
- **Auto-upgrade**: Otomatis naik level berdasarkan total transaksi
- **Direct subscribe**: Bisa bayar langsung untuk upgrade
- **Keduanya berjalan paralel** → fleksibel & modern

---

## 3. Benefit Per Tier

### Bronze (Basic Member) — Gratis
- Promo khusus member
- Voucher ulang tahun
- Reminder kontrol gigi
- Rekomendasi perawatan sesuai kebutuhan
- Riwayat booking & konsultasi tersimpan
- Informasi promo dan treatment terbaru

> **Tujuan**: Database marketing & onboarding. User merasa "saya sudah jadi member" sementara klinik mendapat database.

### Gold (Premium Member) — Entry Premium
- **Semua benefit Bronze**, plus:
- Prioritas booking
- Benefit khusus member (diskon ringan, bukan besar-besaran)
- Gratis konsultasi tertentu
- Point reward transaksi (multiplier 1x)
- Promo treatment eksklusif
- Reminder treatment prioritas

> **Tujuan**: Mulai monetisasi. Harus terasa "worth it untuk upgrade".

### Platinum (Priority Member) — Loyal Customer
- **Semua benefit Gold**, plus:
- Prioritas jadwal dokter
- Free scaling 1x per tahun
- Benefit khusus treatment premium
- Point reward lebih besar (multiplier 1.5x)
- Akses promo lebih awal
- Fast-track appointment
- Birthday special voucher (lebih premium)

> **Tujuan**: Retention. Level paling profitable.

### Diamond (VIP Member) — Elite/Prestige
- **Semua benefit Platinum**, plus:
- Priority penuh untuk booking
- Layanan customer care khusus
- Prioritas appointment darurat
- Konsultasi estetik eksklusif
- Gift & special treatment tertentu
- Undangan event khusus member
- Priority service experience
- Perencanaan treatment personal
- Point multiplier 2x

> **Tujuan**: Luxury experience & prestige. Fokus experience, bukan diskon.

### Prinsip Benefit
- ✅ **Experience** → prioritas, personalisasi, eksklusivitas
- ✅ **Priority** → booking, jadwal, appointment
- ✅ **Personalization** → rekomendasi, perencanaan treatment
- ❌ **Jangan diskon besar-besaran** → merusak value klinik premium

---

## 4. Mekanisme Expiry & Downgrade

### Aturan Expiry

| Level | Expired? | Keterangan |
|-------|----------|-----------|
| Bronze | ❌ Tidak | Gratis selamanya selama profil lengkap |
| Gold | ✅ 1 tahun | Setelah langganan atau auto-upgrade |
| Platinum | ✅ 1 tahun | Setelah langganan atau auto-upgrade |
| Diamond | ✅ 1 tahun | Setelah langganan atau auto-upgrade |

### Flow Saat Expired

```
User Gold/Platinum/Diamond expired
  ↓
Level → Bronze (selalu ada di database)
Status → inactive (untuk paid tier)
last_paid_level → disimpan (misal: "platinum")
  ↓
User bisa renew kapan saja
  ↓
Renew → kembali ke last_paid_level
```

### Kolom Baru: `last_paid_level`
- Type: `enum('gold','platinum','diamond')` nullable
- Diisi setiap kali user berada di level berbayar
- Digunakan untuk restore level saat renew

---

## 5. Perubahan Database

### Migration Baru: `add_bronze_to_membership_system`

#### Tabel `users` — Perubahan kolom:
```php
// 1. Ubah enum membership_level: tambah 'bronze', default 'bronze'
$table->enum('membership_level', ['bronze', 'gold', 'platinum', 'diamond'])
      ->default('bronze')->change();

// 2. Tambah kolom last_paid_level
$table->enum('last_paid_level', ['gold', 'platinum', 'diamond'])
      ->nullable()->after('membership_level');
```

#### Tabel `membership_histories` — Perubahan enum:
```php
// old_level dan new_level tambah 'bronze'
$table->enum('old_level', ['bronze', 'gold', 'platinum', 'diamond', 'none'])->change();
$table->enum('new_level', ['bronze', 'gold', 'platinum', 'diamond'])->change();
```

#### Data migration — Update existing users:
```php
// User yang saat ini gold dan belum lengkapi profil → tetap gold (grandfathered)
// User yang gold dan profil lengkap → tetap gold (grandfathered)
// SEMUA user existing tetap di level saat ini (TIDAK diturunkan ke bronze)
// Hanya user BARU yang mulai dari bronze
```

---

## 6. Perubahan Backend (Laravel)

### 6.1 User Model (`app/Models/User.php`)

#### `getNextMembershipLevel()` — Update:
```php
public function getNextMembershipLevel(): ?string
{
    return match($this->membership_level) {
        'bronze' => 'gold',
        'gold' => 'platinum',
        'platinum' => 'diamond',
        'diamond' => null,
        default => 'bronze',
    };
}
```

#### `getProgressToNextLevel()` — Update threshold:
```php
$requiredAmount = match($nextLevel) {
    'gold' => 5000000,       // BARU: 5 juta untuk gold
    'platinum' => 15000000,  // Diubah: 15 juta (sebelumnya 10 juta)
    'diamond' => 30000000,   // Tetap: 30 juta
    default => 0,
};
```

#### `isMembershipActive()` — Update untuk bronze:
```php
public function isMembershipActive(): bool
{
    // Bronze selalu aktif (gratis, tidak expired)
    if ($this->membership_level === 'bronze') {
        return $this->membership_profile_completed;
    }

    return $this->membership_status === 'active'
        && !is_null($this->membership_expires_at)
        && now()->lessThanOrEqualTo($this->membership_expires_at);
}
```

#### Method baru — `isBronze()`:
```php
public function isBronze(): bool
{
    return $this->membership_level === 'bronze';
}

public function isPaidMember(): bool
{
    return in_array($this->membership_level, ['gold', 'platinum', 'diamond']);
}
```

#### `promoEligibleLevel()` — Update:
```php
public function promoEligibleLevel(): string
{
    if (!$this->isProfileComplete()) {
        return 'none';
    }

    return match($this->membership_level) {
        'bronze' => 'bronze',
        'gold' => 'gold_bonus',
        'platinum' => 'platinum_bonus',
        'diamond' => 'diamond_bonus',
        default => 'regular',
    };
}
```

#### `$fillable` — Tambah `last_paid_level`:
```php
'last_paid_level',
```

#### `casts()` — Tambah:
```php
// Tidak perlu cast khusus, enum sudah ditangani Laravel
```

### 6.2 MembershipService (`app/Services/MembershipService.php`)

#### `calculateMembershipLevel()` — Update:
```php
public function calculateMembershipLevel(User $user): string
{
    $profile = $user->membershipProfile;
    $isProfileComplete = $profile && $profile->isComplete();

    // Jika profil belum lengkap → bronze
    if (!$isProfileComplete) {
        return 'bronze';
    }

    // Check dari tertinggi ke terendah
    if ($user->total_transactions >= 30000000) {
        return 'diamond';
    }

    if ($user->total_transactions >= 15000000 || $user->completed_treatments >= 8) {
        return 'platinum';
    }

    if ($user->total_transactions >= 5000000) {
        return 'gold';
    }

    // Profil lengkap tapi belum ada transaksi → bronze
    return 'bronze';
}
```

#### `getMembershipBenefits()` — Tambah bronze:
```php
public function getMembershipBenefits(string $level): array
{
    return match($level) {
        'bronze' => [
            'birthday_voucher' => true,
            'personalized_recommendation' => true,
            'special_promo' => true,
            'booking_history' => true,
            'treatment_reminder' => true,
            'discount_percentage' => 0,
            'point_multiplier' => 0.5,
        ],
        'gold' => [
            'birthday_voucher' => true,
            'personalized_recommendation' => true,
            'special_promo' => true,
            'priority_booking' => true,
            'free_consultation' => true,
            'point_reward' => true,
            'exclusive_promo' => true,
            'treatment_priority_reminder' => true,
            'discount_percentage' => 5,
            'point_multiplier' => 1,
        ],
        'platinum' => [
            'birthday_voucher' => true,
            'personalized_recommendation' => true,
            'special_promo' => true,
            'priority_booking' => true,
            'priority_doctor_schedule' => true,
            'free_scaling_per_year' => 1,
            'premium_treatment_benefit' => true,
            'early_access_promo' => true,
            'fast_track_appointment' => true,
            'birthday_special_voucher' => true,
            'discount_percentage' => 10,
            'point_multiplier' => 1.5,
        ],
        'diamond' => [
            'birthday_voucher' => true,
            'personalized_recommendation' => true,
            'special_promo' => true,
            'priority_booking' => true,
            'vip_priority' => true,
            'dedicated_customer_care' => true,
            'emergency_appointment_priority' => true,
            'exclusive_treatment_offers' => true,
            'annual_smile_evaluation' => true,
            'exclusive_event_invitation' => true,
            'personal_treatment_plan' => true,
            'special_gift' => true,
            'discount_percentage' => 15,
            'point_multiplier' => 2,
        ],
        default => [],
    };
}
```

> **Catatan penting**: Diskon dikurangi dari sebelumnya!
> - Gold: 10% → 5% (entry premium, jangan terlalu murah)
> - Platinum: 15% → 10%
> - Diamond: 20% → 15%
> 
> Fokus ke **experience & priority**, bukan diskon.

#### `downgradeMembership()` — Update:
```php
protected function downgradeMembership(User $user): void
{
    // Simpan level terakhir sebelum downgrade
    if ($user->isPaidMember()) {
        $user->update(['last_paid_level' => $user->membership_level]);
    }

    // Selalu downgrade ke bronze (bukan gold)
    $this->updateMembershipLevel(
        $user,
        'bronze',
        $user->membership_level,
        'Membership expired - downgraded to Bronze'
    );

    // Set status inactive untuk paid tier
    $user->update(['membership_status' => 'inactive']);
}
```

#### Method baru — `renewMembership()`:
```php
public function renewMembership(User $user, ?string $targetLevel = null): bool
{
    $level = $targetLevel ?? $user->last_paid_level;

    if (!$level || !in_array($level, ['gold', 'platinum', 'diamond'])) {
        return false;
    }

    $oldLevel = $user->membership_level;

    $this->updateMembershipLevel(
        $user,
        $level,
        $oldLevel,
        'Membership renewed to ' . $level
    );

    return true;
}
```

#### `updateMembershipLevel()` — Update untuk simpan last_paid_level:
```php
public function updateMembershipLevel(User $user, string $newLevel, ...): bool
{
    // ... existing logic ...

    $updateData = [
        'membership_level' => $newLevel,
        'membership_status' => 'active',
        'membership_started_at' => $user->membership_started_at ?? now(),
    ];

    // Bronze tidak expired
    if ($newLevel === 'bronze') {
        $updateData['membership_expires_at'] = null;
    } else {
        $updateData['membership_expires_at'] = now()->addYear();
        $updateData['last_paid_level'] = $newLevel;
    }

    $user->update($updateData);

    // ... rest of existing logic ...
}
```

### 6.3 MembershipController (`app/Http/Controllers/Api/User/MembershipController.php`)

#### `upgrade()` — Update level order & fees:
```php
$levelOrder = ['bronze' => 0, 'gold' => 1, 'platinum' => 2, 'diamond' => 3];

$upgradeFees = [
    'gold' => 499000,        // BARU
    'platinum' => 1500000,   // Tetap
    'diamond' => 5000000,    // Tetap
];
```

#### `updateProfile()` — Update bronze activation:
```php
// If profile is complete, activate Bronze membership
if ($isComplete && $user->membership_level === 'bronze') {
    $user->update([
        'membership_status' => 'active',
        'membership_profile_completed' => true,
    ]);
    // Tidak langsung upgrade ke gold
    // Gold hanya melalui transaksi atau langganan
}
```

### 6.4 MembershipAdminController (`app/Http/Controllers/Api/Admin/MembershipAdminController.php`)

#### `analytics()` — Tambah bronze:
```php
$revenueByLevel = [
    'bronze' => 0,  // Gratis, tidak ada revenue langsung
    'gold' => User::where('membership_level', 'gold')...,
    'platinum' => ...,
    'diamond' => ...,
];
```

#### `levelDistribution()` — Tambah bronze:
```php
$distribution = [
    'bronze' => User::where('membership_level', 'bronze')->count(),
    'gold' => ...,
    'platinum' => ...,
    'diamond' => ...,
];
```

---

## 7. Perubahan Frontend (React)

### 7.1 `membershipApi.ts` — Type Updates

```typescript
// Update level type
level: 'bronze' | 'gold' | 'platinum' | 'diamond';

// Update AnalyticsData
interface AnalyticsData {
    total_members: number;
    bronze_members: number;    // BARU
    gold_members: number;
    platinum_members: number;
    diamond_members: number;
    // ... rest same
    revenue_by_level: {
        bronze: number;        // BARU
        gold: number;
        platinum: number;
        diamond: number;
    };
}

// Update upgrade target
upgrade: async (targetLevel: 'gold' | 'platinum' | 'diamond'): Promise<any> => { ... }

// Update level distribution
counts: { bronze: number; gold: number; platinum: number; diamond: number };
percentages: { bronze: number; gold: number; platinum: number; diamond: number };
```

### 7.2 `Membership.tsx` — UI Updates

#### Tier Badge & Color Scheme
```
Bronze   → warna: #CD7F32 (bronze/copper)
Gold     → warna: #c9a24a (existing gold)
Platinum → warna: #8B9DAF (platinum/silver-blue)
Diamond  → warna: #B9F2FF (diamond/ice-blue)
```

#### Progress Bar ke Next Level
```
Bronze user melihat:
  "Total transaksi: Rp 2.000.000"
  "Rp 3.000.000 lagi menuju Gold"
  [========------] 40%

Gold user melihat:
  "Total transaksi: Rp 8.500.000"
  "Rp 6.500.000 lagi menuju Platinum"
  [========------] 57%
```

#### Upgrade CTA
- Bronze: "Upgrade ke Gold — Rp 499K/tahun" atau "Transaksi Rp 5 juta untuk auto-upgrade"
- Gold: "Upgrade ke Platinum — Rp 1,5 jt/tahun"
- Platinum: "Upgrade ke Diamond — Rp 5 jt/tahun"
- Diamond: "Anda sudah di level tertinggi"

#### Membership Card per Tier
- Bronze: Card dengan accent bronze
- Gold: Card dengan accent gold (existing)
- Platinum: Card dengan accent platinum
- Diamond: Card dengan accent diamond + efek sparkle/gradient premium

### 7.3 `DashboardLayout.tsx` — Theme per Tier

```typescript
const tierConfig = {
    bronze:   { label: 'Basic Member',    gradient: 'from-[#CD7F32] to-[#8B5E3C]' },
    gold:     { label: 'Premium Member',  gradient: 'from-[#c9a24a] to-[#a8843a]' },
    platinum: { label: 'Priority Member',  gradient: 'from-[#8B9DAF] to-[#6B7D8F]' },
    diamond:  { label: 'VIP Member',      gradient: 'from-[#B9F2FF] to-[#7DD3E8]' },
};
```

---

## 8. UX Flow: Membership Progress di Dashboard

### Tampilan yang Direkomendasikan

```
┌─────────────────────────────────────────┐
│  🏆 Gold Member                        │
│                                         │
│  Total transaksi: Rp 8.500.000         │
│  ████████████░░░░░░░░  57%             │
│  Rp 6.500.000 lagi menuju Platinum     │
│                                         │
│  [Upgrade ke Platinum - Rp 1,5jt/tahun]│
└─────────────────────────────────────────┘
```

### Bronze User (Belum Lengkap Profil)
```
┌─────────────────────────────────────────┐
│  🥉 Bronze Member                       │
│                                         │
│  Lengkapi profil untuk aktifkan         │
│  membership digital Anda                │
│                                         │
│  Profil: ████████░░░░░░░░  60%         │
│  [Lengkapi Profil Sekarang]             │
└─────────────────────────────────────────┘
```

### Bronze User (Profil Lengkap)
```
┌─────────────────────────────────────────┐
│  🥉 Bronze Member — Aktif               │
│                                         │
│  Mulai treatment pertama untuk          │
│  upgrade ke Gold secara otomatis!       │
│                                         │
│  Transaksi: Rp 0                        │
│  Rp 5.000.000 lagi menuju Gold          │
│                                         │
│  [Upgrade ke Gold - Rp 499K/tahun]      │
└─────────────────────────────────────────┘
```

---

## 9. Bahasa & Copywriting

### Ganti Istilah

| Daripada | Gunakan |
|----------|---------|
| "Berlangganan" | "Upgrade Membership" |
| "Diskon" | "Benefit khusus member" |
| "Bayar membership" | "Upgrade ke [level]" |
| "Membership habis" | "Membership perlu diperbarui" |
| "Turun level" | "Kembali ke Bronze" |

### Label per Tier (User-Facing)

| Level | Label Dashboard | Label Kartu |
|-------|----------------|-------------|
| Bronze | Basic Member | BRONZE |
| Gold | Premium Member | GOLD |
| Platinum | Priority Member | PLATINUM |
| Diamond | VIP Member | DIAMOND |

---

## 10. Nominal Langganan (Rekomendasi Final)

| Level | Harga Langganan | Threshold Auto-Upgrade |
|-------|-----------------|----------------------|
| Bronze | **Gratis** | - |
| Gold | Rp **499.000**/tahun | Transaksi ≥ Rp 5.000.000 |
| Platinum | Rp **1.500.000**/tahun | Transaksi ≥ Rp 15.000.000 ATAU 8 treatment |
| Diamond | Rp **5.000.000**/tahun | Transaksi ≥ Rp 30.000.000 ATAU invitation |

> Harga diambil dari batas bawah range untuk menurunkan barrier entry.
> Bisa di-adjust naik nanti jika perlu.

---

## 11. Point Reward System

| Level | Point per Rp 100.000 | Multiplier |
|-------|---------------------|-----------|
| Bronze | 0.5 point | 0.5x |
| Gold | 1 point | 1x |
| Platinum | 1.5 point | 1.5x |
| Diamond | 2 point | 2x |

> Bronze tetap dapat poin (meski sedikit) agar ada hook untuk engagement.

---

## 12. Data Migration Strategy

### Existing Users (Grandfathering)

```
SAAT INI                    SETELAH MIGRATION
─────────────────────────────────────────────
User dengan level 'gold'    → TETAP 'gold' (grandfathered)
User dengan level 'platinum'→ TETAP 'platinum' (grandfathered)
User dengan level 'diamond' → TETAP 'diamond' (grandfathered)
User BARU (registrasi)      → MULAI dari 'bronze'
```

**TIDAK ada user yang diturunkan levelnya.** Hanya user baru yang mulai dari bronze.

### Migration Script
```php
// 1. Tambah enum value 'bronze' ke membership_level
// 2. Tambah kolom last_paid_level
// 3. Set last_paid_level untuk existing paid members
DB::statement("UPDATE users SET last_paid_level = membership_level WHERE membership_level IN ('gold', 'platinum', 'diamond')");
// 4. Update enum di membership_histories
```

---

## 13. API Endpoint Changes

### Baru
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/membership/renew` | Renew ke last_paid_level |
| GET | `/membership/tiers` | List semua tier + benefit (public) |

### Dimodifikasi
| Method | Endpoint | Perubahan |
|--------|----------|-----------|
| POST | `/membership/upgrade` | Target level bisa `'gold'` (dari bronze) |
| GET | `/membership` | Response tambah `last_paid_level`, `tier_info` |
| GET | `/admin/membership/analytics` | Tambah `bronze_members` |
| GET | `/admin/membership/level-distribution` | Tambah `bronze` count |

---

## 14. Urutan Implementasi

1. **Migration** — Tambah bronze enum + kolom last_paid_level
2. **User Model** — Update semua method terkait level
3. **MembershipService** — Core business logic (calculate, benefits, downgrade, renew)
4. **Controllers** — Update existing + endpoint baru
5. **Frontend Types** — Update membershipApi.ts
6. **Frontend UI** — Membership.tsx (tier badge, progress, upgrade CTA)
7. **Frontend Dashboard** — DashboardLayout.tsx (theme per tier)
8. **Testing** — Verifikasi semua flow

---

## 15. Checklist Sebelum Implementasi

- [ ] Konfirmasi nominal langganan final
- [ ] Konfirmasi threshold auto-upgrade final
- [ ] Konfirmasi benefit per tier (apakah ada yang mau ditambah/dikurangi?)
- [ ] Konfirmasi diskon percentage (apakah setuju dikurangi?)
- [ ] Konfirmasi point multiplier per tier
- [ ] Konfirmasi warna/branding per tier
- [ ] Konfirmasi grandfathering strategy (existing user tetap di level saat ini)
- [ ] Siap deploy migration ke production
