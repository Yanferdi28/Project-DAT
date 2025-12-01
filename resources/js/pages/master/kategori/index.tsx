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
import { useLanguage } from '@/contexts/LanguageContext';

interface Kategori {
    id: number;
    nama_kategori: string;
    deskripsi: string | null;
    sub_kategori_count: number;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface Props {
    kategoris: {
        data: Kategori[];
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

export default function KategoriIndex({ kategoris, filters, flash }: Props) {
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Kategori | null }>({
        open: false,
        item: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/kategori',
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
            '/kategori',
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
        router.get('/kategori');
    };

    const confirmDelete = (item: Kategori) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDelete = () => {
        if (!deleteDialog.item) return;
        
        setIsDeleting(true);
        router.delete(`/kategori/${deleteDialog.item.id}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialog({ open: false, item: null });
            },
        });
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('nav.master'), href: '#' },
                { title: t('kategori.title'), href: '/kategori' },
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
                            {t('kategori.title')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('users.total')} {kategoris.total} {t('kategori.title').toLowerCase()}
                        </p>
                    </div>
                    <Link href="/kategori/create">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Plus className="h-4 w-4 mr-2" />
                            {t('kategori.add')}
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
                            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
                                placeholder={t('kategori.search')}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button type="submit">{t('users.searchBtn')}</Button>
                        {search && (
                            <Button type="button" variant="outline" onClick={handleReset}>
                                {t('users.reset')}
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
                                        {t('users.no')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('kategori.namaKategori')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('kategori.deskripsi')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('kategori.jumlahSubKategori')}
                                    </th>
                                    <th className="sticky right-0 bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {kategoris.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {t('kategori.noData')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    kategoris.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/kategori/${item.id}/edit`)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {(kategoris.current_page - 1) * kategoris.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.nama_kategori}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                                {item.deskripsi || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {item.sub_kategori_count}
                                                </span>
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/kategori/${item.id}/edit`}>
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
                                                        onClick={() => confirmDelete(item)}
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
                    {kategoris.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('users.showing')}{' '}
                                    <span className="font-medium">
                                        {(kategoris.current_page - 1) * kategoris.per_page + 1}
                                    </span>{' '}
                                    -{' '}
                                    <span className="font-medium">
                                        {Math.min(kategoris.current_page * kategoris.per_page, kategoris.total)}
                                    </span>{' '}
                                    {t('users.of')} <span className="font-medium">{kategoris.total}</span>
                                </p>
                                <div className="flex gap-2">
                                    {kategoris.links.map((link, index) => {
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

                    {/* Previous & Next Navigation */}
                    <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {t('users.page')} {kategoris.current_page} {t('users.of')} {kategoris.last_page}
                            </span>
                            
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const prevLink = kategoris.links.find(link => link.label.includes('Previous') || link.label.includes('&laquo;'));
                                        if (prevLink?.url) router.get(prevLink.url);
                                    }}
                                    disabled={kategoris.current_page === 1}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    {t('users.previous')}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const nextLink = kategoris.links.find(link => link.label.includes('Next') || link.label.includes('&raquo;'));
                                        if (nextLink?.url) router.get(nextLink.url);
                                    }}
                                    disabled={kategoris.current_page === kategoris.last_page}
                                    className="flex items-center gap-2"
                                >
                                    {t('users.next')}
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => !isDeleting && setDeleteDialog({ open, item: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('kategori.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('kategori.deleteMessage')}{' '}
                            <span className="font-semibold">{deleteDialog.item?.nama_kategori}</span>? {t('kategori.deleteWarning')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, item: null })}
                            disabled={isDeleting}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? t('users.deleting') : t('common.delete')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
