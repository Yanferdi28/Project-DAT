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
        $kodeKlasifikasiMap = KodeKlasifikasi::whereNotNull('kode_klasifikasi_induk')
            ->get(['id', 'retensi_aktif', 'retensi_inaktif', 'status_akhir', 'kode_klasifikasi'])
            ->keyBy('id');
        $klasifikasiIds = $kodeKlasifikasiMap->keys()->values();

        $unitPengolahIds = UnitPengolah::pluck('id')->values();
        $berkasArsipIds = BerkasArsip::pluck('nomor_berkas')->values();
        $kategoriIds = Kategori::pluck('id')->values();
        $subKategoriByKategori = SubKategori::select('id', 'kategori_id')
            ->get()
            ->groupBy('kategori_id')
            ->map(fn ($items) => $items->pluck('id')->values());
        $userIds = User::pluck('id')->values();

        if ($klasifikasiIds->isEmpty() || $unitPengolahIds->isEmpty() || $kategoriIds->isEmpty()) {
            return;
        }

        // Gunakan nilai yang valid dengan form/controller (agar cocok dengan filter laporan dan UI).
        $tingkatPerkembangan = ['asli', 'salinan', 'tembusan', 'pertinggal'];
        $jumlahSatuan = ['lembar', 'jilid', 'bundle'];
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
            // Pastikan sebaran status & publish_status muncul di semua laporan.
            $status = match ($index % 10) {
                0, 1, 2 => 'pending',
                3, 4, 5, 6 => 'diterima',
                default => 'ditolak',
            };

            $publishStatus = ($index % 3 === 0) ? 'draft' : 'published';

            $kodeKlasifikasiId = $klasifikasiIds[$index % $klasifikasiIds->count()];
            $kodeKlasifikasi = $kodeKlasifikasiMap[$kodeKlasifikasiId];
            $unitPengolahId = $unitPengolahIds[$index % $unitPengolahIds->count()];

            // Pastikan setiap berkas punya minimal 1 item arsip (untuk laporan berkas/detail).
            // Setelah itu, sisipkan beberapa arsip unit tanpa berkas (untuk laporan penyusutan - arsip unit).
            $berkasArsipId = null;
            if (!$berkasArsipIds->isEmpty()) {
                if ($index < $berkasArsipIds->count()) {
                    $berkasArsipId = $berkasArsipIds[$index];
                } else {
                    $berkasArsipId = ($index % 3 === 0) ? null : $berkasArsipIds[$index % $berkasArsipIds->count()];
                }
            }

            // Variasi tahun untuk kebutuhan laporan penyusutan dan filter periode.
            $tanggal = $berkasArsipId === null
                ? Carbon::create(2014 + ($index % 5), ($index % 12) + 1, min(($index % 28) + 1, 28))
                : Carbon::create(2019 + ($index % 7), ($index % 12) + 1, min(($index % 28) + 1, 28));

            $createdAt = $tanggal->copy()->addDays(($index % 20) + 1)->setTime(9, 0);

            $verifiedBy = null;
            $verifiedAt = null;
            $submittedAt = null;
            $verifikasiOleh = null;
            $verifikasiTanggal = null;
            $verifikasiKeterangan = null;
            $verificationNotes = null;

            if ($status !== 'pending') {
                $verifierId = $userIds->isEmpty() ? null : $userIds[$index % $userIds->count()];
                $verifiedBy = $verifierId;
                $verifikasiOleh = $verifierId;
                $verifiedAt = $createdAt->copy()->addDays(2)->setTime(10, 15);
                $verifikasiTanggal = $verifiedAt;

                if ($status === 'diterima') {
                    $verifikasiKeterangan = 'Arsip telah diverifikasi dan diterima.';
                    $verificationNotes = 'Data lengkap. Diterima untuk proses penyimpanan.';
                } else {
                    $verifikasiKeterangan = 'Arsip ditolak karena data tidak lengkap.';
                    $verificationNotes = 'Mohon lengkapi metadata/unggah dokumen pendukung.';
                }
            }

            if ($publishStatus === 'published') {
                $submittedAt = $createdAt->copy()->subDays(1)->setTime(16, 0);
            }

            $kategoriId = $kategoriIds[$index % $kategoriIds->count()];
            $subKategoriCandidates = $subKategoriByKategori->get($kategoriId);
            $subKategoriId = $subKategoriCandidates && $subKategoriCandidates->isNotEmpty()
                ? $subKategoriCandidates[$index % $subKategoriCandidates->count()]
                : null;

            $arsipUnit = ArsipUnit::create([
                'kode_klasifikasi_id' => $kodeKlasifikasiId,
                'unit_pengolah_arsip_id' => $unitPengolahId,
                'berkas_arsip_id' => $berkasArsipId,
                'kategori_id' => $kategoriId,
                'sub_kategori_id' => $subKategoriId,
                'publish_status' => $publishStatus,
                'verified_by' => $verifiedBy,
                'verified_at' => $verifiedAt,
                'verification_notes' => $verificationNotes,
                'submitted_at' => $submittedAt,
                'verifikasi_oleh' => $verifikasiOleh,
                'verifikasi_tanggal' => $verifikasiTanggal,
                'retensi_aktif' => $kodeKlasifikasi->retensi_aktif,
                'retensi_inaktif' => $kodeKlasifikasi->retensi_inaktif,
                'indeks' => $arsip['indeks'],
                'no_item_arsip' => $arsip['no_item_arsip'],
                'uraian_informasi' => $arsip['uraian_informasi'],
                'tanggal' => $tanggal,
                'jumlah_nilai' => ($index % 25) + 1,
                'jumlah_satuan' => $jumlahSatuan[$index % count($jumlahSatuan)],
                'tingkat_perkembangan' => $tingkatPerkembangan[$index % count($tingkatPerkembangan)],
                'skkaad' => $kodeKlasifikasi->status_akhir,
                'ruangan' => $ruanganList[$index % count($ruanganList)],
                'no_filling' => 'R' . str_pad((string)(($index % 20) + 1), 2, '0', STR_PAD_LEFT),
                'no_laci' => 'L' . str_pad((string)(($index % 10) + 1), 2, '0', STR_PAD_LEFT),
                'no_folder' => 'FD' . str_pad((string)(($index % 50) + 1), 3, '0', STR_PAD_LEFT),
                'no_box' => 'BX' . str_pad((string)(($index % 200) + 1), 4, '0', STR_PAD_LEFT),
                'dokumen' => null,
                'keterangan' => $arsip['keterangan'],
                'status' => $status,
                'verifikasi_keterangan' => $verifikasiKeterangan,
            ]);

            // Set created_at agar laporan filter periode dan rekap per unit pengolah punya variasi.
            $arsipUnit->forceFill([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ])->saveQuietly();
        }
    }
}
