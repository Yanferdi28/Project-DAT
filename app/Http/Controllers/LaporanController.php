<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    /**
     * Get user's unit_pengolah_id if restricted.
     * Returns null for admin (can see all), otherwise returns user's unit_pengolah_id.
     */
    private function getUserUnitPengolahId(): ?int
    {
        $user = auth()->user();
        if ($user->role === 'admin') {
            return null;
        }
        return $user->unit_pengolah_id;
    }

    private function getReportCreator(Request $request)
    {
        return $request->user()->loadMissing('unitPengolah');
    }

    /**
     * Display the rekap per unit pengolah page.
     */
    public function rekapUnitPengolah(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/rekap-unit-pengolah', [
            'unitPengolahs' => $unitPengolahs,
        ]);
    }

    /**
     * Export rekap per unit pengolah to PDF.
     */
    public function exportRekapUnitPengolahPdf(Request $request)
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');

        // Get all unit pengolah
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        // Build rekap data per unit
        $rekapPerUnit = [];
        $totalArsip = 0;
        $totalBerkas = 0;
        $totalPending = 0;
        $totalDiterima = 0;
        $totalDitolak = 0;

        foreach ($unitPengolahs as $unit) {
            // Query arsip unit
            $arsipQuery = ArsipUnit::where('unit_pengolah_arsip_id', $unit->id);
            
            if ($dariTanggal) {
                $arsipQuery->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $arsipQuery->whereDate('created_at', '<=', $sampaiTanggal);
            }

            $jumlahArsip = (clone $arsipQuery)->count();
            $pending = (clone $arsipQuery)->where('status', 'pending')->count();
            $diterima = (clone $arsipQuery)->where('status', 'diterima')->count();
            $ditolak = (clone $arsipQuery)->where('status', 'ditolak')->count();

            // Query berkas arsip
            $berkasQuery = BerkasArsip::where('unit_pengolah_id', $unit->id);
            
            if ($dariTanggal) {
                $berkasQuery->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $berkasQuery->whereDate('created_at', '<=', $sampaiTanggal);
            }

            $jumlahBerkas = $berkasQuery->count();

            // Only add if unit has arsip or berkas
            if ($jumlahArsip > 0 || $jumlahBerkas > 0) {
                $rekapPerUnit[] = [
                    'id' => $unit->id,
                    'nama_unit' => $unit->nama_unit,
                    'jumlah_arsip' => $jumlahArsip,
                    'jumlah_berkas' => $jumlahBerkas,
                    'pending' => $pending,
                    'diterima' => $diterima,
                    'ditolak' => $ditolak,
                ];

                $totalArsip += $jumlahArsip;
                $totalBerkas += $jumlahBerkas;
                $totalPending += $pending;
                $totalDiterima += $diterima;
                $totalDitolak += $ditolak;
            }
        }

        // Sort by jumlah arsip descending
        usort($rekapPerUnit, function ($a, $b) {
            return $b['jumlah_arsip'] - $a['jumlah_arsip'];
        });

        // Total stats
        $totalStats = [
            'total_unit' => count($rekapPerUnit),
            'total_arsip' => $totalArsip,
            'total_berkas' => $totalBerkas,
            'total_pending' => $totalPending,
            'total_diterima' => $totalDiterima,
            'total_ditolak' => $totalDitolak,
            'avg_arsip_per_unit' => count($rekapPerUnit) > 0 ? $totalArsip / count($rekapPerUnit) : 0,
        ];

        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.rekap-unit-pengolah', compact(
            'rekapPerUnit',
            'totalStats',
            'dariTanggal',
            'sampaiTanggal',
            'reportCreator'
        ));

        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-rekap-unit-pengolah-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Display the penyusutan report page.
     */
    public function penyusutan(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/penyusutan', [
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Display the status & verifikasi report page.
     */
    public function statusVerifikasi(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/status-verifikasi', [
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Export status & verifikasi report to PDF.
     */
    public function exportStatusVerifikasiPdf(Request $request)
    {
        $filterStatus = $request->input('status');
        $filterPublishStatus = $request->input('publish_status');
        $unitPengolahId = $request->input('unit_pengolah_id');
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        
        // Base query builder function to avoid mutation issues
        $baseQuery = function() use ($unitPengolahId, $dariTanggal, $sampaiTanggal) {
            $query = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah', 'verifiedBy', 'verifikasiOleh']);
            
            if ($unitPengolahId) {
                $query->where('unit_pengolah_arsip_id', $unitPengolahId);
            }
            
            if ($dariTanggal) {
                $query->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $query->whereDate('created_at', '<=', $sampaiTanggal);
            }
            
            return $query;
        };
        
        // Get statistics - status uses: pending, diterima, ditolak
        // publish_status uses: draft, published
        $stats = [
            'pending' => $baseQuery()->where('status', 'pending')->count(),
            'diterima' => $baseQuery()->where('status', 'diterima')->count(),
            'ditolak' => $baseQuery()->where('status', 'ditolak')->count(),
            'draft' => $baseQuery()->where('publish_status', 'draft')->count(),
            'published' => $baseQuery()->where('publish_status', 'published')->count(),
            'total' => $baseQuery()->count(),
        ];
        
        // Get arsip units
        $arsipUnits = collect();
        $arsipPending = collect();
        $arsipDiterima = collect();
        $arsipDitolak = collect();
        
        if ($filterStatus) {
            $arsipUnits = $baseQuery()->where('status', $filterStatus)->orderBy('created_at', 'desc')->get();
        } else {
            $arsipPending = $baseQuery()->where('status', 'pending')->orderBy('created_at', 'desc')->get();
            $arsipDiterima = $baseQuery()->where('status', 'diterima')->orderBy('verifikasi_tanggal', 'desc')->get();
            $arsipDitolak = $baseQuery()->where('status', 'ditolak')->orderBy('verifikasi_tanggal', 'desc')->get();
        }
        
        // Get unit pengolah for header
        $unitPengolah = null;
        if ($unitPengolahId) {
            $unitPengolah = UnitPengolah::find($unitPengolahId);
        }
        
        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.arsip-status-verifikasi', compact(
            'arsipUnits',
            'arsipPending',
            'arsipDiterima',
            'arsipDitolak',
            'stats',
            'filterStatus',
            'unitPengolah',
            'dariTanggal',
            'sampaiTanggal',
            'reportCreator'
        ));
        
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->stream('laporan-status-verifikasi-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Display the berita acara penyerahan page.
     */
    public function beritaAcaraPenyerahan(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        
        // Get arsip yang statusnya "diterima" dan belum pernah diserahkan
        $arsipQuery = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah'])
            ->where('status', 'diterima');
        
        // Filter by user's unit pengolah if restricted
        if ($userUnitPengolahId) {
            $arsipQuery->where('unit_pengolah_arsip_id', $userUnitPengolahId);
        }
        
        $arsipUnits = $arsipQuery->orderBy('created_at', 'desc')->get();

        return Inertia::render('laporan/berita-acara-penyerahan', [
            'unitPengolahs' => $unitPengolahs,
            'arsipUnits' => $arsipUnits,
            'userUnitPengolahId' => $userUnitPengolahId,
        ]);
    }

    /**
     * Store berita acara penyerahan and export to PDF.
     */
    public function storeBeritaAcaraPenyerahan(Request $request)
    {
        $validated = $request->validate([
            'unit_pengolah_asal_id' => 'required|exists:unit_pengolah,id',
            'unit_pengolah_tujuan_id' => 'nullable|exists:unit_pengolah,id',
            'penerima_nama' => 'nullable|string|max:255',
            'penerima_jabatan' => 'nullable|string|max:255',
            'tanggal_penyerahan' => 'required|date',
            'keterangan' => 'nullable|string',
            'arsip_ids' => 'required|array|min:1',
            'arsip_ids.*' => 'exists:arsip_unit,id_berkas',
        ]);

        try {
            return \Illuminate\Support\Facades\DB::transaction(function () use ($validated) {
                // Generate nomor berita acara
                $nomorBeritaAcara = \App\Models\BeritaAcaraPenyerahan::generateNomorBeritaAcara();

                // Create berita acara
                $beritaAcara = \App\Models\BeritaAcaraPenyerahan::create([
                    'nomor_berita_acara' => $nomorBeritaAcara,
                    'tanggal_penyerahan' => $validated['tanggal_penyerahan'],
                    'unit_pengolah_asal_id' => $validated['unit_pengolah_asal_id'],
                    'unit_pengolah_tujuan_id' => $validated['unit_pengolah_tujuan_id'] ?? null,
                    'penerima_nama' => $validated['penerima_nama'] ?? null,
                    'penerima_jabatan' => $validated['penerima_jabatan'] ?? null,
                    'keterangan' => $validated['keterangan'] ?? null,
                    'dibuat_oleh' => auth()->id(),
                ]);

                // Attach arsip units
                $beritaAcara->arsipUnits()->attach($validated['arsip_ids']);

                // Load relationships for PDF
                $beritaAcara->load([
                    'unitPengolahAsal',
                    'unitPengolahTujuan',
                    'dibuatOleh',
                    'arsipUnits.kodeKlasifikasi',
                    'arsipUnits.unitPengolah',
                ]);

                $pdf = Pdf::loadView('pdf.berita-acara-penyerahan', compact('beritaAcara'));
                $pdf->setPaper('a4', 'portrait');

                // Replace / dengan - untuk nama file yang valid
                $safeFilename = str_replace('/', '-', $nomorBeritaAcara);

                // Gunakan download() bukan stream() untuk menghindari masalah output buffering
                return $pdf->download('berita-acara-penyerahan-' . $safeFilename . '.pdf');
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Gagal membuat Berita Acara PDF', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'user_id' => auth()->id(),
                'input' => $validated,
            ]);

            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat PDF: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Export existing berita acara to PDF.
     */
    public function exportBeritaAcaraPdf($id)
    {
        $beritaAcara = \App\Models\BeritaAcaraPenyerahan::with([
            'unitPengolahAsal',
            'unitPengolahTujuan',
            'dibuatOleh',
            'arsipUnits.kodeKlasifikasi',
            'arsipUnits.unitPengolah',
        ])->findOrFail($id);

        $pdf = Pdf::loadView('pdf.berita-acara-penyerahan', compact('beritaAcara'));
        $pdf->setPaper('a4', 'portrait');

        // Replace / dengan - untuk nama file yang valid
        $safeFilename = str_replace('/', '-', $beritaAcara->nomor_berita_acara);
        return $pdf->stream('berita-acara-penyerahan-' . $safeFilename . '.pdf');
    }

    // ====================================================================
    // Report 8: Statistik Klasifikasi Arsip
    // ====================================================================

    /**
     * Display the statistik klasifikasi arsip page.
     */
    public function statistikKlasifikasi(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/statistik-klasifikasi', [
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Export statistik klasifikasi arsip to PDF.
     */
    public function exportStatistikKlasifikasiPdf(Request $request)
    {
        $unitPengolahId = $request->input('unit_pengolah_id');
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');

        $baseQuery = function () use ($unitPengolahId, $dariTanggal, $sampaiTanggal) {
            $query = ArsipUnit::query();
            if ($unitPengolahId) {
                $query->where('unit_pengolah_arsip_id', $unitPengolahId);
            }
            if ($dariTanggal) {
                $query->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $query->whereDate('created_at', '<=', $sampaiTanggal);
            }
            return $query;
        };

        $totalArsip = $baseQuery()->count();

        // Group by kode_klasifikasi
        $perKlasifikasi = $baseQuery()
            ->select('kode_klasifikasi_id', DB::raw('count(*) as jumlah'))
            ->groupBy('kode_klasifikasi_id')
            ->orderByDesc('jumlah')
            ->get()
            ->map(function ($item) use ($totalArsip) {
                $kode = KodeKlasifikasi::find($item->kode_klasifikasi_id);
                return [
                    'kode_klasifikasi' => $kode?->kode_klasifikasi ?? '-',
                    'uraian' => $kode?->uraian ?? 'Tidak Diketahui',
                    'jumlah' => $item->jumlah,
                    'persentase' => $totalArsip > 0 ? round(($item->jumlah / $totalArsip) * 100, 1) : 0,
                ];
            });

        // Group by prefix (2 char, e.g. KU, PR, HK)
        $perPrefix = $perKlasifikasi->groupBy(function ($item) {
            return strtoupper(substr($item['kode_klasifikasi'], 0, 2));
        })->map(function ($group, $prefix) use ($totalArsip) {
            $jumlah = $group->sum('jumlah');
            return [
                'prefix' => $prefix,
                'jumlah' => $jumlah,
                'persentase' => $totalArsip > 0 ? round(($jumlah / $totalArsip) * 100, 1) : 0,
                'detail' => $group->values()->toArray(),
            ];
        })->sortByDesc('jumlah')->values();

        $unitPengolah = $unitPengolahId ? UnitPengolah::find($unitPengolahId) : null;

        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.statistik-klasifikasi', compact(
            'perKlasifikasi',
            'perPrefix',
            'totalArsip',
            'unitPengolah',
            'dariTanggal',
            'sampaiTanggal',
            'reportCreator'
        ));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-statistik-klasifikasi-' . date('Y-m-d') . '.pdf');
    }

    // ====================================================================
    // Report 9: Log Aktivitas (Audit Trail)
    // ====================================================================

    /**
     * Display the log aktivitas report page.
     */
    public function logAktivitas(): Response
    {
        return Inertia::render('laporan/log-aktivitas', [
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Export log aktivitas to PDF.
     */
    public function exportLogAktivitasPdf(Request $request)
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        $action = $request->input('action');
        $userId = $request->input('user_id');

        $query = ActivityLog::with('user')->orderByDesc('created_at');

        if ($dariTanggal) {
            $query->whereDate('created_at', '>=', $dariTanggal);
        }
        if ($sampaiTanggal) {
            $query->whereDate('created_at', '<=', $sampaiTanggal);
        }
        if ($action) {
            $query->where('action', $action);
        }
        if ($userId) {
            $query->where('user_id', $userId);
        }

        $logs = $query->limit(500)->get();

        // Summary stats
        $baseQuery = function () use ($dariTanggal, $sampaiTanggal) {
            $q = ActivityLog::query();
            if ($dariTanggal) {
                $q->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $q->whereDate('created_at', '<=', $sampaiTanggal);
            }
            return $q;
        };

        $stats = [
            'total' => $baseQuery()->count(),
            'created' => $baseQuery()->where('action', 'created')->count(),
            'updated' => $baseQuery()->where('action', 'updated')->count(),
            'deleted' => $baseQuery()->where('action', 'deleted')->count(),
            'unique_users' => $baseQuery()->distinct('user_id')->count('user_id'),
        ];

        $perUser = $baseQuery()
            ->select('user_id', DB::raw('count(*) as jumlah'))
            ->groupBy('user_id')
            ->orderByDesc('jumlah')
            ->with('user')
            ->limit(10)
            ->get()
            ->map(fn ($item) => [
                'nama' => $item->user?->name ?? 'Unknown',
                'jumlah' => $item->jumlah,
            ]);

        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.log-aktivitas', compact(
            'logs',
            'stats',
            'perUser',
            'dariTanggal',
            'sampaiTanggal',
            'action',
            'reportCreator'
        ));
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-log-aktivitas-' . date('Y-m-d') . '.pdf');
    }

    // ====================================================================
    // Report 10: Statistik OCR & AI
    // ====================================================================

    /**
     * Display the statistik OCR & AI report page.
     */
    public function statistikOcr(): Response
    {
        return Inertia::render('laporan/statistik-ocr', [
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Export statistik OCR & AI to PDF.
     */
    public function exportStatistikOcrPdf(Request $request)
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');

        $baseQuery = function () use ($dariTanggal, $sampaiTanggal) {
            $query = ArsipUnit::query();
            if ($dariTanggal) {
                $query->whereDate('created_at', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $query->whereDate('created_at', '<=', $sampaiTanggal);
            }
            return $query;
        };

        $totalArsip = $baseQuery()->count();

        // OCR stats
        $ocrCompleted = $baseQuery()->where('ocr_status', 'completed')->count();
        $ocrPending = $baseQuery()->where(function ($q) {
            $q->whereNull('ocr_status')->orWhere('ocr_status', 'pending');
        })->count();
        $ocrProcessing = $baseQuery()->where('ocr_status', 'processing')->count();
        $ocrFailed = $baseQuery()->where('ocr_status', 'failed')->count();
        $avgOcrConfidence = $baseQuery()->where('ocr_status', 'completed')->avg('ocr_confidence');

        // AI classification stats
        $aiSuggested = $baseQuery()->whereNotNull('suggested_kode_klasifikasi_id')->count();
        $aiAccepted = $baseQuery()->where('ai_suggestion_status', 'accepted')->count();
        $aiRejected = $baseQuery()->where('ai_suggestion_status', 'rejected')->count();
        $aiPending = $baseQuery()->whereNotNull('suggested_kode_klasifikasi_id')
            ->whereNull('ai_suggestion_status')->count();
        $avgAiConfidence = $baseQuery()->whereNotNull('ai_confidence_score')->avg('ai_confidence_score');

        // Confidence distribution
        $confidenceBuckets = [];
        foreach (['0-20', '20-40', '40-60', '60-80', '80-100'] as $bucket) {
            [$min, $max] = explode('-', $bucket);
            $count = $baseQuery()
                ->where('ocr_status', 'completed')
                ->whereBetween('ocr_confidence', [(float) $min, (float) $max])
                ->count();
            $confidenceBuckets[] = ['range' => $bucket . '%', 'count' => $count];
        }

        // AI confidence distribution
        $aiConfidenceBuckets = [];
        foreach (['0-20', '20-40', '40-60', '60-80', '80-100'] as $bucket) {
            [$min, $max] = explode('-', $bucket);
            $count = $baseQuery()
                ->whereNotNull('ai_confidence_score')
                ->whereBetween('ai_confidence_score', [(float) $min, (float) $max])
                ->count();
            $aiConfidenceBuckets[] = ['range' => $bucket . '%', 'count' => $count];
        }

        $ocrStats = [
            'total_arsip' => $totalArsip,
            'completed' => $ocrCompleted,
            'pending' => $ocrPending,
            'processing' => $ocrProcessing,
            'failed' => $ocrFailed,
            'avg_confidence' => $avgOcrConfidence ? round($avgOcrConfidence, 1) : 0,
            'success_rate' => ($ocrCompleted + $ocrFailed) > 0
                ? round(($ocrCompleted / ($ocrCompleted + $ocrFailed)) * 100, 1) : 0,
        ];

        $aiStats = [
            'total_suggested' => $aiSuggested,
            'accepted' => $aiAccepted,
            'rejected' => $aiRejected,
            'pending' => $aiPending,
            'avg_confidence' => $avgAiConfidence ? round($avgAiConfidence, 1) : 0,
            'acceptance_rate' => ($aiAccepted + $aiRejected) > 0
                ? round(($aiAccepted / ($aiAccepted + $aiRejected)) * 100, 1) : 0,
        ];

        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.statistik-ocr', compact(
            'ocrStats',
            'aiStats',
            'confidenceBuckets',
            'aiConfidenceBuckets',
            'dariTanggal',
            'sampaiTanggal',
            'reportCreator'
        ));
        $pdf->setPaper('a4', 'portrait');

        return $pdf->stream('laporan-statistik-ocr-ai-' . date('Y-m-d') . '.pdf');
    }

    // ====================================================================
    // Report 11: Laporan Peminjaman / Pengembalian Arsip
    // ====================================================================

    /**
     * Display the laporan peminjaman page.
     */
    public function laporanPeminjaman(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/peminjaman', [
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $this->getUserUnitPengolahId(),
        ]);
    }

    /**
     * Export laporan peminjaman/pengembalian to PDF.
     */
    public function exportLaporanPeminjamanPdf(Request $request)
    {
        $filterStatus = $request->input('status');
        $unitPengolahId = $request->input('unit_pengolah_id');
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');

        // Auto-update status terlambat
        \App\Models\PeminjamanArsip::where('status', 'dipinjam')
            ->whereDate('tanggal_harus_kembali', '<', now())
            ->update(['status' => 'terlambat']);

        $baseQuery = function () use ($unitPengolahId, $dariTanggal, $sampaiTanggal) {
            $query = \App\Models\PeminjamanArsip::with([
                'arsipUnit.kodeKlasifikasi',
                'arsipUnit.unitPengolah',
                'peminjam',
                'unitPengolah',
                'dicatatOleh',
                'dikembalikanOleh',
            ]);

            if ($unitPengolahId) {
                $query->where('unit_pengolah_id', $unitPengolahId);
            }
            if ($dariTanggal) {
                $query->whereDate('tanggal_pinjam', '>=', $dariTanggal);
            }
            if ($sampaiTanggal) {
                $query->whereDate('tanggal_pinjam', '<=', $sampaiTanggal);
            }

            return $query;
        };

        // Statistics
        $stats = [
            'total' => $baseQuery()->count(),
            'dipinjam' => $baseQuery()->where('status', 'dipinjam')->count(),
            'dikembalikan' => $baseQuery()->where('status', 'dikembalikan')->count(),
            'terlambat' => $baseQuery()->where('status', 'terlambat')->count(),
        ];

        // Get data
        if ($filterStatus) {
            $peminjaman = $baseQuery()->where('status', $filterStatus)->orderByDesc('tanggal_pinjam')->get();
        } else {
            $peminjaman = $baseQuery()->orderByDesc('tanggal_pinjam')->get();
        }

        $unitPengolah = $unitPengolahId ? UnitPengolah::find($unitPengolahId) : null;

        $reportCreator = $this->getReportCreator($request);

        $pdf = Pdf::loadView('pdf.laporan-peminjaman', compact(
            'peminjaman',
            'stats',
            'filterStatus',
            'unitPengolah',
            'dariTanggal',
            'sampaiTanggal',
            'reportCreator'
        ));
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('laporan-peminjaman-' . date('Y-m-d') . '.pdf');
    }
}
