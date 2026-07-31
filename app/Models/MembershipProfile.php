<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'gender',
        'date_of_birth',
        'city',
        'dental_concerns',
        'treatment_interests',
        'dental_conditions',
        'last_dental_visit',
        'lifestyle_interests',
        'personal_goals',
        'communication_preferences',
        'content_preferences',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'last_dental_visit' => 'date',
        'dental_concerns' => 'array',
        'treatment_interests' => 'array',
        'dental_conditions' => 'array',
        'lifestyle_interests' => 'array',
        'personal_goals' => 'array',
        'communication_preferences' => 'array',
        'content_preferences' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isComplete(): bool
    {
        return !empty($this->gender)
            && !empty($this->date_of_birth)
            && !empty($this->city)
            && !empty($this->dental_concerns)
            && !empty($this->treatment_interests);
    }
}
