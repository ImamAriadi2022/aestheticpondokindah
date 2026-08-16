<?php

namespace App\Models\Doctor\Odontogram;

use App\Models\Shared\User\User;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Odontogram extends Model
{
    use HasFactory;

    protected $table = 'odontograms';

    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'doctor_id',
        'notes',
        'created_by',
        'updated_by',
    ];

    public function medicalRecord(): BelongsTo
    {
        return $this->belongsTo(MedicalRecord::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'patient_id');
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function toothStates(): HasMany
    {
        return $this->hasMany(ToothState::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
