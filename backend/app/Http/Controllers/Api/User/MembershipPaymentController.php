<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\MembershipService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MembershipPaymentController extends Controller
{
    protected MembershipService $membershipService;
    protected MidtransService $midtransService;
    
    // Pricing config (sesuai rencana)
    const UPGRADE_FEES = [
        'gold' => 499000,
        'platinum' => 1500000,
        'diamond' => 5000000,
    ];

    const TIER_LABELS = [
        'bronze' => 'Basic Member',
        'gold' => 'Premium Member',
        'platinum' => 'Priority Member',
        'diamond' => 'VIP Member',
    ];

    private const LEVEL_ORDER = ['bronze', 'gold', 'platinum', 'diamond'];

    public function __construct(MembershipService $membershipService, MidtransService $midtransService)
    {
        $this->membershipService = $membershipService;
        $this->midtransService = $midtransService;
    }

    /**
     * Get available upgrade options for user
     */
    public function getUpgradeOptions(Request $request): JsonResponse
    {
        $user = $request->user();
        // Older records can be missing a level. Treat them as Bronze so an
        // undefined array key cannot make this endpoint return HTTP 500.
        $currentLevel = $this->resolveMembershipLevel($user->membership_level);
        $currentIndex = array_search($currentLevel, self::LEVEL_ORDER, true);

        $options = [];

        // Generate options untuk tier yang lebih tinggi
        for ($i = $currentIndex + 1; $i < count(self::LEVEL_ORDER); $i++) {
            $targetLevel = self::LEVEL_ORDER[$i];
            $amount = self::UPGRADE_FEES[$targetLevel];
            
            $options[] = [
                'level' => $targetLevel,
                'label' => self::TIER_LABELS[$targetLevel],
                'price' => $amount,
                'price_formatted' => 'Rp ' . number_format($amount, 0, ',', '.'),
                'benefits' => $this->membershipService->getMembershipBenefits($targetLevel),
                'skip_requirement' => true, // Langsung upgrade, tidak perlu transaksi
            ];
        }

        // Info current progress untuk auto-upgrade
        $progress = $user->getProgressToNextLevel();

        return response()->json([
            'success' => true,
            'data' => [
                'current_level' => $currentLevel,
                'current_label' => self::TIER_LABELS[$currentLevel],
                'upgrade_options' => $options,
                'auto_upgrade_progress' => $progress, // Progress dari transaksi treatment
                'can_auto_upgrade' => $progress['percentage'] >= 100,
                'payment_gateway' => [
                    'provider' => 'midtrans',
                    'available' => $this->midtransService->isConfigured(),
                ],
            ],
        ]);
    }

    /**
     * Create upgrade payment transaction
     */
    public function createPayment(Request $request): JsonResponse
    {
        $request->validate([
            'target_level' => 'required|in:gold,platinum,diamond',
            'payment_method' => 'required|in:transfer,qris,va,gopay,ovo',
        ]);

        $user = $request->user();
        $targetLevel = $request->input('target_level');
        $currentLevel = $this->resolveMembershipLevel($user->membership_level);

        if (!$this->midtransService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran Midtrans belum dikonfigurasi. Silakan hubungi administrator.',
            ], 503);
        }

        // Validasi: tidak boleh downgrade
        $levelOrder = array_flip(self::LEVEL_ORDER);
        if ($levelOrder[$targetLevel] <= $levelOrder[$currentLevel]) {
            return response()->json([
                'success' => false,
                'message' => 'Tidak bisa downgrade ke tier yang lebih rendah',
            ], 400);
        }

        $amount = self::UPGRADE_FEES[$targetLevel];

        DB::beginTransaction();
        try {
            // Buat transaction record (pending)
            $transaction = $user->membershipTransactions()->create([
                'amount' => $amount,
                'transaction_type' => 'upgrade',
                'description' => "Upgrade membership ke {$targetLevel}",
                'status' => 'pending',
                'metadata' => [
                    'target_level' => $targetLevel,
                    'current_level' => $currentLevel,
                    'payment_method' => $request->input('payment_method'),
                    'order_id' => 'UPG-' . strtoupper(Str::random(10)),
                ],
            ]);

            $midtransData = $this->midtransService->createSnapToken($transaction, $user);

            if (!$midtransData['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => $midtransData['message'] ?? 'Gagal membuat token pembayaran',
                ], 500);
            }

            $transaction->update([
                'metadata' => array_merge($transaction->metadata, [
                    'snap_token' => $midtransData['snap_token'],
                    'payment_url' => $midtransData['snap_url'],
                ]),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Silakan lakukan pembayaran',
                'data' => [
                    'transaction_id' => $transaction->id,
                    'order_id' => $transaction->metadata['order_id'],
                    'amount' => $amount,
                    'amount_formatted' => 'Rp ' . number_format($amount, 0, ',', '.'),
                    'target_level' => $targetLevel,
                    'payment_method' => $request->input('payment_method'),
                    'snap_token' => $midtransData['snap_token'],
                    'payment_url' => $midtransData['snap_url'],
                    'expiry_time' => now()->addMinutes(60)->toISOString(),
                ],
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create upgrade payment: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat transaksi pembayaran',
            ], 500);
        }
    }

    /**
     * Check payment status & upgrade if paid (via Midtrans)
     */
    public function checkStatus(Request $request, int $transactionId): JsonResponse
    {
        $user = $request->user();
        $transaction = $user->membershipTransactions()->findOrFail($transactionId);
        $orderId = $transaction->metadata['order_id'] ?? null;

        if (!$orderId) {
            return response()->json([
                'success' => false,
                'message' => 'Order ID not found',
            ], 400);
        }

        // Cek status ke Midtrans
        $midtransStatus = $this->midtransService->checkTransactionStatus($orderId);
        
        if (!$midtransStatus['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal cek status ke Midtrans',
                'error' => $midtransStatus['message'],
            ], 500);
        }

        $transactionStatus = $midtransStatus['transaction_status'];
        $isPaid = $this->midtransService->isPaymentSuccess($transactionStatus);
        $isPending = $this->midtransService->isPaymentPending($transactionStatus);
        $isFailed = $this->midtransService->isPaymentFailed($transactionStatus);

        // Update local transaction status
        if ($isPaid && $transaction->status === 'pending') {
            DB::beginTransaction();
            try {
                // Update transaction status
                $transaction->update([
                    'status' => 'completed',
                    'metadata' => array_merge($transaction->metadata, [
                        'payment_type' => $midtransStatus['payment_type'],
                        'midtrans_status' => $transactionStatus,
                        'settlement_time' => $midtransStatus['settlement_time'],
                    ]),
                ]);

                // PROSES UPGRADE
                $targetLevel = $transaction->metadata['target_level'];
                
                // 1. Update membership level
                $this->membershipService->updateMembershipLevel(
                    $user,
                    $targetLevel,
                    $user->membership_level,
                    'Upgrade melalui pembayaran Midtrans: ' . $orderId,
                    $user->id
                );

                // 2. Tambahkan ke total_transactions (agar konsisten dengan auto-upgrade)
                $user->increment('total_transactions', $transaction->amount);

                // 3. Berikan poin bonus untuk upgrade
                $bonusPoints = match($targetLevel) {
                    'gold' => 100,
                    'platinum' => 300,
                    'diamond' => 1000,
                    default => 0,
                };
                
                if ($bonusPoints > 0) {
                    $this->membershipService->addPoints(
                        $user,
                        $bonusPoints,
                        'upgrade_bonus',
                        "Bonus poin upgrade ke {$targetLevel}",
                        now()->addYear()
                    );
                }

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => "Upgrade ke {$targetLevel} berhasil!",
                    'data' => [
                        'new_level' => $targetLevel,
                        'new_label' => self::TIER_LABELS[$targetLevel],
                        'bonus_points' => $bonusPoints,
                        'payment_type' => $this->midtransService->getPaymentMethodName($midtransStatus['payment_type'] ?? 'unknown'),
                        'membership_expires_at' => $user->membership_expires_at,
                    ],
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Failed to process upgrade: ' . $e->getMessage());
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal memproses upgrade',
                ], 500);
            }
        }

        // Update status jika cancelled/expired
        if ($isFailed && $transaction->status === 'pending') {
            $transaction->update(['status' => 'cancelled']);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'status' => $transaction->status,
                'midtrans_status' => $transactionStatus,
                'is_paid' => $isPaid,
                'is_pending' => $isPending,
                'payment_type' => $midtransStatus['payment_type'],
            ],
        ]);
    }

    /**
     * Webhook untuk notifikasi dari Midtrans
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        $orderId = $payload['order_id'] ?? null;
        
        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'No order_id'], 400);
        }

        // Verifikasi signature Midtrans
        $verification = $this->midtransService->verifyNotification($payload);
        
        if (!$verification['success']) {
            Log::warning('Midtrans webhook verification failed', [
                'order_id' => $orderId,
                'message' => $verification['message'] ?? 'Unknown error',
            ]);
            return response()->json(['success' => false, 'message' => 'Invalid signature'], 403);
        }

        // Cari transaction berdasarkan order_id di metadata
        $transaction = \App\Models\MembershipTransaction::where('metadata->order_id', $orderId)->first();
        
        if (!$transaction) {
            Log::warning('Transaction not found for webhook', ['order_id' => $orderId]);
            return response()->json(['success' => false, 'message' => 'Transaction not found'], 404);
        }

        // Update status berdasarkan notifikasi
        $status = $payload['transaction_status'] ?? 'pending';
        $isPaid = $this->midtransService->isPaymentSuccess($status);
        $isFailed = $this->midtransService->isPaymentFailed($status);
        
        // Update transaction metadata
        $transaction->update([
            'metadata' => array_merge($transaction->metadata, [
                'midtrans_status' => $status,
                'payment_type' => $payload['payment_type'] ?? null,
                'transaction_time' => $payload['transaction_time'] ?? null,
                'settlement_time' => $payload['settlement_time'] ?? null,
                'fraud_status' => $payload['fraud_status'] ?? null,
            ]),
        ]);
        
        if ($isPaid && $transaction->status === 'pending') {
            DB::beginTransaction();
            try {
                $transaction->update(['status' => 'completed']);
                
                // Trigger upgrade
                $user = $transaction->user;
                $targetLevel = $transaction->metadata['target_level'];
                $oldLevel = $user->membership_level;
                
                $this->membershipService->updateMembershipLevel(
                    $user,
                    $targetLevel,
                    $oldLevel,
                    'Upgrade via Midtrans webhook: ' . $orderId,
                    null
                );
                
                // Tambah ke total transactions
                $user->increment('total_transactions', $transaction->amount);
                
                // Bonus poin
                $bonusPoints = match($targetLevel) {
                    'gold' => 100,
                    'platinum' => 300,
                    'diamond' => 1000,
                    default => 0,
                };
                
                if ($bonusPoints > 0) {
                    $this->membershipService->addPoints(
                        $user,
                        $bonusPoints,
                        'upgrade_bonus',
                        "Bonus poin upgrade ke {$targetLevel} via webhook",
                        now()->addYear()
                    );
                }
                
                DB::commit();
                Log::info("Membership upgrade via webhook: {$oldLevel} -> {$targetLevel} for user {$user->id}");
                
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Webhook upgrade failed: ' . $e->getMessage());
                return response()->json(['success' => false, 'message' => 'Processing failed'], 500);
            }
        } elseif ($isFailed) {
            $transaction->update(['status' => 'cancelled']);
        }

        return response()->json(['success' => true]);
    }

    private function resolveMembershipLevel(?string $level): string
    {
        return array_key_exists($level, self::TIER_LABELS) ? $level : 'bronze';
    }
}
