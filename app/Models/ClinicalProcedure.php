<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClinicalProcedure extends Model
{
    use HasFactory;

    protected $table = 'clinical_procedures';

    protected $fillable = [
        'medical_record_id',
        'patient_id',
        'doctor_id',
        'procedure_catalog_id',
        'diagnosis_id',
        'tooth_number',
        'notes',
        'status',
        'performed_by',
        'performed_at',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'performed_at' => 'datetime',
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

    public function catalog(): BelongsTo
    {
        return $this->belongsTo(ProcedureCatalog::class, 'procedure_catalog_id');
    }

    public function diagnosis(): BelongsTo
    {
        return $this->belongsTo(Diagnosis::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
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
