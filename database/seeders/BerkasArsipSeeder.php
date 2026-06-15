<?php

namespace Database\Seeders;

use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use Illuminate\Database\Seeder;

class BerkasArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $samples = [
            [
                'kode' => 'UM.01.01',
                'unit' => 'TATA USAHA UMUM',
                'nama_berkas' => 'Berkas Administrasi Persuratan',
                'lokasi_fisik' => 'Rak TU-01',
                'uraian' => 'Kumpulan surat masuk, surat keluar, nota dinas, dan dokumen administrasi persuratan.',
            ],
            [
                'kode' => 'KP.01.06',
                'unit' => 'TATA USAHA SDM',
                'nama_berkas' => 'Berkas Penugasan Pegawai',
                'lokasi_fisik' => 'Rak SDM-01',
                'uraian' => 'Kumpulan surat perintah, penunjukan, pemanggilan, dan dokumen penugasan pegawai.',
            ],
            [
                'kode' => 'PR.02.01',
                'unit' => 'TATA USAHA KEUANGAN',
                'nama_berkas' => 'Berkas Pelaporan Anggaran dan Kinerja',
                'lokasi_fisik' => 'Rak KEU-01',
                'uraian' => 'Kumpulan laporan anggaran dan kinerja unit kerja.',
            ],
        ];

        foreach ($samples as $sample) {
            $kodeKlasifikasi = $this->kodeKlasifikasi($sample['kode']);

            if (!$kodeKlasifikasi) {
                continue;
            }

            BerkasArsip::updateOrCreate(
                ['nama_berkas' => $sample['nama_berkas']],
                [
                    'klasifikasi_id' => $kodeKlasifikasi->id,
                    'unit_pengolah_id' => $this->unitId($sample['unit']),
                    'retensi_aktif' => $kodeKlasifikasi->retensi_aktif,
                    'retensi_inaktif' => $kodeKlasifikasi->retensi_inaktif,
                    'penyusutan_akhir' => $kodeKlasifikasi->status_akhir,
                    'lokasi_fisik' => $sample['lokasi_fisik'],
                    'uraian' => $sample['uraian'],
                ]
            );
        }
    }

    private function kodeKlasifikasi(string $kode): ?KodeKlasifikasi
    {
        return KodeKlasifikasi::where('kode_klasifikasi', $kode)->first()
            ?? KodeKlasifikasi::query()->first();
    }

    private function unitId(string $unitName): ?int
    {
        return UnitPengolah::where('nama_unit', $unitName)->value('id')
            ?? UnitPengolah::query()->value('id');
    }
}
