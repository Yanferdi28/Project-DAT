<?php

use App\Models\User;

// ─── ADMIN-ONLY ROUTES ───────────────────────────────────

test('admin can access master data routes', function () {
    $admin = createAdmin();

    // Master Kode Klasifikasi
    $this->actingAs($admin)->get('/kode-klasifikasi')->assertOk();
    // Master Unit Pengolah
    $this->actingAs($admin)->get('/unit-pengolah')->assertOk();
    // Master Kategori
    $this->actingAs($admin)->get('/kategori')->assertOk();
    // Master Sub Kategori
    $this->actingAs($admin)->get('/sub-kategori')->assertOk();
    // User Management
    $this->actingAs($admin)->get('/users')->assertOk();
    // Activity Log
    $this->actingAs($admin)->get('/activity-log')->assertOk();
    // Rekap Unit Pengolah
    $this->actingAs($admin)->get('/laporan/rekap-unit-pengolah')->assertOk();
});

test('operator cannot access admin-only routes', function () {
    $operator = createOperator();

    $this->actingAs($operator)->get('/kode-klasifikasi')->assertForbidden();
    $this->actingAs($operator)->get('/unit-pengolah')->assertForbidden();
    $this->actingAs($operator)->get('/kategori')->assertForbidden();
    $this->actingAs($operator)->get('/sub-kategori')->assertForbidden();
    $this->actingAs($operator)->get('/users')->assertForbidden();
    $this->actingAs($operator)->get('/activity-log')->assertForbidden();
    $this->actingAs($operator)->get('/laporan/rekap-unit-pengolah')->assertForbidden();
});

test('regular user cannot access admin-only routes', function () {
    $user = createUser();

    $this->actingAs($user)->get('/kode-klasifikasi')->assertForbidden();
    $this->actingAs($user)->get('/unit-pengolah')->assertForbidden();
    $this->actingAs($user)->get('/kategori')->assertForbidden();
    $this->actingAs($user)->get('/sub-kategori')->assertForbidden();
    $this->actingAs($user)->get('/users')->assertForbidden();
    $this->actingAs($user)->get('/activity-log')->assertForbidden();
    $this->actingAs($user)->get('/laporan/rekap-unit-pengolah')->assertForbidden();
});

// ─── OPERATOR+ADMIN ONLY ROUTES ──────────────────────────

test('operator and admin can access verification routes', function () {
    $master = createMasterData();

    $arsip = \App\Models\ArsipUnit::create([
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

    $admin = createAdmin();
    $operator = createOperator();

    // Admin can update status
    $this->actingAs($admin)
        ->patch("/arsip-unit/{$arsip->id_berkas}/status", ['status' => 'diterima'])
        ->assertRedirect();

    // Operator can update status
    $arsip->update(['status' => 'pending']);
    $this->actingAs($operator)
        ->patch("/arsip-unit/{$arsip->id_berkas}/status", ['status' => 'ditolak'])
        ->assertRedirect();
});

test('regular user cannot access verification routes', function () {
    $master = createMasterData();
    $user = createUser();

    $arsip = \App\Models\ArsipUnit::create([
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
        ->patch("/arsip-unit/{$arsip->id_berkas}/status", ['status' => 'diterima'])
        ->assertForbidden();

    $this->actingAs($user)
        ->patch("/arsip-unit/{$arsip->id_berkas}/publish-status", ['publish_status' => 'published'])
        ->assertForbidden();
});

// ─── ALL AUTHENTICATED USERS ROUTES ──────────────────────

test('all roles can access common routes', function () {
    $roles = [createAdmin(), createOperator(), createUser()];

    foreach ($roles as $user) {
        $this->actingAs($user)->get('/dashboard')->assertOk();
        $this->actingAs($user)->get('/arsip-unit')->assertOk();
        $this->actingAs($user)->get('/berkas-arsip')->assertOk();
        $this->actingAs($user)->get('/laporan/penyusutan')->assertOk();
        $this->actingAs($user)->get('/laporan/status-verifikasi')->assertOk();
        $this->actingAs($user)->get('/laporan/berita-acara-penyerahan')->assertOk();
    }
});

// ─── OPERATOR WRITE RESTRICTION ──────────────────────────

test('operator is blocked from all CUD operations on arsip', function () {
    $operator = createOperator();
    $master = createMasterData();

    // Cannot create
    $this->actingAs($operator)->get('/arsip-unit/create')->assertForbidden();
    $this->actingAs($operator)->post('/arsip-unit', [])->assertForbidden();

    // Cannot create berkas
    $this->actingAs($operator)->get('/berkas-arsip/create')->assertForbidden();
    $this->actingAs($operator)->post('/berkas-arsip', [])->assertForbidden();
});

// ─── GUEST REDIRECTS ─────────────────────────────────────

test('guests are redirected to login for all protected routes', function () {
    $protectedRoutes = [
        '/dashboard',
        '/arsip-unit',
        '/berkas-arsip',
        '/users',
        '/kode-klasifikasi',
        '/unit-pengolah',
        '/kategori',
        '/sub-kategori',
        '/activity-log',
        '/laporan/penyusutan',
        '/laporan/status-verifikasi',
        '/laporan/berita-acara-penyerahan',
        '/laporan/rekap-unit-pengolah',
        '/my-profile',
    ];

    foreach ($protectedRoutes as $route) {
        $this->get($route)->assertRedirect('/login');
    }
});

// ─── VERIFICATION PENDING ────────────────────────────────

test('unverified user is redirected to verification pending', function () {
    $unverified = User::factory()->withoutTwoFactor()->unverified()->create(['role' => 'user']);

    $this->actingAs($unverified)
        ->get('/dashboard')
        ->assertRedirect(route('verification.pending'));
});

test('verified user can access dashboard', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/dashboard')
        ->assertOk();
});

test('unverified user can view pending page', function () {
    $unverified = User::factory()->withoutTwoFactor()->unverified()->create(['role' => 'user']);

    $this->actingAs($unverified)
        ->get('/verification/pending')
        ->assertOk();
});

test('verified user is redirected from pending page to dashboard', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/verification/pending')
        ->assertRedirect(route('dashboard'));
});
