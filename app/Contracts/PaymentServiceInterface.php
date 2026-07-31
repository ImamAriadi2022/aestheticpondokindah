<?php

namespace App\Contracts;

use App\Models\Invoice;
use App\Models\Payment;

interface PaymentServiceInterface
{
    /**
     * Create a payment transaction for an unpaid invoice
     */
    public function createPayment(Invoice $invoice, string $paymentMethod = 'qris'): Payment;

    /**
     * Get payment details by ID or reference
     */
    public function getPayment(int|string $paymentId): ?Payment;

    /**
     * Simulate payment status transition (settlement, expire, cancel, deny, failure)
     */
    public function simulateStatusTransition(Payment $payment, string $targetStatus, ?string $reason = null): Payment;
}
