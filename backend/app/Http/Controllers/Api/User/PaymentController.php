<?php

namespace App\Http\Controllers\Api\User;

use App\Contracts\PaymentServiceInterface;
use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class PaymentController extends Controller
{
    protected PaymentServiceInterface $paymentService;

    public function __construct(PaymentServiceInterface $paymentService)
    {
        $this->paymentService = $paymentService;
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $payments = Payment::with('invoice')
            ->where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $payments,
        ]);
    }

    public function createPayment(Request $request, int|string $invoiceId): JsonResponse
    {
        $user = $request->user();
        $invoice = Invoice::find($invoiceId);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => 'Invoice tidak ditemukan.',
            ], 404);
        }

        // Strict IDOR Check
        if ((int) $invoice->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke tagihan invoice ini.',
            ], 403);
        }

        $paymentMethod = $request->input('payment_method', 'qris');

        try {
            $payment = $this->paymentService->createPayment($invoice, $paymentMethod);

            return response()->json([
                'success' => true,
                'message' => 'Transaksi pembayaran berhasil dibuat.',
                'data' => [
                    'payment' => $payment,
                    'gateway_response' => $payment->gateway_response,
                ],
            ], 201);
        } catch (RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    public function show(Request $request, int|string $id): JsonResponse
    {
        $user = $request->user();
        $payment = $this->paymentService->getPayment($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan.',
            ], 404);
        }

        // Strict IDOR Check
        if ((int) $payment->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pembayaran ini.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $payment,
        ]);
    }

    public function simulateSettlement(Request $request, int|string $id): JsonResponse
    {
        return $this->handleSimulation($request, $id, 'settlement');
    }

    public function simulateExpire(Request $request, int|string $id): JsonResponse
    {
        return $this->handleSimulation($request, $id, 'expire');
    }

    public function simulateCancel(Request $request, int|string $id): JsonResponse
    {
        return $this->handleSimulation($request, $id, 'cancel');
    }

    public function simulateDeny(Request $request, int|string $id): JsonResponse
    {
        return $this->handleSimulation($request, $id, 'deny');
    }

    public function simulateFailure(Request $request, int|string $id): JsonResponse
    {
        return $this->handleSimulation($request, $id, 'failure');
    }

    private function handleSimulation(Request $request, int|string $id, string $targetStatus): JsonResponse
    {
        $user = $request->user();
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan.',
            ], 404);
        }

        // Strict IDOR Check
        if ((int) $payment->user_id !== (int) $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak memiliki akses ke pembayaran ini.',
            ], 403);
        }

        $reason = $request->input('reason');

        try {
            $updatedPayment = $this->paymentService->simulateStatusTransition($payment, $targetStatus, $reason);

            return response()->json([
                'success' => true,
                'message' => "Simulasi status pembayaran {$targetStatus} berhasil dijalankan.",
                'data' => [
                    'payment' => $updatedPayment,
                    'gateway_response' => $updatedPayment->gateway_response,
                    'user_membership_level' => $user->fresh()->membership_level, // MUST REMAIN UNCHANGED
                    'membership_active' => false, // MUST NOT BE ACTIVATED IN TASK 4.4
                ],
            ]);
        } catch (InvalidArgumentException | RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
