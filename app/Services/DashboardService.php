<?php

namespace App\Services;

use App\Models\ArsipUnit;
use App\Models\BerkasArsip;
use App\Models\KodeKlasifikasi;
use App\Models\UnitPengolah;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * Get all dashboard data scoped by user's unit pengolah.
     */
    public function getDashboardData(?int $userUnitPengolahId): array
    {
        $arsipQuery = ArsipUnit::query();
        $berkasQuery = BerkasArsip::query();

        if ($userUnitPengolahId) {
            $arsipQuery->where('unit_pengolah_arsip_id', $userUnitPengolahId);
            $berkasQuery->where('unit_pengolah_id', $userUnitPengolahId);
        }

        return [
            'stats' => $this->getStats($arsipQuery, $berkasQuery, $userUnitPengolahId),
            'charts' => $this->getCharts($arsipQuery),
            'recentArsipUnit' => $this->getRecentArsipUnit($arsipQuery),
        ];
    }

    private function getStats($arsipQuery, $berkasQuery, ?int $userUnitPengolahId): array
    {
        $totalArsipUnit = (clone $arsipQuery)->count();
        $totalBerkasArsip = (clone $berkasQuery)->count();
        $totalUsers = $userUnitPengolahId ? null : User::count();

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

        $ocrStats = $this->getOcrStats($arsipQuery);
        $growth = $this->getGrowthStats($arsipQuery);

        return [
            'totalArsipUnit' => $totalArsipUnit,
            'totalBerkasArsip' => $totalBerkasArsip,
            'totalUsers' => $totalUsers,
            'statusCounts' => $statusCounts,
            'publishCounts' => $publishCounts,
            'thisMonthCount' => $growth['thisMonthCount'],
            'growthPercent' => $growth['growthPercent'],
            'ocr' => $ocrStats,
        ];
    }

    private function getOcrStats($arsipQuery): array
    {
        $ocrProcessed = (clone $arsipQuery)->where('ocr_status', 'completed')->count();
        $ocrPending = (clone $arsipQuery)->where(function ($q) {
            $q->whereNull('ocr_status')->orWhere('ocr_status', 'pending');
        })->count();
        $ocrFailed = (clone $arsipQuery)->where('ocr_status', 'failed')->count();
        $avgOcrConfidence = (clone $arsipQuery)->where('ocr_status', 'completed')->avg('ocr_confidence');

        return [
            'processed' => $ocrProcessed,
            'pending' => $ocrPending,
            'failed' => $ocrFailed,
            'avgConfidence' => $avgOcrConfidence ? round($avgOcrConfidence, 1) : 0,
        ];
    }

    private function getGrowthStats($arsipQuery): array
    {
        $thisMonthCount = (clone $arsipQuery)
            ->whereBetween('created_at', [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()])
            ->count();
        $lastMonthCount = (clone $arsipQuery)
            ->whereBetween('created_at', [Carbon::now()->subMonth()->startOfMonth(), Carbon::now()->subMonth()->endOfMonth()])
            ->count();
        $growthPercent = $lastMonthCount > 0
            ? round((($thisMonthCount - $lastMonthCount) / $lastMonthCount) * 100, 1)
            : ($thisMonthCount > 0 ? 100 : 0);

        return [
            'thisMonthCount' => $thisMonthCount,
            'growthPercent' => $growthPercent,
        ];
    }

    private function getCharts($arsipQuery): array
    {
        return [
            'monthlyTrend' => $this->getMonthlyTrend($arsipQuery),
            'perKlasifikasi' => $this->getPerKlasifikasi($arsipQuery),
            'perUnitPengolah' => $this->getPerUnitPengolah($arsipQuery),
            'statusDistribution' => $this->getStatusDistribution($arsipQuery),
        ];
    }

    private function getMonthlyTrend($arsipQuery): array
    {
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

        return $monthlyData;
    }

    private function getPerKlasifikasi($arsipQuery): array
    {
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

        return $perKlasifikasi->map(fn($item) => [
            'kode' => $klasifikasiMap[$item->kode_klasifikasi_id] ?? 'N/A',
            'total' => $item->total,
        ])->values()->toArray();
    }

    private function getPerUnitPengolah($arsipQuery): array
    {
        $perUnitPengolah = (clone $arsipQuery)
            ->select('unit_pengolah_arsip_id', DB::raw('count(*) as total'))
            ->whereNotNull('unit_pengolah_arsip_id')
            ->groupBy('unit_pengolah_arsip_id')
            ->orderByDesc('total')
            ->get();

        $unitIds = $perUnitPengolah->pluck('unit_pengolah_arsip_id');
        $unitMap = UnitPengolah::whereIn('id', $unitIds)->pluck('nama_unit', 'id');

        return $perUnitPengolah->map(fn($item) => [
            'nama' => $unitMap[$item->unit_pengolah_arsip_id] ?? 'N/A',
            'total' => $item->total,
        ])->values()->toArray();
    }

    private function getStatusDistribution($arsipQuery): array
    {
        $statusCounts = (clone $arsipQuery)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status')
            ->toArray();

        return [
            ['name' => 'Diterima', 'value' => $statusCounts['diterima'] ?? 0, 'color' => '#22c55e'],
            ['name' => 'Ditolak', 'value' => $statusCounts['ditolak'] ?? 0, 'color' => '#ef4444'],
            ['name' => 'Pending', 'value' => $statusCounts['pending'] ?? 0, 'color' => '#f59e0b'],
        ];
    }

    private function getRecentArsipUnit($arsipQuery)
    {
        return (clone $arsipQuery)
            ->with('unitPengolah:id,nama_unit')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get(['id_berkas', 'indeks', 'unit_pengolah_arsip_id', 'status', 'publish_status', 'created_at']);
    }
}
