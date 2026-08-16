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
        'image',
        'intro',
        'paragraphs',
        'steps',
        'general_dentists',
        'specialist_label',
        'specialist_names',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'paragraphs' => 'array',
        'steps' => 'array',
        'general_dentists' => 'array',
        'specialist_names' => 'array',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('title');
    }
}
