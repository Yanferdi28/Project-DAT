<?php

namespace App\Http\Controllers;

use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UnitPengolahController extends Controller
{
    public function index(Request $request)
    {
        $query = UnitPengolah::query();

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('nama_unit', 'like', "%{$search}%");
        }

        $unitPengolahs = $query->orderBy('nama_unit')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('master/unit-pengolah/index', [
            'unitPengolahs' => $unitPengolahs,
            'filters' => $request->only(['search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('master/unit-pengolah/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_unit' => 'required|string|max:255',
        ]);

        UnitPengolah::create($validated);

        return redirect()->route('unit-pengolah.index')
            ->with('success', 'Unit pengolah berhasil ditambahkan.');
    }

    public function edit(UnitPengolah $unitPengolah)
    {
        return Inertia::render('master/unit-pengolah/edit', [
            'unitPengolah' => $unitPengolah,
        ]);
    }

    public function update(Request $request, UnitPengolah $unitPengolah)
    {
        $validated = $request->validate([
            'nama_unit' => 'required|string|max:255',
        ]);

        $unitPengolah->update($validated);

        return redirect()->route('unit-pengolah.index')
            ->with('success', 'Unit pengolah berhasil diperbarui.');
    }

    public function destroy(UnitPengolah $unitPengolah)
    {
        $unitPengolah->delete();

        return redirect()->route('unit-pengolah.index')
            ->with('success', 'Unit pengolah berhasil dihapus.');
    }
}
