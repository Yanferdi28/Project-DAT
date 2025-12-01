<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BerkasArsip extends Model
{
    use HasFactory;

    protected $table = 'berkas_arsip';
    protected $primaryKey = 'nomor_berkas';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'nama_berkas',
        'klasifikasi_id',
        'unit_pengolah_id',
        'retensi_aktif',
        'retensi_inaktif',
        'penyusutan_akhir',
        'lokasi_fisik',
        'uraian',
    ];

    protected $casts = [
        'retensi_aktif' => 'integer',
        'retensi_inaktif' => 'integer',
    ];

    public function kodeKlasifikasi(): BelongsTo
    {
        return $this->belongsTo(KodeKlasifikasi::class, 'klasifikasi_id');
    }

    public function unitPengolah(): BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class, 'unit_pengolah_id');
    }

    public function arsipUnits(): HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'berkas_arsip_id', 'nomor_berkas');
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'nomor_berkas';
    }
}
