<?php

namespace App\Http\Controllers;

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

class ArsipUnitController extends Controller
{
    /**
     * Check if the current user has permission to perform the action.
     */
    private function checkRestrictedRole(): void
    {
        if (in_array(auth()->user()->role, ['management', 'operator'])) {
            abort(403, 'Unauthorized action.');
        }
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $query = ArsipUnit::with([
            'kodeKlasifikasi',
            'unitPengolah',
            'berkasArsip',
            'kategori',
            'subKategori'
        ]);

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

        // Filter by status
        if ($request->has('status') && $request->status != '') {
            $query->where('status', $request->status);
        }

        // Filter by publish_status
        if ($request->has('publish_status') && $request->publish_status != '') {
            $query->where('publish_status', $request->publish_status);
        }

        $arsipUnits = $query->oldest()->paginate(10)->withQueryString();

        return Inertia::render('arsip-unit/index', [
            'arsipUnits' => $arsipUnits,
            'filters' => $request->only(['search', 'status', 'publish_status']),
            'berkasArsips' => BerkasArsip::with(['kodeKlasifikasi', 'unitPengolah'])
                ->orderBy('nama_berkas')
                ->get(),
            'unitPengolahs' => UnitPengolah::orderBy('nama_unit')->get(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        $this->checkRestrictedRole();
        
        return Inertia::render('arsip-unit/create', [
            'kodeKlasifikasis' => KodeKlasifikasi::select('id', 'kode_klasifikasi', 'uraian', 'retensi_aktif', 'retensi_inaktif', 'status_akhir')
                ->orderBy('kode_klasifikasi')
                ->get(),
            'unitPengolahs' => UnitPengolah::all(),
            'kategoris' => Kategori::all(),
            'subKategoris' => SubKategori::with('kategori')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $this->checkRestrictedRole();
        
        $validated = $request->validate([
            'kode_klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_arsip_id' => 'required|exists:unit_pengolah,id',
            'kategori_id' => 'required|exists:kategori,id',
            'sub_kategori_id' => 'required|exists:sub_kategori,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'indeks' => 'nullable|string|max:255',
            'uraian_informasi' => 'required|string',
            'tanggal' => 'required|date',
            'jumlah_nilai' => 'required|integer|min:1',
            'jumlah_satuan' => 'required|in:lembar,jilid,bundle',
            'tingkat_perkembangan' => 'required|in:asli,salinan,tembusan,pertinggal',
            'skkaad' => 'nullable|string|max:255',
            'ruangan' => 'nullable|string|max:255',
            'no_filling' => 'nullable|string|max:255',
            'no_laci' => 'nullable|string|max:255',
            'no_folder' => 'nullable|string|max:255',
            'no_box' => 'nullable|string|max:255',
            'dokumen' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'keterangan' => 'nullable|string',
        ]);

        // Handle file upload
        if ($request->hasFile('dokumen')) {
            $file = $request->file('dokumen');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('dokumen-arsip', $filename, 'public');
            $validated['dokumen'] = $path;
        }

        // Set default status and publish_status
        $validated['status'] = 'pending';
        $validated['publish_status'] = 'draft';

        ArsipUnit::create($validated);

        return redirect()->route('arsip-unit.index')
            ->with('success', 'Arsip unit berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ArsipUnit $arsipUnit): Response
    {
        $arsipUnit->load([
            'kodeKlasifikasi',
            'unitPengolah',
            'berkasArsip',
            'kategori',
            'subKategori',
            'verifiedBy',
            'verifikasiOleh'
        ]);

        return Inertia::render('arsip-unit/show', [
            'arsipUnit' => $arsipUnit,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ArsipUnit $arsipUnit): Response
    {
        $this->checkRestrictedRole();
        
        return Inertia::render('arsip-unit/edit', [
            'arsipUnit' => $arsipUnit,
            'kodeKlasifikasis' => KodeKlasifikasi::select('id', 'kode_klasifikasi', 'uraian', 'retensi_aktif', 'retensi_inaktif', 'status_akhir')
                ->orderBy('kode_klasifikasi')
                ->get(),
            'unitPengolahs' => UnitPengolah::all(),
            'kategoris' => Kategori::all(),
            'subKategoris' => SubKategori::with('kategori')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        $this->checkRestrictedRole();
        
        $validated = $request->validate([
            'kode_klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_arsip_id' => 'required|exists:unit_pengolah,id',
            'kategori_id' => 'required|exists:kategori,id',
            'sub_kategori_id' => 'required|exists:sub_kategori,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'indeks' => 'nullable|string|max:255',
            'uraian_informasi' => 'required|string',
            'tanggal' => 'required|date',
            'jumlah_nilai' => 'required|integer|min:1',
            'jumlah_satuan' => 'required|in:lembar,jilid,bundle',
            'tingkat_perkembangan' => 'required|in:asli,salinan,tembusan,pertinggal',
            'skkaad' => 'nullable|string|max:255',
            'ruangan' => 'nullable|string|max:255',
            'no_filling' => 'nullable|string|max:255',
            'no_laci' => 'nullable|string|max:255',
            'no_folder' => 'nullable|string|max:255',
            'no_box' => 'nullable|string|max:255',
            'dokumen' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png|max:10240',
            'keterangan' => 'nullable|string',
        ]);

        // Handle file upload
        if ($request->hasFile('dokumen')) {
            // Delete old file if exists
            if ($arsipUnit->dokumen && Storage::disk('public')->exists($arsipUnit->dokumen)) {
                Storage::disk('public')->delete($arsipUnit->dokumen);
            }
            
            $file = $request->file('dokumen');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('dokumen-arsip', $filename, 'public');
            $validated['dokumen'] = $path;
        }

        $arsipUnit->update($validated);

        return redirect()->route('arsip-unit.index')
            ->with('success', 'Arsip unit berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ArsipUnit $arsipUnit): RedirectResponse
    {
        $this->checkRestrictedRole();
        
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
        ]);

        $arsipUnit->update($validated);

        return redirect()->back()
            ->with('success', 'Status berhasil diperbarui.');
    }

    /**
     * Update the publish status of the specified resource.
     */
    public function updatePublishStatus(Request $request, ArsipUnit $arsipUnit): RedirectResponse
    {
        $validated = $request->validate([
            'publish_status' => 'required|in:draft,published,archived',
        ]);

        $arsipUnit->update($validated);

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

        // Validate that berkas arsip has matching kode_klasifikasi and unit_pengolah
        $berkasArsip = BerkasArsip::find($validated['berkas_arsip_id']);
        
        if ($berkasArsip->klasifikasi_id !== $arsipUnit->kode_klasifikasi_id) {
            return redirect()->back()
                ->with('error', 'Kode klasifikasi berkas arsip tidak sesuai dengan arsip unit.');
        }

        if ($berkasArsip->unit_pengolah_id !== $arsipUnit->unit_pengolah_arsip_id) {
            return redirect()->back()
                ->with('error', 'Unit pengolah berkas arsip tidak sesuai dengan arsip unit.');
        }

        $arsipUnit->update($validated);

        return redirect()->back()
            ->with('success', 'Arsip unit berhasil dimasukkan ke berkas arsip.');
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
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $query->where('unit_pengolah_arsip_id', $request->unit_pengolah_id);
        }

        $arsipUnits = $query->orderBy('tanggal', 'asc')->get();

        $pdf = Pdf::loadView('pdf.arsip-unit', compact('arsipUnits'));
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->stream('arsip-unit-' . date('Y-m-d') . '.pdf');
    }
}
