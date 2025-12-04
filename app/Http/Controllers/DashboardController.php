<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
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

    public function index()
    {
        $userUnitPengolahId = $this->getUserUnitPengolahId();
        
        // Base queries with unit pengolah filter
        $arsipQuery = ArsipUnit::query();
        $berkasQuery = BerkasArsip::query();
        
        if ($userUnitPengolahId) {
            $arsipQuery->where('unit_pengolah_arsip_id', $userUnitPengolahId);
            $berkasQuery->where('unit_pengolah_id', $userUnitPengolahId);
        }
        
        // Total arsip unit
        $totalArsipUnit = (clone $arsipQuery)->count();
        
        // Total berkas arsip
        $totalBerkasArsip = (clone $berkasQuery)->count();
        
        // Total pengguna (only for admin)
        $totalUsers = $userUnitPengolahId ? null : User::count();
        
        // Recent arsip unit (last 5)
        $recentArsipUnit = (clone $arsipQuery)
            ->with('unitPengolah:id,nama_unit')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id_berkas', 'indeks', 'unit_pengolah_arsip_id', 'status', 'publish_status', 'created_at']);
        
        return Inertia::render('dashboard', [
            'stats' => [
                'totalArsipUnit' => $totalArsipUnit,
                'totalBerkasArsip' => $totalBerkasArsip,
                'totalUsers' => $totalUsers,
            ],
            'recentArsipUnit' => $recentArsipUnit,
        ]);
    }
}
