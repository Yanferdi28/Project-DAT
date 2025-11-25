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

interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    role: 'admin' | 'user';
    created_at: string;
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
    filters: {
        search?: string;
        status?: string;
        sort_field?: string;
        sort_direction?: string;
        per_page?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function UsersIndex({ users, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
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
            { search, status, per_page: perPage },
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
            { search, status: value, per_page: perPage },
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
            { search, status, per_page: newPerPage },
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
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Manajemen Pengguna', href: usersRoutes.index().url },
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
                            Manajemen Pengguna
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Total {users.total} pengguna terdaftar
                        </p>
                    </div>
                    <Link href={usersRoutes.create().url}>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            Tambah Pengguna
                        </Button>
                    </Link>
                </div>

                {/* Show Entries & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tampilkan</label>
                        <select
                            value={perPage}
                            onChange={(e) => handlePerPageChange(e.target.value)}
                            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">data</label>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <Input
                            type="text"
                            placeholder="Cari nama atau email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Button type="submit">Cari</Button>
                </form>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                    <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
                    <select
                        value={status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    >
                        <option value="">Semua Status</option>
                        <option value="verified">Terverifikasi</option>
                        <option value="unverified">Belum Verifikasi</option>
                    </select>
                    {(search || status) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSearch('');
                                setStatus('');
                                setPerPage(10);
                                router.get(usersRoutes.index().url);
                            }}
                        >
                            Reset
                        </Button>
                    )}
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('name')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            Nama
                                            {getSortIcon('name')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('email')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            Email
                                            {getSortIcon('email')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSort('created_at')}
                                            className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            Terdaftar
                                            {getSortIcon('created_at')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <User className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                Tidak ada data pengguna
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
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
                                                        Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                        User
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {user.email_verified_at ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        Terverifikasi
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                        Belum Verifikasi
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {user.email_verified_at ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                setVerifyDialog({ open: true, user, action: 'unverify' })
                                                            }
                                                            className="hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 dark:hover:bg-yellow-950 dark:hover:text-yellow-400 dark:hover:border-yellow-700"
                                                            title="Batalkan Verifikasi"
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
                                                            title="Verifikasi Email"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Link href={usersRoutes.edit({ user: user.id }).url}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-700"
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
                                    Menampilkan{' '}
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
                                    dari <span className="font-medium">{users.total}</span> pengguna
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

                    {/* Previous & Next Navigation */}
                    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                Halaman {users.current_page} dari {users.last_page}
                            </span>
                            
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const prevLink = users.links.find(link => link.label.includes('Previous') || link.label.includes('&laquo;'));
                                        if (prevLink?.url) router.get(prevLink.url);
                                    }}
                                    disabled={users.current_page === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Sebelumnya
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const nextLink = users.links.find(link => link.label.includes('Next') || link.label.includes('&raquo;'));
                                        if (nextLink?.url) router.get(nextLink.url);
                                    }}
                                    disabled={users.current_page === users.last_page}
                                    className="flex items-center gap-2"
                                >
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, user: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Hapus Pengguna</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus pengguna{' '}
                            <span className="font-semibold">{deleteDialog.user?.name}</span>? Tindakan
                            ini tidak dapat dibatalkan.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, user: null })}
                            disabled={isDeleting}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Verify Confirmation Dialog */}
            <Dialog open={verifyDialog.open} onOpenChange={(open) => !isVerifying && setVerifyDialog({ open, user: null, action: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {verifyDialog.action === 'verify' ? 'Verifikasi Email Pengguna' : 'Batalkan Verifikasi Email'}
                        </DialogTitle>
                        <DialogDescription>
                            {verifyDialog.action === 'verify' ? (
                                <>
                                    Apakah Anda yakin ingin memverifikasi email pengguna{' '}
                                    <span className="font-semibold">{verifyDialog.user?.name}</span>? 
                                    Pengguna akan ditandai sebagai terverifikasi.
                                </>
                            ) : (
                                <>
                                    Apakah Anda yakin ingin membatalkan verifikasi email pengguna{' '}
                                    <span className="font-semibold">{verifyDialog.user?.name}</span>? 
                                    Pengguna akan ditandai sebagai belum terverifikasi.
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
                            Batal
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={isVerifying}
                            className={verifyDialog.action === 'verify' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-600 hover:bg-yellow-700'}
                        >
                            {isVerifying ? 'Memproses...' : verifyDialog.action === 'verify' ? 'Verifikasi' : 'Batalkan Verifikasi'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
