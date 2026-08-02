<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsultationMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'consultation_id',
        'sender_id',
        'sender_role',
        'body',
        'attachments',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'attachments' => 'json',
            'read_at' => 'datetime',
        ];
    }

    public function consultation(): BelongsTo
    {
        return $this->belongsTo(Consultation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
