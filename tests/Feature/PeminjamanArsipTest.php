<?php

use App\Models\ArsipUnit;
use App\Models\PeminjamanArsip;

beforeEach(function () {
    $this->masterData = createMasterData();
});

test('show peminjaman arsip includes borrowed archive and borrower unit details', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'indeks' => 'ARSIP-DETAIL-001',
        'uraian_informasi' => 'Uraian arsip untuk detail peminjaman',
        'tanggal' => '2026-06-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'status' => 'diterima',
    ]);

    $peminjaman = PeminjamanArsip::create([
        'arsip_unit_id' => $arsip->id_berkas,
        'unit_pengolah_id' => $master['unitPengolah']->id,
        'nama_peminjam' => 'Ahmad Dwi Putra',
        'jabatan_peminjam' => 'Kepala BGN',
        'tujuan_peminjaman' => 'Untuk contoh pembuatan surat lanjutan',
        'tanggal_pinjam' => '2026-06-03',
        'tanggal_harus_kembali' => '2026-06-24',
        'status' => 'dipinjam',
        'dicatat_oleh' => $admin->id,
    ]);

    $this->actingAs($admin)
        ->get("/peminjaman-arsip/{$peminjaman->id}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('peminjaman-arsip/show')
            ->where('peminjaman.arsip_unit.indeks', 'ARSIP-DETAIL-001')
            ->where('peminjaman.arsip_unit.uraian_informasi', 'Uraian arsip untuk detail peminjaman')
            ->where('peminjaman.arsip_unit.unit_pengolah.nama_unit', $master['unitPengolah']->nama_unit)
            ->where('peminjaman.unit_pengolah.nama_unit', $master['unitPengolah']->nama_unit)
        );
});
