<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

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

        // Base queries — scoped by unit_pengolah for non-admin users
        $arsipQuery = ArsipUnit::query();
        $berkasQuery = BerkasArsip::query();

        if ($userUnitPengolahId) {
            $arsipQuery->where('unit_pengolah_arsip_id', $userUnitPengolahId);
            $berkasQuery->where('unit_pengolah_id', $userUnitPengolahId);
        }

        // === Summary Stats ===
        $totalArsipUnit = (clone $arsipQuery)->count();
        $totalBerkasArsip = (clone $berkasQuery)->count();
        $totalUsers = $userUnitPengolahId ? null : User::count();

        // Status counts
        $statusCounts = (clone $arsipQuery)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        $publishCounts = (clone $arsipQuery)
            ->select('publish_status', DB::raw('count(*) as total'))
            ->groupBy('publish_status')
            ->pluck('total', 'publish_status')
            ->toArray();

        // OCR stats
        $ocrProcessed = (clone $arsipQuery)->whereNotNull('ocr_status')->where('ocr_status', 'completed')->count();
        $ocrPending = (clone $arsipQuery)->where(function ($q) {
            $q->whereNull('ocr_status')->orWhere('ocr_status', 'pending');
        })->count();
        $ocrFailed = (clone $arsipQuery)->where('ocr_status', 'failed')->count();
        $avgOcrConfidence = (clone $arsipQuery)->where('ocr_status', 'completed')->avg('ocr_confidence');

        // === Monthly Trend (last 12 months) ===
        $monthlyTrend = (clone $arsipQuery)
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%Y-%m') as bulan"),
                DB::raw('count(*) as total')
            )
            ->where('created_at', '>=', Carbon::now()->subMonths(11)->startOfMonth())
            ->groupBy('bulan')
            ->orderBy('bulan')
            ->get()
            ->keyBy('bulan');

        // Fill missing months
        $monthlyData = [];
        for ($i = 11; $i >= 0; $i--) {
            $month = Carbon::now()->subMonths($i);
            $key = $month->format('Y-m');
            $monthlyData[] = [
                'bulan' => $month->translatedFormat('M Y'),
                'bulan_short' => $month->translatedFormat('M'),
                'total' => $monthlyTrend->has($key) ? $monthlyTrend[$key]->total : 0,
            ];
        }

        // === Arsip per Kode Klasifikasi (top 10) ===
        $perKlasifikasi = (clone $arsipQuery)
            ->select('kode_klasifikasi_id', DB::raw('count(*) as total'))
            ->whereNotNull('kode_klasifikasi_id')
            ->groupBy('kode_klasifikasi_id')
            ->orderByDesc('total')
            ->take(10)
            ->get();

        $klasifikasiIds = $perKlasifikasi->pluck('kode_klasifikasi_id');
        $klasifikasiMap = KodeKlasifikasi::whereIn('id', $klasifikasiIds)
            ->pluck('kode_klasifikasi', 'id');

        $klasifikasiData = $perKlasifikasi->map(fn($item) => [
            'kode' => $klasifikasiMap[$item->kode_klasifikasi_id] ?? 'N/A',
            'total' => $item->total,
        ])->values()->toArray();

        // === Arsip per Unit Pengolah ===
        $perUnitPengolah = (clone $arsipQuery)
            ->select('unit_pengolah_arsip_id', DB::raw('count(*) as total'))
            ->whereNotNull('unit_pengolah_arsip_id')
            ->groupBy('unit_pengolah_arsip_id')
            ->orderByDesc('total')
            ->get();

        $unitIds = $perUnitPengolah->pluck('unit_pengolah_arsip_id');
        $unitMap = UnitPengolah::whereIn('id', $unitIds)->pluck('nama_unit', 'id');

        $unitPengolahData = $perUnitPengolah->map(fn($item) => [
            'nama' => $unitMap[$item->unit_pengolah_arsip_id] ?? 'N/A',
            'total' => $item->total,
        ])->values()->toArray();

        // === Status Distribution (for pie chart) ===
        $statusDistribution = [
            ['name' => 'Diterima', 'value' => $statusCounts['diterima'] ?? 0, 'color' => '#22c55e'],
            ['name' => 'Ditolak', 'value' => $statusCounts['ditolak'] ?? 0, 'color' => '#ef4444'],
            ['name' => 'Pending', 'value' => $statusCounts['pending'] ?? 0, 'color' => '#f59e0b'],
        ];

        // === Recent Arsip Unit (last 5) ===
        $recentArsipUnit = (clone $arsipQuery)
            ->with('unitPengolah:id,nama_unit')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id_berkas', 'indeks', 'unit_pengolah_arsip_id', 'status', 'publish_status', 'created_at']);

        // === This month vs last month ===
        $thisMonthCount = (clone $arsipQuery)
            ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->count();
        $lastMonthCount = (clone $arsipQuery)
            ->whereBetween('created_at', [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()])
            ->count();
        $growthPercent = $lastMonthCount > 0
            ? round((($thisMonthCount - $lastMonthCount) / $lastMonthCount) * 100, 1)
            : ($thisMonthCount > 0 ? 100 : 0);

        return Inertia::render('dashboard', [
            'stats' => [
                'totalArsipUnit' => $totalArsipUnit,
                'totalBerkasArsip' => $totalBerkasArsip,
                'totalUsers' => $totalUsers,
                'statusCounts' => $statusCounts,
                'publishCounts' => $publishCounts,
                'thisMonthCount' => $thisMonthCount,
                'growthPercent' => $growthPercent,
                'ocr' => [
                    'processed' => $ocrProcessed,
                    'pending' => $ocrPending,
                    'failed' => $ocrFailed,
                    'avgConfidence' => $avgOcrConfidence ? round($avgOcrConfidence, 1) : 0,
                ],
            ],
            'charts' => [
                'monthlyTrend' => $monthlyData,
                'perKlasifikasi' => $klasifikasiData,
                'perUnitPengolah' => $unitPengolahData,
                'statusDistribution' => $statusDistribution,
            ],
            'recentArsipUnit' => $recentArsipUnit,
        ]);
    }
}
