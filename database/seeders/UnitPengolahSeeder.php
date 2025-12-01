<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UnitPengolahSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['id' => 1, 'nama_unit' => 'TMB'],
            ['id' => 2, 'nama_unit' => 'SIARAN'],
            ['id' => 3, 'nama_unit' => 'KMB'],
            ['id' => 4, 'nama_unit' => 'LPU'],
            ['id' => 5, 'nama_unit' => 'TATA USAHA KEUANGAN'],
            ['id' => 6, 'nama_unit' => 'TATA USAHA UMUM'],
            ['id' => 7, 'nama_unit' => 'TATA USAHA SDM'],
        ];

        DB::table('unit_pengolah')->upsert(
            $data,
            ['id'],
            ['nama_unit']
        );
    }
}
