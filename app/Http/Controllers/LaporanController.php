<?php

namespace App\Http\Controllers;

use App\Models\ArsipUnit;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Barryvdh\DomPDF\Facade\Pdf;

class LaporanController extends Controller
{
    /**
     * Display the penyusutan report page.
     */
    public function penyusutan(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('laporan/penyusutan', [
            'unitPengolahs' => $unitPengolahs,
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
        
        $pdf = Pdf::loadView('pdf.arsip-status-verifikasi', compact(
            'arsipUnits',
            'arsipPending',
            'arsipDiterima',
            'arsipDitolak',
            'stats',
            'filterStatus',
            'unitPengolah',
            'dariTanggal',
            'sampaiTanggal'
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
        
        // Get arsip yang statusnya "diterima" dan belum pernah diserahkan
        $arsipUnits = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah'])
            ->where('status', 'diterima')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('laporan/berita-acara-penyerahan', [
            'unitPengolahs' => $unitPengolahs,
            'arsipUnits' => $arsipUnits,
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
        return $pdf->stream('berita-acara-penyerahan-' . $safeFilename . '.pdf');
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
}
