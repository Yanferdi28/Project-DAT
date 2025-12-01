<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function kategori()
    {
        return $this->belongsTo(Kategori::class);
    }
}
