<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Membership\UpdateProfileRequest;
use App\Http\Requests\Membership\UpgradeMembershipRequest;
use App\Models\MembershipPoint;
use App\Models\MembershipProfile;
use App\Models\MembershipTransaction;
use App\Services\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MembershipController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

    /**
     * Get user membership details
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->load(['membershipProfile', 'membershipPoints' => function ($query) {
            $query->latest()->limit(20);
        }]);

        $progress = $user->getProgressToNextLevel();
        $benefits = $this->membershipService->getMembershipBenefits($user->membership_level);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'whatsapp' => $user->whatsapp,
                ],
                'membership' => [
                    'level' => $user->membership_level ?? 'bronze',
                    'status' => $user->membership_level === 'bronze' ? 'active' : ($user->membership_status ?? 'active'),
                    'started_at' => $user->membership_started_at,
                    'expires_at' => $user->membership_expires_at,
                    'points' => $user->membership_points,
                    'total_transactions' => $user->total_transactions,
                    'completed_treatments' => $user->completed_treatments,
                    'profile_completed' => $user->membership_profile_completed,
                ],
                'progress' => $progress,
                'benefits' => $benefits,
                'profile' => $user->membershipProfile,
            ],
        ]);
    }

    /**
     * Get membership profile
     */
    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->membershipProfile;

        if (!$profile) {
            return response()->json([
                'success' => true,
                'data' => null,
                'message' => 'Profile not found',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    /**
     * Update membership profile
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $profile = $user->membershipProfile ?? new MembershipProfile();
        $profile->user_id = $user->id;
        $profile->fill($request->validated());
        $profile->save();

        // Check if profile is complete
        $isComplete = $profile->isComplete();
        $user->update(['membership_profile_completed' => $isComplete]);

        // Semua pengguna adalah Bronze member (gratis & otomatis aktif)
        if ($user->membership_level === 'bronze') {
            $user->update([
                'membership_status' => 'active',
                'membership_profile_completed' => $isComplete,
            ]);
            // Tidak langsung upgrade ke gold - Gold hanya melalui pembayaran upgrade
        }

        // Check for auto-upgrade untuk semua level
        $this->membershipService->checkAndUpdateMembershipLevel($user);

        return response()->json([
            'success' => true,
            'data' => $profile,
            'message' => 'Profile updated successfully',
        ]);
    }

    /**
     * Get membership points
     */
    public function getPoints(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $points = $user->membershipPoints()
            ->latest()
            ->paginate(20);

        $earned = $user->membershipPoints()->earned()->sum('points');
        $redeemed = $user->membershipPoints()->redeemed()->sum('points');
        $expired = $user->membershipPoints()->expired()->sum('points');

        return response()->json([
            'success' => true,
            'data' => [
                'current_balance' => $user->membership_points,
                'total_earned' => $earned,
                'total_redeemed' => $redeemed,
                'total_expired' => $expired,
                'history' => $points,
            ],
        ]);
    }

    /**
     * Get membership history
     */
    public function getHistory(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $history = $user->membershipHistories()
            ->with('changedBy:id,name')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * Get membership transactions
     */
    public function getTransactions(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $transactions = $user->membershipTransactions()
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $transactions,
        ]);
    }

    /**
     * Get membership tiers info (public endpoint)
     */
    public function tiers(Request $request): JsonResponse
    {
        $tiers = [
            'bronze' => [
                'label' => 'Basic Member',
                'price' => 0,
                'threshold_transaction' => 0,
                'benefits' => $this->membershipService->getMembershipBenefits('bronze'),
            ],
            'gold' => [
                'label' => 'Premium Member',
                'price' => 499000,
                'threshold_transaction' => 5000000,
                'benefits' => $this->membershipService->getMembershipBenefits('gold'),
            ],
            'platinum' => [
                'label' => 'Priority Member',
                'price' => 1500000,
                'threshold_transaction' => 15000000,
                'benefits' => $this->membershipService->getMembershipBenefits('platinum'),
            ],
        ];

        return response()->json([
            'success' => true,
            'data' => $tiers,
        ]);
    }

    /**
     * Upgrade membership
     */
    public function upgrade(UpgradeMembershipRequest $request): JsonResponse
    {
        $user = $request->user();
        $targetLevel = $request->input('target_level');

        // Validate upgrade
        $currentLevel = $user->membership_level;
        $levelOrder = ['bronze' => 0, 'gold' => 1, 'platinum' => 2];

        if ($levelOrder[$targetLevel] <= $levelOrder[$currentLevel]) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot downgrade membership through this endpoint',
            ], 400);
        }

        // Calculate upgrade fee
        $upgradeFees = [
            'gold' => 499000,        // BARU: dari bronze ke gold
            'platinum' => 1500000,   // Tetap
        ];

        $fee = $upgradeFees[$targetLevel] ?? 0;

        // Create upgrade transaction
        $this->membershipService->addTransaction(
            $user,
            $fee,
            'upgrade',
            "Membership upgrade to {$targetLevel}",
            ['target_level' => $targetLevel]
        );

        // Update membership level
        $this->membershipService->updateMembershipLevel(
            $user,
            $targetLevel,
            $currentLevel,
            'Paid upgrade',
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => "Successfully upgraded to {$targetLevel} membership",
            'data' => [
                'new_level' => $targetLevel,
                'fee_paid' => $fee,
            ],
        ]);
    }

    /**
     * Submit an upgrade request for review (Task 4.2)
     */
    public function requestUpgrade(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'target_level' => 'required|in:gold,platinum',
        ]);

        $user = $request->user();
        $targetLevel = $validated['target_level'];
        $currentLevel = $user->membership_level ?? 'bronze';

        $levelOrder = ['bronze' => 0, 'gold' => 1, 'platinum' => 2];

        if (!array_key_exists($targetLevel, $levelOrder)) {
            return response()->json([
                'success' => false,
                'message' => 'Level membership target tidak valid.',
            ], 422);
        }

        if ($levelOrder[$targetLevel] <= $levelOrder[$currentLevel]) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade hanya diperbolehkan untuk level membership yang lebih tinggi.',
            ], 422);
        }

        // Duplicate Pending Request Guard
        $existingPending = MembershipTransaction::where('user_id', $user->id)
            ->where('transaction_type', 'upgrade')
            ->where('status', 'pending')
            ->where('description', 'like', "%{$targetLevel}%")
            ->first();

        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => "Permintaan upgrade ke level {$targetLevel} sudah terdaftar dan sedang menunggu proses review.",
                'data' => [
                    'id' => (string) $existingPending->id,
                    'user_id' => (string) $user->id,
                    'current_level' => $currentLevel,
                    'target_level' => $targetLevel,
                    'status' => 'pending',
                ]
            ], 422);
        }

        $upgradeFees = [
            'gold' => 499000,
            'platinum' => 1500000,
        ];

        $fee = $upgradeFees[$targetLevel] ?? 0;

        $transaction = MembershipTransaction::create([
            'user_id' => $user->id,
            'amount' => $fee,
            'transaction_type' => 'upgrade',
            'status' => 'pending',
            'description' => "Permintaan upgrade ke membership {$targetLevel}",
            'metadata' => ['target_level' => $targetLevel, 'current_level' => $currentLevel],
        ]);

        return response()->json([
            'success' => true,
            'message' => "Permintaan upgrade ke membership {$targetLevel} berhasil dibuat.",
            'data' => [
                'id' => (string) $transaction->id,
                'user_id' => (string) $user->id,
                'current_level' => $currentLevel,
                'target_level' => $targetLevel,
                'amount' => $fee,
                'amount_formatted' => 'Rp ' . number_format($fee, 0, ',', '.'),
                'status' => 'pending',
                'created_at' => optional($transaction->created_at)->toISOString(),
            ],
        ], 201);
    }

    /**
     * Renew membership to last paid level
     */
    public function renew(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if user can renew
        if (!$user->last_paid_level) {
            return response()->json([
                'success' => false,
                'message' => 'No previous paid level to renew to',
            ], 400);
        }

        $success = $this->membershipService->renewMembership($user);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to renew membership',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => "Successfully renewed to {$user->membership_level} membership",
            'data' => [
                'new_level' => $user->membership_level,
            ],
        ]);
    }

    /**
     * Redeem points
     */
    public function redeemPoints(Request $request): JsonResponse
    {
        $request->validate([
            'points' => 'required|integer|min:1',
            'description' => 'required|string',
        ]);

        $user = $request->user();
        $points = $request->input('points');
        $description = $request->input('description');

        try {
            $this->membershipService->redeemPoints($user, $points, $description);

            return response()->json([
                'success' => true,
                'message' => "Successfully redeemed {$points} points",
                'data' => [
                    'points_redeemed' => $points,
                    'new_balance' => $user->fresh()->membership_points,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Cancel membership
     */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->membership_status === 'cancelled') {
            return response()->json([
                'success' => false,
                'message' => 'Membership sudah dibatalkan sebelumnya',
            ], 400);
        }

        $user->update([
            'membership_status' => 'cancelled',
        ]);

        $this->membershipService->recordHistory(
            $user,
            $user->membership_level,
            $user->membership_level,
            'Pembatalan membership oleh pengguna',
            $user->id
        );

        return response()->json([
            'success' => true,
            'message' => 'Membership berhasil dibatalkan',
            'data' => [
                'status' => 'cancelled',
            ],
        ]);
    }
}
