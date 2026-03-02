<?php

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

beforeEach(function () {
    $this->masterData = createMasterData();
});

// ─── INDEX ────────────────────────────────────────────────

test('guests cannot access arsip unit index', function () {
    $this->get('/arsip-unit')->assertRedirect('/login');
});

test('unverified users are redirected to verification pending', function () {
    $user = User::factory()->withoutTwoFactor()->unverified()->create(['role' => 'user']);

    $this->actingAs($user)
        ->get('/arsip-unit')
        ->assertRedirect(route('verification.pending'));
});

test('admin can view arsip unit index', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/arsip-unit')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip-unit/index'));
});

test('operator can view arsip unit index', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/arsip-unit')
        ->assertOk();
});

test('user can view arsip unit index', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get('/arsip-unit')
        ->assertOk();
});

test('arsip unit index supports search filter', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Dokumen Penting Arsip',
        'tanggal' => '2025-01-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->get('/arsip-unit?search=Penting')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('arsip-unit/index')
            ->has('arsipUnits.data', 1)
        );
});

test('arsip unit index supports status filter', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Test Status',
        'tanggal' => '2025-01-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'status' => 'pending',
    ]);

    $this->actingAs($admin)
        ->get('/arsip-unit?status=pending')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('arsipUnits.data', 1));

    $this->actingAs($admin)
        ->get('/arsip-unit?status=diterima')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('arsipUnits.data', 0));
});

// ─── CREATE ───────────────────────────────────────────────

test('admin can access arsip unit create form', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/arsip-unit/create')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip-unit/create'));
});

test('operator cannot access arsip unit create form', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/arsip-unit/create')
        ->assertForbidden();
});

test('user can access arsip unit create form', function () {
    $user = createUser();

    $this->actingAs($user)
        ->get('/arsip-unit/create')
        ->assertOk();
});

// ─── STORE ────────────────────────────────────────────────

test('admin can create arsip unit', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $data = [
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Uraian test arsip unit',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 3,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'indeks' => 'IDX-001',
    ];

    $this->actingAs($admin)
        ->post('/arsip-unit', $data)
        ->assertRedirect();

    $this->assertDatabaseHas('arsip_unit', [
        'uraian_informasi' => 'Uraian test arsip unit',
        'status' => 'pending',
        'publish_status' => 'draft',
    ]);
});

test('operator cannot create arsip unit', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $data = [
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Test',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
    ];

    $this->actingAs($operator)
        ->post('/arsip-unit', $data)
        ->assertForbidden();
});

test('store arsip unit requires validation', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->post('/arsip-unit', [])
        ->assertSessionHasErrors([
            'kode_klasifikasi_id',
            'kategori_id',
            'sub_kategori_id',
            'uraian_informasi',
            'tanggal',
            'jumlah_nilai',
            'jumlah_satuan',
        ]);
});

test('store arsip unit with file upload', function () {
    Storage::fake('public');
    $admin = createAdmin();
    $master = $this->masterData;

    $data = [
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Arsip dengan dokumen',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
        'dokumen' => UploadedFile::fake()->create('test.pdf', 1024, 'application/pdf'),
    ];

    $this->actingAs($admin)
        ->post('/arsip-unit', $data)
        ->assertRedirect();

    $arsip = ArsipUnit::where('uraian_informasi', 'Arsip dengan dokumen')->first();
    expect($arsip)->not->toBeNull();
    expect($arsip->dokumen)->not->toBeNull();
});

// ─── SHOW ─────────────────────────────────────────────────

test('admin can view arsip unit detail', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Detail test',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->get("/arsip-unit/{$arsip->id_berkas}")
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('arsip-unit/show'));
});

// ─── UPDATE ───────────────────────────────────────────────

test('admin can update arsip unit', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Original',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
    ]);

    $this->actingAs($admin)
        ->put("/arsip-unit/{$arsip->id_berkas}", [
            'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
            'kategori_id' => $master['kategori']->id,
            'sub_kategori_id' => $master['subKategori']->id,
            'uraian_informasi' => 'Updated',
            'tanggal' => '2025-07-01',
            'jumlah_nilai' => 2,
            'jumlah_satuan' => 'jilid',
            'tingkat_perkembangan' => 'salinan',
        ])
        ->assertRedirect();

    $arsip->refresh();
    expect($arsip->uraian_informasi)->toBe('Updated');
    expect($arsip->jumlah_satuan)->toBe('jilid');
});

test('operator cannot update arsip unit', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Test',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'tingkat_perkembangan' => 'asli',
    ]);

    $this->actingAs($operator)
        ->put("/arsip-unit/{$arsip->id_berkas}", [
            'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
            'kategori_id' => $master['kategori']->id,
            'sub_kategori_id' => $master['subKategori']->id,
            'uraian_informasi' => 'Hacked',
            'tanggal' => '2025-06-15',
            'jumlah_nilai' => 1,
            'jumlah_satuan' => 'lembar',
            'tingkat_perkembangan' => 'asli',
        ])
        ->assertForbidden();
});

// ─── DELETE ───────────────────────────────────────────────

test('admin can delete arsip unit', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'To delete',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->delete("/arsip-unit/{$arsip->id_berkas}")
        ->assertRedirect();

    $this->assertSoftDeleted('arsip_unit', ['id_berkas' => $arsip->id_berkas]);
});

test('operator cannot delete arsip unit', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Cannot delete',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($operator)
        ->delete("/arsip-unit/{$arsip->id_berkas}")
        ->assertForbidden();
});

// ─── STATUS & PUBLISH ─────────────────────────────────────

test('operator can update arsip unit verification status', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Pending verification',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'status' => 'pending',
    ]);

    $this->actingAs($operator)
        ->patch("/arsip-unit/{$arsip->id_berkas}/status", [
            'status' => 'diterima',
        ])
        ->assertRedirect();

    $arsip->refresh();
    expect($arsip->status)->toBe('diterima');
});

test('user cannot update arsip unit verification status', function () {
    $user = createUser();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Test',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'status' => 'pending',
    ]);

    $this->actingAs($user)
        ->patch("/arsip-unit/{$arsip->id_berkas}/status", [
            'status' => 'diterima',
        ])
        ->assertForbidden();
});

test('operator can update publish status', function () {
    $operator = createOperator();
    $master = $this->masterData;

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Publish test',
        'tanggal' => '2025-06-15',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'publish_status' => 'draft',
    ]);

    $this->actingAs($operator)
        ->patch("/arsip-unit/{$arsip->id_berkas}/publish-status", [
            'publish_status' => 'published',
        ])
        ->assertRedirect();

    $arsip->refresh();
    expect($arsip->publish_status)->toBe('published');
});

// ─── EXPORT ───────────────────────────────────────────────

test('admin can access print preview', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/arsip-unit/print-preview')
        ->assertOk();
});

test('admin can export arsip unit PDF', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/arsip-unit/export/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});
