<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeminjamanArsip extends Model
{
    use HasFactory, LogsActivity;

    protected static string $activityModelName = 'Peminjaman Arsip';

    protected static array $activityIgnoredFields = [];

    public function getActivityIdentifier(): string
    {
        return "#{$this->id}";
    }

    protected $table = 'peminjaman_arsip';

    protected $fillable = [
        'arsip_unit_id',
        'peminjam_id',
        'unit_pengolah_id',
        'nama_peminjam',
        'jabatan_peminjam',
        'tujuan_peminjaman',
        'tanggal_pinjam',
        'tanggal_harus_kembali',
        'tanggal_kembali',
        'status',
        'kondisi_pengembalian',
        'catatan',
        'dicatat_oleh',
        'dikembalikan_oleh',
    ];

    protected $casts = [
        'tanggal_pinjam' => 'date',
        'tanggal_harus_kembali' => 'date',
        'tanggal_kembali' => 'date',
    ];

    // ====================================================================
    // Relationships
    // ====================================================================

    public function arsipUnit(): BelongsTo
    {
        return $this->belongsTo(ArsipUnit::class, 'arsip_unit_id', 'id_berkas');
    }

    public function peminjam(): BelongsTo
    {
        return $this->belongsTo(User::class, 'peminjam_id');
    }

    public function unitPengolah(): BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class, 'unit_pengolah_id');
    }

    public function dicatatOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dicatat_oleh');
    }

    public function dikembalikanOleh(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dikembalikan_oleh');
    }

    // ====================================================================
    // Scopes
    // ====================================================================

    /**
     * Scope: filter arsip yang masih dipinjam.
     */
    public function scopeBelumDikembalikan($query)
    {
        return $query->whereIn('status', ['dipinjam', 'terlambat']);
    }

    /**
     * Scope: filter arsip yang terlambat dikembalikan.
     */
    public function scopeTerlambat($query)
    {
        return $query->where('status', 'dipinjam')
            ->whereDate('tanggal_harus_kembali', '<', now());
    }

    // ====================================================================
    // Accessors
    // ====================================================================

    /**
     * Check apakah peminjaman sudah melewati deadline.
     */
    public function getIsTerlambatAttribute(): bool
    {
        return $this->status === 'dipinjam'
            && $this->tanggal_harus_kembali
            && $this->tanggal_harus_kembali->isPast();
    }
}
