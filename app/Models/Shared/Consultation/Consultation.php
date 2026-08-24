<?php

namespace App\Models\Shared\Consultation;

use App\Models\Shared\User\User;
use App\Models\Shared\Reservation\Reservation;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Doctor\Visit\Visit;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Consultation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'doctor_id',
        'admin_id',
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
        'reservation_id',
        'visit_id',
        'guest_name',
        'guest_phone',
        'guest_email',
        'access_token',
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

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function doctorSchedule(): BelongsTo
    {
        return $this->belongsTo(DoctorSchedule::class);
    }

    public function reservation(): BelongsTo
    {
        return $this->belongsTo(Reservation::class);
    }

    public function visit(): BelongsTo
    {
        return $this->belongsTo(Visit::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ConsultationMessage::class)->orderBy('created_at')->orderBy('id');
    }

    public function meetings(): HasMany
    {
        return $this->hasMany(ConsultationMeeting::class)->orderByDesc('starts_at')->orderByDesc('created_at');
    }

    /**
     * Display name of the person who started the conversation
     * (guest identity falls back to the registered user).
     */
    public function getParticipantNameAttribute(): string
    {
        return trim($this->guest_name) ?: ($this->user?->name ?? 'Pasien');
    }

    /**
     * True when the conversation was started by an anonymous guest.
     */
    public function getIsGuestAttribute(): bool
    {
        return empty($this->user_id);
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

    /**
     * Access check shared across roles:
     * - clinic admin may access every consultation
     * - doctor uses isManagedBy()
     * - patient (user) may access own consultations
     */
    public function isParticipant(User $user): bool
    {
        if (in_array($user->role, ['clinic_admin', 'clinic', 'admin'], true)) {
            return true;
        }

        if ($user->role === 'doctor') {
            return $this->isManagedBy($user);
        }

        if (in_array($user->role, ['user', 'patient'], true)
            && $this->user_id
            && (int) $this->user_id === (int) $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Guest access via the resume token (quick consultations only).
     */
    public function isGuestAccessible(?string $token): bool
    {
        return $this->type === 'quick'
            && $this->access_token
            && $token
            && hash_equals((string) $this->access_token, (string) $token);
    }
}
