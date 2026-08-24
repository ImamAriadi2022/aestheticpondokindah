<?php

namespace App\Services\Patient\Membership;

use App\Models\Patient\Membership\MembershipPoint;
use App\Models\Patient\Membership\MembershipPointRule;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\User\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class MembershipPointRuleService
{
    /**
     * Get all point rules
     */
    public function getAllRules(): Collection
    {
        return MembershipPointRule::with(['service', 'creator:id,name', 'updater:id,name'])
            ->orderBy('is_active', 'desc')
            ->orderBy('id', 'asc')
            ->get();
    }

    /**
     * Create a new point rule
     */
    public function createRule(array $data, ?int $adminId = null): MembershipPointRule
    {
        return MembershipPointRule::create([
            'name' => $data['name'],
            'service_id' => $data['service_id'] ?? null,
            'service_name' => $data['service_name'] ?? null,
            'points' => (int) ($data['points'] ?? 0),
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : true,
            'description' => $data['description'] ?? null,
            'created_by' => $adminId,
            'updated_by' => $adminId,
        ]);
    }

    /**
     * Update an existing point rule
     */
    public function updateRule(MembershipPointRule $rule, array $data, ?int $adminId = null): MembershipPointRule
    {
        $rule->update([
            'name' => $data['name'] ?? $rule->name,
            'service_id' => array_key_exists('service_id', $data) ? $data['service_id'] : $rule->service_id,
            'service_name' => array_key_exists('service_name', $data) ? $data['service_name'] : $rule->service_name,
            'points' => isset($data['points']) ? (int) $data['points'] : $rule->points,
            'is_active' => array_key_exists('is_active', $data) ? (bool) $data['is_active'] : $rule->is_active,
            'description' => array_key_exists('description', $data) ? $data['description'] : $rule->description,
            'updated_by' => $adminId ?? $rule->updated_by,
        ]);

        return $rule->fresh(['service', 'creator:id,name', 'updater:id,name']);
    }

    /**
     * Toggle active status of a rule
     */
    public function toggleStatus(MembershipPointRule $rule, ?int $adminId = null): MembershipPointRule
    {
        $rule->is_active = !$rule->is_active;
        $rule->updated_by = $adminId;
        $rule->save();

        return $rule;
    }

    /**
     * Delete a rule
     */
    public function deleteRule(MembershipPointRule $rule): bool
    {
        return (bool) $rule->delete();
    }

    /**
     * Match a treatment/service to an active rule
     */
    public function findMatchingRuleForTreatment(?string $treatmentInterest, ?int $serviceId = null): ?MembershipPointRule
    {
        if ($serviceId) {
            $rule = MembershipPointRule::active()->where('service_id', $serviceId)->first();
            if ($rule) return $rule;
        }

        if (!$treatmentInterest) {
            return null;
        }

        $cleanTreatment = trim(mb_strtolower($treatmentInterest));
        $activeRules = MembershipPointRule::active()->get();

        foreach ($activeRules as $rule) {
            $rServiceName = trim(mb_strtolower((string) $rule->service_name));
            $rName = trim(mb_strtolower((string) $rule->name));

            if ($rServiceName && ($cleanTreatment === $rServiceName || str_contains($cleanTreatment, $rServiceName) || str_contains($rServiceName, $cleanTreatment))) {
                return $rule;
            }

            if ($rName && ($cleanTreatment === $rName || str_contains($cleanTreatment, $rName) || str_contains($rName, $cleanTreatment))) {
                return $rule;
            }
        }

        $keywords = [
            'scaling' => ['scaling', 'karang', 'polishing'],
            'bleaching' => ['whitening', 'bleaching', 'pemutihan'],
            'tambal' => ['filling', 'tambal', 'inlay', 'onlay', 'restorasi'],
            'cabut' => ['extraction', 'cabut', 'odontektomi', 'wisdom', 'bungsu'],
            'implant' => ['implant', 'implan'],
            'ortho' => ['behel', 'orthodontic', 'aligner', 'invisalign'],
            'root canal' => ['root canal', 'saluran akar', 'endodontik'],
            'konsultasi' => ['konsultasi', 'periksa', 'check-up', 'check up', 'oral care'],
        ];

        foreach ($keywords as $category => $terms) {
            foreach ($terms as $term) {
                if (str_contains($cleanTreatment, $term)) {
                    foreach ($activeRules as $rule) {
                        $targetStr = mb_strtolower($rule->name . ' ' . $rule->service_name . ' ' . $rule->description);
                        if (str_contains($targetStr, $term) || str_contains($targetStr, $category)) {
                            return $rule;
                        }
                    }
                }
            }
        }

        return $activeRules->firstWhere('points', '>', 0);
    }

    /**
     * Process and award points automatically for completed reservation (Idempotent / Anti-Double Point)
     */
    public function processAutomaticPointsForCompletedReservation(Reservation $reservation): ?MembershipPoint
    {
        if (!$reservation->user_id) {
            return null;
        }

        $resIdStr = (string) $reservation->id;

        $alreadyAwarded = MembershipPoint::where('reference_type', 'reservation')
            ->where('reference_id', $resIdStr)
            ->where('type', 'earned')
            ->exists();

        if ($alreadyAwarded) {
            Log::info("Automatic points skipped: Reservation #{$resIdStr} already awarded points.");
            return null;
        }

        $rule = $this->findMatchingRuleForTreatment($reservation->treatment_interest);

        if (!$rule || $rule->points <= 0) {
            Log::info("Automatic points skipped: No active rule matched for treatment '{$reservation->treatment_interest}'.");
            return null;
        }

        return DB::transaction(function () use ($reservation, $rule, $resIdStr) {
            $exists = MembershipPoint::where('reference_type', 'reservation')
                ->where('reference_id', $resIdStr)
                ->where('type', 'earned')
                ->lockForUpdate()
                ->exists();

            if ($exists) {
                return null;
            }

            $user = User::where('id', $reservation->user_id)->lockForUpdate()->first();
            if (!$user) {
                return null;
            }

            $pointsToAward = (int) $rule->points;
            $balanceBefore = (int) ($user->membership_points ?? 0);
            $balanceAfter = $balanceBefore + $pointsToAward;

            $bookingCode = $reservation->code ?: 'RSV-' . str_pad($resIdStr, 6, '0', STR_PAD_LEFT);

            $point = MembershipPoint::create([
                'user_id' => $user->id,
                'points' => $pointsToAward,
                'balance_before' => $balanceBefore,
                'balance_after' => $balanceAfter,
                'type' => 'earned',
                'description' => "Perolehan {$pointsToAward} poin dari {$rule->name} (Reservasi #{$bookingCode})",
                'reference_id' => $resIdStr,
                'reference_type' => 'reservation',
                'expires_at' => now()->addYear(),
            ]);

            $user->membership_points = $balanceAfter;
            $user->save();

            app(MembershipService::class)->checkAndUpdateMembershipLevel($user);

            Log::info("Automatic points awarded: +{$pointsToAward} pts to user #{$user->id} for reservation #{$resIdStr} (Balance: {$balanceBefore} -> {$balanceAfter}).");

            return $point;
        });
    }
}
