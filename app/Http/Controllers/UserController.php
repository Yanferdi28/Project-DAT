<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::with('unitPengolah');

        // Search functionality
        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by verification status
        if ($request->has('status') && $request->status != '') {
            if ($request->status === 'verified') {
                $query->whereNotNull('email_verified_at');
            } elseif ($request->status === 'unverified') {
                $query->whereNull('email_verified_at');
            }
        }

        // Filter by unit pengolah
        if ($request->has('unit_pengolah_id') && $request->unit_pengolah_id != '') {
            $query->where('unit_pengolah_id', $request->unit_pengolah_id);
        }

        // Sorting
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'asc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination with per_page parameter
        $perPage = $request->get('per_page', 10);
        $perPage = in_array($perPage, [5, 10, 25, 50, 100]) ? $perPage : 10;
        $users = $query->paginate($perPage)->withQueryString();

        return Inertia::render('users/index', [
            'users' => $users,
            'unitPengolahs' => UnitPengolah::orderBy('nama_unit')->get(),
            'filters' => $request->only(['search', 'status', 'unit_pengolah_id', 'sort_field', 'sort_direction', 'per_page']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('users/create', [
            'unitPengolahs' => UnitPengolah::orderBy('nama_unit')->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,management,operator,user'],
            'unit_pengolah_id' => ['nullable', 'exists:unit_pengolah,id'],
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => $user->load('unitPengolah'),
            'unitPengolahs' => UnitPengolah::orderBy('nama_unit')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:admin,management,operator,user'],
            'unit_pengolah_id' => ['nullable', 'exists:unit_pengolah,id'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return redirect()->route('users.index')
            ->with('success', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting yourself
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak bisa menghapus akun sendiri.');
        }

        $user->delete();

        return back()->with('success', 'Pengguna berhasil dihapus.');
    }

    /**
     * Manually verify user's email.
     */
    public function verify(User $user)
    {
        if ($user->email_verified_at) {
            return back()->with('error', 'Pengguna sudah terverifikasi.');
        }

        $user->email_verified_at = now();
        $user->save();

        return back()->with('success', 'Email pengguna berhasil diverifikasi.');
    }

    /**
     * Unverify user's email.
     */
    public function unverify(User $user)
    {
        if (!$user->email_verified_at) {
            return back()->with('error', 'Pengguna belum terverifikasi.');
        }

        $user->email_verified_at = null;
        $user->save();

        return back()->with('success', 'Verifikasi email pengguna berhasil dibatalkan.');
    }
}
