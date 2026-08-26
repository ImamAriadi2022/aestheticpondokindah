<?php

namespace App\Models\Shared\User;

use App\Models\Shared\Reservation\Reservation;
use App\Models\Shared\Consultation\Consultation;
use App\Models\Admin\PromoClaim\PromoClaim;
use App\Models\Doctor\Schedule\DoctorSchedule;
use App\Models\Doctor\Visit\Visit;
use App\Models\Doctor\MedicalRecord\MedicalRecord;
use App\Models\Patient\Profile\UserProfile;
use App\Models\Patient\Profile\UserDeviceToken;
use App\Models\Patient\Membership\MembershipProfile;
use App\Models\Patient\Membership\MembershipPoint;
use App\Models\Patient\Membership\MembershipHistory;
use App\Models\Patient\Membership\MembershipTransaction;
use App\Models\Patient\Billing\Invoice;
use App\Models\Patient\Billing\Payment;
use App\Models\Patient\Complaint\Complaint;
use App\Models\Patient\Notification\Notification;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'whatsapp',
        'role',
        'status',
        'phone_verified_at',
        'address_line',
        'city',
        'postal_code',
        'profile_completed_at',
        'membership_level',
        'membership_status',
        'membership_points',
        'membership_started_at',
        'membership_expires_at',
        'gender',
        'blood_type',
        'job',
        'birth_date',
        'province',
        'district',
        'interests',
        'is_coffee_drinker',
        'is_smoker',
        'source_info',
        'insurance_provider',
        'last_paid_level',
        'avatar',
        'str_number',
        'sip_number',
        'specialization',
        'education',
        'experience_years',
        'bio',
        'primary_branch',
        'consultation_fee',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'profile_completed_at' => 'datetime',
            'membership_started_at' => 'datetime',
            'membership_expires_at' => 'datetime',
            'birth_date' => 'date',
            'interests' => 'json',
            'is_coffee_drinker' => 'boolean',
            'is_smoker' => 'boolean',
            'password' => 'hashed',
        ];
    }

    // =========================================================================
    // QUERY SCOPES
    // =========================================================================

    public function scopePatients($query)
    {
        return $query->where('role', 'patient');
    }

    public function scopeDoctors($query)
    {
        return $query->where('role', 'doctor');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    // =========================================================================
    // BUSINESS LOGIC & HELPERS
    // =========================================================================

    public function isProfileComplete(): bool
    {
        return !empty($this->name)
            && !empty($this->whatsapp)
            && !is_null($this->phone_verified_at)
            && !empty($this->address_line)
            && !empty($this->city)
            && !empty($this->postal_code);
    }

    public function isMembershipActive(): bool
    {
        // Bronze selalu aktif (gratis, otomatis untuk semua pengguna terdaftar, tidak expired)
        if ($this->membership_level === 'bronze') {
            return true;
        }

        return $this->membership_status === 'active'
            && !is_null($this->membership_expires_at)
            && now()->lessThanOrEqualTo($this->membership_expires_at);
    }

    public function promoEligibleLevel(): string
    {
        if (!$this->isProfileComplete()) {
            return 'none';
        }

        if ($this->isMembershipActive()) {
            return match($this->membership_level) {
                'bronze' => 'bronze',
                'gold' => 'gold_bonus',
                'platinum' => 'platinum_bonus',
                default => 'bronze',
            };
        }

        return 'bronze';
    }

    public function isBronze(): bool
    {
        return $this->membership_level === 'bronze';
    }

    public function isPaidMember(): bool
    {
        return in_array($this->membership_level, ['gold', 'platinum']);
    }

    public function getNextMembershipLevel(): ?string
    {
        return match($this->membership_level) {
            'bronze' => 'gold',
            'gold' => 'platinum',
            'platinum' => null,
            default => 'bronze',
        };
    }

    public function getProgressToNextLevel(): array
    {
        $currentPoints = (int) ($this->membership_points ?? 0);
        $totalTransactions = (float) ($this->total_transactions ?? 0);
        $nextLevel = $this->getNextMembershipLevel();
        if (!$nextLevel) {
            return [
                'next_level' => null,
                'current_points' => $currentPoints,
                'required_points' => 0,
                'current_amount' => $totalTransactions,
                'required_amount' => 0,
                'percentage' => 100,
                'remaining' => 0,
                'remaining_points' => 0,
            ];
        }

        $goldPointThreshold = (int) \App\Models\Admin\Settings\ClinicSetting::getValue('gold_point_threshold', 1000);
        $platinumPointThreshold = (int) \App\Models\Admin\Settings\ClinicSetting::getValue('platinum_point_threshold', 3000);

        $requiredPoints = match($nextLevel) {
            'gold' => $goldPointThreshold,
            'platinum' => $platinumPointThreshold,
            default => 1000,
        };

        $requiredAmount = match($nextLevel) {
            'gold' => 5000000,
            'platinum' => 15000000,
            default => 0,
        };

        $percentage = $requiredPoints > 0 ? min(100, ($currentPoints / $requiredPoints) * 100) : 100;
        $remainingPoints = max(0, $requiredPoints - $currentPoints);
        $remainingAmount = max(0, $requiredAmount - $totalTransactions);

        return [
            'next_level' => $nextLevel,
            'current_points' => $currentPoints,
            'required_points' => $requiredPoints,
            'current_amount' => $totalTransactions,
            'required_amount' => $requiredAmount,
            'percentage' => round($percentage, 1),
            'remaining' => $remainingAmount,
            'remaining_points' => $remainingPoints,
        ];
    }

    // =========================================================================
    // ELOQUENT RELATIONSHIPS
    // =========================================================================

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function membershipProfile(): HasOne
    {
        return $this->hasOne(MembershipProfile::class);
    }

    public function promoClaims(): HasMany
    {
        return $this->hasMany(PromoClaim::class);
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    public function reservations(): HasMany
    {
        return $this->hasMany(Reservation::class);
    }

    public function patientConsultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'user_id');
    }

    public function doctorConsultations(): HasMany
    {
        return $this->hasMany(Consultation::class, 'doctor_id');
    }

    public function doctorSchedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class, 'user_id');
    }

    public function visits(): HasMany
    {
        return $this->hasMany(Visit::class, 'patient_id');
    }

    public function medicalRecords(): HasMany
    {
        return $this->hasMany(MedicalRecord::class, 'patient_id');
    }

    public function membershipTransactions(): HasMany
    {
        return $this->hasMany(MembershipTransaction::class);
    }

    public function membershipPoints(): HasMany
    {
        return $this->hasMany(MembershipPoint::class);
    }

    public function membershipHistories(): HasMany
    {
        return $this->hasMany(MembershipHistory::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    public function deviceTokens(): HasMany
    {
        return $this->hasMany(UserDeviceToken::class);
    }
}
