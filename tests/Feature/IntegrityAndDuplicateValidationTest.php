<?php

use App\Models\ActivityLog;
use App\Models\ArsipUnit;
use App\Models\BeritaAcaraPenyerahan;
use App\Models\BerkasArsip;
use App\Models\Kategori;
use App\Models\KodeKlasifikasi;
use App\Models\PeminjamanArsip;
use App\Models\SubKategori;
use App\Models\UnitPengolah;
use App\Models\User;

beforeEach(function () {
    $this->masterData = createMasterData();
});

// ─── MASTER DATA DUPLICATE PREVENTION ──────────────────────────────────────────

test('store unit pengolah rejects duplicate nama_unit', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/unit-pengolah', [
            'nama_unit' => 'Unit Test', // Already created in beforeEach
        ])
        ->assertSessionHasErrors(['nama_unit']);
});

test('store kategori rejects duplicate nama_kategori', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/kategori', [
            'nama_kategori' => 'Test Kategori', // Already created in beforeEach
        ])
        ->assertSessionHasErrors(['nama_kategori']);
});

test('store sub kategori rejects duplicate nama_sub_kategori in same kategori', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/sub-kategori', [
            'kategori_id' => $this->masterData['kategori']->id,
            'nama_sub_kategori' => 'Test Sub Kategori', // Already created in beforeEach
        ])
        ->assertSessionHasErrors(['nama_sub_kategori']);
});

test('store sub kategori allows same nama_sub_kategori in different kategori', function () {
    $admin = createAdmin();
    $kategori2 = Kategori::create(['nama_kategori' => 'Kategori Lain']);

    $this->actingAs($admin)
        ->post('/sub-kategori', [
            'kategori_id' => $kategori2->id,
            'nama_sub_kategori' => 'Test Sub Kategori', // Same name, different kategori
        ])
        ->assertRedirect('/sub-kategori')
        ->assertSessionHasNoErrors();
});

// ─── BERKAS ARSIP DUPLICATE PREVENTION ────────────────────────────────────────

test('store berkas arsip rejects duplicate nama_berkas in same klasifikasi and unit pengolah', function () {
    $admin = createAdmin();

    BerkasArsip::create([
        'nama_berkas' => 'Berkas Unik 2026',
        'klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $this->masterData['unitPengolah']->id,
    ]);

    $this->actingAs($admin)
        ->post('/berkas-arsip', [
            'nama_berkas' => 'Berkas Unik 2026',
            'klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
            'unit_pengolah_id' => $this->masterData['unitPengolah']->id,
        ])
        ->assertSessionHasErrors(['nama_berkas']);
});

// ─── ARSIP UNIT INTEGRITY & DUPLICATE PREVENTION ──────────────────────────────

test('store arsip unit rejects sub_kategori that does not belong to kategori', function () {
    $admin = createAdmin();
    $kategori2 = Kategori::create(['nama_kategori' => 'Kategori Bebas']);
    $subKategori2 = SubKategori::create([
        'kategori_id' => $kategori2->id,
        'nama_sub_kategori' => 'Sub Bebas',
    ]);

    $this->actingAs($admin)
        ->post('/arsip-unit', [
            'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
            'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
            'kategori_id' => $this->masterData['kategori']->id,
            'sub_kategori_id' => $subKategori2->id, // Mismatched sub_kategori!
            'uraian_informasi' => 'Test mismatch',
            'tanggal' => '2026-08-01',
            'jumlah_nilai' => 1,
            'jumlah_satuan' => 'lembar',
            'tingkat_perkembangan' => 'asli',
        ])
        ->assertSessionHasErrors(['sub_kategori_id']);
});

test('store arsip unit rejects duplicate no_item_arsip in same unit pengolah', function () {
    $admin = createAdmin();

    ArsipUnit::create([
        'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
        'kategori_id' => $this->masterData['kategori']->id,
        'sub_kategori_id' => $this->masterData['subKategori']->id,
        'no_item_arsip' => 'ITEM-001',
        'uraian_informasi' => 'Arsip Pertama',
        'tanggal' => '2026-08-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'status' => 'diterima',
    ]);

    $this->actingAs($admin)
        ->post('/arsip-unit', [
            'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
            'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
            'kategori_id' => $this->masterData['kategori']->id,
            'sub_kategori_id' => $this->masterData['subKategori']->id,
            'no_item_arsip' => 'ITEM-001', // Duplicate item number in same unit
            'uraian_informasi' => 'Arsip Kedua',
            'tanggal' => '2026-08-02',
            'jumlah_nilai' => 1,
            'jumlah_satuan' => 'lembar',
            'tingkat_perkembangan' => 'asli',
        ])
        ->assertSessionHasErrors(['no_item_arsip']);
});

// ─── PEMINJAMAN ARSIP DOUBLE-BORROWING PREVENTION ────────────────────────────

