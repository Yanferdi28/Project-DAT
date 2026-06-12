<?php

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;

beforeEach(function () {
    $this->masterData = createMasterData();
});

// ─── INDEX ────────────────────────────────────────────────

test('guests cannot access berkas arsip index', function () {
    $this->get('/berkas-arsip')->assertRedirect('/login');
});

test('admin can view berkas arsip index', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/berkas-arsip')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('berkas-arsip/index'));
});

test('operator can view berkas arsip index', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/berkas-arsip')
        ->assertOk();
});

test('berkas arsip index supports search', function () {
    $admin = createAdmin();
    $master = $this->masterData;
    $kodeSdm = \App\Models\KodeKlasifikasi::create([
        'kode_klasifikasi' => 'KP.04.04',
        'uraian' => 'Kenaikan Pangkat Struktural dan Fungsional',
        'retensi_aktif' => 2,
        'retensi_inaktif' => 3,
        'status_akhir' => 'Musnah',
        'klasifikasi_keamanan' => 'Biasa',
    ]);

    BerkasArsip::create([
        'nama_berkas' => 'Berkas Keuangan 2025',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    BerkasArsip::create([
        'nama_berkas' => 'Berkas SDM',
        'klasifikasi_id' => $kodeSdm->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $this->actingAs($admin)
        ->get('/berkas-arsip?search=Keuangan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('berkasArsips.data', 1));

    $this->actingAs($admin)
        ->get('/berkas-arsip?search=KP.04.04')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('berkasArsips.data', 1)
            ->where('berkasArsips.data.0.nama_berkas', 'Berkas SDM'));

    $this->actingAs($admin)
        ->get('/berkas-arsip?search=Pangkat Struktural')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('berkasArsips.data', 1)
            ->where('berkasArsips.data.0.nama_berkas', 'Berkas SDM'));
});

// ─── CREATE ───────────────────────────────────────────────

test('admin can access berkas arsip create form', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/berkas-arsip/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('berkas-arsip/create'));
});

test('operator cannot access berkas arsip create form', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/berkas-arsip/create')
        ->assertForbidden();
});

test('user can access berkas arsip create form', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get('/berkas-arsip/create')
        ->assertOk();
});

// ─── STORE ────────────────────────────────────────────────

test('admin can create berkas arsip', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $this->actingAs($admin)
        ->post('/berkas-arsip', [
            'nama_berkas' => 'Berkas Baru Test',
            'klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'unit_pengolah_id' => $master['unitPengolah']->id,
            'retensi_aktif' => 2,
            'retensi_inaktif' => 5,
            'lokasi_fisik' => 'Rak A-01',
            'uraian' => 'Uraian berkas test',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('berkas_arsip', [
        'nama_berkas' => 'Berkas Baru Test',
        'lokasi_fisik' => 'Rak A-01',
    ]);
});

test('operator cannot create berkas arsip', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $this->actingAs($operator)
        ->post('/berkas-arsip', [
            'nama_berkas' => 'Test',
            'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        ])
        ->assertForbidden();
});

test('store berkas arsip requires validation', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/berkas-arsip', [])
        ->assertSessionHasErrors(['nama_berkas', 'klasifikasi_id']);
});

test('store berkas arsip with create_another redirects to create', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $this->actingAs($admin)
        ->post('/berkas-arsip', [
            'nama_berkas' => 'Berkas Another',
            'klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'create_another' => true,
        ])
        ->assertRedirect(route('berkas-arsip.create'));
});

// ─── SHOW ─────────────────────────────────────────────────

test('admin can view berkas arsip detail', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Detail Test',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $this->actingAs($admin)
        ->get("/berkas-arsip/{$berkas->nomor_berkas}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('berkas-arsip/show'));
});

// ─── UPDATE ───────────────────────────────────────────────

test('admin can update berkas arsip', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Original',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $this->actingAs($admin)
        ->put("/berkas-arsip/{$berkas->nomor_berkas}", [
            'nama_berkas' => 'Updated Berkas',
            'klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'unit_pengolah_id' => $master['unitPengolah']->id,
            'lokasi_fisik' => 'Rak B-02',
        ])
        ->assertRedirect();

    $berkas->refresh();
    expect($berkas->nama_berkas)->toBe('Updated Berkas');
    expect($berkas->lokasi_fisik)->toBe('Rak B-02');
});

test('operator cannot update berkas arsip', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Test',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
    ]);

    $this->actingAs($operator)
        ->put("/berkas-arsip/{$berkas->nomor_berkas}", [
            'nama_berkas' => 'Hacked',
            'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        ])
        ->assertForbidden();
});

// ─── DELETE ───────────────────────────────────────────────

test('admin can delete berkas arsip without arsip units', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'To Delete',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
    ]);

    $this->actingAs($admin)
        ->delete("/berkas-arsip/{$berkas->nomor_berkas}")
        ->assertRedirect();

    $this->assertSoftDeleted('berkas_arsip', ['nomor_berkas' => $berkas->nomor_berkas]);
});

test('cannot delete berkas arsip that has arsip units', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Has Children',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'berkas_arsip_id' => $berkas->nomor_berkas,
        'uraian_informasi' => 'Child arsip',
        'tanggal' => '2025-01-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->delete("/berkas-arsip/{$berkas->nomor_berkas}")
        ->assertRedirect();

    // Berkas should still exist because it has arsip units
    $this->assertDatabaseHas('berkas_arsip', ['nomor_berkas' => $berkas->nomor_berkas]);
});

test('operator cannot delete berkas arsip', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Test',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
    ]);

    $this->actingAs($operator)
        ->delete("/berkas-arsip/{$berkas->nomor_berkas}")
        ->assertForbidden();
});

// ─── ADD/REMOVE ARSIP UNIT ───────────────────────────────

test('admin can add arsip unit to berkas', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Target Berkas',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Unassigned arsip',
        'tanggal' => '2025-01-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->post("/berkas-arsip/{$berkas->nomor_berkas}/add-arsip-unit", [
            'arsip_unit_id' => $arsip->id_berkas,
        ])
        ->assertRedirect();

    $arsip->refresh();
    expect($arsip->berkas_arsip_id)->toBe($berkas->nomor_berkas);
});

test('admin can remove arsip unit from berkas', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $berkas = BerkasArsip::create([
        'nama_berkas' => 'Source Berkas',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'berkas_arsip_id' => $berkas->nomor_berkas,
        'uraian_informasi' => 'Assigned arsip',
        'tanggal' => '2025-01-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->delete("/berkas-arsip/{$berkas->nomor_berkas}/remove-arsip-unit/{$arsip->id_berkas}")
        ->assertRedirect();

    $arsip->refresh();
    expect($arsip->berkas_arsip_id)->toBeNull();
});

// ─── EXPORT ───────────────────────────────────────────────

test('admin can access berkas arsip print preview', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/berkas-arsip/print-preview')
        ->assertOk();
});

test('admin can export berkas arsip PDF', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/berkas-arsip/export/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
