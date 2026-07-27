<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DoctorSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'date',
        'time_range',
        'location',
        'total_slots',
        'booked_slots',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'total_slots' => 'integer',
            'booked_slots' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getSlotsLeftAttribute(): int
    {
        return max(0, $this->total_slots - $this->booked_slots);
    }

    public function getIsFullAttribute(): bool
    {
        return $this->booked_slots >= $this->total_slots;
    }
}
