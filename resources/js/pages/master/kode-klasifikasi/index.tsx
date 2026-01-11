import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { FileText, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
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

// Helper functions for labels
const getStatusAkhirLabel = (status: string) => {
    const labels: Record<string, string> = {
        musnah: 'Musnah',
        permanen: 'Permanen',
        dinilaikembali: 'Dinilai Kembali'
    };
    return labels[status.toLowerCase().replace(' ', '')] || status;
};

const getKeamananLabel = (keamanan: string) => {
    const labels: Record<string, string> = {
        biasa: 'Biasa',
        rahasia: 'Rahasia',
        terbatas: 'Terbatas'
    };
    return labels[keamanan.toLowerCase()] || keamanan;
};

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    kode_klasifikasi_induk: string | null;
    uraian: string;
    retensi_aktif: number;
    retensi_inaktif: number;
    status_akhir: 'Musnah' | 'Permanen' | 'Dinilai Kembali';
    klasifikasi_keamanan: 'Biasa' | 'Rahasia' | 'Terbatas';
    parent?: {
        kode_klasifikasi: string;
        uraian: string;
    };
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    kodeKlasifikasis: {
        data: KodeKlasifikasi[];
        links: PaginationLink[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        per_page?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function KodeKlasifikasiIndex({ kodeKlasifikasis, filters, flash }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: KodeKlasifikasi | null }>({
        open: false,
        item: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/kode-klasifikasi',
            { search, per_page: perPage },
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
            '/kode-klasifikasi',
            { search, per_page: newPerPage },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleReset = () => {
        setSearch('');
        setPerPage(10);
        router.get('/kode-klasifikasi');
    };

    const confirmDelete = (item: KodeKlasifikasi) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDelete = () => {
        if (!deleteDialog.item) return;
        
        setIsDeleting(true);
        router.delete(`/kode-klasifikasi/${deleteDialog.item.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialog({ open: false, item: null });
            },
        });
    };

    const getStatusBadge = (status: string) => {
        const colors = {
            'Musnah': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'Permanen': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            'Dinilai Kembali': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getKeamananBadge = (keamanan: string) => {
        const colors = {
            'Biasa': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            'Rahasia': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            'Terbatas': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
        };
        return colors[keamanan as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Master', href: '#' },
                { title: 'Kode Klasifikasi', href: '/kode-klasifikasi' },
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
                            {'Kode Klasifikasi'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {'Total'} {kodeKlasifikasis.total} {'Kode Klasifikasi'.toLowerCase()}
                        </p>
                    </div>
                    <Link href="/kode-klasifikasi/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            {'Tambah Kode Klasifikasi'}
                        </Button>
                    </Link>
                </div>

                {/* Show Entries & Search */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{'Tampilkan'}</label>
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{'data'}</label>
                    </div>
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                type="text"
                                placeholder={'Cari kode atau uraian...'}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit">{'Cari'}</Button>
                        {search && (
                            <Button type="button" variant="outline" onClick={handleReset}>
                                {'Reset'}
                            </Button>
                        )}
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-800">
                    <div className="overflow-x-auto relative">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'No'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Kode'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Uraian'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Kode Induk'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Retensi Aktif'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Retensi Inaktif'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Status Akhir'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Klasifikasi Keamanan'}
                                    </th>
                                    <th className="sticky right-0 bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {'Aksi'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {kodeKlasifikasis.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {'Tidak ada data kode klasifikasi'}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    kodeKlasifikasis.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/kode-klasifikasi/${item.id}/edit`)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {(kodeKlasifikasis.current_page - 1) * kodeKlasifikasis.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-white">{item.kode_klasifikasi}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {item.uraian}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.parent ? (
                                                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{item.parent.kode_klasifikasi}</span>
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {item.retensi_aktif} {'Tahun'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {item.retensi_inaktif} {'Tahun'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(item.status_akhir)}`}>
                                                    {getStatusAkhirLabel(item.status_akhir)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKeamananBadge(item.klasifikasi_keamanan)}`}>
                                                    {getKeamananLabel(item.klasifikasi_keamanan)}
                                                </span>
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/kode-klasifikasi/${item.id}/edit`}>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-700"
                                                            title={'Edit'}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </Link>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => confirmDelete(item)}
                                                        className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-700"
                                                        title={'Hapus'}
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
                    {kodeKlasifikasis.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {'Menampilkan'}{' '}
                                    <span className="font-medium">
                                        {(kodeKlasifikasis.current_page - 1) * kodeKlasifikasis.per_page + 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-medium">
                                        {Math.min(kodeKlasifikasis.current_page * kodeKlasifikasis.per_page, kodeKlasifikasis.total)}
                                    </span>{' '}
                                    {'dari'} <span className="font-medium">{kodeKlasifikasis.total}</span>
                                </p>
                                <div className="flex gap-2">
                                    {kodeKlasifikasis.links.map((link, index) => {
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
                                                className={link.active ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
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
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, item: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{'Konfirmasi Hapus Kode Klasifikasi'}</DialogTitle>
                        <DialogDescription>
                            {'Apakah Anda yakin ingin menghapus kode klasifikasi'}{' '}
                            <span className="font-semibold">{deleteDialog.item?.kode_klasifikasi}</span>? {'Tindakan ini tidak dapat dibatalkan.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, item: null })}
                            disabled={isDeleting}
                        >
                            {'Batal'}
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
        </AppSidebarLayout>
    );
}
