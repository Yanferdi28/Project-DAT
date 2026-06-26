<?php

namespace App\Http\Controllers;

use App\Http\Requests\ArsipUnitStoreRequest;
use App\Http\Requests\ArsipUnitUpdateRequest;
use App\Jobs\ProcessOcrJob;
use App\Models\ActivityLog;
use App\Models\ArsipUnit;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use App\Models\BerkasArsip;
use App\Models\Kategori;
use App\Models\SubKategori;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Gate;

class ArsipUnitController extends Controller
{
    // Removed checkRestrictedRole as we now use Policies

    /**
     * Get the unit pengolah ID for filtering based on user role.
     * Returns null for admin (can see all), or user's unit_pengolah_id for regular users.
     */
    private function getUserUnitPengolahId(): ?int
    {
        $user = auth()->user();
        // Admin can see all, users with unit_pengolah_id can only see their own unit
        if ($user->role === 'admin') {
            return null;
        }
        return $user->unit_pengolah_id;
    }

    /**
     * Mark AI feedback as corrected when a user chooses a different final code.
     */
    private function applyAiCorrectionStatus(array $validated, ArsipUnit $arsipUnit): array
    {
        if (
            !$arsipUnit->suggested_kode_klasifikasi_id
            || !array_key_exists('kode_klasifikasi_id', $validated)
        ) {
            return $validated;
        }

        $selectedKodeId = (int) $validated['kode_klasifikasi_id'];
        $suggestedKodeId = (int) $arsipUnit->suggested_kode_klasifikasi_id;

        if ($selectedKodeId !== $suggestedKodeId) {
            $validated['ai_suggestion_status'] = 'corrected';
        }

        return $validated;
    }

