<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'status',
        'topic',
        'category',
        'chief_complaint',
        'duration',
        'pain_scale',
        'allergies',
        'medications',
        'prior_treatment',
        'preferred_contact',
        'contact_number',
        'expectations',
        'notes',
        'doctor_name',
        'schedule_date',
        'schedule_time',
        'location',
        'attachments',
        'doctor_schedule_id',
    ];

    protected function casts(): array
    {
        return [
            'pain_scale' => 'integer',
            'attachments' => 'json',
            'schedule_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function doctorSchedule(): BelongsTo
    {
        return $this->belongsTo(DoctorSchedule::class);
    }
}
