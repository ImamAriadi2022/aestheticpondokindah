<?php

namespace App\Services;

use App\Models\MembershipHistory;
use App\Models\MembershipPoint;
use App\Models\MembershipProfile;
use App\Models\MembershipTransaction;
use App\Models\User;
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
     */
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
    public function addPoints(User $user, int $points, string $type = 'earned', string $description = null, ?string $referenceId = null, ?string $referenceType = null): MembershipPoint
    {
        try {
            DB::beginTransaction();

            $point = MembershipPoint::create([
                'user_id' => $user->id,
                'points' => $points,
                'type' => $type,
                'description' => $description,
                'reference_id' => $referenceId,
                'reference_type' => $referenceType,
                'expires_at' => now()->addYear(),
            ]);

            // Update user point balance
            $currentBalance = $user->membership_points;
            $newBalance = $type === 'earned' || $type === 'adjusted' 
                ? $currentBalance + $points 
                : max(0, $currentBalance - $points);

            $user->update([
                'membership_points' => $newBalance,
            ]);

            DB::commit();

            return $point;
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("Failed to add points: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Redeem points
     */
    public function redeemPoints(User $user, int $points, string $description, ?string $referenceId = null): bool
    {
        if ($user->membership_points < $points) {
            throw new \Exception('Insufficient points balance');
        }

        $this->addPoints($user, $points, 'redeemed', $description, $referenceId, 'redemption');
        return true;
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

        // Set status inactive untuk paid tier (bronze tidak pakai status)
        $user->update(['membership_status' => 'inactive']);
    }

    /**
     * Get membership analytics
     */
    public function getAnalytics(): array
    {
        return [
            'total_members' => User::where('membership_status', 'active')->orWhere('membership_level', 'bronze')->count(),
            'bronze_members' => User::where('membership_level', 'bronze')->count(),
            'gold_members' => User::where('membership_level', 'gold')->where('membership_status', 'active')->count(),
            'platinum_members' => User::where('membership_level', 'platinum')->where('membership_status', 'active')->count(),
            'diamond_members' => User::where('membership_level', 'diamond')->where('membership_status', 'active')->count(),
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
