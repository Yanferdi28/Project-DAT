<?php

namespace Database\Seeders;

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\Kategori;
use App\Models\KodeKlasifikasi;
use App\Models\SubKategori;
use App\Models\UnitPengolah;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArsipUnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $samples = [
            [
                'kode' => 'KP.01.06',
                'unit' => 'TATA USAHA SDM',
                'kategori' => 'Berkala',
                'sub_kategori' => 'Dokumen Surat Menyurat',
                'indeks' => 'Pelaksanaan Apel Kedisiplinan Pegawai',
                'no_item_arsip' => 'KP-001',
                'uraian_informasi' => 'Nota dinas pelaksanaan apel kedisiplinan pegawai.',
                'tanggal' => '2026-05-11',
                'jumlah_nilai' => 1,
                'jumlah_satuan' => 'lembar',
                'tingkat_perkembangan' => 'asli',
                'ruangan' => 'Ruang Arsip',
                'no_filling' => 'F-SDM-01',
                'no_laci' => 'L-01',
                'no_folder' => 'SDM-001',
                'no_box' => 'BOX-SDM-001',
                'keterangan' => 'Contoh arsip unit hasil seed.',
            ],
            [
                'kode' => 'UM.01.01',
                'unit' => 'TATA USAHA UMUM',
                'kategori' => 'Setiap Saat',
                'sub_kategori' => 'Dokumen Surat Menyurat',
                'indeks' => 'Nota Dinas Administrasi Persuratan',
                'no_item_arsip' => 'UM-001',
                'uraian_informasi' => 'Nota dinas terkait administrasi persuratan dan tindak lanjut surat.',
                'tanggal' => '2026-06-03',
                'jumlah_nilai' => 2,
                'jumlah_satuan' => 'lembar',
                'tingkat_perkembangan' => 'salinan',
                'ruangan' => 'Ruang Arsip',
                'no_filling' => 'F-TU-01',
                'no_laci' => 'L-02',
                'no_folder' => 'TU-001',
                'no_box' => 'BOX-TU-001',
                'keterangan' => 'Contoh arsip administrasi umum.',
            ],
            [
                'kode' => 'PR.02.01',
                'unit' => 'TATA USAHA KEUANGAN',
                'kategori' => 'Berkala',
                'sub_kategori' => 'Laporan Keuangan Audited',
                'indeks' => 'Laporan Anggaran dan Kinerja Bulanan',
                'no_item_arsip' => 'PR-001',
                'uraian_informasi' => 'Laporan pelaksanaan anggaran dan kinerja bulanan unit kerja.',
                'tanggal' => '2026-06-10',
                'jumlah_nilai' => 1,
                'jumlah_satuan' => 'bundle',
                'tingkat_perkembangan' => 'asli',
                'ruangan' => 'Ruang Arsip',
                'no_filling' => 'F-KEU-01',
                'no_laci' => 'L-03',
                'no_folder' => 'KEU-001',
                'no_box' => 'BOX-KEU-001',
                'keterangan' => 'Contoh arsip pelaporan anggaran.',
            ],
        ];

        $verifiedBy = User::where('role', 'admin')->value('id');

        foreach ($samples as $sample) {
            $kodeKlasifikasi = $this->kodeKlasifikasi($sample['kode']);

            if (!$kodeKlasifikasi) {
                continue;
            }

            $unitId = $this->unitId($sample['unit']);
            $kategori = $this->kategori($sample['kategori']);
            $subKategori = $this->subKategori($kategori, $sample['sub_kategori']);

            ArsipUnit::updateOrCreate(
                [
                    'indeks' => $sample['indeks'],
                    'tanggal' => $sample['tanggal'],
                ],
                [
                    'kode_klasifikasi_id' => $kodeKlasifikasi->id,
                    'unit_pengolah_arsip_id' => $unitId,
                    'berkas_arsip_id' => $this->berkasArsipId($kodeKlasifikasi->id, $unitId),
                    'kategori_id' => $kategori?->id,
                    'sub_kategori_id' => $subKategori?->id,
                    'publish_status' => 'published',
                    'verified_by' => $verifiedBy,
                    'verified_at' => now(),
                    'submitted_at' => now(),
                    'retensi_aktif' => $kodeKlasifikasi->retensi_aktif,
                    'retensi_inaktif' => $kodeKlasifikasi->retensi_inaktif,
                    'no_item_arsip' => $sample['no_item_arsip'],
                    'uraian_informasi' => $sample['uraian_informasi'],
                    'jumlah_nilai' => $sample['jumlah_nilai'],
                    'jumlah_satuan' => $sample['jumlah_satuan'],
                    'tingkat_perkembangan' => $sample['tingkat_perkembangan'],
                    'klasifikasi_keamanan' => $kodeKlasifikasi->klasifikasi_keamanan,
                    'ruangan' => $sample['ruangan'],
                    'no_filling' => $sample['no_filling'],
                    'no_laci' => $sample['no_laci'],
                    'no_folder' => $sample['no_folder'],
                    'no_box' => $sample['no_box'],
                    'keterangan' => $sample['keterangan'],
                    'status' => 'diterima',
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

    private function kategori(string $nama): ?Kategori
    {
        return Kategori::where('nama_kategori', $nama)->first()
            ?? Kategori::query()->first();
    }

    private function subKategori(?Kategori $kategori, string $nama): ?SubKategori
    {
        if (!$kategori) {
            return SubKategori::query()->first();
        }

        return SubKategori::where('kategori_id', $kategori->id)
            ->where('nama_sub_kategori', $nama)
            ->first()
            ?? SubKategori::where('kategori_id', $kategori->id)->first()
            ?? SubKategori::query()->first();
    }

    private function berkasArsipId(int $kodeKlasifikasiId, ?int $unitId): ?int
    {
        return BerkasArsip::where('klasifikasi_id', $kodeKlasifikasiId)
            ->when($unitId, fn ($query) => $query->where('unit_pengolah_id', $unitId))
            ->value('nomor_berkas');
    }
}
