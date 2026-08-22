<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UnitPengolah extends Model
{
    use HasFactory;

    protected $table = 'unit_pengolah';

    protected $fillable = [
        'nama_unit',
    ];

    protected $appends = ['nama'];

    public $timestamps = false;

    public function getNamaAttribute()
    {
        return $this->nama_unit;
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'unit_pengolah_id');
    }

    public function berkasArsip(): HasMany
    {
        return $this->hasMany(BerkasArsip::class, 'unit_pengolah_id');
    }

    public function arsipUnits(): HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'unit_pengolah_arsip_id');
    }

    public function peminjaman(): HasMany
    {
        return $this->hasMany(PeminjamanArsip::class, 'unit_pengolah_id');
    }

    public function beritaAcaraAsal(): HasMany
    {
        return $this->hasMany(BeritaAcaraPenyerahan::class, 'unit_pengolah_asal_id');
    }

    public function beritaAcaraTujuan(): HasMany
    {
        return $this->hasMany(BeritaAcaraPenyerahan::class, 'unit_pengolah_tujuan_id');
    }
}
