<?php

/*
|--------------------------------------------------------------------------
| Test Case
|--------------------------------------------------------------------------
|
| The closure you provide to your test functions is always bound to a specific PHPUnit test
| case class. By default, that class is "PHPUnit\Framework\TestCase". Of course, you may
| need to change it using the "pest()" function to bind a different classes or traits.
|
*/

pest()->extend(Tests\TestCase::class)
    ->use(Illuminate\Foundation\Testing\RefreshDatabase::class)
    ->in('Feature');

/*
|--------------------------------------------------------------------------
| Expectations
|--------------------------------------------------------------------------
|
| When you're writing tests, you often need to check that values meet certain conditions. The
| "expect()" function gives you access to a set of "expectations" methods that you can use
| to assert different things. Of course, you may extend the Expectation API at any time.
|
*/

expect()->extend('toBeOne', function () {
    return $this->toBe(1);
});

/*
|--------------------------------------------------------------------------
| Functions
|--------------------------------------------------------------------------
|
| While Pest is very powerful out-of-the-box, you may have some testing code specific to your
| project that you don't want to repeat in every file. Here you can also expose helpers as
| global functions to help you to reduce the number of lines of code in your test files.
|
*/

function something()
{
    // ..
}

/*
|--------------------------------------------------------------------------
| Test Helpers
|--------------------------------------------------------------------------
*/

/**
 * Create a verified admin user.
 */
function createAdmin(array $attributes = []): \App\Models\User
{
    if (!isset($attributes['unit_pengolah_id'])) {
        $unit = \App\Models\UnitPengolah::first() ?? \App\Models\UnitPengolah::create(['nama_unit' => 'Unit Admin']);
        $attributes['unit_pengolah_id'] = $unit->id;
    }

    return \App\Models\User::factory()->withoutTwoFactor()->create(array_merge([
        'role' => 'admin',
        'email_verified_at' => now(),
    ], $attributes));
}

/**
 * Create a verified operator user.
 */
function createOperator(array $attributes = []): \App\Models\User
{
    if (!isset($attributes['unit_pengolah_id'])) {
        $unit = \App\Models\UnitPengolah::first() ?? \App\Models\UnitPengolah::create(['nama_unit' => 'Unit Operator']);
        $attributes['unit_pengolah_id'] = $unit->id;
    }

    return \App\Models\User::factory()->withoutTwoFactor()->create(array_merge([
        'role' => 'operator',
        'email_verified_at' => now(),
    ], $attributes));
}

/**
 * Create a verified regular user.
 */
function createUser(array $attributes = []): \App\Models\User
{
    if (!isset($attributes['unit_pengolah_id'])) {
        $unit = \App\Models\UnitPengolah::first() ?? \App\Models\UnitPengolah::create(['nama_unit' => 'Unit User']);
        $attributes['unit_pengolah_id'] = $unit->id;
    }

    return \App\Models\User::factory()->withoutTwoFactor()->create(array_merge([
        'role' => 'user',
        'email_verified_at' => now(),
    ], $attributes));
}

/**
 * Create base master data needed for arsip tests.
 */
function createMasterData(): array
{
    $unitPengolah = \App\Models\UnitPengolah::create(['nama_unit' => 'Unit Test']);
    $kodeKlasifikasi = \App\Models\KodeKlasifikasi::create([
        'kode_klasifikasi' => 'TS.01',
        'uraian' => 'Test Klasifikasi',
        'retensi_aktif' => 2,
        'retensi_inaktif' => 3,
        'status_akhir' => 'Musnah',
        'klasifikasi_keamanan' => 'Biasa',
    ]);
    $kategori = \App\Models\Kategori::create([
        'nama_kategori' => 'Test Kategori',
        'deskripsi' => 'Deskripsi test',
    ]);
    $subKategori = \App\Models\SubKategori::create([
        'kategori_id' => $kategori->id,
        'nama_sub_kategori' => 'Test Sub Kategori',
        'deskripsi' => 'Deskripsi sub test',
    ]);

    return compact('unitPengolah', 'kodeKlasifikasi', 'kategori', 'subKategori');
}
