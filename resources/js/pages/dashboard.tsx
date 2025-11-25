import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { BarChart3, Users, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, UserCheck, Shield, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardStats {
    totalUsers: number;
    userChange: number;
    userTrend: 'up' | 'down';
    verifiedUsers: number;
    adminUsers: number;
    usersThisMonth: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
    email_verified_at: string | null;
    role: 'admin' | 'user';
}

interface Props {
    stats: DashboardStats;
    recentUsers: RecentUser[];
}

export default function Dashboard({ stats, recentUsers }: Props) {
    const { t, language } = useLanguage();
    
    const statsCards = [
        {
            title: t('dashboard.totalUsers'),
            value: stats.totalUsers.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            change: `${stats.userChange >= 0 ? '+' : ''}${stats.userChange}%`,
            trend: stats.userTrend,
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            description: `${stats.usersThisMonth} ${t('dashboard.thisMonth')}`,
        },
        {
            title: t('dashboard.verified'),
            value: stats.verifiedUsers.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            change: `${Math.round((stats.verifiedUsers / stats.totalUsers) * 100)}%`,
            trend: 'up' as const,
            icon: UserCheck,
            color: 'from-green-500 to-emerald-500',
            description: t('dashboard.emailVerified'),
        },
        {
            title: t('dashboard.administrator'),
            value: stats.adminUsers.toLocaleString(language === 'id' ? 'id-ID' : 'en-US'),
            change: `${Math.round((stats.adminUsers / stats.totalUsers) * 100)}%`,
            trend: 'up' as const,
            icon: Shield,
            color: 'from-purple-500 to-pink-500',
            description: t('dashboard.roleAdmin'),
        },
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
                                        <div className="mt-1 md:mt-2 flex items-center gap-1">
                                            {stat.trend === 'up' ? (
                                                <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                                            ) : (
                                                <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                                            )}
                                            <span
                                                className={`text-xs md:text-sm font-medium ${
                                                    stat.trend === 'up'
                                                        ? 'text-green-500'
                                                        : 'text-red-500'
                                                }`}
                                            >
                                                {stat.change}
                                            </span>
                                            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{stat.description}</span>
                                        </div>
                                    </div>
                                    <div
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}
                                    >
                                        <stat.icon className="h-6 w-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Chart Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80"
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {t('dashboard.monthlyStats')}
                                </h2>
                                <div className="flex gap-2">
                                    <button className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all hover:shadow-xl">
                                        {t('dashboard.thisMonthBtn')}
                                    </button>
                                </div>
                            </div>
                            <div className="relative aspect-video overflow-hidden rounded-xl border border-gray-200/50 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700/50 dark:from-gray-800 dark:to-gray-900">
                                <PlaceholderPattern className="absolute inset-0 size-full stroke-gray-900/10 dark:stroke-gray-100/10" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <BarChart3 className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600" />
                                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                            {t('dashboard.chartPlaceholder')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Activity Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-white/10 dark:bg-gray-900/80"
                        >
                            <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
                                {t('dashboard.recentUsers')}
                            </h2>
                            <div className="space-y-4">
                                {recentUsers.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-2" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {t('dashboard.noUsers')}
                                        </p>
                                    </div>
                                ) : (
                                    recentUsers.map((user) => (
                                        <div
                                            key={user.id}
                                            className="flex items-center gap-4 rounded-xl border border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:from-gray-800/50 dark:to-gray-900/50"
                                        >
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-blue-500 to-cyan-600'}`}>
                                                {user.role === 'admin' ? (
                                                    <Shield className="h-5 w-5 text-white" />
                                                ) : (
                                                    <Users className="h-5 w-5 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate">
                                                        {user.name}
                                                    </p>
                                                    {user.email_verified_at && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                            <UserCheck className="h-3 w-3 mr-1" />
                                                            Verified
                                                        </span>
                                                    )}
                                                    {user.role === 'admin' && (
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Clock className="h-3 w-3 text-gray-400" />
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {getTimeAgo(user.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
