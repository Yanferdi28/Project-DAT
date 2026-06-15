<?php

namespace Database\Seeders;

use App\Models\UnitPengolah;
use Illuminate\Database\Seeder;

class UnitPengolahSeeder extends Seeder
{
    public function run(): void
    {
        $unitPengolahs = [
            'TMB',
            'SIARAN',
            'KMB',
            'LPU',
            'TATA USAHA KEUANGAN',
            'TATA USAHA UMUM',
            'TATA USAHA SDM',
        ];

        foreach ($unitPengolahs as $namaUnit) {
            UnitPengolah::updateOrCreate(
                ['nama_unit' => $namaUnit],
                ['nama_unit' => $namaUnit]
            );
        }
    }
}
