<?php

namespace App\Services\Patient\Profile;

use App\Models\Shared\User\User;

class ProfileCompletionService
{
    public function isComplete(User $user): bool
    {
        return !empty($user->full_name)
            && !empty($user->whatsapp)
            && !is_null($user->phone_verified_at)
            && !empty($user->address_line)
            && !empty($user->city)
            && !empty($user->postal_code);
    }

    public function missingFields(User $user): array
    {
        $missing = [];

        if (empty($user->name)) {
            $missing[] = 'name';
        }
        if (empty($user->whatsapp)) {
            $missing[] = 'whatsapp';
        }
        if (is_null($user->phone_verified_at)) {
            $missing[] = 'phone_verified_at';
        }
        if (empty($user->address_line)) {
            $missing[] = 'address_line';
        }
        if (empty($user->city)) {
            $missing[] = 'city';
        }
        if (empty($user->postal_code)) {
            $missing[] = 'postal_code';
        }

        return $missing;
    }

    public function markCompletedIfEligible(User $user): void
    {
        if ($this->isComplete($user) && is_null($user->profile_completed_at)) {
            $user->forceFill([
                'profile_completed_at' => now(),
            ])->saveQuietly();
        }
    }
}
