<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use Carbon\Carbon;

class BerkasArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $klasifikasiIds = KodeKlasifikasi::whereNotNull('kode_klasifikasi_induk')->pluck('id')->values();
        $unitPengolahIds = UnitPengolah::pluck('id')->values();

        if ($klasifikasiIds->isEmpty() || $unitPengolahIds->isEmpty()) {
            return;
        }

        // Minimal 10 data, dengan variasi tahun agar laporan penyusutan punya data "segera" dan "mendekat".
        // Tahun acuan default laporan adalah tahun sekarang (mis. 2026).
        $berkasTemplates = [
            [
                'nama_berkas' => 'Berkas Perencanaan Program Tahunan',
                'uraian' => 'Dokumen perencanaan program dan kegiatan tahunan',
                'lokasi_fisik' => 'Rak A1 - Ruang Arsip Utama',
                'penyusutan_akhir' => null,
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2015, 2, 12, 9, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Laporan Keuangan Triwulan',
                'uraian' => 'Laporan keuangan triwulanan dan bukti pendukung',
                'lokasi_fisik' => 'Rak B2 - Ruang Arsip Keuangan',
                'penyusutan_akhir' => 'Musnah',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2018, 3, 20, 10, 30, 0),
            ],
            [
                'nama_berkas' => 'Berkas Pengadaan Barang dan Jasa',
                'uraian' => 'Dokumen proses pengadaan barang/jasa (kontrak, BA, evaluasi)',
                'lokasi_fisik' => 'Rak C1 - Ruang Arsip Umum',
                'penyusutan_akhir' => 'Dinilai Kembali',
                'retensi_aktif' => 2,
                'retensi_inaktif' => 3,
                'created_at' => Carbon::create(2019, 7, 5, 14, 15, 0),
            ],
            [
                'nama_berkas' => 'Berkas Kepegawaian Mutasi',
                'uraian' => 'Dokumen mutasi dan penempatan pegawai',
                'lokasi_fisik' => 'Rak D3 - Ruang Arsip SDM',
                'penyusutan_akhir' => 'Permanen',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2020, 1, 17, 8, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Surat Masuk',
                'uraian' => 'Kumpulan surat masuk dan disposisi',
                'lokasi_fisik' => 'Rak A2 - Ruang Arsip Utama',
                'penyusutan_akhir' => null,
                'retensi_aktif' => 1,
                'retensi_inaktif' => 2,
                'created_at' => Carbon::create(2022, 11, 9, 11, 45, 0),
            ],
            [
                'nama_berkas' => 'Berkas Notulen Rapat Direksi',
                'uraian' => 'Notulensi rapat direksi dan tindak lanjut',
                'lokasi_fisik' => 'Rak E1 - Ruang Arsip Rahasia',
                'penyusutan_akhir' => 'Permanen',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2017, 9, 1, 9, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Perjanjian Kerjasama',
                'uraian' => 'Dokumen perjanjian kerjasama dengan pihak ketiga',
                'lokasi_fisik' => 'Rak F2 - Ruang Arsip Hukum',
                'penyusutan_akhir' => 'Permanen',
                'retensi_aktif' => 3,
                'retensi_inaktif' => 2,
                'created_at' => Carbon::create(2023, 5, 22, 15, 20, 0),
            ],
            [
                'nama_berkas' => 'Berkas Laporan Siaran Bulanan',
                'uraian' => 'Laporan kegiatan siaran bulanan (rekap program dan evaluasi)',
                'lokasi_fisik' => 'Rak G1 - Ruang Arsip Siaran',
                'penyusutan_akhir' => 'Musnah',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2024, 2, 2, 10, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Inventaris BMN',
                'uraian' => 'Daftar inventaris Barang Milik Negara dan dokumen pendukung',
                'lokasi_fisik' => 'Rak H2 - Ruang Arsip Aset',
                'penyusutan_akhir' => 'Permanen',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2016, 6, 18, 13, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Pelatihan Pegawai',
                'uraian' => 'Dokumen pelatihan dan pengembangan pegawai',
                'lokasi_fisik' => 'Rak D1 - Ruang Arsip SDM',
                'penyusutan_akhir' => 'Musnah',
                'retensi_aktif' => 1,
                'retensi_inaktif' => 1,
                'created_at' => Carbon::create(2025, 4, 10, 9, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas LHKPN Pejabat',
                'uraian' => 'Laporan Harta Kekayaan Penyelenggara Negara (LHKPN)',
                'lokasi_fisik' => 'Rak E2 - Ruang Arsip Rahasia',
                'penyusutan_akhir' => 'Permanen',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2014, 12, 30, 16, 0, 0),
            ],
            [
                'nama_berkas' => 'Berkas Pemeliharaan Peralatan',
                'uraian' => 'Dokumen pemeliharaan peralatan teknik dan checklist rutin',
                'lokasi_fisik' => 'Rak I1 - Ruang Arsip Teknik',
                'penyusutan_akhir' => 'Musnah',
                'retensi_aktif' => null,
                'retensi_inaktif' => null,
                'created_at' => Carbon::create(2021, 8, 14, 10, 0, 0),
            ],
        ];

        foreach ($berkasTemplates as $index => $template) {
            $klasifikasiId = $klasifikasiIds[$index % $klasifikasiIds->count()];
            $unitPengolahId = $unitPengolahIds[$index % $unitPengolahIds->count()];

            $berkas = BerkasArsip::create([
                'nama_berkas' => $template['nama_berkas'],
                'klasifikasi_id' => $klasifikasiId,
                'unit_pengolah_id' => $unitPengolahId,
                'retensi_aktif' => $template['retensi_aktif'],
                'retensi_inaktif' => $template['retensi_inaktif'],
                'penyusutan_akhir' => $template['penyusutan_akhir'],
                'lokasi_fisik' => $template['lokasi_fisik'],
                'uraian' => $template['uraian'],
            ]);

            $createdAt = $template['created_at'] ?? now();
            $berkas->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->saveQuietly();
        }
    }
}
