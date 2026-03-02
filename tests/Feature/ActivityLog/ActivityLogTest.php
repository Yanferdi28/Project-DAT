<?php

use App\Models\ActivityLog;

test('admin can view activity log', function () {
    $admin = createAdmin();

    $this->actingAs($admin)
        ->get('/activity-log')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('activity-log/index'));
});

test('activity log supports action filter', function () {
    $admin = createAdmin();

    // Clear logs created by user creation
    ActivityLog::truncate();

    ActivityLog::create([
        'user_id' => $admin->id,
        'action' => 'created',
        'model_type' => 'App\\Models\\ArsipUnit',
        'model_id' => 1,
        'description' => 'Membuat Arsip Unit Test',
    ]);

    ActivityLog::create([
        'user_id' => $admin->id,
        'action' => 'updated',
        'model_type' => 'App\\Models\\ArsipUnit',
        'model_id' => 1,
        'description' => 'Mengubah Arsip Unit Test',
    ]);

    $this->actingAs($admin)
        ->get('/activity-log?action=created')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('logs.data', 1));
});

test('activity log supports date range filter', function () {
    $admin = createAdmin();

    // Clear logs created by user creation
    ActivityLog::truncate();

    $oldLog = ActivityLog::create([
        'user_id' => $admin->id,
        'action' => 'created',
        'model_type' => 'App\\Models\\ArsipUnit',
        'model_id' => 1,
        'description' => 'Old entry',
    ]);
    $oldLog->forceFill(['created_at' => '2025-01-01 10:00:00'])->save();

    $recentLog = ActivityLog::create([
        'user_id' => $admin->id,
        'action' => 'created',
        'model_type' => 'App\\Models\\ArsipUnit',
        'model_id' => 2,
        'description' => 'Recent entry',
    ]);
    $recentLog->forceFill(['created_at' => '2025-06-15 10:00:00'])->save();

    $this->actingAs($admin)
        ->get('/activity-log?from_date=2025-06-01&to_date=2025-06-30')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->has('logs.data', 1));
});

test('activity log records are created on arsip unit creation', function () {
    $admin = createAdmin();
    $master = createMasterData();

    $this->actingAs($admin)
        ->post('/arsip-unit', [
            'kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
            'kategori_id' => $master['kategori']->id,
            'sub_kategori_id' => $master['subKategori']->id,
            'uraian_informasi' => 'Activity log test',
            'tanggal' => '2025-06-15',
            'jumlah_nilai' => 1,
            'jumlah_satuan' => 'lembar',
            'tingkat_perkembangan' => 'asli',
        ]);

    $this->assertDatabaseHas('activity_logs', [
        'action' => 'created',
        'model_type' => 'App\\Models\\ArsipUnit',
    ]);
});
