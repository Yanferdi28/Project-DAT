import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    FileText,
    User as UserIcon,
    Folder,
    Plus,
    Edit,
    Trash2,
    CheckCircle,
    Globe,
    Brain,
    Clock,
    ArrowUpDown,
    X,
    Calendar,
} from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface User {
    id: number;
    name: string;
}

interface Log {
    id: number;
    user_id: number | null;
    action: string;
    model_type: string | null;
    model_id: number | null;
    description: string;
    old_values: Record<string, any> | null;
    new_values: Record<string, any> | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    user: User | null;
}

interface Pagination {
    data: Log[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Filters {
    action?: string;
    user_id?: string;
    model_type?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
}

interface Props {
    logs: Pagination;
    users: User[];
    actions: string[];
    filters: Filters;
}

const actionConfig: Record<string, { label: string; color: string; icon: any }> = {
    created: { label: 'Dibuat', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: Plus },
    updated: { label: 'Diperbarui', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: Edit },
    deleted: { label: 'Dihapus', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: Trash2 },
    status_changed: { label: 'Status Diubah', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: ArrowUpDown },
    published: { label: 'Dipublikasi', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: Globe },
    login: { label: 'Login', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200', icon: UserIcon },
    ocr_processed: { label: 'OCR Diproses', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200', icon: Brain },
};

const modelTypeLabels: Record<string, { label: string; icon: any }> = {
    'App\\Models\\ArsipUnit': { label: 'Arsip Unit', icon: FileText },
    'App\\Models\\BerkasArsip': { label: 'Berkas Arsip', icon: Folder },
    'App\\Models\\User': { label: 'Pengguna', icon: UserIcon },
};

export default function ActivityLogIndex({ logs, users, actions, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [showFilters, setShowFilters] = useState(
        !!(filters.action || filters.user_id || filters.model_type || filters.from_date || filters.to_date),
    );

    const applyFilters = (newFilters: Partial<Filters>) => {
        router.get(
            '/activity-log',
            { ...filters, ...newFilters, page: 1 },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const clearFilters = () => {
        setSearch('');
        router.get('/activity-log', {}, { preserveState: true });
    };

    const hasActiveFilters = !!(filters.action || filters.user_id || filters.model_type || filters.search || filters.from_date || filters.to_date);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getTimeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
        if (diffMin < 1) return 'Baru saja';
        if (diffMin < 60) return `${diffMin} menit lalu`;
        const diffHrs = Math.floor(diffMin / 60);
        if (diffHrs < 24) return `${diffHrs} jam lalu`;
        const diffDays = Math.floor(diffHrs / 24);
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return formatDate(dateStr);
    };

    const renderChanges = (oldVals: Record<string, any> | null, newVals: Record<string, any> | null) => {
        if (!oldVals && !newVals) return null;

        const allKeys = new Set([...Object.keys(oldVals || {}), ...Object.keys(newVals || {})]);
        const entries = Array.from(allKeys).filter(
            (k) => !['updated_at', 'created_at', 'id', 'id_berkas', 'nomor_berkas'].includes(k),
        );
        if (entries.length === 0) return null;

        return (
            <div className="mt-2 space-y-1">
                {entries.slice(0, 5).map((key) => (
                    <div key={key} className="flex items-start gap-2 text-xs">
                        <span className="min-w-[100px] font-medium text-gray-500 dark:text-gray-400">
                            {key.replace(/_/g, ' ')}
                        </span>
                        {oldVals?.[key] !== undefined && (
                            <span className="rounded bg-red-50 px-1.5 py-0.5 text-red-700 line-through dark:bg-red-900/20 dark:text-red-400">
                                {String(oldVals[key]).substring(0, 60)}
                            </span>
                        )}
                        {newVals?.[key] !== undefined && (
                            <span className="rounded bg-green-50 px-1.5 py-0.5 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                {String(newVals[key]).substring(0, 60)}
                            </span>
                        )}
                    </div>
                ))}
                {entries.length > 5 && (
                    <p className="text-xs text-gray-400">+ {entries.length - 5} perubahan lainnya</p>
                )}
            </div>
        );
    };

    return (
        <AppSidebarLayout>
            <Head title="Activity Log" />

            <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg">
                            <Activity className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 md:text-2xl dark:text-white">
                                Activity Log
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Audit trail seluruh aktivitas di sistem
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        Total: {logs.total.toLocaleString('id-ID')} aktivitas
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Cari aktivitas..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Button type="submit" size="sm">
                                <Search className="mr-1.5 h-4 w-4" />
                                Cari
                            </Button>
                        </form>
                        <div className="flex gap-2">
                            <Button
                                variant={showFilters ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter className="mr-1.5 h-4 w-4" />
                                Filter
                            </Button>
                            {hasActiveFilters && (
                                <Button variant="ghost" size="sm" onClick={clearFilters}>
                                    <X className="mr-1.5 h-4 w-4" />
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 sm:grid-cols-2 lg:grid-cols-5 dark:border-gray-800">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Aksi
                                </label>
                                <Select
                                    value={filters.action || ''}
                                    onValueChange={(v) => applyFilters({ action: v || undefined })}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Semua Aksi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Aksi</SelectItem>
                                        {actions.map((a) => (
                                            <SelectItem key={a} value={a}>
                                                {actionConfig[a]?.label || a}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Pengguna
                                </label>
                                <Select
                                    value={filters.user_id || ''}
                                    onValueChange={(v) => applyFilters({ user_id: v || undefined })}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Semua Pengguna" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Pengguna</SelectItem>
                                        {users.map((u) => (
                                            <SelectItem key={u.id} value={String(u.id)}>
                                                {u.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Tipe Data
                                </label>
                                <Select
                                    value={filters.model_type || ''}
                                    onValueChange={(v) => applyFilters({ model_type: v || undefined })}
                                >
                                    <SelectTrigger className="h-9 text-sm">
                                        <SelectValue placeholder="Semua Tipe" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Semua Tipe</SelectItem>
                                        <SelectItem value="ArsipUnit">Arsip Unit</SelectItem>
                                        <SelectItem value="BerkasArsip">Berkas Arsip</SelectItem>
                                        <SelectItem value="User">Pengguna</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    className="h-9 text-sm"
                                    value={filters.from_date || ''}
                                    onChange={(e) => applyFilters({ from_date: e.target.value || undefined })}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    className="h-9 text-sm"
                                    value={filters.to_date || ''}
                                    onChange={(e) => applyFilters({ to_date: e.target.value || undefined })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Activity Log Timeline */}
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    {logs.data.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {logs.data.map((log) => {
                                const config = actionConfig[log.action] || {
                                    label: log.action,
                                    color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
                                    icon: Activity,
                                };
                                const ActionIcon = config.icon;
                                const modelInfo = log.model_type ? modelTypeLabels[log.model_type] : null;
                                const ModelIcon = modelInfo?.icon || FileText;

                                return (
                                    <div
                                        key={log.id}
                                        className="flex gap-4 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                    >
                                        {/* Timeline Icon */}
                                        <div className="flex flex-col items-center">
                                            <div
                                                className={
                                                    'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ' +
                                                    config.color
                                                }
                                            >
                                                <ActionIcon className="h-4 w-4" />
                                            </div>
                                            <div className="mt-2 h-full w-px bg-gray-200 dark:bg-gray-700" />
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1 pb-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {log.user?.name || 'Sistem'}
                                                </span>
                                                <Badge
                                                    variant="outline"
                                                    className={'text-xs ' + config.color}
                                                >
                                                    {config.label}
                                                </Badge>
                                                {modelInfo && (
                                                    <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                        <ModelIcon className="h-3 w-3" />
                                                        {modelInfo.label}
                                                        {log.model_id && (
                                                            <span className="text-gray-400">
                                                                #{log.model_id}
                                                            </span>
                                                        )}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                                {log.description}
                                            </p>

                                            {renderChanges(log.old_values, log.new_values)}

                                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {getTimeAgo(log.created_at)}
                                                </span>
                                                {log.ip_address && (
                                                    <span>IP: {log.ip_address}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <Activity className="mb-3 h-12 w-12" />
                            <p className="text-lg font-medium">Tidak ada aktivitas</p>
                            <p className="text-sm">
                                {hasActiveFilters
                                    ? 'Coba ubah filter pencarian'
                                    : 'Aktivitas akan tercatat secara otomatis'}
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {logs.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 dark:border-gray-800">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan {logs.from}-{logs.to} dari {logs.total} aktivitas
                            </p>
                            <div className="flex gap-1">
                                {logs.links.map((link, i) => {
                                    if (i === 0) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    if (i === logs.links.length - 1) {
                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                size="sm"
                                                disabled={!link.url}
                                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                                className="h-8 w-8 p-0"
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        );
                                    }
                                    // Show limited page numbers
                                    const pageNum = parseInt(link.label);
                                    if (
                                        isNaN(pageNum) ||
                                        (pageNum > 3 &&
                                            pageNum < logs.last_page - 2 &&
                                            Math.abs(pageNum - logs.current_page) > 1)
                                    ) {
                                        if (
                                            !isNaN(pageNum) &&
                                            (pageNum === 4 || pageNum === logs.last_page - 3) &&
                                            Math.abs(pageNum - logs.current_page) > 1
                                        ) {
                                            return (
                                                <span key={i} className="flex h-8 w-8 items-center justify-center text-xs text-gray-400">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    }
                                    return (
                                        <Button
                                            key={i}
                                            variant={link.active ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                            className="h-8 w-8 p-0 text-xs"
                                        >
                                            {link.label}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppSidebarLayout>
    );
}
