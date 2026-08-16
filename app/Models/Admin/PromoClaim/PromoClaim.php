<?php

namespace App\Models\Admin\PromoClaim;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PromoClaim extends Model
{
    protected $fillable = [
        'user_id',
        'claimed_by_admin_id',
        'claim_type',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function claimedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'claimed_by_admin_id');
    }
}
