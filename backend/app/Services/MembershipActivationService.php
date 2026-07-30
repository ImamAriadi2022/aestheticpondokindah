<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\MembershipHistory;
use App\Models\MembershipPoint;
use App\Models\MembershipTransaction;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class MembershipActivationService
{
    /**
     * Handle business updates after payment settlement
     */
    public function activateFromPayment(Payment $payment): array
    {
        // 1. Security & Invariant Check: Only settlement triggers activation!
        if ($payment->status !== 'settlement') {
            throw new RuntimeException("Aktivasi membership gagal: Status pembayaran '{$payment->status}' bukan 'settlement'.");
        }

        // 2. Idempotency Guard: Prevent duplicate activation for same payment!
        $response = $payment->gateway_response ?? [];
        if (!empty($response['business_activation']['activated_at'])) {
            return [
                'already_activated' => true,
                'user' => $payment->user,
                'activated_at' => $response['business_activation']['activated_at'],
            ];
        }

        return DB::transaction(function () use ($payment, $response) {
            $payment->loadMissing(['invoice', 'user']);
            $invoice = $payment->invoice;
            $user = $payment->user;

            if (!$user) {
                throw new RuntimeException("Aktivasi membership gagal: User tidak ditemukan.");
            }

            $targetLevel = $invoice?->target_level ?? 'gold';
            $oldLevel = $user->membership_level ?? 'bronze';

            // A) Update User Membership State
            $user->membership_level = $targetLevel;
            $user->membership_status = 'active';
            $user->membership_started_at = $user->membership_started_at ?? now();
            $user->membership_expires_at = now()->addYear();
            $user->last_paid_level = $targetLevel;

            // B) Award Points (1 point per Rp 10.000 spent)
            $amountSpent = (float) $payment->amount;
            $pointsEarned = (int) floor($amountSpent / 10000);
            if ($pointsEarned > 0) {
                $user->membership_points = ($user->membership_points ?? 0) + $pointsEarned;
            }
            $user->save();

            // C) Record Points Audit Trail
            $pointRecord = null;
            if ($pointsEarned > 0) {
                $pointRecord = MembershipPoint::create([
                    'user_id' => $user->id,
                    'points' => $pointsEarned,
                    'type' => 'earned',
                    'description' => "Bonus poin dari upgrade membership ke " . ucfirst($targetLevel),
                    'reference_id' => (string) $payment->id,
                    'reference_type' => 'payment',
                    'expires_at' => now()->addYear(),
                ]);
            }

            // D) Complete Linked Upgrade Request Transaction
            $upgradeRequest = null;
            if ($invoice && $invoice->membership_transaction_id) {
                $upgradeRequest = MembershipTransaction::find($invoice->membership_transaction_id);
                if ($upgradeRequest) {
                    $upgradeRequest->status = 'completed';
                    $upgradeRequest->save();
                }
            }

            // E) Update Invoice Status to Paid
            if ($invoice) {
                $invoice->status = 'paid';
                $invoice->save();
            }

            // F) Record Membership History
            $history = MembershipHistory::create([
                'user_id' => $user->id,
                'old_level' => $oldLevel,
                'new_level' => $targetLevel,
                'reason' => "Membership upgrade activated following payment settled (Invoice #{$invoice?->invoice_number})",
                'changed_by' => $user->id,
                'metadata' => [
                    'payment_id' => (string) $payment->id,
                    'payment_number' => $payment->payment_number,
                    'invoice_id' => (string) $invoice?->id,
                    'invoice_number' => $invoice?->invoice_number,
                    'upgrade_request_id' => (string) $upgradeRequest?->id,
                    'points_granted' => $pointsEarned,
                    'timestamp' => now()->toISOString(),
                ],
            ]);

            // G) Store Activation Stamp in Gateway Response for Idempotency
            $response['business_activation'] = [
                'activated_at' => now()->toISOString(),
                'target_level' => $targetLevel,
                'old_level' => $oldLevel,
                'history_id' => $history->id,
                'points_earned' => $pointsEarned,
            ];
            $payment->gateway_response = $response;
            $payment->save();

            return [
                'already_activated' => false,
                'user' => $user->fresh(),
                'old_level' => $oldLevel,
                'new_level' => $targetLevel,
                'membership_status' => $user->membership_status,
                'points_earned' => $pointsEarned,
                'history_id' => $history->id,
                'invoice_id' => $invoice?->id,
                'upgrade_request_status' => $upgradeRequest?->status,
                'activated_at' => $response['business_activation']['activated_at'],
            ];
        });
    }
}
