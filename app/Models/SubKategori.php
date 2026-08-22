<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubKategori extends Model
{
    use HasFactory;

    protected $table = 'sub_kategori';

    protected $fillable = [
        'kategori_id',
        'nama_sub_kategori',
        'deskripsi',
    ];

    protected $appends = ['nama'];

    public function getNamaAttribute()
    {
        return $this->nama_sub_kategori;
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class);
    }

    public function arsipUnits(): HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'sub_kategori_id');
    }
}
