<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
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
        // Bronze selalu aktif (gratis, tidak expired)
        if ($this->membership_level === 'bronze') {
            return $this->membership_profile_completed;
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
                'diamond' => 'diamond_bonus',
                default => 'regular',
            };
        }

        return 'regular';
    }

    public function isBronze(): bool
    {
        return $this->membership_level === 'bronze';
    }

    public function isPaidMember(): bool
    {
        return in_array($this->membership_level, ['gold', 'platinum', 'diamond']);
    }

    public function promoClaims(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PromoClaim::class);
    }

    public function profile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function complaints(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Complaint::class);
    }

    public function membershipProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(MembershipProfile::class);
    }

    public function membershipTransactions(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MembershipTransaction::class);
    }

    public function membershipPoints(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MembershipPoint::class);
    }

    public function membershipHistories(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(MembershipHistory::class);
    }

    public function getNextMembershipLevel(): ?string
    {
        return match($this->membership_level) {
            'bronze' => 'gold',
            'gold' => 'platinum',
            'platinum' => 'diamond',
            'diamond' => null,
            default => 'bronze',
        };
    }

    public function getProgressToNextLevel(): array
    {
        $totalTransactions = (float) ($this->total_transactions ?? 0);
        $nextLevel = $this->getNextMembershipLevel();
        if (!$nextLevel) {
            return [
                'next_level' => null,
                'current_amount' => $totalTransactions,
                'required_amount' => 0,
                'percentage' => 100,
                'remaining' => 0,
            ];
        }

        $requiredAmount = match($nextLevel) {
            'gold' => 5000000,
            'platinum' => 15000000,
            'diamond' => 30000000,
            default => 0,
        };

        $percentage = $requiredAmount > 0 ? min(100, ($totalTransactions / $requiredAmount) * 100) : 100;
        $remaining = max(0, $requiredAmount - $totalTransactions);

        return [
            'next_level' => $nextLevel,
            'current_amount' => $totalTransactions,
            'required_amount' => $requiredAmount,
            'percentage' => round($percentage, 1),
            'remaining' => $remaining,
        ];
    }
}
