<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class BeritaAcaraPenyerahan extends Model
{
    use HasFactory;

    protected $table = 'berita_acara_penyerahan';

    protected $fillable = [
        'nomor_berita_acara',
        'tanggal_penyerahan',
        'unit_pengolah_asal_id',
        'unit_pengolah_tujuan_id',
        'penerima_nama',
        'penerima_jabatan',
        'keterangan',
        'dibuat_oleh',
    ];

    protected $casts = [
        'tanggal_penyerahan' => 'date',
    ];

    /**
     * Generate nomor berita acara otomatis
     */
    public static function generateNomorBeritaAcara(): string
    {
        $year = now()->format('Y');
        $month = now()->format('m');
        
        $lastRecord = self::whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->orderBy('id', 'desc')
            ->first();

        if ($lastRecord) {
            // Extract number from last record
            preg_match('/BA-(\d+)/', $lastRecord->nomor_berita_acara, $matches);
            $lastNumber = isset($matches[1]) ? (int)$matches[1] : 0;
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return sprintf('BA-%04d/%s/%s', $newNumber, $month, $year);
    }

    /**
     * Unit pengolah asal (yang menyerahkan)
     */
    public function unitPengolahAsal(): BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class, 'unit_pengolah_asal_id');
    }

    /**
     * Unit pengolah tujuan (yang menerima)
     */
    public function unitPengolahTujuan(): BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class, 'unit_pengolah_tujuan_id');
    }

    /**
     * User yang membuat berita acara
     */
    public function dibuatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }

    /**
     * Arsip yang diserahkan
     */
    public function arsipUnits(): BelongsToMany
    {
        return $this->belongsToMany(
            ArsipUnit::class,
            'berita_acara_arsip',
            'berita_acara_id',
            'arsip_unit_id',
            'id',
            'id_berkas'
        )->withPivot('keterangan_item')->withTimestamps();
    }

    /**
     * Get total jumlah arsip yang diserahkan
     */
    public function getJumlahArsipAttribute(): int
    {
        return $this->arsipUnits()->count();
    }
}
