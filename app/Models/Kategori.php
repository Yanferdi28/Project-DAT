<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Kategori extends Model
{
    use HasFactory;

    protected $table = 'kategori';

    protected $fillable = [
        'nama_kategori',
        'deskripsi',
    ];

    protected $appends = ['nama'];

    public function getNamaAttribute()
    {
        return $this->nama_kategori;
    }

    public function subKategori(): HasMany
    {
        return $this->hasMany(SubKategori::class);
    }

    public function arsipUnits(): HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'kategori_id');
    }
}
