import { useState } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
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

interface BerkasArsip {
    nomor_berkas: number;
    nama_berkas: string;
    klasifikasi_id: number;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    penyusutan_akhir: string | null;
    lokasi_fisik: string | null;
    uraian: string | null;
    kode_klasifikasi?: {
        kode_klasifikasi: string;
        uraian: string;
    };
    unit_pengolah?: {
        id: number;
        nama_unit: string;
    };
    arsip_units_count?: number;
}

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    uraian: string;
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

interface PaginatedData {
    data: BerkasArsip[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    berkasArsips: PaginatedData;
    kodeKlasifikasis: KodeKlasifikasi[];
    unitPengolahs: UnitPengolah[];
    filters: {
        search?: string;
        klasifikasi_id?: number;
        unit_pengolah_id?: number;
        per_page?: number;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    auth: {
        user: {
            role: string;
            unit_pengolah_id?: number;
        };
    };
    userUnitPengolahId?: number | null;
    [key: string]: any;
}

export default function BerkasArsipIndex() {
    const { t } = useLanguage();
    const { berkasArsips, kodeKlasifikasis, unitPengolahs, filters, flash, auth, userUnitPengolahId } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>(
        filters.klasifikasi_id?.toString() || ''
    );
    // If user has unit_pengolah restriction, auto-lock the filter
    const isUnitPengolahLocked = userUnitPengolahId !== null && userUnitPengolahId !== undefined;
    const [filterUnitPengolah, setFilterUnitPengolah] = useState<string>(
        isUnitPengolahLocked ? userUnitPengolahId.toString() : (filters.unit_pengolah_id?.toString() || '')
    );
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    
    // Export dialog state
    const [exportDialog, setExportDialog] = useState(false);
    const [exportFormat, setExportFormat] = useState('detail');
    const [exportKlasifikasi, setExportKlasifikasi] = useState('');
    const [exportUnitPengolah, setExportUnitPengolah] = useState(
        isUnitPengolahLocked ? userUnitPengolahId!.toString() : ''
    );
    const [exportDariTanggal, setExportDariTanggal] = useState('');
    const [exportSampaiTanggal, setExportSampaiTanggal] = useState('');
    
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: BerkasArsip | null }>({
        open: false,
        item: null,
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const canCreateEdit = !['management', 'operator'].includes(auth.user?.role || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/berkas-arsip',
            { 
                search, 
                klasifikasi_id: filterKlasifikasi || undefined,
                unit_pengolah_id: filterUnitPengolah || undefined,
                per_page: perPage
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            '/berkas-arsip',
            { 
                search, 
                klasifikasi_id: filterKlasifikasi || undefined,
                unit_pengolah_id: filterUnitPengolah || undefined,
                per_page: newPerPage
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setFilterKlasifikasi('');
        setFilterUnitPengolah('');
        setPerPage(10);
        router.get('/berkas-arsip');
    };

    const confirmDelete = (item: BerkasArsip) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDelete = () => {
        if (!deleteDialog.item) return;
        
        setIsDeleting(true);
        router.delete(`/berkas-arsip/${deleteDialog.item.nomor_berkas}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialog({ open: false, item: null });
            },
        });
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        params.append('format', exportFormat);
        if (exportKlasifikasi) params.append('klasifikasi_id', exportKlasifikasi);
        if (exportUnitPengolah) params.append('unit_pengolah_id', exportUnitPengolah);
        if (exportDariTanggal) params.append('dari_tanggal', exportDariTanggal);
        if (exportSampaiTanggal) params.append('sampai_tanggal', exportSampaiTanggal);
        
        window.open(`/berkas-arsip/export/pdf?${params.toString()}`, '_blank');
        setExportDialog(false);
    };

    return (
        <AppSidebarLayout
            breadcrumbs={[
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('berkasArsip.title'), href: '/berkas-arsip' },
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
                            {t('berkasArsip.title')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('users.total')} {berkasArsips.total} {t('berkasArsip.title').toLowerCase()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => setExportDialog(true)}
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            {t('common.print')}
                        </Button>
                        {canCreateEdit && (
                            <Link href="/berkas-arsip/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('berkasArsip.add')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder={t('berkasArsip.search')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div>
                                <select
                                    value={filterKlasifikasi}
                                    onChange={(e) => setFilterKlasifikasi(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                                >
                                    <option value="">{t('berkasArsip.allKlasifikasi')}</option>
                                    {kodeKlasifikasis.map((kode) => (
                                        <option key={kode.id} value={kode.id}>
                                            {kode.kode_klasifikasi} - {kode.uraian}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <select
                                    value={filterUnitPengolah}
                                    onChange={(e) => !isUnitPengolahLocked && setFilterUnitPengolah(e.target.value)}
                                    disabled={isUnitPengolahLocked}
                                    className={`w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 ${isUnitPengolahLocked ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {!isUnitPengolahLocked && <option value="">Semua Unit Pengolah</option>}
                                    {unitPengolahs.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.nama_unit}
                                        </option>
                                    ))}
                                </select>
                                {isUnitPengolahLocked && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        Unit pengolah terkunci sesuai akun Anda
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Search className="h-4 w-4 mr-2" />
                                    {t('users.searchBtn')}
                                </Button>
                                {(search || filterKlasifikasi || filterUnitPengolah) && (
                                    <Button type="button" variant="outline" onClick={handleReset}>
                                        {t('users.reset')}
                                    </Button>
                                )}
                            </div>
                        </div>
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
                                        {t('berkasArsip.namaBerkas')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('berkasArsip.kodeKlasifikasi')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        Unit Pengolah
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('berkasArsip.retensi')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('berkasArsip.lokasiFisik')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('berkasArsip.jumlahArsip')}
                                    </th>
                                    <th className="sticky right-0 bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {berkasArsips.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {t('berkasArsip.noData')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    berkasArsips.data.map((item, index) => (
                                        <tr
                                            key={item.nomor_berkas}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/berkas-arsip/${item.nomor_berkas}`)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {(berkasArsips.current_page - 1) * berkasArsips.per_page + index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                                                {item.nama_berkas}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {item.kode_klasifikasi ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {item.kode_klasifikasi.kode_klasifikasi}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {item.kode_klasifikasi.uraian}
                                                        </div>
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {item.unit_pengolah?.nama_unit || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                <div className="text-xs">
                                                    <div>Aktif: {item.retensi_aktif || '-'}</div>
                                                    <div>Inaktif: {item.retensi_inaktif || '-'}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                                {item.lokasi_fisik || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white text-center">
                                                {item.arsip_units_count || 0}
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {canCreateEdit && (
                                                        <>
                                                            <Link href={`/berkas-arsip/${item.nomor_berkas}/edit`}>
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
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {berkasArsips.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('users.showing')}{' '}
                                    <span className="font-medium">{berkasArsips.from}</span> -{' '}
                                    <span className="font-medium">{berkasArsips.to}</span>{' '}
                                    {t('users.of')} <span className="font-medium">{berkasArsips.total}</span>
                                </p>
                                <div className="flex gap-2">
                                    {berkasArsips.links?.map((link, index) => {
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
                        <DialogTitle>{t('berkasArsip.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('berkasArsip.deleteConfirmation')}
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

            {/* Export Dialog */}
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.print')} {t('berkasArsip.title')}</DialogTitle>
                        <DialogDescription>
                            Pilih format laporan dan filter
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Format Laporan<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={exportFormat}
                                onChange={(e) => setExportFormat(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="detail">Detail - Daftar Isi Berkas Arsip Aktif</option>
                                <option value="summary">Ringkasan - Daftar Berkas Arsip Aktif</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {exportFormat === 'detail' 
                                    ? 'Menampilkan berkas beserta semua item arsip di dalamnya'
                                    : 'Menampilkan ringkasan berkas tanpa detail item arsip'}
                            </p>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Unit Pengolah{isUnitPengolahLocked && ' (terkunci)'}
                            </label>
                            <select
                                value={exportUnitPengolah}
                                onChange={(e) => setExportUnitPengolah(e.target.value)}
                                disabled={isUnitPengolahLocked}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {!isUnitPengolahLocked && <option value="">Semua Unit Pengolah</option>}
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                            {isUnitPengolahLocked && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Unit pengolah terkunci sesuai dengan unit pengolah Anda.
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Kode Klasifikasi
                            </label>
                            <select
                                value={exportKlasifikasi}
                                onChange={(e) => setExportKlasifikasi(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="">Semua Klasifikasi</option>
                                {kodeKlasifikasis.map((kode) => (
                                    <option key={kode.id} value={kode.id}>
                                        {kode.kode_klasifikasi} - {kode.uraian}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={exportDariTanggal}
                                    onChange={(e) => setExportDariTanggal(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={exportSampaiTanggal}
                                    onChange={(e) => setExportSampaiTanggal(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialog(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                            {t('common.print')} PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
