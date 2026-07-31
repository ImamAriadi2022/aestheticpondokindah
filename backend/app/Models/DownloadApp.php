<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DownloadApp extends Model
{
    protected $fillable = [
        'title',
        'description',
        'version',
        'platform',
        'apk_path',
        'download_link',
        'file_size',
        'is_active',
        'is_development',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_development' => 'boolean',
        'file_size' => 'integer',
        'sort_order' => 'integer',
    ];
}
