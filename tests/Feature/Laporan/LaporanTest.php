<?php

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\UnitPengolah;

beforeEach(function () {
    $this->masterData = createMasterData();
});

// ─── PENYUSUTAN ──────────────────────────────────────────

test('all roles can access penyusutan report', function () {
    $roles = [createAdmin(), createOperator(), createUser()];

    foreach ($roles as $user) {
        $this->actingAs($user)
            ->get('/laporan/penyusutan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('laporan/penyusutan'));
    }
});

test('penyusutan report receives unit pengolah list', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/laporan/penyusutan')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('unitPengolahs'));
});

test('penyusutan PDF export works', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/berkas-arsip/export/penyusutan?tahun_acuan=2026')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

// ─── STATUS VERIFIKASI ───────────────────────────────────

test('all roles can access status verifikasi report', function () {
    $roles = [createAdmin(), createOperator(), createUser()];

    foreach ($roles as $user) {
        $this->actingAs($user)
            ->get('/laporan/status-verifikasi')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('laporan/status-verifikasi'));
    }
});

test('status verifikasi PDF export works', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/laporan/status-verifikasi/export')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('status verifikasi report supports filters', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/laporan/status-verifikasi/export?status=pending')
        ->assertOk();
});

// ─── BERITA ACARA PENYERAHAN ─────────────────────────────

test('all roles can access berita acara penyerahan page', function () {
    $roles = [createAdmin(), createOperator(), createUser()];

    foreach ($roles as $user) {
        $this->actingAs($user)
            ->get('/laporan/berita-acara-penyerahan')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('laporan/berita-acara-penyerahan'));
    }
});

test('admin can create berita acara penyerahan', function () {
    $admin = createAdmin();
    $master = $this->masterData;
    $unitTujuan = UnitPengolah::create(['nama_unit' => 'Unit Tujuan']);

    $arsip = ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'For berita acara',
        'tanggal' => '2025-01-01',
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
    ]);

    $this->actingAs($admin)
        ->post('/laporan/berita-acara-penyerahan', [
            'unit_pengolah_asal_id' => $master['unitPengolah']->id,
            'unit_pengolah_tujuan_id' => $unitTujuan->id,
            'tanggal_penyerahan' => '2025-06-15',
            'arsip_ids' => [$arsip->id_berkas],
        ])
        ->assertOk();

    $this->assertDatabaseHas('berita_acara_penyerahan', [
        'unit_pengolah_asal_id' => $master['unitPengolah']->id,
        'unit_pengolah_tujuan_id' => $unitTujuan->id,
    ]);
});

// ─── REKAP UNIT PENGOLAH (ADMIN ONLY) ────────────────────

test('admin can access rekap unit pengolah', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/laporan/rekap-unit-pengolah')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('laporan/rekap-unit-pengolah'));
});

test('operator cannot access rekap unit pengolah', function () {
    $operator = createOperator();

    $this->actingAs($operator)
        ->get('/laporan/rekap-unit-pengolah')
        ->assertForbidden();
});

test('rekap unit pengolah PDF export works', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/laporan/rekap-unit-pengolah/export')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('signature block displays the report creator name and unit', function () {
    $unit = UnitPengolah::create(['nama_unit' => 'Unit Pembuat Laporan']);
    $creator = createAdmin([
        'name' => 'Pembuat Laporan Test',
        'unit_pengolah_id' => $unit->id,
    ])->load('unitPengolah');

    $html = view('pdf.partials.report-signature', ['reportCreator' => $creator])
        ->render();

    expect($html)
        ->toContain('Dibuat oleh,')
        ->toContain('Pembuat Laporan Test')
        ->toContain('Unit Pembuat Laporan');
});

test('additional report PDF export includes creator data', function (string $url) {
    $admin = createAdmin(['name' => 'Admin Pembuat Laporan']);

    $this->actingAs($admin)
        ->get($url)
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
})->with([
    'statistik klasifikasi' => '/laporan/statistik-klasifikasi/export',
    'log aktivitas' => '/laporan/log-aktivitas/export',
    'statistik OCR' => '/laporan/statistik-ocr/export',
    'peminjaman' => '/laporan/peminjaman/export',
]);
