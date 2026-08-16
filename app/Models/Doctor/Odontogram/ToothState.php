<?php

namespace App\Models\Doctor\Odontogram;

use App\Models\Shared\User\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToothState extends Model
{
    use HasFactory;

    protected $table = 'tooth_states';

    protected $fillable = [
        'odontogram_id',
        'tooth_number',
        'condition',
        'surface',
        'notes',
        'updated_by',
    ];

    public function odontogram(): BelongsTo
    {
        return $this->belongsTo(Odontogram::class);
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
