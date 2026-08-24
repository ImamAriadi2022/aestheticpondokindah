<?php

namespace App\Models\Patient\Membership;

use App\Models\Guest\Service\ClinicService;
use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MembershipPointRule extends Model
{
    use HasFactory;

    protected $table = 'membership_point_rules';

    protected $fillable = [
        'name',
        'service_id',
        'service_name',
        'points',
        'is_active',
        'description',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'points' => 'integer',
        'is_active' => 'boolean',
    ];

    public function service(): BelongsTo
    {
        return $this->belongsTo(ClinicService::class, 'service_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
