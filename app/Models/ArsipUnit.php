<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArsipUnit extends Model
{
    use HasFactory;

    protected $table = 'arsip_unit';
    protected $primaryKey = 'id_berkas';

    protected $fillable = [
        'kode_klasifikasi_id',
        'unit_pengolah_arsip_id',
        'berkas_arsip_id',
        'kategori_id',
        'sub_kategori_id',
        'publish_status',
        'verified_by',
        'verified_at',
        'verification_notes',
        'submitted_at',
        'verifikasi_oleh',
        'verifikasi_tanggal',
        'retensi_aktif',
        'retensi_inaktif',
        'indeks',
        'no_item_arsip',
        'uraian_informasi',
        'tanggal',
        'jumlah_nilai',
        'jumlah_satuan',
        'tingkat_perkembangan',
        'skkaad',
        'ruangan',
        'no_filling',
        'no_laci',
        'no_folder',
        'no_box',
        'dokumen',
        'keterangan',
        'status',
        'verifikasi_keterangan',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'verified_at' => 'datetime',
        'submitted_at' => 'datetime',
        'verifikasi_tanggal' => 'datetime',
    ];

    public function kodeKlasifikasi(): BelongsTo
    {
        return $this->belongsTo(KodeKlasifikasi::class, 'kode_klasifikasi_id');
    }

    public function unitPengolah(): BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class, 'unit_pengolah_arsip_id');
    }

    public function berkasArsip(): BelongsTo
    {
        return $this->belongsTo(BerkasArsip::class, 'berkas_arsip_id', 'nomor_berkas');
    }

    public function kategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function subKategori(): BelongsTo
    {
        return $this->belongsTo(SubKategori::class, 'sub_kategori_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function verifikasiOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verifikasi_oleh');
    }
}
