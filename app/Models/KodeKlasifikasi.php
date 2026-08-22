<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class KodeKlasifikasi extends Model
{
    use HasFactory;

    protected $table = 'kode_klasifikasi';

    protected $fillable = [
        'kode_klasifikasi',
        'kode_klasifikasi_induk',
        'uraian',
        'retensi_aktif',
        'retensi_inaktif',
        'status_akhir',
        'klasifikasi_keamanan',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(KodeKlasifikasi::class, 'kode_klasifikasi_induk', 'kode_klasifikasi');
    }

    public function children(): HasMany
    {
        return $this->hasMany(KodeKlasifikasi::class, 'kode_klasifikasi_induk', 'kode_klasifikasi');
    }

    public function berkasArsip(): HasMany
    {
        return $this->hasMany(BerkasArsip::class, 'klasifikasi_id');
    }

    public function arsipUnits(): HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'kode_klasifikasi_id');
    }
}
