<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'complaint',
        'date',
        'source',
        'status',
        'payment_status',
    ];

    protected $casts = [
        'date' => 'date',
    ];
}
