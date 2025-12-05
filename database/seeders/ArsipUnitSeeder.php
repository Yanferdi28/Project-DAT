<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ArsipUnit;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use App\Models\BerkasArsip;
use App\Models\Kategori;
use App\Models\SubKategori;
use App\Models\User;
use Carbon\Carbon;

class ArsipUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $klasifikasiIds = KodeKlasifikasi::whereNotNull('kode_klasifikasi_induk')->pluck('id')->toArray();
        $unitPengolahIds = UnitPengolah::pluck('id')->toArray();
        $berkasArsipIds = BerkasArsip::pluck('nomor_berkas')->toArray();
        $kategoriIds = Kategori::pluck('id')->toArray();
        $subKategoriIds = SubKategori::pluck('id')->toArray();
        $userIds = User::pluck('id')->toArray();

        $tingkatPerkembangan = ['Asli', 'Salinan', 'Fotokopi', 'Pertinggal'];
        $jumlahSatuan = ['Lembar', 'Berkas', 'Bendel', 'Buku', 'Map'];
        $statusList = ['pending', 'diterima', 'ditolak'];
        $publishStatusList = ['draft', 'submitted', 'verified', 'published'];
        $ruanganList = ['Ruang Arsip A', 'Ruang Arsip B', 'Ruang Arsip C', 'Gudang Arsip'];

        $arsipData = [
            [
                'indeks' => 'Perencanaan Program',
                'no_item_arsip' => 'PR/2024/001',
                'uraian_informasi' => 'Dokumen Rencana Kerja dan Anggaran Kementerian/Lembaga (RKA-KL) tahun 2024',
                'keterangan' => 'Dokumen lengkap dengan lampiran',
            ],
            [
                'indeks' => 'Laporan Keuangan',
                'no_item_arsip' => 'KU/2024/001',
                'uraian_informasi' => 'Laporan Realisasi Anggaran (LRA) Triwulan I Tahun 2024',
                'keterangan' => 'Sudah diaudit internal',
            ],
            [
                'indeks' => 'Surat Masuk',
                'no_item_arsip' => 'UM/2024/001',
                'uraian_informasi' => 'Surat undangan rapat koordinasi dari Kemenkominfo',
                'keterangan' => 'Prioritas tinggi',
            ],
            [
                'indeks' => 'Kepegawaian',
                'no_item_arsip' => 'KP/2024/001',
                'uraian_informasi' => 'SK Mutasi Pegawai dari Unit TMB ke Unit Siaran',
                'keterangan' => 'Efektif mulai 1 Februari 2024',
            ],
            [
                'indeks' => 'Pengadaan',
                'no_item_arsip' => 'PBJ/2024/001',
                'uraian_informasi' => 'Dokumen Kontrak Pengadaan Peralatan Studio',
                'keterangan' => 'Nilai kontrak di atas 200 juta',
            ],
            [
                'indeks' => 'Siaran',
                'no_item_arsip' => 'SI/2024/001',
                'uraian_informasi' => 'Laporan Monitoring Siaran Harian Januari 2024',
                'keterangan' => 'Format digital dan cetak',
            ],
            [
                'indeks' => 'Perjanjian Kerjasama',
                'no_item_arsip' => 'MOU/2024/001',
                'uraian_informasi' => 'MOU Kerjasama dengan Pemerintah Daerah Provinsi Jawa Barat',
                'keterangan' => 'Masa berlaku 3 tahun',
            ],
            [
                'indeks' => 'Inventaris',
                'no_item_arsip' => 'BMN/2024/001',
                'uraian_informasi' => 'Berita Acara Serah Terima Barang Inventaris Kantor',
                'keterangan' => 'Peralatan IT baru',
            ],
            [
                'indeks' => 'Pelatihan',
                'no_item_arsip' => 'DIK/2024/001',
                'uraian_informasi' => 'Laporan Penyelenggaraan Diklat Jurnalistik Radio',
                'keterangan' => 'Peserta 25 orang',
            ],
            [
                'indeks' => 'Notulen Rapat',
                'no_item_arsip' => 'NOT/2024/001',
                'uraian_informasi' => 'Notulen Rapat Pimpinan tanggal 15 Januari 2024',
                'keterangan' => 'Agenda: Evaluasi Kinerja Q4 2023',
            ],
            [
                'indeks' => 'LHKPN',
                'no_item_arsip' => 'LHKPN/2024/001',
                'uraian_informasi' => 'Laporan Harta Kekayaan Penyelenggara Negara Tahun 2023',
                'keterangan' => 'Dokumen rahasia',
            ],
            [
                'indeks' => 'Pemeliharaan',
                'no_item_arsip' => 'PM/2024/001',
                'uraian_informasi' => 'Laporan Pemeliharaan Pemancar FM Bulanan',
                'keterangan' => 'Termasuk checklist preventive maintenance',
            ],
            [
                'indeks' => 'Surat Keluar',
                'no_item_arsip' => 'SK/2024/001',
                'uraian_informasi' => 'Surat Permohonan Narasumber ke Kemendikbud',
                'keterangan' => 'Untuk acara dialog pendidikan',
            ],
            [
                'indeks' => 'Evaluasi Kinerja',
                'no_item_arsip' => 'EK/2024/001',
                'uraian_informasi' => 'Dokumen Penilaian Kinerja Pegawai (SKP) Semester I 2024',
                'keterangan' => 'Seluruh pegawai unit',
            ],
            [
                'indeks' => 'Peraturan',
                'no_item_arsip' => 'PER/2024/001',
                'uraian_informasi' => 'Peraturan Direktur tentang Tata Tertib Pegawai',
                'keterangan' => 'Revisi peraturan tahun 2020',
            ],
            [
                'indeks' => 'Anggaran',
                'no_item_arsip' => 'ANG/2024/002',
                'uraian_informasi' => 'Dokumen Revisi DIPA Tahun 2024',
                'keterangan' => 'Revisi kedua',
            ],
            [
                'indeks' => 'Berita Acara',
                'no_item_arsip' => 'BA/2024/001',
                'uraian_informasi' => 'Berita Acara Penyerahan Arsip Inaktif ke Unit Kearsipan',
                'keterangan' => 'Jumlah 50 boks arsip',
            ],
            [
                'indeks' => 'Gratifikasi',
                'no_item_arsip' => 'GR/2024/001',
                'uraian_informasi' => 'Laporan Penolakan Gratifikasi dari Vendor',
                'keterangan' => 'Sesuai ketentuan KPK',
            ],
            [
                'indeks' => 'Absensi',
                'no_item_arsip' => 'ABS/2024/001',
                'uraian_informasi' => 'Rekap Absensi Pegawai Bulan Januari 2024',
                'keterangan' => 'Data dari sistem fingerprint',
            ],
            [
                'indeks' => 'Cuti',
                'no_item_arsip' => 'CT/2024/001',
                'uraian_informasi' => 'Permohonan dan Persetujuan Cuti Tahunan Pegawai',
                'keterangan' => 'Periode Februari 2024',
            ],
        ];

        foreach ($arsipData as $index => $arsip) {
            $status = $statusList[array_rand($statusList)];
            $publishStatus = $publishStatusList[array_rand($publishStatusList)];
            $tanggal = Carbon::now()->subDays(rand(1, 365));

            $verifiedBy = null;
            $verifiedAt = null;
            $submittedAt = null;
            $verifikasiOleh = null;
            $verifikasiTanggal = null;
            $verifikasiKeterangan = null;

            if ($status === 'diterima') {
                $verifiedBy = !empty($userIds) ? $userIds[array_rand($userIds)] : null;
                $verifiedAt = Carbon::now()->subDays(rand(1, 30));
                $verifikasiOleh = $verifiedBy;
                $verifikasiTanggal = $verifiedAt;
                $verifikasiKeterangan = 'Arsip telah diverifikasi dan diterima';
            } elseif ($status === 'ditolak') {
                $verifiedBy = !empty($userIds) ? $userIds[array_rand($userIds)] : null;
                $verifiedAt = Carbon::now()->subDays(rand(1, 30));
                $verifikasiOleh = $verifiedBy;
                $verifikasiTanggal = $verifiedAt;
                $verifikasiKeterangan = 'Arsip ditolak karena data tidak lengkap';
            }

            if (in_array($publishStatus, ['submitted', 'verified', 'published'])) {
                $submittedAt = Carbon::now()->subDays(rand(31, 60));
            }

            ArsipUnit::create([
                'kode_klasifikasi_id' => !empty($klasifikasiIds) ? $klasifikasiIds[array_rand($klasifikasiIds)] : null,
                'unit_pengolah_arsip_id' => !empty($unitPengolahIds) ? $unitPengolahIds[array_rand($unitPengolahIds)] : null,
                'berkas_arsip_id' => !empty($berkasArsipIds) ? $berkasArsipIds[array_rand($berkasArsipIds)] : null,
                'kategori_id' => !empty($kategoriIds) ? $kategoriIds[array_rand($kategoriIds)] : null,
                'sub_kategori_id' => !empty($subKategoriIds) ? $subKategoriIds[array_rand($subKategoriIds)] : null,
                'publish_status' => $publishStatus,
                'verified_by' => $verifiedBy,
                'verified_at' => $verifiedAt,
                'submitted_at' => $submittedAt,
                'verifikasi_oleh' => $verifikasiOleh,
                'verifikasi_tanggal' => $verifikasiTanggal,
                'retensi_aktif' => rand(1, 5),
                'retensi_inaktif' => rand(3, 10),
                'indeks' => $arsip['indeks'],
                'no_item_arsip' => $arsip['no_item_arsip'],
                'uraian_informasi' => $arsip['uraian_informasi'],
                'tanggal' => $tanggal,
                'jumlah_nilai' => rand(1, 50),
                'jumlah_satuan' => $jumlahSatuan[array_rand($jumlahSatuan)],
                'tingkat_perkembangan' => $tingkatPerkembangan[array_rand($tingkatPerkembangan)],
                'skkaad' => 'SKKAAD-' . str_pad($index + 1, 4, '0', STR_PAD_LEFT),
                'ruangan' => $ruanganList[array_rand($ruanganList)],
                'no_filling' => 'F-' . str_pad(rand(1, 100), 3, '0', STR_PAD_LEFT),
                'no_laci' => 'L-' . str_pad(rand(1, 20), 2, '0', STR_PAD_LEFT),
                'no_folder' => 'FD-' . str_pad(rand(1, 50), 3, '0', STR_PAD_LEFT),
                'no_box' => 'BX-' . str_pad(rand(1, 200), 4, '0', STR_PAD_LEFT),
                'dokumen' => null,
                'keterangan' => $arsip['keterangan'],
                'status' => $status,
                'verifikasi_keterangan' => $verifikasiKeterangan,
            ]);
        }
    }
}
