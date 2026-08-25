<?php

namespace App\Services\Patient\Membership;

use App\Models\Patient\Membership\MembershipHistory;
use App\Models\Patient\Membership\MembershipPoint;
use App\Models\Patient\Membership\MembershipProfile;
use App\Models\Patient\Membership\MembershipTransaction;
use App\Models\Shared\User\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipService
{
    /**
     * Check and update membership level based on user activity
     */
    public function checkAndUpdateMembershipLevel(User $user, ?int $changedBy = null): bool
    {
        $oldLevel = $user->membership_level;
        $newLevel = $this->calculateMembershipLevel($user);

        if ($oldLevel !== $newLevel) {
            return $this->updateMembershipLevel($user, $newLevel, $oldLevel, 'Automatic upgrade based on activity', $changedBy);
        }

        return false;
    }

    /**
     * Calculate the appropriate membership level for a user
     *
     * Semua pengguna terdaftar otomatis Bronze (gratis). Gold & Platinum
     * hanya diperoleh melalui pembayaran/upgrade, bukan dari transaksi otomatis.
     */
    public function calculateMembershipLevel(User $user): string
    {
        // Gold & Platinum hanya lewat pembayaran, jangan turunkan level yang sudah dibayar
        if (in_array($user->membership_level, ['gold', 'platinum'], true)) {
            return $user->membership_level;
        }

        // Default: semua pengguna adalah Bronze member
        return 'bronze';
    }

    /**
     * Update membership level
     */
    public function updateMembershipLevel(User $user, string $newLevel, ?string $oldLevel = null, string $reason = 'Manual update', ?int $changedBy = null): bool
    {
        try {
            DB::beginTransaction();

            $oldLevel = $oldLevel ?? $user->membership_level;

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

            // Record history
            MembershipHistory::create([
                'user_id' => $user->id,
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
                'reason' => $reason,
                'changed_by' => $changedBy,
                'metadata' => [
                    'previous_level' => $oldLevel,
                    'new_level' => $newLevel,
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            DB::commit();

            Log::info("Membership level updated for user {$user->id}: {$oldLevel} -> {$newLevel}");

            return true;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to update membership level: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Renew membership to last paid level
     */
    public function renewMembership(User $user, ?string $targetLevel = null): bool
    {
        $level = $targetLevel ?? $user->last_paid_level;

        if (!$level || !in_array($level, ['gold', 'platinum'])) {
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

    /**
     * Add transaction and update membership
     */
    public function addTransaction(User $user, float $amount, string $type, string $description = null, array $metadata = []): MembershipTransaction
    {
        try {
            DB::beginTransaction();

            // Create transaction
            $transaction = MembershipTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'transaction_type' => $type,
                'description' => $description,
                'status' => 'completed',
                'metadata' => $metadata,
            ]);

            // Update user totals
            $user->update([
                'total_transactions' => $user->total_transactions + $amount,
            ]);

            // Add points (1 point per 100,000 IDR)
            if ($type === 'treatment') {
                $pointsEarned = intval(floor($amount / 100000));
                if ($pointsEarned > 0) {
                    $this->addPoints($user, $pointsEarned, 'earned', "Points earned from treatment: {$description}");
                }
            }

            // Check for membership upgrade
            $this->checkAndUpdateMembershipLevel($user);

            DB::commit();

            return $transaction;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to add transaction: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Add points to user account
     */
    public function addPoints(User $user, int $points, string $type = 'earned', string $description = null, ?string $referenceId = null, ?string $referenceType = null, ?int $adminId = null): MembershipPoint
    {
        try {
            return DB::transaction(function () use ($user, $points, $type, $description, $referenceId, $referenceType, $adminId) {
                $lockedUser = User::where('id', $user->id)->lockForUpdate()->first();
                $currentBalance = (int) ($lockedUser->membership_points ?? 0);

                if ($type === 'redeemed' || $type === 'expired') {
                    $deductAmount = abs($points);
                    if ($currentBalance < $deductAmount) {
                        throw new \InvalidArgumentException("Saldo poin member tidak mencukupi untuk pengurangan poin.");
                    }
                    $pointsValue = -$deductAmount;
                    $newBalance = $currentBalance - $deductAmount;
                } else {
                    $pointsValue = $points;
                    $newBalance = $currentBalance + $pointsValue;
                    if ($newBalance < 0) {
                        throw new \InvalidArgumentException("Penyesuaian poin akan menyebabkan saldo menjadi negatif.");
                    }
                }

                $point = MembershipPoint::create([
                    'user_id' => $lockedUser->id,
                    'points' => $pointsValue,
                    'balance_before' => $currentBalance,
                    'balance_after' => $newBalance,
                    'type' => $type,
                    'description' => $description,
                    'reference_id' => $referenceId,
                    'reference_type' => $referenceType,
                    'admin_id' => $adminId,
                    'expires_at' => now()->addYear(),
                ]);

                $lockedUser->membership_points = $newBalance;
                $lockedUser->save();

                $this->checkAndUpdateMembershipLevel($lockedUser, $adminId);

                return $point;
            });
        } catch (\Exception $e) {
            Log::error("Failed to add points: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Redeem points
     */
    public function redeemPoints(User $user, int $points, string $description, ?string $referenceId = null): MembershipPoint
    {
        $pointsToDeduct = abs($points);
        if ($pointsToDeduct <= 0) {
            throw new \InvalidArgumentException("Jumlah poin yang ditukar harus lebih dari 0.");
        }

        return $this->addPoints($user, $pointsToDeduct, 'redeemed', $description, $referenceId, 'reservation');
    }

    /**
     * Complete treatment
     */
    public function completeTreatment(User $user, float $amount, string $description): void
    {
        $user->update([
            'completed_treatments' => $user->completed_treatments + 1,
        ]);

        $this->addTransaction($user, $amount, 'treatment', $description);

        // Check for membership upgrade
        $this->checkAndUpdateMembershipLevel($user);
    }

    /**
     * Get membership benefits based on level
     */
    public function getMembershipBenefits(string $level): array
    {
        return match($level) {
            'bronze' => [
                'medical_record_digital' => true,
                'booking_history' => true,
                'point_reward' => true,
                'special_promo' => true,
                'birthday_voucher' => false,
                'discount_percentage' => 0,
                'point_multiplier' => 1.0,
                'privilege_badge' => 'Standard Member',
            ],
            'gold' => [
                'medical_record_digital' => true,
                'booking_history' => true,
                'point_reward' => true,
                'special_promo' => true,
                'priority_booking' => true,
                'free_consultation' => true,
                'birthday_voucher' => true,
                'exclusive_promo' => true,
                'discount_percentage' => 5,
                'point_multiplier' => 1.5,
                'privilege_badge' => 'Premium Privilege',
            ],
            'platinum' => [
                'medical_record_digital' => true,
                'booking_history' => true,
                'point_reward' => true,
                'special_promo' => true,
                'priority_booking' => true,
                'priority_doctor_schedule' => true,
                'fast_track_vip' => true,
                'free_scaling_per_year' => 1,
                'dedicated_patient_care' => true,
                'free_consultation' => true,
                'birthday_voucher' => true,
                'birthday_special_voucher' => true,
                'exclusive_promo' => true,
                'discount_percentage' => 10,
                'point_multiplier' => 2.0,
                'privilege_badge' => 'VIP Priority Privilege',
            ],
            default => [],
        };
    }

    /**
     * Check for expired memberships and downgrade
     */
    public function checkExpiredMemberships(): void
    {
        $expiredUsers = User::where('membership_status', 'active')
            ->where('membership_expires_at', '<', now())
            ->get();

        foreach ($expiredUsers as $user) {
            $this->downgradeMembership($user);
        }
    }

    /**
     * Downgrade membership to Bronze
     */
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

        // Bronze selalu aktif (gratis, tidak butuh status berbayar)
        $user->update(['membership_status' => 'active']);
    }

    /**
     * Get membership analytics
     */
    public function getAnalytics(): array
    {
        return [
            'total_members' => User::whereIn('role', ['user', 'patient'])->count(),
            'bronze_members' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'bronze')->count(),
            'gold_members' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'gold')->where('membership_status', 'active')->count(),
            'platinum_members' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'platinum')->where('membership_status', 'active')->count(),
            'total_points_issued' => MembershipPoint::earned()->sum('points'),
            'total_points_redeemed' => MembershipPoint::redeemed()->sum('points'),
            'total_revenue' => MembershipTransaction::completed()->sum('amount'),
            'most_active_members' => User::withCount('membershipTransactions')
                ->orderBy('membership_transactions_count', 'desc')
                ->limit(10)
                ->get(['id', 'name', 'membership_level', 'membership_transactions_count']),
        ];
    }
}
