<?php

namespace App\Models\Shared\Reservation;

use App\Models\Shared\User\User;
use App\Models\Shared\Consultation\Consultation;
use App\Models\Doctor\Schedule\DoctorSchedule;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Reservation extends Model
{
    use SoftDeletes;

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
        'redeem_points',
        'point_discount',
        'service_price',
        'final_price',
        'admin_notes',
        'signature_data',
        'terms_accepted_at',
        'rescheduled_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'birth_date' => 'date',
            'terms_accepted_at' => 'datetime',
            'rescheduled_at' => 'datetime',
            'redeem_points' => 'integer',
            'point_discount' => 'decimal:2',
            'service_price' => 'decimal:2',
            'final_price' => 'decimal:2',
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
