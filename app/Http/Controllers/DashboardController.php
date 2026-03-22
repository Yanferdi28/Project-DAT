<?php

namespace App\Http\Controllers;

use App\Services\DashboardService;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService
    ) {}

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
        $data = $this->dashboardService->getDashboardData($userUnitPengolahId);

        return Inertia::render('dashboard', $data);
    }
}
