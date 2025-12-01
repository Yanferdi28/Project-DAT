<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function subKategori()
    {
        return $this->hasMany(SubKategori::class);
    }
}
