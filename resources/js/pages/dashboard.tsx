import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    BarChart3,
    Users,
    FileText,
    Folder,
    TrendingUp,
    TrendingDown,
    Brain,
    CheckCircle,
    Clock,
    XCircle,
    ArrowRight,
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
} from 'recharts';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    totalArsipUnit: number;
    totalBerkasArsip: number;
    totalUsers: number | null;
    statusCounts: Record<string, number>;
    publishCounts: Record<string, number>;
    thisMonthCount: number;
    growthPercent: number;
    ocr: {
        processed: number;
        pending: number;
        failed: number;
        avgConfidence: number;
    };
}

interface ChartData {
    monthlyTrend: { bulan: string; bulan_short: string; total: number }[];
    perKlasifikasi: { kode: string; total: number }[];
    perUnitPengolah: { nama: string; total: number }[];
    statusDistribution: { name: string; value: number; color: string }[];
}

interface ArsipUnit {
    id_berkas: number;
    nomor_arsip: string;
    indeks: string;
    status: string;
    publish_status: string;
    created_at: string;
    unit_pengolah?: {
        nama_unit: string;
    };
}

interface Props {
    stats: DashboardStats;
    charts: ChartData;
    recentArsipUnit: ArsipUnit[];
}

const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1',
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
                        {p.value.toLocaleString('id-ID')}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function Dashboard({ stats, charts, recentArsipUnit }: Props) {
    const statsCards = [
        {
            title: 'Total Arsip Unit',
            value: stats.totalArsipUnit.toLocaleString('id-ID'),
            icon: FileText,
            gradient: 'from-blue-500 to-cyan-500',
            bg: 'bg-blue-50 dark:bg-blue-950/30',
            description: 'Jumlah arsip unit terdaftar',
        },
        {
            title: 'Total Berkas Arsip',
            value: stats.totalBerkasArsip.toLocaleString('id-ID'),
            icon: Folder,
            gradient: 'from-green-500 to-emerald-500',
            bg: 'bg-green-50 dark:bg-green-950/30',
            description: 'Jumlah berkas arsip terdaftar',
        },
        {
            title: 'Arsip Bulan Ini',
            value: stats.thisMonthCount.toLocaleString('id-ID'),
            icon: stats.growthPercent >= 0 ? TrendingUp : TrendingDown,
            gradient: stats.growthPercent >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-orange-500',
            bg: stats.growthPercent >= 0 ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-red-50 dark:bg-red-950/30',
            description: `${stats.growthPercent >= 0 ? '+' : ''}${stats.growthPercent}% dari bulan lalu`,
        },
        ...(stats.totalUsers !== null
            ? [
                  {
                      title: 'Total Pengguna',
                      value: stats.totalUsers.toLocaleString('id-ID'),
                      icon: Users,
                      gradient: 'from-purple-500 to-pink-500',
                      bg: 'bg-purple-50 dark:bg-purple-950/30',
                      description: 'Jumlah pengguna terdaftar',
                  },
              ]
            : []),
    ];

    const ocrTotal = stats.ocr.processed + stats.ocr.pending + stats.ocr.failed;
    const ocrRate = ocrTotal > 0 ? Math.round((stats.ocr.processed / ocrTotal) * 100) : 0;

    const statusDistFiltered = charts.statusDistribution.filter((s) => s.value > 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative min-h-screen overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-950">
                    <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-600/10" />
                    <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl dark:from-purple-600/10 dark:to-pink-600/10" />
                </div>

                <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                    {/* Welcome */}
                    <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-2xl backdrop-blur-xl md:p-8 dark:border-white/10 dark:bg-gray-900/80">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-xl font-bold text-gray-900 md:text-3xl dark:text-white">
                                    Dashboard Analytics
                                </h1>
                                <p className="mt-1 text-sm text-gray-600 md:mt-2 md:text-base dark:text-gray-400">
                                    Ringkasan statistik dan visualisasi data arsip digital
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                                    <BarChart3 className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
                        {statsCards.map((stat) => (
                            <div
                                key={stat.title}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl transition-all hover:scale-[1.02] hover:shadow-2xl md:p-6 dark:border-white/10 dark:bg-gray-900/80"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-600 md:text-sm dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-1 text-2xl font-bold text-gray-900 md:mt-2 md:text-3xl dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 text-xs text-gray-500 md:mt-2 md:text-sm dark:text-gray-400">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg md:h-12 md:w-12`}
                                    >
                                        <stat.icon className="h-5 w-5 text-white md:h-6 md:w-6" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Row: Area Chart + Pie Chart */}
                    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                        {/* Monthly Trend Area Chart */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80 lg:col-span-2">
                            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                Tren Arsip Bulanan
                            </h2>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.monthlyTrend}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                        <XAxis
                                            dataKey="bulan_short"
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 12, fill: '#6b7280' }}
                                            axisLine={false}
                                            tickLine={false}
                                            allowDecimals={false}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#3b82f6"
                                            strokeWidth={2.5}
                                            fill="url(#colorTotal)"
                                            name="Arsip"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Status Distribution Pie Chart */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80">
                            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                Distribusi Status
                            </h2>
                            <div className="h-72">
                                {statusDistFiltered.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={statusDistFiltered}
                                                cx="50%"
                                                cy="45%"
                                                innerRadius={50}
                                                outerRadius={80}
                                                paddingAngle={4}
                                                dataKey="value"
                                                label={({ name, percent }) =>
                                                    `${name} ${(percent * 100).toFixed(0)}%`
                                                }
                                                labelLine={false}
                                            >
                                                {statusDistFiltered.map((entry, index) => (
                                                    <Cell key={index} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{ fontSize: 12 }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                        Belum ada data
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row: Bar Charts */}
                    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
                        {/* Per Kode Klasifikasi */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80">
                            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                Top 10 Kode Klasifikasi
                            </h2>
                            <div className="h-72">
                                {charts.perKlasifikasi.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={charts.perKlasifikasi}
                                            layout="vertical"
                                            margin={{ left: 10, right: 20 }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                                horizontal={false}
                                            />
                                            <XAxis
                                                type="number"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                dataKey="kode"
                                                type="category"
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                width={75}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="total" name="Arsip" radius={[0, 6, 6, 0]}>
                                                {charts.perKlasifikasi.map((_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                        Belum ada data
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Per Unit Pengolah */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80">
                            <h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
                                Arsip per Unit Pengolah
                            </h2>
                            <div className="h-72">
                                {charts.perUnitPengolah.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={charts.perUnitPengolah}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="nama"
                                                tick={{ fontSize: 10, fill: '#6b7280' }}
                                                axisLine={false}
                                                tickLine={false}
                                                interval={0}
                                                angle={-25}
                                                textAnchor="end"
                                                height={60}
                                            />
                                            <YAxis
                                                tick={{ fontSize: 11, fill: '#6b7280' }}
                                                axisLine={false}
                                                tickLine={false}
                                                allowDecimals={false}
                                            />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Bar dataKey="total" name="Arsip" radius={[6, 6, 0, 0]}>
                                                {charts.perUnitPengolah.map((_, index) => (
                                                    <Cell
                                                        key={index}
                                                        fill={COLORS[index % COLORS.length]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                                        Belum ada data
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Row: OCR Stats + Recent Table */}
                    <div className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3">
                        {/* OCR Analytics */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80">
                            <div className="mb-4 flex items-center gap-2">
                                <Brain className="h-5 w-5 text-purple-500" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    OCR & AI Analytics
                                </h2>
                            </div>

                            <div className="space-y-4">
                                {/* OCR Success Rate Ring */}
                                <div className="flex items-center justify-center">
                                    <div className="relative flex h-32 w-32 items-center justify-center">
                                        <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                fill="none"
                                                stroke="#e5e7eb"
                                                strokeWidth="10"
                                                className="dark:stroke-gray-700"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r="50"
                                                fill="none"
                                                stroke="#8b5cf6"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray={`${ocrRate * 3.14} ${314 - ocrRate * 3.14}`}
                                            />
                                        </svg>
                                        <div className="absolute text-center">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {ocrRate}%
                                            </span>
                                            <p className="text-[10px] text-gray-500">Berhasil</p>
                                        </div>
                                    </div>
                                </div>

                                {/* OCR Detail Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between rounded-lg bg-green-50 p-2.5 dark:bg-green-900/20">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Berhasil</span>
                                        </div>
                                        <span className="font-semibold text-green-600 dark:text-green-400">
                                            {stats.ocr.processed}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-2.5 dark:bg-yellow-900/20">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Menunggu</span>
                                        </div>
                                        <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                            {stats.ocr.pending}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-red-50 p-2.5 dark:bg-red-900/20">
                                        <div className="flex items-center gap-2">
                                            <XCircle className="h-4 w-4 text-red-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Gagal</span>
                                        </div>
                                        <span className="font-semibold text-red-600 dark:text-red-400">
                                            {stats.ocr.failed}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg bg-purple-50 p-2.5 dark:bg-purple-900/20">
                                        <div className="flex items-center gap-2">
                                            <Brain className="h-4 w-4 text-purple-500" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                Rata-rata Confidence
                                            </span>
                                        </div>
                                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                                            {stats.ocr.avgConfidence}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Arsip Unit Table */}
                        <div className="rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-xl md:p-6 dark:border-white/10 dark:bg-gray-900/80 lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Arsip Unit Terbaru
                                </h2>
                                <Link
                                    href="/arsip-unit"
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                                >
                                    Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200 dark:border-gray-700">
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                No
                                            </th>
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Nama Arsip
                                            </th>
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Unit Pengolah
                                            </th>
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Status
                                            </th>
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Publikasi
                                            </th>
                                            <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Tanggal
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentArsipUnit.length > 0 ? (
                                            recentArsipUnit.map((arsip, index) => (
                                                <tr
                                                    key={arsip.id_berkas}
                                                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                                >
                                                    <td className="py-3 text-sm text-gray-900 dark:text-white">
                                                        {index + 1}
                                                    </td>
                                                    <td className="py-3 text-sm text-gray-900 dark:text-white">
                                                        {arsip.indeks || '-'}
                                                    </td>
                                                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                        {arsip.unit_pengolah?.nama_unit || '-'}
                                                    </td>
                                                    <td className="py-3 text-sm">
                                                        <StatusBadge status={arsip.status} />
                                                    </td>
                                                    <td className="py-3 text-sm">
                                                        <PublishBadge status={arsip.publish_status} />
                                                    </td>
                                                    <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                        {new Date(arsip.created_at).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                            }
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="py-8 text-center text-sm text-gray-400"
                                                >
                                                    Belum ada arsip unit
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        diterima: {
            label: 'Diterima',
            cls: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        },
        ditolak: {
            label: 'Ditolak',
            cls: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        },
        pending: {
            label: 'Pending',
            cls: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        },
    };
    const s = map[status] || map.pending;
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${s.cls}`}
        >
            {s.label}
        </span>
    );
}

function PublishBadge({ status }: { status: string }) {
    return status === 'published' ? (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            Published
        </span>
    ) : (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
            Draft
        </span>
    );
}
