<?php

namespace App\Models\Admin\Media;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Media extends Model
{
    protected $table = 'media';

    protected $fillable = [
        'uploaded_by',
        'post_id',
        'collection',
        'disk',
        'path',
        'original_name',
        'mime_type',
        'size_bytes',
        'width',
        'height',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'width' => 'integer',
        'height' => 'integer',
    ];

    public function url(): string
    {
        if (($this->disk ?? 'public') === 'public') {
            return asset('storage/' . ltrim($this->path, '/'));
        }
        return Storage::disk($this->disk ?? 'public')->url($this->path);
    }
}
