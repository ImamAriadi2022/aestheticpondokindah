<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReservationAudit extends Model
{
    protected $fillable = [
        'reservation_id',
        'user_id',
        'action',
        'field',
        'old_value',
        'new_value',
        'notes',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
