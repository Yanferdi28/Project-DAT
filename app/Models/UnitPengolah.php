<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
}
