<?php

namespace App\Services;

use Midtrans\Snap;
use Midtrans\Transaction;
use Midtrans\Config as MidtransConfig;
use App\Models\User;
use App\Models\MembershipTransaction;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class MidtransService
{
    protected bool $isProduction;
    protected string $serverKey;
    protected string $clientKey;

    public function __construct()
    {
        $this->isProduction = Config::get('midtrans.is_production', false);
        $this->serverKey = Config::get('midtrans.server_key', '');
        $this->clientKey = Config::get('midtrans.client_key', '');

        // Midtrans is an optional integration. Do not instantiate a missing
        // SDK while the clinic is still operating without online payments.
        if (class_exists(MidtransConfig::class)) {
            MidtransConfig::$serverKey = $this->serverKey;
            MidtransConfig::$isProduction = $this->isProduction;
            MidtransConfig::$isSanitized = true;
            MidtransConfig::$is3ds = true;
        }
    }

    /**
     * A Snap request cannot be created without a server key.  Keeping this
     * check here lets callers reject an incomplete gateway configuration
     * before creating a payment transaction.
     */
    public function isConfigured(): bool
    {
        return trim($this->serverKey) !== '' && class_exists(Snap::class);
    }

    /**
     * Create Snap Token untuk pembayaran
     */
    public function createSnapToken(MembershipTransaction $transaction, User $user): array
    {
        try {
            $orderId = $transaction->metadata['order_id'];
            $amount = $transaction->amount;
            $targetLevel = $transaction->metadata['target_level'];

            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => $amount,
                ],
                'customer_details' => [
                    'first_name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->whatsapp ?? '',
                ],
                'item_details' => [
                    [
                        'id' => 'upgrade_' . $targetLevel,
                        'price' => $amount,
                        'quantity' => 1,
                        'name' => 'Upgrade Membership - ' . ucfirst($targetLevel),
                        'category' => 'Membership',
                    ],
                ],
                'custom_expiry' => [
                    'expiry_duration' => 60,
                    'unit' => 'minute',
                ],
                'enabled_payments' => [
                    'credit_card',
                    'bca_va',
                    'bni_va',
                    'bri_va',
                    'gopay',
                    'shopeepay',
                    'qris',
                    'echannel', // Mandiri bill
                    'permata_va',
                    'other_va',
                ],
                'callbacks' => [
                    'finish' => url('/membership/upgrade/success'),
                    'error' => url('/membership/upgrade/error'),
                ],
            ];

            // Generate Snap Token
            $snapToken = Snap::getSnapToken($params);

            // Generate Snap URL
            $snapUrl = $this->isProduction
                ? 'https://app.midtrans.com/snap/v2/vtweb/' . $snapToken
                : 'https://app.sandbox.midtrans.com/snap/v2/vtweb/' . $snapToken;

            Log::info('Snap token generated', ['order_id' => $orderId]);

            return [
                'success' => true,
                'snap_token' => $snapToken,
                'snap_url' => $snapUrl,
                'order_id' => $orderId,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to create Snap token: ' . $e->getMessage(), [
                'transaction_id' => $transaction->id,
                'order_id' => $transaction->metadata['order_id'] ?? null,
            ]);

            return [
                'success' => false,
                'message' => 'Gagal membuat token pembayaran: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Check transaction status dari Midtrans
     */
    public function checkTransactionStatus(string $orderId): array
    {
        try {
            $status = Transaction::status($orderId);

            return [
                'success' => true,
                'status' => $status,
                'transaction_status' => $status->transaction_status ?? 'unknown',
                'fraud_status' => $status->fraud_status ?? null,
                'payment_type' => $status->payment_type ?? null,
                'transaction_time' => $status->transaction_time ?? null,
                'settlement_time' => $status->settlement_time ?? null,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to check transaction status: ' . $e->getMessage(), [
                'order_id' => $orderId,
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Verify Midtrans notification (webhook)
     */
    public function verifyNotification(array $payload): array
    {
        try {
            $orderId = $payload['order_id'] ?? null;
            $statusCode = $payload['status_code'] ?? null;
            $grossAmount = $payload['gross_amount'] ?? null;
            $serverKey = $this->serverKey;

            // Generate signature key untuk verifikasi
            $input = $orderId . $statusCode . $grossAmount . $serverKey;
            $signatureKey = hash('sha512', $input);

            // Verify signature
            if (!hash_equals($signatureKey, $payload['signature_key'] ?? '')) {
                Log::warning('Invalid Midtrans signature', [
                    'order_id' => $orderId,
                    'expected' => $signatureKey,
                    'received' => $payload['signature_key'] ?? null,
                ]);

                return [
                    'success' => false,
                    'message' => 'Invalid signature',
                ];
            }

            return [
                'success' => true,
                'verified' => true,
                'order_id' => $orderId,
                'transaction_status' => $payload['transaction_status'] ?? 'unknown',
                'status_code' => $statusCode,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to verify notification: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Cancel transaction di Midtrans
     */
    public function cancelTransaction(string $orderId): array
    {
        try {
            $response = Transaction::cancel($orderId);

            return [
                'success' => true,
                'status' => $response,
            ];

        } catch (\Exception $e) {
            Log::error('Failed to cancel transaction: ' . $e->getMessage(), [
                'order_id' => $orderId,
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Check if payment is successful based on transaction_status
     */
    public function isPaymentSuccess(string $transactionStatus): bool
    {
        return in_array($transactionStatus, [
            'capture',
            'settlement',
        ]);
    }

    /**
     * Check if payment is pending
     */
    public function isPaymentPending(string $transactionStatus): bool
    {
        return in_array($transactionStatus, [
            'pending',
            'authorize',
        ]);
    }

    /**
     * Check if payment is failed/cancelled
     */
    public function isPaymentFailed(string $transactionStatus): bool
    {
        return in_array($transactionStatus, [
            'deny',
            'cancel',
            'expire',
            'failure',
        ]);
    }

    /**
     * Get payment method name (human readable)
     */
    public function getPaymentMethodName(string $paymentType): string
    {
        $methods = [
            'credit_card' => 'Kartu Kredit',
            'bca_va' => 'BCA Virtual Account',
            'bni_va' => 'BNI Virtual Account',
            'bri_va' => 'BRI Virtual Account',
            'mandiri_va' => 'Mandiri Virtual Account',
            'permata_va' => 'Permata Virtual Account',
            'gopay' => 'GoPay',
            'shopeepay' => 'ShopeePay',
            'qris' => 'QRIS',
            'echannel' => 'Mandiri Bill Payment',
            'cimb_clicks' => 'CIMB Clicks',
            'danamon_online' => 'Danamon Online',
            'bca_klikbca' => 'BCA KlikBCA',
            'bca_klikpay' => 'BCA KlikPay',
            'bri_epay' => 'BRI e-Pay',
            'akulaku' => 'Akulaku',
            'alfamart' => 'Alfamart',
            'indomaret' => 'Indomaret',
        ];

        return $methods[$paymentType] ?? $paymentType;
    }
}
