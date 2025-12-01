<?php

namespace App\Http\Controllers;

use App\Models\KodeKlasifikasi;
use Illuminate\Http\Request;
use Inertia\Inertia;

class KodeKlasifikasiController extends Controller
{
    public function index(Request $request)
    {
        $query = KodeKlasifikasi::query()->with('parent');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_klasifikasi', 'like', "%{$search}%")
                    ->orWhere('uraian', 'like', "%{$search}%");
            });
        }

        $kodeKlasifikasis = $query->orderBy('kode_klasifikasi')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/kode-klasifikasi/index', [
            'kodeKlasifikasis' => $kodeKlasifikasis,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        $parentOptions = KodeKlasifikasi::orderBy('kode_klasifikasi')
            ->get(['kode_klasifikasi', 'uraian']);

        return Inertia::render('master/kode-klasifikasi/create', [
            'parentOptions' => $parentOptions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kode_klasifikasi' => 'required|string|max:255|unique:kode_klasifikasi,kode_klasifikasi',
            'kode_klasifikasi_induk' => 'nullable|string|exists:kode_klasifikasi,kode_klasifikasi',
            'uraian' => 'required|string|max:255',
            'retensi_aktif' => 'required|integer|min:0',
            'retensi_inaktif' => 'required|integer|min:0',
            'status_akhir' => 'required|in:Musnah,Permanen,Dinilai Kembali',
            'klasifikasi_keamanan' => 'required|in:Biasa,Rahasia,Terbatas',
        ]);

        KodeKlasifikasi::create($validated);

        return redirect()->route('kode-klasifikasi.index')
            ->with('success', 'Kode klasifikasi berhasil ditambahkan.');
    }

    public function edit(KodeKlasifikasi $kodeKlasifikasi)
    {
        $parentOptions = KodeKlasifikasi::where('kode_klasifikasi', '!=', $kodeKlasifikasi->kode_klasifikasi)
            ->orderBy('kode_klasifikasi')
            ->get(['kode_klasifikasi', 'uraian']);

        return Inertia::render('master/kode-klasifikasi/edit', [
            'kodeKlasifikasi' => $kodeKlasifikasi,
            'parentOptions' => $parentOptions,
        ]);
    }

    public function update(Request $request, KodeKlasifikasi $kodeKlasifikasi)
    {
        $validated = $request->validate([
            'kode_klasifikasi' => 'required|string|max:255|unique:kode_klasifikasi,kode_klasifikasi,' . $kodeKlasifikasi->id,
            'kode_klasifikasi_induk' => 'nullable|string|exists:kode_klasifikasi,kode_klasifikasi',
            'uraian' => 'required|string|max:255',
            'retensi_aktif' => 'required|integer|min:0',
            'retensi_inaktif' => 'required|integer|min:0',
            'status_akhir' => 'required|in:Musnah,Permanen,Dinilai Kembali',
            'klasifikasi_keamanan' => 'required|in:Biasa,Rahasia,Terbatas',
        ]);

        $kodeKlasifikasi->update($validated);

        return redirect()->route('kode-klasifikasi.index')
            ->with('success', 'Kode klasifikasi berhasil diperbarui.');
    }

    public function destroy(KodeKlasifikasi $kodeKlasifikasi)
    {
        $kodeKlasifikasi->delete();

        return redirect()->route('kode-klasifikasi.index')
            ->with('success', 'Kode klasifikasi berhasil dihapus.');
    }
}
