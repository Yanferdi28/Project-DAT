<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ArsipUnit extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    protected static string $activityModelName = 'Arsip Unit';

    protected static array $activityIgnoredFields = [
        'extracted_text',
        'ocr_status',
        'ocr_confidence',
        'ocr_error',
        'ocr_processed_at',
        'ai_confidence_score',
        'ai_suggestion_status',
        'suggested_kategori_id',
        'suggested_sub_kategori_id',
        'suggested_kode_klasifikasi_id',
    ];

    public function getActivityIdentifier(): string
    {
        return $this->indeks ?: "#{$this->id_berkas}";
    }

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
        // OCR fields
        'extracted_text',
        'ocr_status',
        'ocr_confidence',
        'ocr_error',
        'ocr_processed_at',
        'suggested_kategori_id',
        'suggested_sub_kategori_id',
        'suggested_kode_klasifikasi_id',
        'ai_confidence_score',
        'ai_suggestion_status',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'verified_at' => 'datetime',
        'submitted_at' => 'datetime',
        'verifikasi_tanggal' => 'datetime',
        'ocr_processed_at' => 'datetime',
        'ocr_confidence' => 'decimal:2',
        'ai_confidence_score' => 'decimal:2',
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

    public function suggestedKategori(): BelongsTo
    {
        return $this->belongsTo(Kategori::class, 'suggested_kategori_id');
    }

    public function suggestedSubKategori(): BelongsTo
    {
        return $this->belongsTo(SubKategori::class, 'suggested_sub_kategori_id');
    }

    public function suggestedKodeKlasifikasi(): BelongsTo
    {
        return $this->belongsTo(KodeKlasifikasi::class, 'suggested_kode_klasifikasi_id');
    }

    /**
     * Scope: search by extracted text content (full-text search).
     */
    public function scopeSearchByContent($query, string $search)
    {
        return $query->whereRaw(
            'MATCH(extracted_text) AGAINST(? IN BOOLEAN MODE)',
            [$search]
        );
    }

    /**
     * Check if document is eligible for OCR processing.
     */
    public function isOcrEligible(): bool
    {
        if (!$this->dokumen) {
            return false;
        }

        $extension = strtolower(pathinfo($this->dokumen, PATHINFO_EXTENSION));
        return in_array($extension, config('ocr.supported_extensions', []));
    }

    /**
     * Check if OCR has been completed.
     */
    public function hasOcrResult(): bool
    {
        return $this->ocr_status === 'completed' && !empty($this->extracted_text);
    }

    /**
     * Check if AI suggestion is pending review.
     */
    public function hasAiSuggestion(): bool
    {
        return $this->suggested_kode_klasifikasi_id !== null
            && $this->ai_suggestion_status === null;
    }
}
