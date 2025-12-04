<?php

namespace App\Http\Controllers;

use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class BerkasArsipController extends Controller
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
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $filterKlasifikasi = $request->input('klasifikasi_id');
        $filterUnitPengolah = $request->input('unit_pengolah_id');
        $perPage = $request->input('per_page', 10);
        
        $userUnitPengolahId = $this->getUserUnitPengolahId();

        $berkasArsips = BerkasArsip::with(['kodeKlasifikasi', 'unitPengolah'])
            ->withCount('arsipUnits')
            // If user has unit_pengolah restriction, filter by it
            ->when($userUnitPengolahId !== null, function ($query) use ($userUnitPengolahId) {
                $query->where('unit_pengolah_id', $userUnitPengolahId);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_berkas', 'like', "%{$search}%")
                        ->orWhere('uraian', 'like', "%{$search}%")
                        ->orWhere('lokasi_fisik', 'like', "%{$search}%");
                });
            })
            ->when($filterKlasifikasi, function ($query, $filterKlasifikasi) {
                $query->where('klasifikasi_id', $filterKlasifikasi);
            })
            // Only apply manual unit_pengolah filter if user is admin
            ->when($filterUnitPengolah && $userUnitPengolahId === null, function ($query) use ($filterUnitPengolah) {
                $query->where('unit_pengolah_id', $filterUnitPengolah);
            })
            ->oldest('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $kodeKlasifikasis = KodeKlasifikasi::orderBy('kode_klasifikasi')->get();
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('berkas-arsip/index', [
            'berkasArsips' => $berkasArsips,
            'kodeKlasifikasis' => $kodeKlasifikasis,
            'unitPengolahs' => $unitPengolahs,
            'filters' => [
                'search' => $search,
                'klasifikasi_id' => $filterKlasifikasi,
                'unit_pengolah_id' => $filterUnitPengolah,
                'per_page' => $perPage,
            ],
            'userUnitPengolahId' => $userUnitPengolahId,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $this->checkRestrictedRole();
        
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        $kodeKlasifikasis = KodeKlasifikasi::orderBy('kode_klasifikasi')->get();
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('berkas-arsip/create', [
            'kodeKlasifikasis' => $kodeKlasifikasis,
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $userUnitPengolahId,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->checkRestrictedRole();
        
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        
        // If user has unit_pengolah restriction, force the unit_pengolah_id to their unit
        if ($userUnitPengolahId !== null) {
            $request->merge(['unit_pengolah_id' => $userUnitPengolahId]);
        }
        
        $validated = $request->validate([
            'nama_berkas' => 'required|string|max:255',
            'klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_id' => 'nullable|exists:unit_pengolah,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'penyusutan_akhir' => 'nullable|string|max:255',
            'lokasi_fisik' => 'nullable|string|max:255',
            'uraian' => 'nullable|string',
        ]);

        BerkasArsip::create($validated);

        // Check if user wants to create another
        if ($request->boolean('create_another')) {
            return redirect()->route('berkas-arsip.create')
                ->with('success', 'Berkas arsip berhasil ditambahkan. Silakan buat berkas arsip baru.');
        }

        return redirect()->route('berkas-arsip.index')
            ->with('success', 'Berkas arsip berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(BerkasArsip $berkasArsip)
    {
        // Check if user has permission to view this berkas arsip
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        if ($userUnitPengolahId !== null && $berkasArsip->unit_pengolah_id !== $userUnitPengolahId) {
            abort(403, 'Anda tidak memiliki akses ke berkas arsip ini.');
        }
        
        $berkasArsip->load([
            'kodeKlasifikasi', 
            'unitPengolah', 
            'arsipUnits' => function ($query) {
                $query->orderBy('created_at', 'asc');
            },
            'arsipUnits.kodeKlasifikasi',
            'arsipUnits.unitPengolah',
            'arsipUnits.kategori',
            'arsipUnits.subKategori',
        ]);

        // Get available arsip units that can be added to this berkas
        // Must have same kode_klasifikasi and unit_pengolah, and not already in this berkas
        $availableArsipUnits = \App\Models\ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah'])
            ->where('kode_klasifikasi_id', $berkasArsip->klasifikasi_id)
            ->where('unit_pengolah_arsip_id', $berkasArsip->unit_pengolah_id)
            ->where(function ($query) use ($berkasArsip) {
                $query->whereNull('berkas_arsip_id')
                    ->orWhere('berkas_arsip_id', '!=', $berkasArsip->nomor_berkas);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('berkas-arsip/show', [
            'berkasArsip' => $berkasArsip,
            'availableArsipUnits' => $availableArsipUnits,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(BerkasArsip $berkasArsip)
    {
        $this->checkRestrictedRole();
        
        // Check if user has permission to edit this berkas arsip
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        if ($userUnitPengolahId !== null && $berkasArsip->unit_pengolah_id !== $userUnitPengolahId) {
            abort(403, 'Anda tidak memiliki akses untuk mengedit berkas arsip ini.');
        }
        
        $berkasArsip->load(['kodeKlasifikasi', 'unitPengolah']);
        $kodeKlasifikasis = KodeKlasifikasi::orderBy('kode_klasifikasi')->get();
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        return Inertia::render('berkas-arsip/edit', [
            'berkasArsip' => $berkasArsip,
            'kodeKlasifikasis' => $kodeKlasifikasis,
            'unitPengolahs' => $unitPengolahs,
            'userUnitPengolahId' => $userUnitPengolahId,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, BerkasArsip $berkasArsip)
    {
        $this->checkRestrictedRole();
        
        // Check if user has permission to update this berkas arsip
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        if ($userUnitPengolahId !== null && $berkasArsip->unit_pengolah_id !== $userUnitPengolahId) {
            abort(403, 'Anda tidak memiliki akses untuk mengupdate berkas arsip ini.');
        }
        
        // If user has unit_pengolah restriction, force the unit_pengolah_id to their unit
        if ($userUnitPengolahId !== null) {
            $request->merge(['unit_pengolah_id' => $userUnitPengolahId]);
        }
        
        $validated = $request->validate([
            'nama_berkas' => 'required|string|max:255',
            'klasifikasi_id' => 'required|exists:kode_klasifikasi,id',
            'unit_pengolah_id' => 'nullable|exists:unit_pengolah,id',
            'retensi_aktif' => 'nullable|integer|min:0',
            'retensi_inaktif' => 'nullable|integer|min:0',
            'penyusutan_akhir' => 'nullable|string|max:255',
            'lokasi_fisik' => 'nullable|string|max:255',
            'uraian' => 'nullable|string',
        ]);

        $berkasArsip->update($validated);

        return redirect()->route('berkas-arsip.index')
            ->with('success', 'Berkas arsip berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(BerkasArsip $berkasArsip)
    {
        $this->checkRestrictedRole();
        
        // Check if user has permission to delete this berkas arsip
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        if ($userUnitPengolahId !== null && $berkasArsip->unit_pengolah_id !== $userUnitPengolahId) {
            abort(403, 'Anda tidak memiliki akses untuk menghapus berkas arsip ini.');
        }
        
        // Check if berkas has related arsip units
        if ($berkasArsip->arsipUnits()->count() > 0) {
            return back()->with('error', 'Berkas arsip tidak dapat dihapus karena memiliki arsip unit terkait.');
        }

        $berkasArsip->delete();

        return redirect()->route('berkas-arsip.index')
            ->with('success', 'Berkas arsip berhasil dihapus.');
    }

    /**
     * Add arsip unit to berkas arsip.
     */
    public function addArsipUnit(Request $request, BerkasArsip $berkasArsip)
    {
        $this->checkRestrictedRole();
        
        $validated = $request->validate([
            'arsip_unit_id' => 'required|exists:arsip_unit,id_berkas',
        ]);

        $arsipUnit = \App\Models\ArsipUnit::find($validated['arsip_unit_id']);

        // Validate that arsip unit has matching kode_klasifikasi and unit_pengolah
        if ($arsipUnit->kode_klasifikasi_id !== $berkasArsip->klasifikasi_id) {
            return redirect()->back()
                ->with('error', 'Kode klasifikasi arsip unit tidak sesuai dengan berkas arsip.');
        }

        if ($arsipUnit->unit_pengolah_arsip_id !== $berkasArsip->unit_pengolah_id) {
            return redirect()->back()
                ->with('error', 'Unit pengolah arsip unit tidak sesuai dengan berkas arsip.');
        }

        $arsipUnit->update(['berkas_arsip_id' => $berkasArsip->nomor_berkas]);

        return redirect()->back()
            ->with('success', 'Arsip unit berhasil ditambahkan ke berkas arsip.');
    }

    /**
     * Remove arsip unit from berkas arsip.
     */
    public function removeArsipUnit(BerkasArsip $berkasArsip, \App\Models\ArsipUnit $arsipUnit)
    {
        $this->checkRestrictedRole();

        // Verify the arsip unit belongs to this berkas
        if ($arsipUnit->berkas_arsip_id !== $berkasArsip->nomor_berkas) {
            return redirect()->back()
                ->with('error', 'Arsip unit tidak terdaftar dalam berkas arsip ini.');
        }

        $arsipUnit->update(['berkas_arsip_id' => null]);

        return redirect()->back()
            ->with('success', 'Arsip unit berhasil dikeluarkan dari berkas arsip.');
    }

    /**
     * Export berkas arsip to PDF.
     */
    public function exportPdf(Request $request)
    {
        $dariTanggal = $request->input('dari_tanggal');
        $sampaiTanggal = $request->input('sampai_tanggal');
        
        $query = BerkasArsip::withCount('arsipUnits')
            ->with([
                'kodeKlasifikasi', 
                'unitPengolah',
                'arsipUnits' => function($query) {
                    $query->orderBy('created_at', 'asc');
                },
            ]);

        // Apply filters
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_berkas', 'like', "%{$search}%")
                    ->orWhere('uraian', 'like', "%{$search}%")
                    ->orWhere('lokasi_fisik', 'like', "%{$search}%");
            });
        }

        if ($request->has('klasifikasi_id') && $request->klasifikasi_id != '') {
            $query->where('klasifikasi_id', $request->klasifikasi_id);
        }

        // Filter by unit pengolah directly
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $query->where('unit_pengolah_id', $request->unit_pengolah_id);
        }

        // Filter by date range
        if ($dariTanggal) {
            $query->whereDate('created_at', '>=', $dariTanggal);
        }
        if ($sampaiTanggal) {
            $query->whereDate('created_at', '<=', $sampaiTanggal);
        }

        $berkasArsips = $query->orderBy('created_at', 'asc')->get();

        // Get unit pengolah for header
        $unitPengolah = null;
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $unitPengolah = UnitPengolah::find($request->unit_pengolah_id);
        }

        // Get format type
        $format = $request->input('format', 'detail');
        
        if ($format === 'summary') {
            $pdf = Pdf::loadView('pdf.berkas-arsip-summary', compact('berkasArsips', 'unitPengolah', 'dariTanggal', 'sampaiTanggal'));
        } else {
            $pdf = Pdf::loadView('pdf.berkas-arsip-detail', compact('berkasArsips', 'unitPengolah', 'dariTanggal', 'sampaiTanggal'));
        }
        
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->stream('berkas-arsip-' . $format . '-' . date('Y-m-d') . '.pdf');
    }

    /**
     * Export laporan arsip mendekati penyusutan to PDF.
     */
    public function exportPenyusutanPdf(Request $request)
    {
        $tahunAcuan = $request->input('tahun_acuan', date('Y'));
        $batasWarning = $request->input('batas_warning', 1); // dalam tahun
        $unitPengolahId = $request->input('unit_pengolah_id');
        
        // Query berkas arsip dengan informasi retensi
        $query = BerkasArsip::with(['kodeKlasifikasi', 'unitPengolah', 'arsipUnits']);
        
        // Filter by unit pengolah
        if ($unitPengolahId) {
            $query->where('unit_pengolah_id', $unitPengolahId);
        }
        
        $berkasArsips = $query->get();
        
        // Query arsip unit juga
        $queryArsipUnit = \App\Models\ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah', 'berkasArsip']);
        
        if ($unitPengolahId) {
            $queryArsipUnit->where('unit_pengolah_arsip_id', $unitPengolahId);
        }
        
        $arsipUnits = $queryArsipUnit->get();
        
        $arsipSegera = [];
        $arsipMendekat = [];
        $totalMusnah = 0;
        $totalPermanen = 0;
        
        // Process berkas arsip
        foreach ($berkasArsips as $berkas) {
            $tanggalArsip = $berkas->created_at;
            $retensiAktif = $berkas->retensi_aktif ?? $berkas->kodeKlasifikasi->retensi_aktif ?? 0;
            $retensiInaktif = $berkas->retensi_inaktif ?? $berkas->kodeKlasifikasi->retensi_inaktif ?? 0;
            $totalRetensi = $retensiAktif + $retensiInaktif;
            $statusAkhir = $berkas->penyusutan_akhir ?? $berkas->kodeKlasifikasi->status_akhir ?? 'musnah';
            
            if ($tanggalArsip && $totalRetensi > 0) {
                $tanggalPenyusutan = \Carbon\Carbon::parse($tanggalArsip)->addYears($totalRetensi);
                $sekarang = \Carbon\Carbon::parse($tahunAcuan . '-01-01');
                $sisaWaktu = $sekarang->diffInYears($tanggalPenyusutan, false);
                
                $arsipData = [
                    'id' => $berkas->nomor_berkas,
                    'tipe' => 'berkas',
                    'kode_klasifikasi' => $berkas->kodeKlasifikasi->kode_klasifikasi ?? '-',
                    'nama_berkas' => $berkas->nama_berkas,
                    'uraian_informasi' => $berkas->uraian,
                    'unit_pengolah' => $berkas->unitPengolah->nama_unit ?? '-',
                    'tanggal_arsip' => $tanggalArsip->format('d/m/Y'),
                    'retensi_aktif' => $retensiAktif,
                    'retensi_inaktif' => $retensiInaktif,
                    'total_retensi' => $totalRetensi,
                    'tanggal_penyusutan' => $tanggalPenyusutan->format('d/m/Y'),
                    'sisa_waktu' => $sisaWaktu <= 0 ? abs($sisaWaktu) . ' thn terlambat' : $sisaWaktu . ' thn lagi',
                    'sisa_waktu_numeric' => $sisaWaktu,
                    'status_akhir' => $statusAkhir,
                    'lokasi' => $berkas->lokasi_fisik ?? '-',
                ];
                
                if ($sisaWaktu <= 0) {
                    $arsipSegera[] = $arsipData;
                    if (strtolower($statusAkhir) == 'permanen') {
                        $totalPermanen++;
                    } else {
                        $totalMusnah++;
                    }
                } elseif ($sisaWaktu <= $batasWarning) {
                    $arsipMendekat[] = $arsipData;
                }
            }
        }
        
        // Process arsip unit yang tidak punya berkas arsip
        foreach ($arsipUnits as $arsip) {
            if ($arsip->berkas_arsip_id) continue; // Skip jika sudah ada di berkas
            
            $tanggalArsip = $arsip->tanggal ?? $arsip->created_at;
            $retensiAktif = $arsip->retensi_aktif ?? $arsip->kodeKlasifikasi->retensi_aktif ?? 0;
            $retensiInaktif = $arsip->retensi_inaktif ?? $arsip->kodeKlasifikasi->retensi_inaktif ?? 0;
            $totalRetensi = $retensiAktif + $retensiInaktif;
            $statusAkhir = $arsip->kodeKlasifikasi->status_akhir ?? 'musnah';
            
            if ($tanggalArsip && $totalRetensi > 0) {
                $tanggalPenyusutan = \Carbon\Carbon::parse($tanggalArsip)->addYears($totalRetensi);
                $sekarang = \Carbon\Carbon::parse($tahunAcuan . '-01-01');
                $sisaWaktu = $sekarang->diffInYears($tanggalPenyusutan, false);
                
                $lokasi = collect([
                    $arsip->ruangan,
                    $arsip->no_filling ? 'Filling: ' . $arsip->no_filling : null,
                    $arsip->no_box ? 'Box: ' . $arsip->no_box : null,
                ])->filter()->implode(', ') ?: '-';
                
                $arsipData = [
                    'id' => $arsip->id_berkas,
                    'tipe' => 'unit',
                    'kode_klasifikasi' => $arsip->kodeKlasifikasi->kode_klasifikasi ?? '-',
                    'nama_berkas' => null,
                    'uraian_informasi' => $arsip->uraian_informasi,
                    'unit_pengolah' => $arsip->unitPengolah->nama_unit ?? '-',
                    'tanggal_arsip' => \Carbon\Carbon::parse($tanggalArsip)->format('d/m/Y'),
                    'retensi_aktif' => $retensiAktif,
                    'retensi_inaktif' => $retensiInaktif,
                    'total_retensi' => $totalRetensi,
                    'tanggal_penyusutan' => $tanggalPenyusutan->format('d/m/Y'),
                    'sisa_waktu' => $sisaWaktu <= 0 ? abs($sisaWaktu) . ' thn terlambat' : $sisaWaktu . ' thn lagi',
                    'sisa_waktu_numeric' => $sisaWaktu,
                    'status_akhir' => $statusAkhir,
                    'lokasi' => $lokasi,
                ];
                
                if ($sisaWaktu <= 0) {
                    $arsipSegera[] = $arsipData;
                    if (strtolower($statusAkhir) == 'permanen') {
                        $totalPermanen++;
                    } else {
                        $totalMusnah++;
                    }
                } elseif ($sisaWaktu <= $batasWarning) {
                    $arsipMendekat[] = $arsipData;
                }
            }
        }
        
        // Sort by sisa waktu
        usort($arsipSegera, fn($a, $b) => $a['sisa_waktu_numeric'] <=> $b['sisa_waktu_numeric']);
        usort($arsipMendekat, fn($a, $b) => $a['sisa_waktu_numeric'] <=> $b['sisa_waktu_numeric']);
        
        // Get unit pengolah for header
        $unitPengolah = null;
        if ($unitPengolahId) {
            $unitPengolah = UnitPengolah::find($unitPengolahId);
        }
        
        $totalSegera = count($arsipSegera);
        $totalMendekat = count($arsipMendekat);
        
        $pdf = Pdf::loadView('pdf.arsip-penyusutan', compact(
            'arsipSegera',
            'arsipMendekat',
            'unitPengolah',
            'tahunAcuan',
            'batasWarning',
            'totalSegera',
            'totalMendekat',
            'totalMusnah',
            'totalPermanen'
        ));
        
        $pdf->setPaper('a4', 'landscape');
        
        return $pdf->stream('laporan-arsip-penyusutan-' . date('Y-m-d') . '.pdf');
    }
}
