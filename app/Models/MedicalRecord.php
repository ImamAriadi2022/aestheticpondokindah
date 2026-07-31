<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected $casts = [
        'finalized_at' => 'datetime',
        'locked_at' => 'datetime',
    ];

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

    public function soapNote(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(SoapNote::class);
    }

    public function diagnoses(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Diagnosis::class);
    }

    public function clinicalProcedures(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ClinicalProcedure::class);
    }

    public function odontogram(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(Odontogram::class);
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked' || $this->locked_at !== null;
    }

    public function isReadOnly(): bool
    {
        return $this->isLocked() || in_array($this->status, ['finalized', 'locked'], true);
    }
}
