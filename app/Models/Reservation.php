<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'doctor_id',
        'doctor_schedule_id',
        'name',
        'phone',
        'email',
        'gender',
        'birth_date',
        'treatment_interest',
        'complaint',
        'date',
        'preferred_time',
        'branch_name',
        'source',
        'status',
        'payment_status',
        'admin_notes',
        'rescheduled_at',
    ];

    protected $casts = [
        'date' => 'date',
        'birth_date' => 'date',
        'rescheduled_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function doctorSchedule(): BelongsTo
    {
        return $this->belongsTo(DoctorSchedule::class, 'doctor_schedule_id');
    }
}
