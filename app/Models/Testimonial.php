<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    protected $fillable = [
        'name',
        'source',
        'rating',
        'quote',
        'photo_path',
        'sort_order',
        'is_published',
    ];

    protected $casts = [
        'rating' => 'integer',
        'sort_order' => 'integer',
        'is_published' => 'boolean',
    ];
}
