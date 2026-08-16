<?php

namespace App\Http\Controllers\Api\Admin\Membership;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Membership\UpdateLevelRequest;
use App\Http\Requests\Admin\Membership\UpdatePointsRequest;
use App\Models\Shared\User\User;
use App\Models\Patient\Membership\MembershipTransaction;
use App\Models\Patient\Billing\Invoice;
use App\Services\MembershipService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

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
        $query = User::with(['membershipProfile']);

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

        try {
            $this->membershipService->addPoints(
                $member,
                $points,
                $type,
                $description
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => "Poin member berhasil diperbarui.",
            'data' => [
                'points_adjusted' => $points,
                'new_balance' => $member->fresh()->membership_points,
            ],
        ]);
    }

    /**
     * Get point transaction history for a specific member
     */
    public function pointsHistory(Request $request, int $id): JsonResponse
    {
        $member = User::findOrFail($id);

        $query = $member->membershipPoints()->latest();

        if ($request->has('type') && $request->input('type') !== 'all') {
            $query->where('type', $request->input('type'));
        }

        $history = $query->paginate($request->input('per_page', 20));

        return response()->json([
            'success' => true,
            'data' => $history,
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'membership_points' => $member->membership_points,
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
            'gold' => User::whereIn('role', ['user', 'patient'])
                ->where('membership_level', 'gold')
                ->where('membership_status', 'active')
                ->sum('total_transactions'),
            'platinum' => User::whereIn('role', ['user', 'patient'])
                ->where('membership_level', 'platinum')
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
            'bronze' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'bronze')->count(),
            'gold' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'gold')->count(),
            'platinum' => User::whereIn('role', ['user', 'patient'])->where('membership_level', 'platinum')->count(),
        ];

        $total = array_sum($distribution);

        $percentage = [
            'bronze' => $total > 0 ? round(($distribution['bronze'] / $total) * 100, 1) : 0,
            'gold' => $total > 0 ? round(($distribution['gold'] / $total) * 100, 1) : 0,
            'platinum' => $total > 0 ? round(($distribution['platinum'] / $total) * 100, 1) : 0,
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

    /**
     * Get pending/all membership upgrade requests (Task 4.3)
     */
    public function requests(Request $request): JsonResponse
    {
        $query = MembershipTransaction::with('user')
            ->where('transaction_type', 'upgrade')
            ->latest();

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $requests = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $requests,
        ]);
    }

    /**
     * Get specific upgrade request details
     */
    public function showRequest(Request $request, int|string $id): JsonResponse
    {
        $upgradeRequest = MembershipTransaction::with('user')
            ->where('transaction_type', 'upgrade')
            ->find($id);

        if (!$upgradeRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade tidak ditemukan.',
            ], 404);
        }

        $invoice = Invoice::where('membership_transaction_id', $upgradeRequest->id)->first();

        return response()->json([
            'success' => true,
            'data' => [
                'request' => $upgradeRequest,
                'invoice' => $invoice,
            ],
        ]);
    }

    /**
     * Approve membership upgrade request & generate UNPAID invoice (Task 4.3)
     */
    public function approveRequest(Request $request, int|string $id): JsonResponse
    {
        $upgradeRequest = MembershipTransaction::with('user')->find($id);

        if (!$upgradeRequest || $upgradeRequest->transaction_type !== 'upgrade') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade tidak ditemukan.',
            ], 404);
        }

        // Business Rules Validation
        if ($upgradeRequest->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade sudah disetujui sebelumnya.',
            ], 422);
        }

        if ($upgradeRequest->status === 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade yang sudah ditolak tidak dapat disetujui.',
            ], 422);
        }

        if ($upgradeRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya permintaan upgrade dengan status Pending yang dapat disetujui.',
            ], 422);
        }

        // Update Upgrade Request Status to Approved
        $upgradeRequest->status = 'approved';
        $upgradeRequest->save();

        // Target Level Extracted from Metadata or Description
        $targetLevel = $upgradeRequest->metadata['target_level'] ?? 'gold';
        if (preg_match('/(gold|platinum|diamond)/i', $upgradeRequest->description, $matches)) {
            $targetLevel = strtolower($matches[1]);
        }

        // Duplicate Invoice Prevention Guard
        $existingInvoice = Invoice::where('membership_transaction_id', $upgradeRequest->id)->first();

        if (!$existingInvoice) {
            $invoiceNumber = 'INV-MEM-' . date('Ymd') . '-' . str_pad((string) $upgradeRequest->id, 6, '0', STR_PAD_LEFT);

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'user_id' => $upgradeRequest->user_id,
                'membership_transaction_id' => $upgradeRequest->id,
                'target_level' => $targetLevel,
                'amount' => $upgradeRequest->amount,
                'status' => 'unpaid', // UNPAID - Ready for Payment Simulation
                'description' => "Tagihan Pembayaran Upgrade Membership " . ucfirst($targetLevel),
                'invoice_date' => now(),
                'due_date' => now()->addDays(7),
            ]);
        } else {
            $invoice = $existingInvoice;
        }

        // IMPORTANT INVARIANT: User's membership level MUST NOT change on approval (remains unchanged until payment)
        $userLevelUnchanged = $upgradeRequest->user ? $upgradeRequest->user->membership_level : 'bronze';

        return response()->json([
            'success' => true,
            'message' => 'Permintaan upgrade disetujui. Tagihan invoice berhasil diterbitkan dengan status UNPAID.',
            'data' => [
                'request' => $upgradeRequest->fresh(),
                'invoice' => $invoice,
                'user_membership_level' => $userLevelUnchanged,
                'membership_active' => false, // MUST NOT BE ACTIVE
            ],
        ]);
    }

    /**
     * Reject membership upgrade request (Task 4.3)
     */
    public function rejectRequest(Request $request, int|string $id): JsonResponse
    {
        $upgradeRequest = MembershipTransaction::find($id);

        if (!$upgradeRequest || $upgradeRequest->transaction_type !== 'upgrade') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade tidak ditemukan.',
            ], 404);
        }

        // Business Rules Validation
        if ($upgradeRequest->status === 'rejected') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade sudah ditolak sebelumnya.',
            ], 422);
        }

        if ($upgradeRequest->status === 'approved') {
            return response()->json([
                'success' => false,
                'message' => 'Permintaan upgrade yang sudah disetujui tidak dapat ditolak.',
            ], 422);
        }

        if ($upgradeRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya permintaan upgrade dengan status Pending yang dapat ditolak.',
            ], 422);
        }

        $upgradeRequest->status = 'rejected';
        $upgradeRequest->save();

        return response()->json([
            'success' => true,
            'message' => 'Permintaan upgrade berhasil ditolak.',
            'data' => [
                'request' => $upgradeRequest->fresh(),
                'invoice_generated' => false, // NO INVOICE FOR REJECTED
            ],
        ]);
    }

    /**
     * Confirm a manual (WhatsApp/offline) membership payment.
     */
    public function confirmManualPayment(Request $request, int|string $id): JsonResponse
    {
        $request->validate(['note' => 'nullable|string|max:1000']);

        $transaction = MembershipTransaction::with('user')->find($id);
        if (!$transaction || $transaction->transaction_type !== 'upgrade') {
            return response()->json(['success' => false, 'message' => 'Permintaan upgrade tidak ditemukan.'], 404);
        }

        if ($transaction->status !== 'pending') {
            return response()->json(['success' => false, 'message' => 'Hanya pembayaran pending yang dapat dikonfirmasi.'], 422);
        }

        $targetLevel = $transaction->metadata['target_level'] ?? null;
        if (!in_array($targetLevel, ['gold', 'platinum'], true)) {
            return response()->json(['success' => false, 'message' => 'Tier transaksi tidak valid.'], 422);
        }

        DB::transaction(function () use ($transaction, $targetLevel, $request): void {
            $user = $transaction->user;
            $transaction->update([
                'status' => 'completed',
                'metadata' => array_merge($transaction->metadata ?? [], [
                    'payment_confirmation' => 'manual_admin',
                    'confirmed_by' => $request->user()->id,
                    'confirmed_at' => now()->toISOString(),
                    'confirmation_note' => $request->input('note'),
                ]),
            ]);

            $this->membershipService->updateMembershipLevel(
                $user,
                $targetLevel,
                $user->membership_level,
                'Pembayaran upgrade dikonfirmasi admin',
                $request->user()->id
            );
            $user->increment('total_transactions', $transaction->amount);

            $bonusPoints = $targetLevel === 'gold' ? 100 : 300;
            $this->membershipService->addPoints(
                $user,
                $bonusPoints,
                'earned',
                "Bonus poin upgrade ke {$targetLevel}",
                (string) $transaction->id,
                'membership_upgrade'
            );
        });

        return response()->json([
            'success' => true,
            'message' => 'Pembayaran manual dikonfirmasi dan membership telah di-upgrade.',
            'data' => ['transaction' => $transaction->fresh()],
        ]);
    }

    /**
     * Admin list of invoices
     */
    public function invoices(Request $request): JsonResponse
    {
        $query = Invoice::with(['user', 'membershipTransaction'])->latest();

        if ($request->has('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($u) use ($search) {
                      $u->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        $invoices = $query->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }

    /**
     * Admin show invoice detail
     */
    public function showInvoice(Request $request, int|string $id): JsonResponse
    {
        $invoice = Invoice::with(['user', 'membershipTransaction'])->find($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice tidak ditemukan.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $invoice,
        ]);
    }
}
