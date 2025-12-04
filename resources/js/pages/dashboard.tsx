import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart3, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, UserCheck, Shield, Clock, FileText, Folder } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

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
    recentArsipUnit: ArsipUnit[];
}

export default function Dashboard({ stats, recentArsipUnit }: Props) {
    const { t, language } = useLanguage();
    
    const statsCards = [
        {
            title: t('dashboard.totalArsipUnit'),
            value: stats.totalArsipUnit.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            icon: FileText,
            color: 'from-blue-500 to-cyan-500',
            description: t('dashboard.totalArsipUnitDesc'),
        },
        {
            title: t('dashboard.totalBerkasArsip'),
            value: stats.totalBerkasArsip.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            icon: Folder,
            color: 'from-green-500 to-emerald-500',
            description: t('dashboard.totalBerkasArsipDesc'),
        },
        // Only show total users for admin
        ...(stats.totalUsers !== null ? [{
            title: t('dashboard.totalUsers'),
            value: stats.totalUsers.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            icon: Users,
            color: 'from-purple-500 to-pink-500',
            description: t('dashboard.totalUsersDesc'),
        }] : []),
    ];

    const getTimeAgo = (date: string) => {
        const now = new Date();
        const created = new Date(date);
        const diffInMinutes = Math.floor((now.getTime() - created.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 1) return t('dashboard.justNow');
        if (diffInMinutes < 60) return `${diffInMinutes} ${t('dashboard.minutesAgo')}`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ${t('dashboard.hoursAgo')}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} ${t('dashboard.daysAgo')}`;
        
        return created.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="relative min-h-screen overflow-hidden">
                {/* Animated gradient background - same as auth */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950">
                    <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-blue-400/20 to-indigo-400/20 blur-3xl dark:from-blue-600/10 dark:to-indigo-600/10" />
                    <div className="absolute -bottom-40 -right-40 h-80 w-80 animate-pulse rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl delay-1000 dark:from-purple-600/10 dark:to-pink-600/10" />
                    <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-indigo-400/15 to-purple-400/15 blur-3xl delay-500 dark:from-indigo-600/10 dark:to-purple-600/10" />
                </div>

                <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6">
                    {/* Welcome Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-white/20 bg-white/80 p-4 md:p-8 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                    {t('dashboard.welcome')}
                                </h1>
                                <p className="mt-1 md:mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
                                    {t('dashboard.summary')}
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
                                    <BarChart3 className="h-8 w-8 text-white" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                        {statsCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 p-4 md:p-6 shadow-xl backdrop-blur-xl transition-all hover:scale-105 hover:shadow-2xl dark:border-white/10 dark:bg-gray-900/80"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                                            {stat.title}
                                        </p>
                                        <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                        <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 dark:text-gray-400">
                                            {stat.description}
                                        </p>
                                    </div>
                                    <div
                                        className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                    >
                                        <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Recent Arsip Unit Table */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {t('dashboard.recentArsipUnit')}
                            </h2>
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
                                            Status Publikasi
                                        </th>
                                        <th className="pb-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                                            Tanggal Buat
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentArsipUnit.map((arsip, index) => (
                                        <tr
                                            key={arsip.id_berkas}
                                            className="border-b border-gray-100 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50"
                                        >
                                            <td className="py-3 text-sm text-gray-900 dark:text-white">
                                                {index + 1}
                                            </td>
                                            <td className="py-3 text-sm text-gray-900 dark:text-white">
                                                {arsip.indeks}
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {arsip.unit_pengolah?.nama_unit || '-'}
                                            </td>
                                            <td className="py-3 text-sm">
                                                {arsip.status === 'diterima' ? (
                                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                                                        Diterima
                                                    </span>
                                                ) : arsip.status === 'ditolak' ? (
                                                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                                                        Ditolak
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-sm">
                                                {arsip.publish_status === 'published' ? (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                        Published
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                                        Draft
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(arsip.created_at).toLocaleDateString('id-ID', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AppLayout>
    );
}
