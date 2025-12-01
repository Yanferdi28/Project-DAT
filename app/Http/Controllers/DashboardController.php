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
    public function index()
    {
        // Total arsip unit
        $totalArsipUnit = ArsipUnit::count();
        
        // Total berkas arsip
        $totalBerkasArsip = BerkasArsip::count();
        
        // Total pengguna
        $totalUsers = User::count();
        
        // Recent arsip unit (last 5)
        $recentArsipUnit = ArsipUnit::with('unitPengolah:id,nama_unit')
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