test('peminjaman rejects borrowing archive that is currently borrowed', function () {
    $admin = createAdmin();

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
        'kategori_id' => $this->masterData['kategori']->id,
        'sub_kategori_id' => $this->masterData['subKategori']->id,
        'uraian_informasi' => 'Arsip Dipinjam',
        'tanggal' => '2026-08-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'status' => 'diterima',
    ]);

    // First loan
    PeminjamanArsip::create([
        'arsip_unit_id' => $arsip->id_berkas,
        'nama_peminjam' => 'Peminjam 1',
        'tujuan_peminjaman' => 'Keperluan Audit',
        'tanggal_pinjam' => '2026-08-10',
        'tanggal_harus_kembali' => '2026-08-20',
        'status' => 'dipinjam',
        'dicatat_oleh' => $admin->id,
    ]);

    // Second loan attempt on the same archive
    $this->actingAs($admin)
        ->post('/peminjaman-arsip', [
            'arsip_unit_id' => $arsip->id_berkas,
            'nama_peminjam' => 'Peminjam 2',
            'tujuan_peminjaman' => 'Keperluan Rapat',
            'tanggal_pinjam' => '2026-08-15',
            'tanggal_harus_kembali' => '2026-08-25',
        ])
        ->assertSessionHasErrors(['arsip_unit_id']);
});

// ─── BERITA ACARA DUPLICATE PREVENTION ───────────────────────────────────────

test('berita acara rejects duplicate arsip_ids in single submission', function () {
    $admin = createAdmin();

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
        'kategori_id' => $this->masterData['kategori']->id,
        'sub_kategori_id' => $this->masterData['subKategori']->id,
        'uraian_informasi' => 'Arsip Penyerahan',
        'tanggal' => '2026-08-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'status' => 'diterima',
    ]);

    $this->actingAs($admin)
        ->post('/laporan/berita-acara-penyerahan', [
            'unit_pengolah_asal_id' => $this->masterData['unitPengolah']->id,
            'tanggal_penyerahan' => '2026-08-20',
            'arsip_ids' => [$arsip->id_berkas, $arsip->id_berkas], // Duplicate!
        ])
        ->assertSessionHasErrors(['arsip_ids.0']);
});

// ─── TWO-WAY MODEL RELATIONSHIPS VERIFICATION ────────────────────────────────

test('all models have working two-way relationships', function () {
    $admin = createAdmin(['unit_pengolah_id' => $this->masterData['unitPengolah']->id]);

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Berkas Relasi',
        'klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $this->masterData['unitPengolah']->id,
    ]);

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $this->masterData['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $this->masterData['unitPengolah']->id,
        'berkas_arsip_id' => $berkas->nomor_berkas,
        'kategori_id' => $this->masterData['kategori']->id,
        'sub_kategori_id' => $this->masterData['subKategori']->id,
        'uraian_informasi' => 'Arsip Relasi',
        'tanggal' => '2026-08-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'status' => 'diterima',
        'verified_by' => $admin->id,
        'verifikasi_oleh' => $admin->id,
    ]);

    $peminjaman = PeminjamanArsip::create([
        'arsip_unit_id' => $arsip->id_berkas,
        'peminjam_id' => $admin->id,
        'unit_pengolah_id' => $this->masterData['unitPengolah']->id,
        'nama_peminjam' => $admin->name,
        'tujuan_peminjaman' => 'Pemeriksaan',
        'tanggal_pinjam' => '2026-08-01',
        'tanggal_harus_kembali' => '2026-08-10',
        'status' => 'dipinjam',
        'dicatat_oleh' => $admin->id,
    ]);

    $ba = BeritaAcaraPenyerahan::create([
        'nomor_berita_acara' => 'BA-TEST-001',
        'tanggal_penyerahan' => '2026-08-01',
        'unit_pengolah_asal_id' => $this->masterData['unitPengolah']->id,
        'dibuat_oleh' => $admin->id,
    ]);
    $ba->arsipUnits()->attach([$arsip->id_berkas]);

    // 1. UnitPengolah relations
    expect($this->masterData['unitPengolah']->users)->toHaveCount(1)
        ->and($this->masterData['unitPengolah']->berkasArsip)->toHaveCount(1)
        ->and($this->masterData['unitPengolah']->arsipUnits)->toHaveCount(1)
        ->and($this->masterData['unitPengolah']->peminjaman)->toHaveCount(1)
        ->and($this->masterData['unitPengolah']->beritaAcaraAsal)->toHaveCount(1);

    // 2. KodeKlasifikasi relations
    expect($this->masterData['kodeKlasifikasi']->berkasArsip)->toHaveCount(1)
        ->and($this->masterData['kodeKlasifikasi']->arsipUnits)->toHaveCount(1);

    // 3. Kategori & SubKategori relations
    expect($this->masterData['kategori']->arsipUnits)->toHaveCount(1)
        ->and($this->masterData['subKategori']->arsipUnits)->toHaveCount(1);

    // 4. User relations
    expect($admin->arsipVerified)->toHaveCount(1)
        ->and($admin->arsipVerifikasiOleh)->toHaveCount(1)
        ->and($admin->peminjamanDicatat)->toHaveCount(1)
        ->and($admin->peminjamanUser)->toHaveCount(1)
        ->and($admin->beritaAcaraDibuat)->toHaveCount(1);

    // 5. ArsipUnit relations
    expect($arsip->peminjaman)->toHaveCount(1)
        ->and($arsip->beritaAcara)->toHaveCount(1);
});
