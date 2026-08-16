<?php

namespace App\Models\Shared\Consultation;

use App\Models\Shared\User\User;
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

    public function getSenderNameAttribute(): string
    {
        if ($this->sender_role === 'admin') {
            return 'Admin';
        }

        if ($this->sender_role === 'doctor') {
            return $this->sender?->name ?? 'Dokter';
        }

        return $this->consultation?->participant_name ?? 'Pasien';
    }
}
