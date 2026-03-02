<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$a = App\Models\ArsipUnit::with('kodeKlasifikasi','unitPengolah','kategori','subKategori')->first();
if (!$a) {
    echo "No ArsipUnit records found\n";
    exit;
}
echo "id_berkas: " . $a->id_berkas . "\n";
echo "kode_klasifikasi: " . ($a->kodeKlasifikasi ? 'OK' : 'NULL') . "\n";
echo "unit_pengolah: " . ($a->unitPengolah ? 'OK' : 'NULL') . "\n";
echo "kategori: " . ($a->kategori ? 'OK' : 'NULL') . "\n";
echo "sub_kategori: " . ($a->subKategori ? 'OK' : 'NULL') . "\n";

// Check if any records have null relations
$nullKode = App\Models\ArsipUnit::whereDoesntHave('kodeKlasifikasi')->count();
$nullUnit = App\Models\ArsipUnit::whereDoesntHave('unitPengolah')->count();
$nullKat = App\Models\ArsipUnit::whereDoesntHave('kategori')->count();
$nullSub = App\Models\ArsipUnit::whereDoesntHave('subKategori')->count();
echo "\nRecords with NULL relations:\n";
echo "  Missing kodeKlasifikasi: $nullKode\n";
echo "  Missing unitPengolah: $nullUnit\n";
echo "  Missing kategori: $nullKat\n";
echo "  Missing subKategori: $nullSub\n";
