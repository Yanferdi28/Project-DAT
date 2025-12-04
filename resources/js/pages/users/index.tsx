import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { User, Plus, Search, Edit, Trash2, ChevronUp, ChevronDown, Filter, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import * as usersRoutes from '@/routes/users';
import { useLanguage } from '@/contexts/LanguageContext';

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'admin' | 'user';
    unit_pengolah_id: number | null;
    unit_pengolah?: {
        id: number;
        nama_unit: string;
    };
    created_at: string;
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    users: {
        data: User[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    unitPengolahs: UnitPengolah[];
    filters: {
        search?: string;
        status?: string;
        unit_pengolah_id?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function UsersIndex({ users, unitPengolahs, filters, flash }: Props) {
    const { language, t } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitPengolahFilter, setUnitPengolahFilter] = useState(filters.unit_pengolah_id || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({
        open: false,
        user: null,
    });
    const [verifyDialog, setVerifyDialog] = useState<{ open: boolean; user: User | null; action: 'verify' | 'unverify' | null }>({
        open: false,
        user: null,
        action: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            usersRoutes.index().url,
            { search, status, unit_pengolah_id: unitPengolahFilter, per_page: perPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(
            usersRoutes.index().url,
            { search, status: value, unit_pengolah_id: unitPengolahFilter, per_page: perPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleUnitPengolahChange = (value: string) => {
        setUnitPengolahFilter(value);
        router.get(
            usersRoutes.index().url,
            { search, status, unit_pengolah_id: value, per_page: perPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            usersRoutes.index().url,
            { search, status, unit_pengolah_id: unitPengolahFilter, per_page: newPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleSort = (field: string) => {
        const direction =
            filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';
        router.get(
            usersRoutes.index().url,
            {
                ...filters,
                sort_field: field,
                sort_direction: direction,
                per_page: perPage,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleDelete = () => {
        if (!deleteDialog.user) return;

        setIsDeleting(true);
        router.delete(usersRoutes.destroy({ user: deleteDialog.user.id }).url, {
            onSuccess: () => {
                setDeleteDialog({ open: false, user: null });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleVerify = () => {
        if (!verifyDialog.user || !verifyDialog.action) return;

        setIsVerifying(true);
        const url = verifyDialog.action === 'verify' 
            ? `/users/${verifyDialog.user.id}/verify`
            : `/users/${verifyDialog.user.id}/unverify`;

        router.post(url, {}, {
            onSuccess: () => {
                setVerifyDialog({ open: false, user: null, action: null });
            },
            onFinish: () => {
                setIsVerifying(false);
            },
        });
    };

    const getSortIcon = (field: string) => {
        if (filters.sort_field !== field) return null;
        return filters.sort_direction === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
        ) : (
            <ChevronDown className="h-4 w-4" />
        );
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('nav.userManagement'), href: usersRoutes.index().url },
            ]}
        >
            <div className="space-y-6">
                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                        {flash.error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                            {t('users.title')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('users.total')} {users.total} {t('users.totalRegistered')}
                        </p>
                    </div>
                    <Link href={usersRoutes.create().url}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('users.addUser')}
                        </Button>
                    </Link>
                </div>

                {/* Show Entries & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('users.showEntries')}</label>
                        <select
                            value={perPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('users.entries')}</label>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="text"
                            placeholder={t('users.searchPlaceholder')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">{t('users.searchBtn')}</Button>
                </form>
                </div>

                {/* Filter */}
                <div className="flex flex-wrap items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('users.filter')}:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="flex-1 min-w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                    >
                        <option value="">{t('users.allStatus')}</option>
                        <option value="verified">{t('users.verified')}</option>
                        <option value="unverified">{t('users.unverified')}</option>
                    </select>
                    <select
                        value={unitPengolahFilter}
                        onChange={(e) => handleUnitPengolahChange(e.target.value)}
                        className="flex-1 min-w-[150px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                    >
                        <option value="">Semua Unit Pengolah</option>
                        {unitPengolahs.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.nama_unit}
                            </option>
                        ))}
                    </select>
                    {(search || status || unitPengolahFilter) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                setUnitPengolahFilter('');
                                setPerPage(10);
                                router.get(usersRoutes.index().url);
                            }}
                        >
                            {t('users.reset')}
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto relative">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('users.no')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {t('users.name')}
                                            {getSortIcon('name')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('email')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {t('users.email')}
                                            {getSortIcon('email')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('users.role')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Unit Pengolah
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('users.status')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('created_at')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            {t('users.registered')}
                                            {getSortIcon('created_at')}
                                        </button>
                                    </th>
                                    <th className="sticky right-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <User className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {t('users.noData')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(usersRoutes.edit({ user: user.id }).url)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {(users.current_page - 1) * users.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.role === 'admin' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                                                        {t('users.admin')}
                                                    </span>
                                                ) : user.role === 'management' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                        {t('users.management')}
                                                    </span>
                                                ) : user.role === 'operator' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                                                        {t('users.operator')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        {t('users.user')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {user.unit_pengolah?.nama_unit || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        {t('users.verified')}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        {t('users.unverified')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {user.email_verified_at ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setVerifyDialog({ open: true, user, action: 'unverify' })
                                                            }
                                                            className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 dark:hover:bg-yellow-950 dark:hover:text-yellow-400 dark:hover:border-yellow-700"
                                                            title={t('users.unverify')}
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setVerifyDialog({ open: true, user, action: 'verify' })
                                                            }
                                                            className="hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-950 dark:hover:text-green-400 dark:hover:border-green-700"
                                                            title={t('users.verify')}
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Link href={usersRoutes.edit({ user: user.id }).url}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-700"
                                                            title={t('users.edit')}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            setDeleteDialog({ open: true, user })
                                                        }
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-700"
                                                        title={t('users.delete')}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {users.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('users.showing')}{' '}
                                    <span className="font-medium">
                                        {(users.current_page - 1) * users.per_page + 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-medium">
                                        {Math.min(
                                            users.current_page * users.per_page,
                                            users.total
                                        )}
                                    </span>{' '}
                                    {t('users.of')} <span className="font-medium">{users.total}</span> {t('users.totalRegistered')}
                                </p>
                                <div className="flex gap-2">
                                    {users.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    disabled
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => router.get(link.url!)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                                className={
                                                    link.active
                                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                        : ''
                                                }
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('users.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('users.deleteMessage')}{' '}
                            <span className="font-semibold">{deleteDialog.user?.name}</span>? {t('users.deleteWarning')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, user: null })}
                            disabled={isDeleting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('users.deleting') : t('users.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Confirmation Dialog */}
            <Dialog open={verifyDialog.open} onOpenChange={(open) => !isVerifying && setVerifyDialog({ open, user: null, action: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {verifyDialog.action === 'verify' ? t('users.verifyTitle') : t('users.unverifyTitle')}
                        </DialogTitle>
                        <DialogDescription>
                            {verifyDialog.action === 'verify' ? (
                                <>
                                    {t('users.verifyMessage')}{' '}
                                    <span className="font-semibold">{verifyDialog.user?.name}</span>? {t('users.verifyNote')}
                                </>
                            ) : (
                                <>
                                    {t('users.unverifyMessage')}{' '}
                                    <span className="font-semibold">{verifyDialog.user?.name}</span>? {t('users.unverifyNote')}
                                </>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setVerifyDialog({ open: false, user: null, action: null })}
                            disabled={isVerifying}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className={verifyDialog.action === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
                        >
                            {isVerifying ? t('users.processing') : verifyDialog.action === 'verify' ? t('users.verify') : t('users.unverify')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