    /**
     * Keep klasifikasi keamanan aligned with Kode Klasifikasi.
     */
    private function applyKlasifikasiKeamanan(array $validated): array
    {
        if (empty($validated['kode_klasifikasi_id'])) {
            return $validated;
        }

        $klasifikasiKeamanan = KodeKlasifikasi::whereKey($validated['kode_klasifikasi_id'])
            ->value('klasifikasi_keamanan');

        if ($klasifikasiKeamanan) {
            $validated['klasifikasi_keamanan'] = $klasifikasiKeamanan;
        }

        return $validated;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user();
        $userUnitPengolahId = $this->getUserUnitPengolahId();

        $query = ArsipUnit::with([
            'kodeKlasifikasi:id,kode_klasifikasi,uraian',
            'unitPengolah:id,nama_unit',
            'berkasArsip:nomor_berkas,nama_berkas',
            'kategori:id,nama_kategori',
            'subKategori:id,nama_sub_kategori,kategori_id'
        ]);

        // Users can now see all arsip units (no filter by unit_pengolah)
        // But edit/delete is restricted in their respective methods

        // Search
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('no_item_arsip', 'like', "%{$search}%")
                    ->orWhere('uraian_informasi', 'like', "%{$search}%")
                    ->orWhere('indeks', 'like', "%{$search}%")
                    ->orWhereHas('kodeKlasifikasi', function ($q) use ($search) {
                        $q->where('kode_klasifikasi', 'like', "%{$search}%")
                            ->orWhere('uraian', 'like', "%{$search}%");
                    });
            });
        }

        // Search by document content (OCR extracted text)
        if ($request->has('content_search') && $request->content_search != '') {
            $query->searchByContent($request->content_search);
        }

        // Filter by publish_status
        if ($request->has('publish_status') && $request->publish_status != '') {
            $query->where('publish_status', $request->publish_status);
        }

        $statusSummaryQuery = clone $query;
        $statusCounts = (clone $statusSummaryQuery)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $statusSummary = [
            'total' => (clone $statusSummaryQuery)->count(),
            'diterima' => (int) ($statusCounts['diterima'] ?? 0),
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'ditolak' => (int) ($statusCounts['ditolak'] ?? 0),
        ];

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        $perPage = $request->input('per_page', 10);
        $arsipUnits = $query->oldest()->paginate($perPage)->withQueryString();

        // For berkasArsips, show all berkas for assignment (no unit_pengolah restriction)
        // This allows users to assign arsip to any berkas
        $berkasArsipsQuery = BerkasArsip::select('nomor_berkas', 'nama_berkas', 'klasifikasi_id', 'unit_pengolah_id')
            ->with(['kodeKlasifikasi:id,kode_klasifikasi,uraian', 'unitPengolah:id,nama_unit']);

        return Inertia::render('arsip-unit/index', [
            'arsipUnits' => $arsipUnits,
            'filters' => array_merge($request->only(['search', 'content_search', 'status', 'publish_status']), ['per_page' => $perPage]),
            'statusSummary' => $statusSummary,
            'berkasArsips' => Inertia::lazy(fn() => $berkasArsipsQuery->orderBy('nama_berkas')->get()),
            'unitPengolahs' => Inertia::lazy(fn() => UnitPengolah::select('id', 'nama_unit')->orderBy('nama_unit')->get()),
            'userUnitPengolahId' => $userUnitPengolahId,
            'ocrEnabled' => config('ocr.enabled', true),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        Gate::authorize('create', ArsipUnit::class);

        $userUnitPengolahId = $this->getUserUnitPengolahId();

        return Inertia::render('arsip-unit/create', [
            'kodeKlasifikasis' => KodeKlasifikasi::select('id', 'kode_klasifikasi', 'uraian', 'retensi_aktif', 'retensi_inaktif', 'status_akhir', 'klasifikasi_keamanan')
                ->orderBy('kode_klasifikasi')
                ->get(),
            'unitPengolahs' => UnitPengolah::all(),
            'kategoris' => Kategori::all(),
            'subKategoris' => SubKategori::with('kategori')->get(),
            'userUnitPengolahId' => $userUnitPengolahId,
            'ocrEnabled' => config('ocr.enabled', true),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ArsipUnitStoreRequest $request): RedirectResponse
    {
        Gate::authorize('create', ArsipUnit::class);
        $user = auth()->user();
        $userUnitPengolahId = $this->getUserUnitPengolahId();

        // If user has unit_pengolah restriction, force the unit_pengolah_arsip_id to their unit
        if ($userUnitPengolahId !== null) {
            $request->merge(['unit_pengolah_arsip_id' => $userUnitPengolahId]);
        }

        $validated = $request->validated();
        $validated = $this->applyKlasifikasiKeamanan($validated);

        // Handle file upload
        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $filename = uniqid('arsip_', true) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('dokumen-arsip', $filename, 'public');
            $validated['dokumen'] = $path;
        }

        // Set default status and publish_status
        $validated['status'] = 'pending';
        $validated['publish_status'] = 'draft';

        $arsipUnit = ArsipUnit::create($validated);

        // Dispatch OCR job if document was uploaded and OCR is enabled
        if ($arsipUnit->dokumen && config('ocr.enabled', true) && $arsipUnit->isOcrEligible()) {
            $arsipUnit->update(['ocr_status' => 'pending']);
            ProcessOcrJob::dispatch($arsipUnit->id_berkas);
        }

        return redirect()->route('arsip-unit.index')
            ->with('success', 'Arsip unit berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ArsipUnit $arsipUnit): Response
    {
        // Users can view any arsip unit (no restriction)
        // Edit/delete is restricted in their respective methods

        $arsipUnit->load([
            'kodeKlasifikasi',
            'unitPengolah',
            'berkasArsip',
            'kategori',
            'subKategori',
            'verifiedBy',
            'verifikasiOleh',
            'suggestedKodeKlasifikasi',
        ]);

        $userUnitPengolahId = $this->getUserUnitPengolahId();

        return Inertia::render('arsip-unit/show', [
            'arsipUnit' => $arsipUnit,
            'userUnitPengolahId' => $userUnitPengolahId,
            'ocrEnabled' => config('ocr.enabled', true),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ArsipUnit $arsipUnit): Response
    {
        Gate::authorize('update', $arsipUnit);

        $userUnitPengolahId = $this->getUserUnitPengolahId();

        return Inertia::render('arsip-unit/edit', [
            'arsipUnit' => $arsipUnit,
            'kodeKlasifikasis' => KodeKlasifikasi::select('id', 'kode_klasifikasi', 'uraian', 'retensi_aktif', 'retensi_inaktif', 'status_akhir', 'klasifikasi_keamanan')
                ->orderBy('kode_klasifikasi')
                ->get(),
            'unitPengolahs' => UnitPengolah::all(),
            'kategoris' => Kategori::all(),
            'subKategoris' => SubKategori::with('kategori')->get(),
            'userUnitPengolahId' => $userUnitPengolahId,
            'ocrEnabled' => config('ocr.enabled', true),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(ArsipUnitUpdateRequest $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        Gate::authorize('update', $arsipUnit);
        $userUnitPengolahId = $this->getUserUnitPengolahId();

        // If user has unit_pengolah restriction, force the unit_pengolah_arsip_id to their unit
        if ($userUnitPengolahId !== null) {
            $request->merge(['unit_pengolah_arsip_id' => $userUnitPengolahId]);
        }

        $validated = $request->validated();
        $validated = $this->applyAiCorrectionStatus($validated, $arsipUnit);
        $validated = $this->applyKlasifikasiKeamanan($validated);

        // Handle file upload
        $newFileUploaded = false;
        if ($request->hasFile('dokumen')) {
            // Delete old file if exists
            if ($arsipUnit->dokumen && Storage::disk('public')->exists($arsipUnit->dokumen)) {
                Storage::disk('public')->delete($arsipUnit->dokumen);
            }

            $file = $request->file('dokumen');
            $filename = uniqid('arsip_', true) . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('dokumen-arsip', $filename, 'public');
            $validated['dokumen'] = $path;
            $newFileUploaded = true;
        }

        $arsipUnit->update($validated);

        // Re-process OCR if a new file was uploaded
        if ($newFileUploaded && config('ocr.enabled', true) && $arsipUnit->isOcrEligible()) {
            $arsipUnit->update([
                'ocr_status' => 'pending',
                'extracted_text' => null,
                'ocr_confidence' => null,
                'ocr_error' => null,
                'suggested_kode_klasifikasi_id' => null,
                'ai_confidence_score' => null,
                'ai_suggestion_status' => null,
            ]);
            ProcessOcrJob::dispatch($arsipUnit->id_berkas);
        }

        return redirect()->route('arsip-unit.index')
            ->with('success', 'Arsip unit berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArsipUnit $arsipUnit): RedirectResponse
    {
        Gate::authorize('delete', $arsipUnit);

        $arsipUnit->delete();

        return redirect()->route('arsip-unit.index')
            ->with('success', 'Arsip unit berhasil dihapus.');
    }

    /**
     * Update the status of the specified resource.
     */
    public function updateStatus(Request $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,diterima,ditolak',
            'verifikasi_keterangan' => 'nullable|string|max:1000',
        ]);

        $updateData = [
            'status' => $validated['status'],
            'verifikasi_oleh' => auth()->id(),
            'verifikasi_tanggal' => now(),
        ];

        // Add rejection reason if status is ditolak
        if ($validated['status'] === 'ditolak' && !empty($validated['verifikasi_keterangan'])) {
            $updateData['verifikasi_keterangan'] = $validated['verifikasi_keterangan'];
        } else if ($validated['status'] !== 'ditolak') {
            // Clear rejection reason if status is not ditolak
            $updateData['verifikasi_keterangan'] = null;
        }

        $oldStatus = $arsipUnit->status;
        $arsipUnit->update($updateData);

        ActivityLog::log(
            'status_changed',
            "Status Arsip Unit {$arsipUnit->indeks} diubah dari {$oldStatus} menjadi {$validated['status']}",
            $arsipUnit,
            ['status' => $oldStatus],
            ['status' => $validated['status']],
        );

        $statusMessages = [
            'pending' => 'Status berhasil diubah menjadi pending.',
            'diterima' => 'Arsip unit berhasil diterima.',
            'ditolak' => 'Arsip unit berhasil ditolak.',
        ];

        return redirect()->back()
            ->with('success', $statusMessages[$validated['status']] ?? 'Status berhasil diperbarui.');
    }

    /**
     * Update the publish status of the specified resource.
     */
    public function updatePublishStatus(Request $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        $validated = $request->validate([
            'publish_status' => 'required|in:draft,published,archived',
        ]);

        $oldPublishStatus = $arsipUnit->publish_status;
        $arsipUnit->update($validated);

        ActivityLog::log(
            'published',
            "Status publikasi Arsip Unit {$arsipUnit->indeks} diubah dari {$oldPublishStatus} menjadi {$validated['publish_status']}",
            $arsipUnit,
            ['publish_status' => $oldPublishStatus],
            ['publish_status' => $validated['publish_status']],
        );

        return redirect()->back()
            ->with('success', 'Status publikasi berhasil diperbarui.');
    }

    /**
     * Assign arsip unit to berkas arsip.
     */
    public function assignToBerkas(Request $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        $validated = $request->validate([
            'berkas_arsip_id' => 'required|exists:berkas_arsip,nomor_berkas',
        ]);

        $arsipUnit->update($validated);

        return redirect()->back()
            ->with('success', 'Arsip unit berhasil dimasukkan ke berkas arsip.');
    }

    /**
     * Display print preview page for arsip unit.
     */
    public function printPreview(Request $request): Response
    {
        $userUnitPengolahId = $this->getUserUnitPengolahId();

        $query = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah']);

        // Users can now see all arsip units (no filter by unit_pengolah)

        // Filter tanggal
        if ($request->has('dari_tanggal') && $request->dari_tanggal != '') {
            $query->where('tanggal', '>=', $request->dari_tanggal);
        }

        if ($request->has('sampai_tanggal') && $request->sampai_tanggal != '') {
            $query->where('tanggal', '<=', $request->sampai_tanggal);
        }

        // Filter status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter unit pengolah (available for all users)
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $query->where('unit_pengolah_arsip_id', $request->unit_pengolah_id);
        }

        $arsipUnits = $query->orderBy('tanggal', 'asc')->get();

        // Get logged-in user's unit pengolah for display
        $user = auth()->user();
        $userUnitPengolah = $user->unitPengolah;

        return Inertia::render('arsip-unit/print-preview', [
            'arsipUnits' => $arsipUnits,
            'unitPengolahs' => UnitPengolah::all(),
            'filters' => $request->only(['dari_tanggal', 'sampai_tanggal', 'status', 'unit_pengolah_id']),
            'userUnitPengolahId' => $userUnitPengolahId,
            'userUnitPengolah' => $userUnitPengolah,
            'userName' => $user->name,
        ]);
    }

    /**
     * Export arsip unit to PDF.
     */
    public function exportPdf(Request $request)
    {
        $query = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah']);

        // Filter tanggal
        if ($request->has('dari_tanggal') && $request->dari_tanggal != '') {
            $query->where('tanggal', '>=', $request->dari_tanggal);
        }

        if ($request->has('sampai_tanggal') && $request->sampai_tanggal != '') {
            $query->where('tanggal', '<=', $request->sampai_tanggal);
        }

        // Filter status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter unit pengolah
        $unitPengolah = null;
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $query->where('unit_pengolah_arsip_id', $request->unit_pengolah_id);
            $unitPengolahModel = UnitPengolah::find($request->unit_pengolah_id);
            $unitPengolah = $unitPengolahModel ? $unitPengolahModel->nama_unit : null;
        }

        $arsipUnits = $query->orderBy('tanggal', 'asc')->get();

        // Build periode string
        $periode = null;
        if ($request->dari_tanggal || $request->sampai_tanggal) {
            $dari = $request->dari_tanggal ? \Carbon\Carbon::parse($request->dari_tanggal)->translatedFormat('d F Y') : '-';
            $sampai = $request->sampai_tanggal ? \Carbon\Carbon::parse($request->sampai_tanggal)->translatedFormat('d F Y') : '-';
            $periode = $dari . ' - ' . $sampai;
        }

        $reportCreator = $request->user()->loadMissing('unitPengolah');

        $pdf = Pdf::loadView('pdf.arsip-unit', compact('arsipUnits', 'unitPengolah', 'periode', 'reportCreator'));
        $pdf->setPaper('a4', 'landscape');

        return $pdf->stream('arsip-unit-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Preview file inline (for PDF and other documents).
     */
    public function previewFile(string $path)
    {
        // Prevent path traversal attacks
        if (str_contains($path, '..') || str_starts_with($path, '/') || str_starts_with($path, '\\')) {
            abort(403, 'Akses ditolak.');
        }

        // Check if file exists
        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan.');
        }

        // Verify the resolved path is within the storage directory
        $fullPath = Storage::disk('public')->path($path);
        $storagePath = realpath(Storage::disk('public')->path(''));
        $realFullPath = realpath($fullPath);

        if ($realFullPath === false || !str_starts_with($realFullPath, $storagePath)) {
            abort(403, 'Akses ditolak.');
        }
        $filename = basename($path);
        $extension = strtolower(pathinfo($filename, PATHINFO_EXTENSION));

        // Determine mime type based on extension for reliability
        $mimeTypes = [
            'pdf' => 'application/pdf',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png' => 'image/png',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'doc' => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls' => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ];

        $mimeType = $mimeTypes[$extension] ?? (mime_content_type($fullPath) ?: 'application/octet-stream');

        return response()->file($fullPath, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $filename . '"',
            'X-Content-Type-Options' => 'nosniff',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
