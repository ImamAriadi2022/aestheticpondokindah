<?php

namespace App\Models\Patient\Membership;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipPoint extends Model
{
    use HasFactory;

    protected $table = 'membership_points';

    protected $fillable = [
        'user_id',
        'points',
        'balance_before',
        'balance_after',
        'type',
        'description',
        'reference_id',
        'reference_type',
        'admin_id',
        'expires_at',
    ];

    protected $casts = [
        'points' => 'integer',
        'balance_before' => 'integer',
        'balance_after' => 'integer',
        'expires_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
