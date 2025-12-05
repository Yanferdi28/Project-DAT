<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;

class BerkasArsipSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $klasifikasiIds = KodeKlasifikasi::whereNotNull('kode_klasifikasi_induk')->pluck('id')->toArray();
        $unitPengolahIds = UnitPengolah::pluck('id')->toArray();

        $berkasData = [
            [
                'nama_berkas' => 'Berkas Perencanaan Program Tahunan 2024',
                'uraian' => 'Dokumen perencanaan program dan kegiatan tahunan tahun 2024',
                'lokasi_fisik' => 'Rak A1 - Ruang Arsip Utama',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Laporan Keuangan Triwulan I 2024',
                'uraian' => 'Laporan keuangan periode Januari - Maret 2024',
                'lokasi_fisik' => 'Rak B2 - Ruang Arsip Keuangan',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Pengadaan Barang dan Jasa',
                'uraian' => 'Dokumen proses pengadaan barang dan jasa tahun 2024',
                'lokasi_fisik' => 'Rak C1 - Ruang Arsip Umum',
                'penyusutan_akhir' => 'Dinilai Kembali',
            ],
            [
                'nama_berkas' => 'Berkas Kepegawaian Mutasi 2024',
                'uraian' => 'Dokumen mutasi dan penempatan pegawai tahun 2024',
                'lokasi_fisik' => 'Rak D3 - Ruang Arsip SDM',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Surat Masuk Januari 2024',
                'uraian' => 'Kumpulan surat masuk bulan Januari 2024',
                'lokasi_fisik' => 'Rak A2 - Ruang Arsip Utama',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Notulen Rapat Direksi',
                'uraian' => 'Notulensi rapat direksi tahun 2024',
                'lokasi_fisik' => 'Rak E1 - Ruang Arsip Rahasia',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Perjanjian Kerjasama',
                'uraian' => 'Dokumen perjanjian kerjasama dengan pihak ketiga',
                'lokasi_fisik' => 'Rak F2 - Ruang Arsip Hukum',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Laporan Siaran Bulanan',
                'uraian' => 'Laporan kegiatan siaran bulanan',
                'lokasi_fisik' => 'Rak G1 - Ruang Arsip Siaran',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Inventaris BMN',
                'uraian' => 'Daftar inventaris Barang Milik Negara',
                'lokasi_fisik' => 'Rak H2 - Ruang Arsip Aset',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Pelatihan Pegawai 2024',
                'uraian' => 'Dokumen pelatihan dan pengembangan pegawai',
                'lokasi_fisik' => 'Rak D1 - Ruang Arsip SDM',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas LHKPN Pejabat',
                'uraian' => 'Laporan Harta Kekayaan Penyelenggara Negara',
                'lokasi_fisik' => 'Rak E2 - Ruang Arsip Rahasia',
                'penyusutan_akhir' => 'Permanen',
            ],
            [
                'nama_berkas' => 'Berkas Pemeliharaan Peralatan',
                'uraian' => 'Dokumen pemeliharaan peralatan teknik',
                'lokasi_fisik' => 'Rak I1 - Ruang Arsip Teknik',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Surat Keluar Februari 2024',
                'uraian' => 'Kumpulan surat keluar bulan Februari 2024',
                'lokasi_fisik' => 'Rak A3 - Ruang Arsip Utama',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Evaluasi Kinerja Semester I',
                'uraian' => 'Dokumen evaluasi kinerja pegawai semester pertama 2024',
                'lokasi_fisik' => 'Rak D2 - Ruang Arsip SDM',
                'penyusutan_akhir' => 'Musnah',
            ],
            [
                'nama_berkas' => 'Berkas Peraturan Internal',
                'uraian' => 'Kumpulan peraturan dan kebijakan internal LPP RRI',
                'lokasi_fisik' => 'Rak F1 - Ruang Arsip Hukum',
                'penyusutan_akhir' => 'Permanen',
            ],
        ];

        foreach ($berkasData as $index => $berkas) {
            BerkasArsip::create([
                'nama_berkas' => $berkas['nama_berkas'],
                'klasifikasi_id' => $klasifikasiIds[array_rand($klasifikasiIds)],
                'unit_pengolah_id' => $unitPengolahIds[array_rand($unitPengolahIds)],
                'retensi_aktif' => rand(1, 5),
                'retensi_inaktif' => rand(3, 10),
                'penyusutan_akhir' => $berkas['penyusutan_akhir'],
                'lokasi_fisik' => $berkas['lokasi_fisik'],
                'uraian' => $berkas['uraian'],
            ]);
        }
    }
}
