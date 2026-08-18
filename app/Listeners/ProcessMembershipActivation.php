<?php

namespace App\Listeners;

use App\Events\PaymentSettled;
use App\Services\Patient\Membership\MembershipActivationService;
use Illuminate\Support\Facades\Log;

class ProcessMembershipActivation
{
    protected MembershipActivationService $activationService;

    public function __construct(MembershipActivationService $activationService)
    {
        $this->activationService = $activationService;
    }

    public function handle(PaymentSettled $event): void
    {
        try {
            $result = $this->activationService->activateFromPayment($event->payment);
            Log::info("PaymentSettled Event Listener Processed Activation:", $result);
        } catch (\Throwable $e) {
            Log::error("Error processing PaymentSettled activation listener: " . $e->getMessage(), [
                'payment_id' => $event->payment->id,
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
