<?php

namespace App\Models\Guest\Wilayah;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Wilayah extends Model
{
    use HasFactory;

    protected $table = 'wilayah';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'kode',
        'nama',
    ];

    /**
     * Scope for Provinces (kode length 2)
     */
    public function scopeProvinces($query)
    {
        return $query->whereRaw('CHAR_LENGTH(kode) = 2');
    }

    /**
     * Scope for Regencies/Cities by Province (kode format XX.YY, length 5)
     */
    public function scopeRegencies($query, string $provinceKode)
    {
        return $query->whereRaw('CHAR_LENGTH(kode) = 5')
                     ->where('kode', 'LIKE', $provinceKode . '.%');
    }

    /**
     * Scope for Districts by Regency/City (kode format XX.YY.ZZ, length 8)
     */
    public function scopeDistricts($query, string $regencyKode)
    {
        return $query->whereRaw('CHAR_LENGTH(kode) = 8')
                     ->where('kode', 'LIKE', $regencyKode . '.%');
    }

    /**
     * Scope for Villages by District (kode format XX.YY.ZZ.WWWW, length 13)
     */
    public function scopeVillages($query, string $districtKode)
    {
        return $query->whereRaw('CHAR_LENGTH(kode) = 13')
                     ->where('kode', 'LIKE', $districtKode . '.%');
    }
}
