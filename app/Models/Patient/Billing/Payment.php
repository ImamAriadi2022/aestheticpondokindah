<?php

namespace App\Models\Patient\Billing;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_number',
        'invoice_id',
        'user_id',
        'gateway_name',
        'gateway_reference',
        'amount',
        'payment_method',
        'status',
        'gateway_response',
        'settled_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'gateway_response' => 'array',
        'settled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    /**
     * Check if payment is in a terminal state
     */
    public function isTerminal(): bool
    {
        return in_array($this->status, ['settlement', 'expire', 'cancel', 'deny', 'failure'], true);
    }
}
