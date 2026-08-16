<?php

namespace App\Models\Patient\Profile;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'dental_complaints',
        'desired_services',
        'current_dental_conditions',
        'last_dental_visit',
        'interests',
        'consumption_habits',
        'lifestyle_interests',
        'treatment_goals',
        'preferred_communication_channels',
    ];

    protected $casts = [
        'dental_complaints' => 'array',
        'desired_services' => 'array',
        'current_dental_conditions' => 'array',
        'interests' => 'array',
        'consumption_habits' => 'array',
        'lifestyle_interests' => 'array',
        'treatment_goals' => 'array',
        'preferred_communication_channels' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
