<?php

use App\Models\ArsipUnit;
use App\Models\KodeKlasifikasi;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->masterData = createMasterData();
});

test('accepted only training export includes corrected rows and excludes rejected rows', function () {
    $master = $this->masterData;
    $correctKode = KodeKlasifikasi::create([
        'kode_klasifikasi' => 'TS.02',
        'uraian' => 'Corrected Klasifikasi',
        'retensi_aktif' => 2,
        'retensi_inaktif' => 3,
        'status_akhir' => 'Musnah',
        'klasifikasi_keamanan' => 'Biasa',
    ]);

    $makeArsip = function (string $text, string|null $status, KodeKlasifikasi $kode) use ($master) {
        return ArsipUnit::create([
            'kode_klasifikasi_id' => $kode->id,
            'suggested_kode_klasifikasi_id' => $master['kodeKlasifikasi']->id,
            'ai_suggestion_status' => $status,
            'extracted_text' => $text,
            'ocr_status' => 'completed',
            'unit_pengolah_arsip_id' => $master['unitPengolah']->id,
            'kategori_id' => $master['kategori']->id,
            'sub_kategori_id' => $master['subKategori']->id,
            'uraian_informasi' => $text,
            'tanggal' => '2025-06-15',
            'jumlah_nilai' => 1,
            'jumlah_satuan' => 'lembar',
            'tingkat_perkembangan' => 'asli',
        ]);
    };

    $makeArsip('corrected real archive text should be exported for retraining', 'corrected', $correctKode);
    $makeArsip('rejected unresolved archive text should not be exported', 'rejected', $master['kodeKlasifikasi']);
    $makeArsip('accepted archive text should be exported for retraining', 'accepted', $master['kodeKlasifikasi']);
    $makeArsip('manual finalized archive text one should be exported', null, $master['kodeKlasifikasi']);
    $makeArsip('manual finalized archive text two should be exported', null, $master['kodeKlasifikasi']);
    $makeArsip('manual finalized archive text three should be exported', null, $master['kodeKlasifikasi']);

    $relativePath = 'storage/framework/testing/training_data_export_test.json';
    $fullPath = base_path($relativePath);
    File::delete($fullPath);

    $exitCode = Artisan::call('ai:export-training-data', [
        '--path' => $relativePath,
        '--accepted-only' => true,
        '--seed-from' => '',
        '--min-text' => 10,
    ]);

    expect($exitCode)->toBe(0);

    $rows = json_decode((string) file_get_contents($fullPath), true);
    $texts = collect($rows)->pluck('text');

    expect($texts)->toContain('corrected real archive text should be exported for retraining');
    expect($texts)->toContain('accepted archive text should be exported for retraining');
    expect($texts)->not->toContain('rejected unresolved archive text should not be exported');
    expect($rows)->toHaveCount(5);

    File::delete($fullPath);
});
