<?php

namespace App\Http\Controllers;

use App\Models\ArsipUnit;
use App\Models\PeminjamanArsip;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PeminjamanArsipController extends Controller
{
    /**
     * Display a listing of peminjaman arsip.
     */
    public function index(Request $request): Response
    {
        $query = PeminjamanArsip::with([
            'arsipUnit.kodeKlasifikasi',
            'arsipUnit.unitPengolah',
            'peminjam',
            'unitPengolah',
            'dicatatOleh',
            'dikembalikanOleh',
        ]);

        // Update status terlambat secara otomatis
        PeminjamanArsip::where('status', 'dipinjam')
            ->whereDate('tanggal_harus_kembali', '<', now())
            ->update(['status' => 'terlambat']);

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        // Filter by unit pengolah
        if ($request->filled('unit_pengolah_id')) {
            $query->where('unit_pengolah_id', $request->input('unit_pengolah_id'));
        }

        // Filter by search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('nama_peminjam', 'like', "%{$search}%")
                    ->orWhereHas('arsipUnit', function ($q2) use ($search) {
                        $q2->where('indeks', 'like', "%{$search}%")
                            ->orWhere('uraian_informasi', 'like', "%{$search}%");
                    });
            });
        }

        $peminjaman = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        // Stats
        $totalDipinjam = PeminjamanArsip::where('status', 'dipinjam')->count();
        $totalTerlambat = PeminjamanArsip::where('status', 'terlambat')->count();
        $totalDikembalikan = PeminjamanArsip::where('status', 'dikembalikan')->count();

        return Inertia::render('peminjaman-arsip/index', [
            'peminjaman' => $peminjaman,
            'unitPengolahs' => $unitPengolahs,
            'filters' => $request->only(['status', 'unit_pengolah_id', 'search']),
            'stats' => [
                'dipinjam' => $totalDipinjam,
                'terlambat' => $totalTerlambat,
                'dikembalikan' => $totalDikembalikan,
            ],
        ]);
    }

    /**
     * Show the form for creating a new peminjaman.
     */
    public function create(): Response
    {
        $unitPengolahs = UnitPengolah::orderBy('nama_unit')->get();

        // Hanya arsip yang sudah diterima yang bisa dipinjam
        $arsipUnits = ArsipUnit::with(['kodeKlasifikasi', 'unitPengolah'])
            ->where('status', 'diterima')
            ->orderBy('indeks')
            ->get()
            ->map(fn ($arsip) => [
                'id_berkas' => $arsip->id_berkas,
                'indeks' => $arsip->indeks ?? "#{$arsip->id_berkas}",
                'uraian_informasi' => $arsip->uraian_informasi,
                'kode_klasifikasi' => $arsip->kodeKlasifikasi?->kode_klasifikasi,
                'unit_pengolah' => $arsip->unitPengolah?->nama_unit,
            ]);

        return Inertia::render('peminjaman-arsip/create', [
            'unitPengolahs' => $unitPengolahs,
            'arsipUnits' => $arsipUnits,
        ]);
    }

    /**
     * Store a newly created peminjaman.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'arsip_unit_id' => 'required|exists:arsip_unit,id_berkas',
            'peminjam_id' => 'nullable|exists:users,id',
            'unit_pengolah_id' => 'nullable|exists:unit_pengolah,id',
            'nama_peminjam' => 'required|string|max:255',
            'jabatan_peminjam' => 'nullable|string|max:255',
            'tujuan_peminjaman' => 'required|string',
            'tanggal_pinjam' => 'required|date',
            'tanggal_harus_kembali' => 'required|date|after_or_equal:tanggal_pinjam',
            'catatan' => 'nullable|string',
        ]);

        $validated['status'] = 'dipinjam';
        $validated['dicatat_oleh'] = auth()->id();

        PeminjamanArsip::create($validated);

        return redirect()->route('peminjaman-arsip.index')
            ->with('success', 'Peminjaman arsip berhasil dicatat.');
    }

    /**
     * Display the specified peminjaman.
     */
    public function show(PeminjamanArsip $peminjamanArsip): Response
    {
        $peminjamanArsip->load([
            'arsipUnit.kodeKlasifikasi',
            'arsipUnit.unitPengolah',
            'arsipUnit.kategori',
            'arsipUnit.subKategori',
            'peminjam',
            'unitPengolah',
            'dicatatOleh',
            'dikembalikanOleh',
        ]);

        return Inertia::render('peminjaman-arsip/show', [
            'peminjaman' => $peminjamanArsip,
        ]);
    }

    /**
     * Process pengembalian arsip.
     */
    public function kembalikan(Request $request, PeminjamanArsip $peminjamanArsip)
    {
        if ($peminjamanArsip->status === 'dikembalikan') {
            return redirect()->back()->with('error', 'Arsip sudah dikembalikan sebelumnya.');
        }

        $validated = $request->validate([
            'tanggal_kembali' => 'required|date|after_or_equal:' . $peminjamanArsip->tanggal_pinjam->format('Y-m-d'),
            'kondisi_pengembalian' => 'required|string|in:baik,rusak ringan,rusak berat',
            'catatan' => 'nullable|string',
        ]);

        $peminjamanArsip->update([
            'tanggal_kembali' => $validated['tanggal_kembali'],
            'kondisi_pengembalian' => $validated['kondisi_pengembalian'],
            'catatan' => $validated['catatan'] ?? $peminjamanArsip->catatan,
            'status' => 'dikembalikan',
            'dikembalikan_oleh' => auth()->id(),
        ]);

        return redirect()->route('peminjaman-arsip.show', $peminjamanArsip)
            ->with('success', 'Arsip berhasil dikembalikan.');
    }
}
