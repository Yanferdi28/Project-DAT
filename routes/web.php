<?php

use App\Http\Controllers\ArsipUnitController;
use App\Http\Controllers\BerkasArsipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KodeKlasifikasiController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SubKategoriController;
use App\Http\Controllers\UnitPengolahController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes (accessible by all authenticated users)
    Route::get('my-profile', [ProfileController::class, 'edit'])->name('myprofile.edit');
    Route::post('my-profile', [ProfileController::class, 'update'])->name('myprofile.update');
    Route::delete('my-profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('myprofile.avatar.delete');

    // Arsip Unit routes (accessible by all authenticated users)
    Route::get('arsip-unit/print-preview', [ArsipUnitController::class, 'printPreview'])->name('arsip-unit.print-preview');
    Route::get('arsip-unit/export/pdf', [ArsipUnitController::class, 'exportPdf'])->name('arsip-unit.export-pdf');
    Route::resource('arsip-unit', ArsipUnitController::class);
    
    // Berkas Arsip routes (accessible by all authenticated users)
    Route::get('berkas-arsip/print-preview', [BerkasArsipController::class, 'printPreview'])->name('berkas-arsip.print-preview');
    Route::get('berkas-arsip/export/pdf', [BerkasArsipController::class, 'exportPdf'])->name('berkas-arsip.export-pdf');
    Route::get('berkas-arsip/export/penyusutan', [BerkasArsipController::class, 'exportPenyusutanPdf'])->name('berkas-arsip.export-penyusutan');
    Route::resource('berkas-arsip', BerkasArsipController::class);
    Route::post('berkas-arsip/{berkasArsip}/add-arsip-unit', [BerkasArsipController::class, 'addArsipUnit'])->name('berkas-arsip.add-arsip-unit');
    Route::delete('berkas-arsip/{berkasArsip}/remove-arsip-unit/{arsipUnit}', [BerkasArsipController::class, 'removeArsipUnit'])->name('berkas-arsip.remove-arsip-unit');
    
    // Laporan routes
    Route::get('laporan/penyusutan', [LaporanController::class, 'penyusutan'])->name('laporan.penyusutan');
    Route::get('laporan/status-verifikasi', [LaporanController::class, 'statusVerifikasi'])->name('laporan.status-verifikasi');
    Route::get('laporan/status-verifikasi/export', [LaporanController::class, 'exportStatusVerifikasiPdf'])->name('laporan.status-verifikasi.export');
    Route::get('laporan/berita-acara-penyerahan', [LaporanController::class, 'beritaAcaraPenyerahan'])->name('laporan.berita-acara-penyerahan');
    Route::post('laporan/berita-acara-penyerahan', [LaporanController::class, 'storeBeritaAcaraPenyerahan'])->name('laporan.berita-acara-penyerahan.store');
    Route::get('laporan/berita-acara-penyerahan/{id}/export', [LaporanController::class, 'exportBeritaAcaraPdf'])->name('laporan.berita-acara-penyerahan.export');
    
    // Laporan Rekap Unit Pengolah (admin and management only)
    Route::middleware('role:admin,management')->group(function () {
        Route::get('laporan/rekap-unit-pengolah', [LaporanController::class, 'rekapUnitPengolah'])->name('laporan.rekap-unit-pengolah');
        Route::get('laporan/rekap-unit-pengolah/export', [LaporanController::class, 'exportRekapUnitPengolahPdf'])->name('laporan.rekap-unit-pengolah.export');
    });
    
    // Arsip Unit status routes (operator and admin only)
    Route::middleware('role:operator,admin')->group(function () {
        Route::patch('arsip-unit/{arsipUnit}/status', [ArsipUnitController::class, 'updateStatus'])->name('arsip-unit.update-status');
        Route::patch('arsip-unit/{arsipUnit}/publish-status', [ArsipUnitController::class, 'updatePublishStatus'])->name('arsip-unit.update-publish-status');
        Route::patch('arsip-unit/{arsipUnit}/assign-to-berkas', [ArsipUnitController::class, 'assignToBerkas'])->name('arsip-unit.assign-to-berkas');
    });

    // Users CRUD routes (admin only)
    Route::middleware('admin')->group(function () {
        Route::resource('users', UserController::class);
        Route::post('users/{user}/verify', [UserController::class, 'verify'])->name('users.verify');
        Route::post('users/{user}/unverify', [UserController::class, 'unverify'])->name('users.unverify');

        // Master routes (admin only)
        Route::resource('kode-klasifikasi', KodeKlasifikasiController::class);
        Route::resource('unit-pengolah', UnitPengolahController::class);
        Route::resource('kategori', KategoriController::class);
        Route::resource('sub-kategori', SubKategoriController::class);
    });
});

require __DIR__.'/settings.php';
