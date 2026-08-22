<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, TwoFactorAuthenticatable, LogsActivity;

    protected static string $activityModelName = 'Pengguna';

    protected static array $activityIgnoredFields = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    public function getActivityIdentifier(): string
    {
        return $this->name ?: "#{$this->id}";
    }

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'avatar',
        'role',
        'unit_pengolah_id',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the unit pengolah that the user belongs to.
     */
    public function unitPengolah(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(UnitPengolah::class);
    }

    public function arsipVerified(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'verified_by');
    }

    public function arsipVerifikasiOleh(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ArsipUnit::class, 'verifikasi_oleh');
    }

    public function peminjamanDicatat(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PeminjamanArsip::class, 'dicatat_oleh');
    }

    public function peminjamanDikembalikan(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PeminjamanArsip::class, 'dikembalikan_oleh');
    }

    public function peminjamanUser(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(PeminjamanArsip::class, 'peminjam_id');
    }

    public function beritaAcaraDibuat(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(BeritaAcaraPenyerahan::class, 'dibuat_oleh');
    }

    public function activityLogs(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ActivityLog::class, 'user_id');
    }

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Check if user is regular user.
     */
    public function isUser(): bool
    {
        return $this->role === 'user';
    }

    /**
     * Check if user is verified by admin.
     */
    public function isVerifiedByAdmin(): bool
    {
        return $this->email_verified_at !== null;
    }

    /**
     * Check if user is pending verification.
     */
    public function isPendingVerification(): bool
    {
        return $this->email_verified_at === null;
    }
}
