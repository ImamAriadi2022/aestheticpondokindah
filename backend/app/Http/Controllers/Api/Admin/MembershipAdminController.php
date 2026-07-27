<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Membership\UpdateLevelRequest;
use App\Http\Requests\Admin\Membership\UpdatePointsRequest;
use App\Models\User;
use App\Services\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class MembershipAdminController extends Controller
{
    protected MembershipService $membershipService;

    public function __construct(MembershipService $membershipService)
    {
        $this->membershipService = $membershipService;
    }

    /**
     * Get all members with filters
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['membershipProfile', 'membershipPoints' => function ($q) {
            $q->latest()->limit(5);
        }]);

        // Filter by membership level
        if ($request->has('level')) {
            $query->where('membership_level', $request->input('level'));
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('membership_status', $request->input('status'));
        }

        // Filter by minimum transaction amount
        if ($request->has('min_transaction')) {
            $query->where('total_transactions', '>=', $request->input('min_transaction'));
        }

        // Search by name or email
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $members = $query->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $members,
        ]);
    }

    /**
     * Get specific member details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $member = User::with([
            'membershipProfile',
            'membershipPoints' => function ($q) {
                $q->latest()->limit(50);
            },
            'membershipTransactions' => function ($q) {
                $q->latest()->limit(50);
            },
            'membershipHistories' => function ($q) {
                $q->with('changedBy:id,name')->latest();
            },
        ])->findOrFail($id);

        $progress = $member->getProgressToNextLevel();
        $benefits = $this->membershipService->getMembershipBenefits($member->membership_level);

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $member,
                'progress' => $progress,
                'benefits' => $benefits,
            ],
        ]);
    }

    /**
     * Update member level
     */
    public function updateLevel(UpdateLevelRequest $request, int $id): JsonResponse
    {
        $member = User::findOrFail($id);
        $admin = $request->user();

        $oldLevel = $member->membership_level;
        $newLevel = $request->input('level');
        $reason = $request->input('reason', 'Manual update by admin');

        $this->membershipService->updateMembershipLevel(
            $member,
            $newLevel,
            $oldLevel,
            $reason,
            $admin->id
        );

        return response()->json([
            'success' => true,
            'message' => "Membership level updated from {$oldLevel} to {$newLevel}",
            'data' => [
                'old_level' => $oldLevel,
                'new_level' => $newLevel,
            ],
        ]);
    }

    /**
     * Update member points
     */
    public function updatePoints(UpdatePointsRequest $request, int $id): JsonResponse
    {
        $member = User::findOrFail($id);
        $points = $request->input('points');
        $type = $request->input('type', 'adjusted');
        $description = $request->input('description', 'Manual adjustment by admin');

        $this->membershipService->addPoints(
            $member,
            $points,
            $type,
            $description
        );

        return response()->json([
            'success' => true,
            'message' => "Points updated successfully",
            'data' => [
                'points_adjusted' => $points,
                'new_balance' => $member->fresh()->membership_points,
            ],
        ]);
    }

    /**
     * Get membership analytics
     */
    public function analytics(Request $request): JsonResponse
    {
        $analytics = $this->membershipService->getAnalytics();

        // Add growth data
        $growth = [
            'new_members_this_month' => User::where('membership_status', 'active')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count(),
            'upgrades_this_month' => User::whereHas('membershipHistories', function ($q) {
                $q->whereMonth('created_at', now()->month)
                  ->whereYear('created_at', now()->year);
            })->count(),
        ];

        // Revenue by membership level
        $revenueByLevel = [
            'bronze' => 0,  // Gratis, tidak ada revenue langsung dari langganan
            'gold' => User::where('membership_level', 'gold')
                ->where('membership_status', 'active')
                ->sum('total_transactions'),
            'platinum' => User::where('membership_level', 'platinum')
                ->where('membership_status', 'active')
                ->sum('total_transactions'),
            'diamond' => User::where('membership_level', 'diamond')
                ->where('membership_status', 'active')
                ->sum('total_transactions'),
        ];

        return response()->json([
            'success' => true,
            'data' => array_merge($analytics, [
                'growth' => $growth,
                'revenue_by_level' => $revenueByLevel,
            ]),
        ]);
    }

    /**
     * Get membership level distribution
     */
    public function levelDistribution(Request $request): JsonResponse
    {
        $distribution = [
            'bronze' => User::where('membership_level', 'bronze')->count(),
            'gold' => User::where('membership_level', 'gold')->count(),
            'platinum' => User::where('membership_level', 'platinum')->count(),
            'diamond' => User::where('membership_level', 'diamond')->count(),
        ];

        $total = array_sum($distribution);

        $percentage = [
            'bronze' => $total > 0 ? round(($distribution['bronze'] / $total) * 100, 1) : 0,
            'gold' => $total > 0 ? round(($distribution['gold'] / $total) * 100, 1) : 0,
            'platinum' => $total > 0 ? round(($distribution['platinum'] / $total) * 100, 1) : 0,
            'diamond' => $total > 0 ? round(($distribution['diamond'] / $total) * 100, 1) : 0,
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'counts' => $distribution,
                'percentages' => $percentage,
                'total' => $total,
            ],
        ]);
    }

    /**
     * Delete member (soft delete)
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $member = User::findOrFail($id);
        $member->delete();

        return response()->json([
            'success' => true,
            'message' => 'Member deleted successfully',
        ]);
    }
}
