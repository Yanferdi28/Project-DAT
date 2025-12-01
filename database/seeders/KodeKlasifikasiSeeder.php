<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\KodeKlasifikasi;

class KodeKlasifikasiSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        KodeKlasifikasi::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $data = [
            ['kode_klasifikasi' => 'PR', 'kode_klasifikasi_induk' => null, 'uraian' => 'Program dan Evaluasi', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PR.01.01', 'kode_klasifikasi_induk' => 'PR', 'uraian' => 'Perencanaan Kegiatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.01.02', 'kode_klasifikasi_induk' => 'PR', 'uraian' => 'Penyusunan Anggaran', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.01.03', 'kode_klasifikasi_induk' => 'PR', 'uraian' => 'Analisis Program', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.02', 'kode_klasifikasi_induk' => 'PR', 'uraian' => 'PELAPORAN', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PR.02.01', 'kode_klasifikasi_induk' => 'PR.02', 'uraian' => 'Pelaporan Anggaran dan Kinerja', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.02.02', 'kode_klasifikasi_induk' => 'PR.02', 'uraian' => 'Pelaksanaan Anggaran', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.02.03', 'kode_klasifikasi_induk' => 'PR.02', 'uraian' => 'Program dan Kegiatan Berkala (Triwulan, Semester, dan Tahunan) serta Insidental', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.02.04', 'kode_klasifikasi_induk' => 'PR.02', 'uraian' => 'Akuntabilitas Kinerja Instansi Pemerintah (LAKIP)', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.03', 'kode_klasifikasi_induk' => 'PR', 'uraian' => 'EVALUASI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PR.03.01', 'kode_klasifikasi_induk' => 'PR.03', 'uraian' => 'Evaluasi Perencanaan Kegiatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.03.02', 'kode_klasifikasi_induk' => 'PR.03', 'uraian' => 'Evaluasi Penyusunan Anggaran', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PR.03.03', 'kode_klasifikasi_induk' => 'PR.03', 'uraian' => 'Evaluasi Analisis Program', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01', 'kode_klasifikasi_induk' => null, 'uraian' => 'HASIL PENGAWASAN/LHKPN/GRATIFIKAS', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PW.01.01', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Pemantauan', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.02', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Analisis', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.03', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Evaluasi', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.04', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Pelaporan', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.05', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'LHKPN', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.06', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Gratifikasi', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.07', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Pelaksanaan Pengawasan Internal dan Eksternal', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.01.08', 'kode_klasifikasi_induk' => 'PW.01', 'uraian' => 'Pelaksanaan Pengawasan Lainnya', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.02', 'kode_klasifikasi_induk' => null, 'uraian' => 'TINDAK LANJUT HASIL PENGAWASAN INTERNAL', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PW.02.01', 'kode_klasifikasi_induk' => 'PW.02', 'uraian' => 'Penyiapan Bahan Evaluasi Atas Laporan hasil pengawasan Aparat Pengawasan Internal Pemerintah', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.02.02', 'kode_klasifikasi_induk' => 'PW.02', 'uraian' => 'Pengawasan Masyarakat/Publik', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.02.03', 'kode_klasifikasi_induk' => 'PW.02', 'uraian' => 'Pemantauan Penyelesaian Tindak Lanjut Hasil Pengawasan Internal dan Masyarakat/Publik', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.03', 'kode_klasifikasi_induk' => null, 'uraian' => 'TINDAK LANJUT HASIL PENGAWASAN EKSTERNAL', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'PW.03.01', 'kode_klasifikasi_induk' => 'PW.03', 'uraian' => 'Penyiapan Bahan Evaluasi Atas laporan hasil pengawasan Aparat Pengawasan Internal Pemerintah', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.03.02', 'kode_klasifikasi_induk' => 'PW.03', 'uraian' => 'Pengawasan Masyarakat/Publik', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'PW.03.03', 'kode_klasifikasi_induk' => 'PW.03', 'uraian' => 'Pemantauan Penyelesaian Tindak Lanjut Hasil Pengawasan Internal dan Masyarakat/Publik', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'UM.01', 'kode_klasifikasi_induk' => null, 'uraian' => 'TATA USAHA DAN RUMAH TANGGA', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.01', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Administrasi Persuratan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.02', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Kebersihan, Ketertiban dan Keamanan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.03', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Izin Peyewaan/peminjaman (Alat-alat, Ruangan, Lapangan, dll)', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.04', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Perumahan Dinas/Kendaraan Dinas', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.05', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Gedung/Perkantoran/Gudang', 'retensi_aktif' => 5, 'retensi_inaktif' => 5, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.06', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Pakaian Dinas', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.07', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Listrik/PAM/Telepon/AC', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.01.08', 'kode_klasifikasi_induk' => 'UM.01', 'uraian' => 'Sumbangan/Bantuan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.02', 'kode_klasifikasi_induk' => null, 'uraian' => 'KEARSIPAN', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'UM.02.01', 'kode_klasifikasi_induk' => 'UM.02', 'uraian' => 'Penyimpanan dan Pemeliharaan Arsip', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'UM.02.02', 'kode_klasifikasi_induk' => 'UM.02', 'uraian' => 'Layanan Arsip (Peminjaman dan Penggunaan Arsip)', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'UM.02.03', 'kode_klasifikasi_induk' => 'UM.02', 'uraian' => 'Penyusutan Arsip', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'UM.02.04', 'kode_klasifikasi_induk' => 'UM.02', 'uraian' => 'Berkas Proses Alih Media Arsip', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'UM.02.05', 'kode_klasifikasi_induk' => 'UM.02', 'uraian' => 'Pembinaan Kearsipan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01', 'kode_klasifikasi_induk' => null, 'uraian' => 'TATA USAHA KEPEGAWAIAN', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01.01', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Data Perorangan/Status/Database/DRH/Statistik', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Rahasia'],
            ['kode_klasifikasi' => 'KP.01.02', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'NIP/Kartu Pegawai/Kartu PPNS/Tanda Pengenal', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.03', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Penggajian/KGB/Tunjangan Jabatan/Daftar gaji', 'retensi_aktif' => 2, 'retensi_inaktif' => 8, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.04', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Pendaftaran/Keluarga/Perkawinan/Anak/Karis/Karsu', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.05', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Daftar Nominatif/Data Pegawai Honorer (kontrak)', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.06', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Penugasan/Penunjukan/Surat Perintah/Pemanggilan/PLH/Surat Pernyataan/Surat Keterangan/SPMT', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.07', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Penghargaan/Piala/Piagam/tanda Kehormatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.08', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Pendelegasian Wewenang', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01.09', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Sumpah Pegawai', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.10', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Daftar Kepangkatan/DUK', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.11', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Cuti', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01.12', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Pelaporan Nikah/Cerai/Rujuk/Izin Perkawinan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01.13', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Surat Kuasa', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.14', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Absensi', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.01.15', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Izin Kerja/izin Belajar/Izin Dispensasi', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.01.16', 'kode_klasifikasi_induk' => 'KP.01', 'uraian' => 'Uji Kesehatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.02', 'kode_klasifikasi_induk' => null, 'uraian' => 'PERENCANAAN PEGAWAI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.02.01', 'kode_klasifikasi_induk' => 'KP.02', 'uraian' => 'Analisis Jabatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.02.02', 'kode_klasifikasi_induk' => 'KP.02', 'uraian' => 'Formasi Pegawai', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.02.03', 'kode_klasifikasi_induk' => 'KP.02', 'uraian' => 'Peta Jabatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.03', 'kode_klasifikasi_induk' => null, 'uraian' => 'PENGADAAN PEGAWAI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.03.01', 'kode_klasifikasi_induk' => 'KP.03', 'uraian' => 'Seleksi Pegawai', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.03.02', 'kode_klasifikasi_induk' => 'KP.03', 'uraian' => 'Penempatan Pegawai', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.03.03', 'kode_klasifikasi_induk' => 'KP.03', 'uraian' => 'Pengangkatan dan Pengunduran Diri CPNS', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.03.04', 'kode_klasifikasi_induk' => 'KP.03', 'uraian' => 'Pengangkatan PNS', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.04', 'kode_klasifikasi_induk' => null, 'uraian' => 'MUTASI PEGAWAI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.04.01', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Pemindahan PNS/Non PNS Antar Unit', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.02', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Pemindahan PNS/Non PNS Antar Instansi', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.03', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Pemindahan PNS/Non PNS dengan Status Dipekerjakan/Diperbantukan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.04', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Kenaikan Pangkat Struktural dan Fungsional', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.05', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Mutasi Pendidikan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.06', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Pengangkatan, Pemindahan, dan Pemberhentian dalam Jabatan Struktural', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.07', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Pengangkatan, Pemindahan, Pemberhentian dan Pembebasan Sementara dalam Jabatan Fungsional', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.08', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Impasing/Penyesuaian Ijazah', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.04.09', 'kode_klasifikasi_induk' => 'KP.04', 'uraian' => 'Serah Terima Jabatan/Tugas', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.05', 'kode_klasifikasi_induk' => null, 'uraian' => 'PEMBINAAN KARIR PEGAWAI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.01', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Tata Usaha Kediklatan (Kurikulum, Modul, Dokumen Adminstrasi, Dokumen Akademik, Dokumen Evaluasi, Sertifikat/STTPL)', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.02', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Pembinaan Mental', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Musnah', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.03', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Diklat Prajabatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.04', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Diklat Pimpinan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.05', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Diklat Fungsional', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.05.06', 'kode_klasifikasi_induk' => 'KP.05', 'uraian' => 'Diklat Teknis', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.06', 'kode_klasifikasi_induk' => null, 'uraian' => 'PENILAIAN PEGAWAI', 'retensi_aktif' => 0, 'retensi_inaktif' => 0, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.06.01', 'kode_klasifikasi_induk' => 'KP.06', 'uraian' => 'Assesment Pegawai', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Biasa'],
            ['kode_klasifikasi' => 'KP.06.02', 'kode_klasifikasi_induk' => 'KP.06', 'uraian' => 'Ujian Dinas, Ujian Penyesuaian Ijazah', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.06.03', 'kode_klasifikasi_induk' => 'KP.06', 'uraian' => 'Teguran/Peringatan/Penundaan gaji dan Pangkat/Penurunan Pangkat', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
            ['kode_klasifikasi' => 'KP.06.04', 'kode_klasifikasi_induk' => 'KP.06', 'uraian' => 'Skorsing/Hukuman Jabatan', 'retensi_aktif' => 2, 'retensi_inaktif' => 3, 'status_akhir' => 'Permanen', 'klasifikasi_keamanan' => 'Terbatas'],
        ];

        foreach (array_chunk($data, 100) as $chunk) {
            KodeKlasifikasi::insert($chunk);
        }
    }
}
