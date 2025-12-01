<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Kategori;
use App\Models\SubKategori;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $mainCategories = [
            '-' => '',
            'Setiap Saat' => 'Informasi yang wajib disediakan dan diumumkan secara terbuka dan dapat diakses oleh publik tanpa menunggu permohonan.',
            'Berkala' => 'Informasi yang wajib diperbarui dan diumumkan secara teratur dalam jangka waktu tertentu.',
            'Serta Merta' => 'Informasi yang wajib diumumkan secara mendadak/tanpa penundaan karena menyangkut hajat hidup orang banyak atau ketertiban umum.',
            'Dikecualikan' => 'Informasi yang bersifat rahasia dan tidak dapat diakses oleh publik sesuai dengan ketentuan perundang-undangan (Pasal 17 UU 14 Tahun 2008).',
        ];

        $kategoriMap = [];
        foreach ($mainCategories as $nama => $deskripsi) {
            $kategori = Kategori::firstOrCreate(
                ['nama_kategori' => $nama],
                ['deskripsi' => $deskripsi]
            );
            $kategoriMap[$nama] = $kategori->id;
        }


        $subCategoriesData = [
            'Setiap Saat' => [
                'Informasi Daftar dan Hasil Penelitian LPP RRI',
                'Informasi dalam pertemuan yang bersifat untuk umum',
                'Informasi tentang penindakan atas pelanggaran yang dilakukan oleh pegawai LPP RRI',
                'Informasi tentang PPID LPP RRI',
                'Kebijakan LPP RRI dan Dokumen Pendukungnya',
                'Keputusan LPP RRI dan Pertimbangannya',
                'Perjanjian LPP RRI dengan Pihak Ketiga',
                'Profil Lengkap Pimpinan dan Pegawai',
                'Prosedur kerja yang berkaitan dengan Publik',
                'Rencana Proyek dan Anggaran Tahunnya',
                'Rencana Strategis LPP RRI',
                'Tata Kelola PPID LPP RRI',
            ],
            'Berkala' => [
                'Acara Siaran',
                'Bintang Radio RRI Tingkat Nasional',
                'Daftar Dokumen Kontrak Pengadaan Barang dan Jasa',
                'Daftar Informasi Publik LPP RRI',
                'Daftar Investasi dan Asset (Administrasi BMN)',
                'DIPA',
                'Dokumen Penghargaan',
                'Dokumen Surat Menyurat',
                'Hasil Monitoring dan Evaluasi KIP',
                'Informasi Agenda Terkait Pelaksanaan Tugas LPP RRI',
                'Informasi Berkaitan Dengan Profile LPP RRI',
                'Informasi Penerimaan Calon Pegawai LPP RRI',
                'Informasi Publik Dalam Bahasa Isyarat Indonesia (BISINDO)',
                'Informasi Terkait Penanganan Covid-19',
                'Laporan Akuntabilitas',
                'Laporan Arus Kas dan CaLK',
                'Laporan Bidang LPU',
                'Laporan Bidang Pemberitaan/Tim Penyiaran',
                'Laporan Bidang SDM dan Umum',
                'Laporan Bidang Siaran/Tim Konten Media Baru',
                'Laporan Bidang TMB',
                'Laporan Keuangan Audited',
                'Laporan Tahunan LPP RRI',
                'LHKPN Dewas & Direksi',
                'LHKPN Kepala RRI Seluruh Indonesia',
                'Maklumat Pelayanan',
                'Neraca Keuangan',
                'Opini BPK RI Atas Laporan Keuangan LPP RRI',
                'Pedoman HUT LPP RRI 80th',
                'Pengadaan Barang & Jasa',
                'Penyelenggaraan Satu Data Indonesia',
                'Peraturan, Keputusan dan Kebijakan',
                'Press Release',
                'Regulasi dan Rancangan Keterbukaan Informasi Publik',
                'Rencana dan LRA Detail',
                'Rencana Umum Pengadaan',
                'Ringkasan Program Strategis LPP RRI',
                'RKAKL LPP RRI',
                'SOP',
                'Standar Pelayanan',
                'Statistik Kepegawaian',
                'Statistik Keuangan',
            ],
            'Serta Merta' => [
                'Informasi Yang Wajib Diumumkan Tanpa Penundaan',
                'Menyangkut Ancaman Terhadap Hajat Hidup Orang Banyak dan Ketertiban Umum',
            ],
            'Dikecualikan' => [
                'Pasal 17 UU 14 Tahun 2008',
            ],
        ];


        foreach ($subCategoriesData as $kategoriNama => $subKategoris) {
            $kategoriId = $kategoriMap[$kategoriNama];
            
            foreach ($subKategoris as $namaSub) {
                SubKategori::firstOrCreate(
                    ['nama_sub_kategori' => $namaSub],
                    ['kategori_id' => $kategoriId]
                );
            }
        }
    }
}
