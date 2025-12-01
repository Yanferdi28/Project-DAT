import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, SquarePen, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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

interface PaginatedData {
    data: BerkasArsip[];
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
    };
    [key: string]: any;
}

export default function Index() {
    const { t } = useLanguage();
    const { berkasArsips, kodeKlasifikasis, unitPengolahs, filters, auth } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [filterKlasifikasi, setFilterKlasifikasi] = useState<string>(
        filters.klasifikasi_id?.toString() || ''
    );
    const [filterUnitPengolah, setFilterUnitPengolah] = useState<string>(
        filters.unit_pengolah_id?.toString() || ''
    );
    
    // Export dialog state
    const [exportDialog, setExportDialog] = useState(false);
    const [exportFormat, setExportFormat] = useState('detail');
    const [exportKlasifikasi, setExportKlasifikasi] = useState('');
    const [exportUnitPengolah, setExportUnitPengolah] = useState('');
    const [exportDariTanggal, setExportDariTanggal] = useState('');
    const [exportSampaiTanggal, setExportSampaiTanggal] = useState('');
    
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [selectedBerkasArsip, setSelectedBerkasArsip] = useState<BerkasArsip | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/berkas-arsip',
            { 
                search, 
                klasifikasi_id: filterKlasifikasi || undefined,
                unit_pengolah_id: filterUnitPengolah || undefined 
            },
            { preserveState: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setFilterKlasifikasi('');
        setFilterUnitPengolah('');
        router.get('/berkas-arsip');
    };

    const handleDelete = () => {
        if (!selectedBerkasArsip) return;

        setIsDeleting(true);
        router.delete(`/berkas-arsip/${selectedBerkasArsip.nomor_berkas}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteDialog(false);
                setSelectedBerkasArsip(null);
            },
            onFinish: () => setIsDeleting(false),
        });
    };

    const openDeleteDialog = (berkasArsip: BerkasArsip) => {
        setSelectedBerkasArsip(berkasArsip);
        setDeleteDialog(true);
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
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: t('berkasArsip.title'), href: '' },
            ]}
        >
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {t('berkasArsip.title')}
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {t('berkasArsip.description')}
                    </p>
                </div>
                {!['management', 'operator'].includes(auth.user?.role || '') && (
                    <Link
                        href="/berkas-arsip/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        {t('berkasArsip.add')}
                    </Link>
                )}
            </div>
            <div className="space-y-6">
                {/* Search and Filter */}
                <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('berkasArsip.search')}
                                </label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('berkasArsip.search')}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {t('berkasArsip.filterKlasifikasi')}
                                </label>
                                <select
                                    value={filterKlasifikasi}
                                    onChange={(e) => setFilterKlasifikasi(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Filter Unit Pengolah
                                </label>
                                <select
                                    value={filterUnitPengolah}
                                    onChange={(e) => setFilterUnitPengolah(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">Semua Unit Pengolah</option>
                                    {unitPengolahs.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.nama_unit}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <Search className="h-4 w-4" />
                                {t('common.search')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {t('common.reset')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportDialog(true)}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                            >
                                Cetak
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="overflow-x-auto relative">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        No
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('berkasArsip.namaBerkas')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('berkasArsip.kodeKlasifikasi')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        Unit Pengolah
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('berkasArsip.retensi')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('berkasArsip.lokasiFisik')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('berkasArsip.jumlahArsip')}
                                    </th>
                                    <th className="sticky right-0 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {berkasArsips.data.length > 0 ? (
                                    berkasArsips.data.map((berkas, index) => (
                                        <tr
                                            key={berkas.nomor_berkas}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                            onClick={() => router.visit(`/berkas-arsip/${berkas.nomor_berkas}`)}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {berkasArsips.from + index}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {berkas.nama_berkas}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {berkas.kode_klasifikasi ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {berkas.kode_klasifikasi.kode_klasifikasi}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {berkas.kode_klasifikasi.uraian}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {berkas.unit_pengolah?.nama_unit || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                <div className="text-xs">
                                                    <div>Aktif: {berkas.retensi_aktif || '-'}</div>
                                                    <div>Inaktif: {berkas.retensi_inaktif || '-'}</div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {berkas.lokasi_fisik || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-gray-900 dark:text-white">
                                                {berkas.arsip_units_count || 0}
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 whitespace-nowrap px-4 py-3 text-center shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {!['management', 'operator'].includes(auth.user?.role || '') && (
                                                        <>
                                                            <Link
                                                                href={`/berkas-arsip/${berkas.nomor_berkas}/edit`}
                                                                className="text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                                title={t('common.edit')}
                                                            >
                                                                <SquarePen className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => openDeleteDialog(berkas)}
                                                                className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                                title={t('common.delete')}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {t('berkasArsip.noData')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {berkasArsips.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                {t('users.showing')} {berkasArsips.from} {t('users.to')} {berkasArsips.to}{' '}
                                {t('users.of')} {berkasArsips.total} {t('users.results')}
                            </div>
                            <div className="flex gap-2">
                                {Array.from({ length: berkasArsips.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/berkas-arsip?page=${page}${search ? `&search=${search}` : ''}${filterKlasifikasi ? `&klasifikasi_id=${filterKlasifikasi}` : ''}${filterUnitPengolah ? `&unit_pengolah_id=${filterUnitPengolah}` : ''}`}
                                        className={`rounded px-3 py-1 text-sm ${
                                            page === berkasArsips.current_page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('berkasArsip.deleteTitle')}</DialogTitle>
                        <DialogDescription>{t('berkasArsip.deleteConfirmation')}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setDeleteDialog(false)}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                        >
                            {isDeleting ? t('common.deleting') : t('common.delete')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-center">Cetak Berkas Arsip</DialogTitle>
                        <DialogDescription className="text-center">
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
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                Filter Unit Pengolah
                            </label>
                            <select
                                value={exportUnitPengolah}
                                onChange={(e) => setExportUnitPengolah(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">Semua Unit Pengolah</option>
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Kode Klasifikasi
                            </label>
                            <select
                                value={exportKlasifikasi}
                                onChange={(e) => setExportKlasifikasi(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                <input
                                    type="date"
                                    value={exportDariTanggal}
                                    onChange={(e) => setExportDariTanggal(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={exportSampaiTanggal}
                                    onChange={(e) => setExportSampaiTanggal(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="flex gap-2">
                        <button
                            onClick={() => setExportDialog(false)}
                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Cetak PDF
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
