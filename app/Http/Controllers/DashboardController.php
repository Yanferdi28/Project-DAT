<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Total users
        $totalUsers = User::count();
        
        // Users this month
        $usersThisMonth = User::whereMonth('created_at', Carbon::now()->month)
            ->whereYear('created_at', Carbon::now()->year)
            ->count();
        
        // Users last month
        $usersLastMonth = User::whereMonth('created_at', Carbon::now()->subMonth()->month)
            ->whereYear('created_at', Carbon::now()->subMonth()->year)
            ->count();
        
        // Calculate percentage change
        $userChange = 0;
        if ($usersLastMonth > 0) {
            $userChange = (($usersThisMonth - $usersLastMonth) / $usersLastMonth) * 100;
        } elseif ($usersThisMonth > 0) {
            $userChange = 100;
        }
        
        // Verified users count
        $verifiedUsers = User::whereNotNull('email_verified_at')->count();
        
        // Admin users count
        $adminUsers = User::where('role', 'admin')->count();
        
        // Recent users (last 5)
        $recentUsers = User::latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at', 'email_verified_at', 'role']);
        
        return Inertia::render('dashboard', [
            'stats' => [
                'totalUsers' => $totalUsers,
                'userChange' => round($userChange, 1),
                'userTrend' => $userChange >= 0 ? 'up' : 'down',
                'verifiedUsers' => $verifiedUsers,
                'adminUsers' => $adminUsers,
                'usersThisMonth' => $usersThisMonth,
            ],
            'recentUsers' => $recentUsers,
        ]);
    }
}
