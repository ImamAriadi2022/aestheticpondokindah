<?php

namespace App\Services\Patient\Payment;

use App\Contracts\PaymentServiceInterface;
use App\Models\Patient\Billing\Invoice;
use App\Models\Patient\Billing\Payment;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class SimulationPaymentService implements PaymentServiceInterface
{
    public function createPayment(Invoice $invoice, string $paymentMethod = 'qris'): Payment
    {
        if ($invoice->status === 'paid') {
            throw new RuntimeException('Invoice sudah dibayar sebelumnya.');
        }

        // Check for existing pending payment for this invoice
        $existing = Payment::where('invoice_id', $invoice->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return $existing;
        }

        $paymentNumber = 'PAY-SIM-' . date('Ymd') . '-' . str_pad((string) rand(1, 99999), 6, '0', STR_PAD_LEFT);
        $gatewayRef = 'SIM-TRX-' . time() . '-' . Str::random(6);

        $initialResponse = $this->buildMidtransResponsePayload(
            $gatewayRef,
            $paymentNumber,
            $invoice->amount,
            'pending',
            $paymentMethod,
            'Transaction is pending'
        );

        return Payment::create([
            'payment_number' => $paymentNumber,
            'invoice_id' => $invoice->id,
            'user_id' => $invoice->user_id,
            'gateway_name' => 'simulation',
            'gateway_reference' => $gatewayRef,
            'amount' => $invoice->amount,
            'payment_method' => $paymentMethod,
            'status' => 'pending',
            'gateway_response' => $initialResponse,
        ]);
    }

    public function getPayment(int|string $paymentId): ?Payment
    {
        return Payment::with(['invoice', 'user'])->find($paymentId);
    }

    public function simulateStatusTransition(Payment $payment, string $targetStatus, ?string $reason = null): Payment
    {
        $allowedStatuses = ['settlement', 'expire', 'cancel', 'deny', 'failure'];
        if (!in_array($targetStatus, $allowedStatuses, true)) {
            throw new InvalidArgumentException("Status simulasi '{$targetStatus}' tidak valid.");
        }

        // State Machine Rule: Only pending transactions can change state!
        if ($payment->isTerminal()) {
            throw new RuntimeException("Transaksi pembayaran dengan status '{$payment->status}' sudah berada dalam kondisi terminal dan tidak dapat diubah.");
        }

        $reasonText = $reason ?: $this->getDefaultStatusMessage($targetStatus);

        $responsePayload = $this->buildMidtransResponsePayload(
            $payment->gateway_reference,
            $payment->payment_number,
            $payment->amount,
            $targetStatus,
            $payment->payment_method,
            $reasonText
        );

        $payment->status = $targetStatus;
        $payment->gateway_response = $responsePayload;

        if ($targetStatus === 'settlement') {
            $payment->settled_at = now();
            
            // Update invoice status to paid
            if ($payment->invoice) {
                $payment->invoice->status = 'paid';
                $payment->invoice->save();
            }

            $payment->save();

            // Task 4.5 Business Event Dispatch: Trigger PaymentSettled Event
            \App\Events\PaymentSettled::dispatch($payment);
        } elseif (in_array($targetStatus, ['expire', 'cancel', 'deny', 'failure'], true)) {
            if ($payment->invoice && $payment->invoice->status === 'unpaid') {
                $payment->invoice->status = $targetStatus === 'expire' ? 'expired' : 'cancelled';
                $payment->invoice->save();
            }
            $payment->save();
        }

        return $payment->fresh(['invoice', 'user']);
    }

    /**
     * Build Midtrans-like response dictionary
     */
    private function buildMidtransResponsePayload(
        string $transactionId,
        string $orderId,
        float $grossAmount,
        string $transactionStatus,
        string $paymentType,
        string $statusMessage
    ): array {
        $statusCodeMap = [
            'pending' => '201',
            'settlement' => '200',
            'expire' => '407',
            'cancel' => '202',
            'deny' => '202',
            'failure' => '500',
        ];

        return [
            'status_code' => $statusCodeMap[$transactionStatus] ?? '200',
            'status_message' => "Midtrans Simulation: " . $statusMessage,
            'transaction_id' => $transactionId,
            'order_id' => $orderId,
            'gross_amount' => number_format($grossAmount, 2, '.', ''),
            'payment_type' => $paymentType,
            'transaction_time' => now()->toDateTimeString(),
            'transaction_status' => $transactionStatus,
            'fraud_status' => 'accept',
            'currency' => 'IDR',
            'gateway_name' => 'simulation',
        ];
    }

    private function getDefaultStatusMessage(string $status): string
    {
        return match ($status) {
            'settlement' => 'Pembayaran berhasil diselesaikan (settlement).',
            'expire' => 'Transaksi pembayaran telah kadaluarsa (expired).',
            'cancel' => 'Transaksi pembayaran telah dibatalkan (cancelled).',
            'deny' => 'Transaksi pembayaran ditolak oleh sistem (denied).',
            'failure' => 'Transaksi pembayaran gagal diproses (failure).',
            default => 'Simulasi status pembayaran.',
        };
    }
}
