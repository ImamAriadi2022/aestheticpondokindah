<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProcedureCatalog extends Model
{
    use HasFactory;

    protected $table = 'procedure_catalogs';

    protected $fillable = [
        'code',
        'name',
        'category',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];
}
