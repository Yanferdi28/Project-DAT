<?php

use App\Http\Controllers\ActivityLogController;
use App\Http\Controllers\ArsipUnitController;
use App\Http\Controllers\BerkasArsipController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KategoriController;
use App\Http\Controllers\KodeKlasifikasiController;
use App\Http\Controllers\LaporanController;
use App\Http\Controllers\OcrController;
use App\Http\Controllers\PeminjamanArsipController;
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

// Route untuk halaman menunggu verifikasi admin
Route::middleware(['auth'])->group(function () {
    Route::get('verification/pending', function () {
        // Jika user sudah diverifikasi, redirect ke dashboard
        if (auth()->user()->isVerifiedByAdmin()) {
            return redirect()->route('dashboard');
        }
        return Inertia::render('auth/verification-pending');
    })->name('verification.pending');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Profile routes (accessible by all authenticated users)
    Route::get('my-profile', [ProfileController::class, 'edit'])->name('myprofile.edit');
    Route::post('my-profile', [ProfileController::class, 'update'])->name('myprofile.update');
    Route::delete('my-profile/avatar', [ProfileController::class, 'deleteAvatar'])->name('myprofile.avatar.delete');

    // File preview route (serve files inline for preview)
    Route::get('file/preview/{path}', [ArsipUnitController::class, 'previewFile'])
        ->where('path', '.*')
        ->name('file.preview');

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
    Route::post('berkas-arsip/{berkasArsip}/bulk-add-arsip-unit', [BerkasArsipController::class, 'bulkAddArsipUnits'])->name('berkas-arsip.bulk-add-arsip-unit');
    Route::delete('berkas-arsip/{berkasArsip}/remove-arsip-unit/{arsipUnit}', [BerkasArsipController::class, 'removeArsipUnit'])->name('berkas-arsip.remove-arsip-unit');

    // Peminjaman Arsip routes (accessible by all authenticated users)
    Route::resource('peminjaman-arsip', PeminjamanArsipController::class)->only(['index', 'create', 'store', 'show']);
    Route::patch('peminjaman-arsip/{peminjamanArsip}/kembalikan', [PeminjamanArsipController::class, 'kembalikan'])->name('peminjaman-arsip.kembalikan');

    // Laporan routes
    Route::get('laporan/penyusutan', [LaporanController::class, 'penyusutan'])->name('laporan.penyusutan');
    Route::get('laporan/status-verifikasi', [LaporanController::class, 'statusVerifikasi'])->name('laporan.status-verifikasi');
    Route::get('laporan/status-verifikasi/export', [LaporanController::class, 'exportStatusVerifikasiPdf'])->name('laporan.status-verifikasi.export');
    Route::get('laporan/berita-acara-penyerahan', [LaporanController::class, 'beritaAcaraPenyerahan'])->name('laporan.berita-acara-penyerahan');
    Route::post('laporan/berita-acara-penyerahan', [LaporanController::class, 'storeBeritaAcaraPenyerahan'])->name('laporan.berita-acara-penyerahan.store');
    Route::get('laporan/berita-acara-penyerahan/{id}/export', [LaporanController::class, 'exportBeritaAcaraPdf'])->name('laporan.berita-acara-penyerahan.export');

    // Laporan Peminjaman/Pengembalian (all authenticated users)
    Route::get('laporan/peminjaman', [LaporanController::class, 'laporanPeminjaman'])->name('laporan.peminjaman');
    Route::get('laporan/peminjaman/export', [LaporanController::class, 'exportLaporanPeminjamanPdf'])->name('laporan.peminjaman.export');

    // Laporan admin only
    Route::middleware('admin')->group(function () {
        Route::get('laporan/rekap-unit-pengolah', [LaporanController::class, 'rekapUnitPengolah'])->name('laporan.rekap-unit-pengolah');
        Route::get('laporan/rekap-unit-pengolah/export', [LaporanController::class, 'exportRekapUnitPengolahPdf'])->name('laporan.rekap-unit-pengolah.export');
        Route::get('laporan/statistik-klasifikasi', [LaporanController::class, 'statistikKlasifikasi'])->name('laporan.statistik-klasifikasi');
        Route::get('laporan/statistik-klasifikasi/export', [LaporanController::class, 'exportStatistikKlasifikasiPdf'])->name('laporan.statistik-klasifikasi.export');
        Route::get('laporan/statistik-ocr', [LaporanController::class, 'statistikOcr'])->name('laporan.statistik-ocr');
        Route::get('laporan/statistik-ocr/export', [LaporanController::class, 'exportStatistikOcrPdf'])->name('laporan.statistik-ocr.export');
        Route::get('laporan/log-aktivitas', [LaporanController::class, 'logAktivitas'])->name('laporan.log-aktivitas');
        Route::get('laporan/log-aktivitas/export', [LaporanController::class, 'exportLogAktivitasPdf'])->name('laporan.log-aktivitas.export');
    });

    // OCR routes
    Route::get('arsip-unit/{arsipUnit}/ocr-result', [OcrController::class, 'result'])->name('arsip-unit.ocr-result');
    Route::post('arsip-unit/{arsipUnit}/ocr-retry', [OcrController::class, 'retry'])->name('arsip-unit.ocr-retry');
    Route::post('arsip-unit/{arsipUnit}/ocr-accept', [OcrController::class, 'acceptSuggestion'])->name('arsip-unit.ocr-accept');
    Route::post('arsip-unit/{arsipUnit}/ocr-reject', [OcrController::class, 'rejectSuggestion'])->name('arsip-unit.ocr-reject');
    Route::get('ocr/status', [OcrController::class, 'status'])->name('ocr.status');
    Route::post('ocr/scan-document', [OcrController::class, 'scanDocument'])->name('ocr.scan-document');

    // Activity Log (admin only)
    Route::middleware('admin')->group(function () {
        Route::get('activity-log', [ActivityLogController::class, 'index'])->name('activity-log.index');
    });

    // Bantuan / Help page
    Route::get('bantuan', function () {
        return Inertia::render('bantuan/index');
    })->name('bantuan');

    // Arsip Unit status routes (operator and admin only)
    Route::middleware('role:operator,admin')->group(function () {
        Route::patch('arsip-unit/{arsipUnit}/status', [ArsipUnitController::class, 'updateStatus'])->name('arsip-unit.update-status');
        Route::patch('arsip-unit/{arsipUnit}/publish-status', [ArsipUnitController::class, 'updatePublishStatus'])->name('arsip-unit.update-publish-status');
    });

    // Assign to berkas route (user and admin only, not operator)
    Route::middleware('role:user,admin')->group(function () {
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

require __DIR__ . '/settings.php';
