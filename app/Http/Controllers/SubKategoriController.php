<?php

namespace App\Http\Controllers;

use App\Models\SubKategori;
use App\Models\Kategori;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubKategoriController extends Controller
{
    public function index(Request $request)
    {
        $query = SubKategori::query()->with('kategori');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('nama_sub_kategori', 'like', "%{$search}%")
                    ->orWhere('deskripsi', 'like', "%{$search}%")
                    ->orWhereHas('kategori', function ($q) use ($search) {
                        $q->where('nama_kategori', 'like', "%{$search}%");
                    });
            });
        }

        if ($request->has('kategori_id') && $request->kategori_id) {
            $query->where('kategori_id', $request->kategori_id);
        }

        $subKategoris = $query->orderBy('nama_sub_kategori')
            ->paginate(10)
            ->withQueryString();

        $kategoris = Kategori::orderBy('nama_kategori')->get();

        return Inertia::render('master/sub-kategori/index', [
            'subKategoris' => $subKategoris,
            'kategoris' => $kategoris,
            'filters' => $request->only(['search', 'kategori_id']),
        ]);
    }

    public function create()
    {
        $kategoris = Kategori::orderBy('nama_kategori')->get();

        return Inertia::render('master/sub-kategori/create', [
            'kategoris' => $kategoris,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategori,id',
            'nama_sub_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        SubKategori::create($validated);

        return redirect()->route('sub-kategori.index')
            ->with('success', 'Sub kategori berhasil ditambahkan.');
    }

    public function edit(SubKategori $subKategori)
    {
        $kategoris = Kategori::orderBy('nama_kategori')->get();

        return Inertia::render('master/sub-kategori/edit', [
            'subKategori' => $subKategori->load('kategori'),
            'kategoris' => $kategoris,
        ]);
    }

    public function update(Request $request, SubKategori $subKategori)
    {
        $validated = $request->validate([
            'kategori_id' => 'required|exists:kategori,id',
            'nama_sub_kategori' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ]);

        $subKategori->update($validated);

        return redirect()->route('sub-kategori.index')
            ->with('success', 'Sub kategori berhasil diperbarui.');
    }

    public function destroy(SubKategori $subKategori)
    {
        $subKategori->delete();

        return redirect()->route('sub-kategori.index')
            ->with('success', 'Sub kategori berhasil dihapus.');
    }
}
