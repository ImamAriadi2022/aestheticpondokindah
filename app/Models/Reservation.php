<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

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

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'birth_date' => 'date',
            'rescheduled_at' => 'datetime',
        ];
    }

    // =========================================================================
    // QUERY SCOPES
    // =========================================================================

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeForDoctor($query, $doctorId)
    {
        return $query->where('doctor_id', $doctorId);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // =========================================================================
    // ELOQUENT RELATIONSHIPS
    // =========================================================================

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

    public function consultation(): HasOne
    {
        return $this->hasOne(Consultation::class);
    }

    public function audits(): HasMany
    {
        return $this->hasMany(ReservationAudit::class)->orderByDesc('created_at');
    }
}
