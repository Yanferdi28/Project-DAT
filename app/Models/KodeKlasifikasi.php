<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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

    public function parent()
    {
        return $this->belongsTo(KodeKlasifikasi::class, 'kode_klasifikasi_induk', 'kode_klasifikasi');
    }

    public function children()
    {
        return $this->hasMany(KodeKlasifikasi::class, 'kode_klasifikasi_induk', 'kode_klasifikasi');
    }
}
