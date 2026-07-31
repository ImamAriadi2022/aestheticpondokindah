<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Popup extends Model
{
    protected $fillable = [
        'title',
        'headline',
        'message',
        'button_label',
        'button_url',
        'image_path',
        'enabled',
        'starts_at',
        'ends_at',
        'priority',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'priority' => 'integer',
    ];
}
