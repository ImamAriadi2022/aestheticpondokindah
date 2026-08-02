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
        'doctor_id',
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

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'doctor_id');
    }

    public function doctorSchedule(): BelongsTo
    {
        return $this->belongsTo(DoctorSchedule::class);
    }

    public function messages(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ConsultationMessage::class)->orderBy('created_at');
    }

    public function meetings(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ConsultationMeeting::class)->orderByDesc('starts_at')->orderByDesc('created_at');
    }

    public function isManagedBy(User $doctor): bool
    {
        if ($this->type === 'quick' && !$this->doctor_id) {
            return true;
        }

        if ($this->doctor_id && (int) $this->doctor_id === (int) $doctor->id) {
            return true;
        }

        if ($this->doctorSchedule && (int) $this->doctorSchedule->user_id === (int) $doctor->id) {
            return true;
        }

        return $this->doctor_name !== null && mb_stripos($this->doctor_name, $doctor->name) !== false;
    }
}
