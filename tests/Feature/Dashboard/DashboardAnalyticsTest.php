<?php

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;

beforeEach(function () {
    $this->masterData = createMasterData();
});

test('dashboard displays correct stats for admin', function () {
    $admin = createAdmin();
    $master = $this->masterData;

    // Create some test data
    ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Arsip 1',
        'tanggal' => now()->format('Y-m-d'),
        'jumlah_nilai' => 1,
        'jumlah_satuan' => 'lembar',
        'status' => 'pending',
    ]);

    ArsipUnit::create([
        'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
        'kategori_id' => $master['kategori']->id,
        'sub_kategori_id' => $master['subKategori']->id,
        'uraian_informasi' => 'Arsip 2',
        'tanggal' => now()->format('Y-m-d'),
        'jumlah_nilai' => 2,
        'jumlah_satuan' => 'jilid',
        'status' => 'diterima',
    ]);

    BerkasArsip::create([
        'nama_berkas' => 'Berkas 1',
        'klasifikasi_id' => $master['kodeKlasifikasi']->id,
        'unit_pengolah_id' => $master['unitPengolah']->id,
    ]);

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('stats')
            ->where('stats.totalArsipUnit', 2)
            ->where('stats.totalBerkasArsip', 1)
            ->has('stats.statusCounts')
            ->has('charts')
            ->has('charts.monthlyTrend')
            ->has('charts.perKlasifikasi')
            ->has('recentArsipUnit')
        );
});

test('dashboard shows totalUsers only for admin', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats.totalUsers')
        );
});

test('dashboard is accessible by all roles', function () {
    $roles = [createAdmin(), createOperator(), createUser()];

    foreach ($roles as $user) {
        $this->actingAs($user)
            ->get('/dashboard')
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard'));
    }
});

test('dashboard displays OCR statistics', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('stats.ocr')
            ->has('stats.ocr.processed')
            ->has('stats.ocr.pending')
            ->has('stats.ocr.failed')
        );
});

test('dashboard displays chart data', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->has('charts.monthlyTrend')
            ->has('charts.perKlasifikasi')
            ->has('charts.perUnitPengolah')
            ->has('charts.statusDistribution')
        );
});
