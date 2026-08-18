<?php

namespace App\Models\Guest\Service;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClinicService extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'category',
        'image',
        'intro',
        'price',
        'duration',
        'paragraphs',
        'steps',
        'general_dentists',
        'specialist_label',
        'specialist_names',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'paragraphs' => 'array',
        'steps' => 'array',
        'general_dentists' => 'array',
        'specialist_names' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    protected $appends = [
        'price_formatted',
    ];

    public function getPriceFormattedAttribute(): string
    {
        $val = (float) ($this->price ?? 500000);
        return 'Rp ' . number_format($val, 0, ',', '.');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }
}
