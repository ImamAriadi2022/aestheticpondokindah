<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class MedicalRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'record_number',
        'visit_id',
        'patient_id',
        'doctor_id',
        'status',
        'summary_notes',
        'finalized_at',
        'locked_at',
    ];

    protected function casts(): array
    {
        return [
            'finalized_at' => 'datetime',
            'locked_at' => 'datetime',
        ];
    }

    public function scopeFinalized($query)
    {
        return $query->where('status', 'finalized')->orWhereNotNull('finalized_at');
    }

    public function scopeLocked($query)
    {
        return $query->where('status', 'locked')->orWhereNotNull('locked_at');
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function soapNote(): HasOne
    {
        return $this->hasOne(SoapNote::class);
    }

    public function diagnoses(): HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function clinicalProcedures(): HasMany
    {
        return $this->hasMany(ClinicalProcedure::class);
    }

    public function odontogram(): HasOne
    {
        return $this->hasOne(Odontogram::class);
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked' || $this->locked_at !== null;
    }

    public function isReadOnly(): bool
    {
        return in_array($this->status, ['finalized', 'locked'], true);
    }
}
