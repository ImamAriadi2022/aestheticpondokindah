<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_number',
        'user_id',
        'membership_transaction_id',
        'target_level',
        'amount',
        'status',
        'description',
        'invoice_date',
        'due_date',
        'payment_details',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'invoice_date' => 'datetime',
        'due_date' => 'datetime',
        'payment_details' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function membershipTransaction(): BelongsTo
    {
        return $this->belongsTo(MembershipTransaction::class, 'membership_transaction_id');
    }
}
