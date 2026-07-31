<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Icd10Code extends Model
{
    use HasFactory;

    protected $table = 'icd10_codes';

    protected $fillable = [
        'code',
        'description',
        'category',
    ];
}
