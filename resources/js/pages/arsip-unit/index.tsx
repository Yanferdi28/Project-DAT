import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { Search, Plus, SquarePen, Trash2, FolderInput } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ArsipUnit {
    id_berkas: number;
    no_item_arsip: string | null;
    indeks: string | null;
    uraian_informasi: string | null;
    tanggal: string | null;
    jumlah_nilai: number;
    jumlah_satuan: string;
    tingkat_perkembangan: string;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    skkaad: string | null;
    ruangan: string | null;
    no_filling: string | null;
    no_laci: string | null;
    no_folder: string | null;
    no_box: string | null;
    status: 'pending' | 'diterima' | 'ditolak';
    publish_status: 'draft' | 'published' | 'archived';
    berkas_arsip_id: number | null;
    kode_klasifikasi_id: number | null;
    unit_pengolah_arsip_id: number | null;
    kode_klasifikasi?: {
        id: number;
        kode_klasifikasi: string;
        uraian: string;
    };
    unit_pengolah?: {
        id: number;
        nama: string;
    };
    berkas_arsip?: {
        nama_berkas: string;
    };
    kategori?: {
        nama: string;
    };
    sub_kategori?: {
        nama: string;
    };
}

interface BerkasArsip {
    nomor_berkas: number;
    nama_berkas: string;
    klasifikasi_id: number;
    unit_pengolah_id: number | null;
    kode_klasifikasi?: {
        kode_klasifikasi: string;
        uraian: string;
    };
    unit_pengolah?: {
        nama_unit: string;
    };
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PaginatedData {
    data: ArsipUnit[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PageProps {
    arsipUnits: PaginatedData;
    berkasArsips: BerkasArsip[];
    unitPengolahs: UnitPengolah[];
    filters: {
        search?: string;
        status?: string;
        publish_status?: string;
    };
    auth: {
        user: {
            role: string;
        };
    };
    [key: string]: any;
}

export default function Index({ arsipUnits, berkasArsips, unitPengolahs, filters }: PageProps) {
    const { auth } = usePage<PageProps>().props;
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [publishStatus, setPublishStatus] = useState(filters.publish_status || '');
    
    // Export dialog state
    const [exportDialog, setExportDialog] = useState(false);
    const [exportFormat] = useState('pdf');
    const [dariTanggal, setDariTanggal] = useState('');
    const [sampaiTanggal, setSampaiTanggal] = useState('');
    const [exportStatus, setExportStatus] = useState('');
    const [exportUnitPengolah, setExportUnitPengolah] = useState('');
    
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; arsipUnit: ArsipUnit | null }>({
        open: false,
        arsipUnit: null,
    });
    const [assignDialog, setAssignDialog] = useState<{ open: boolean; arsipUnit: ArsipUnit | null }>({
        open: false,
        arsipUnit: null,
    });
    const [selectedBerkasId, setSelectedBerkasId] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/arsip-unit',
            { search, status, publish_status: publishStatus },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPublishStatus('');
        router.get('/arsip-unit', {}, { preserveState: true, replace: true });
    };

    const handleDelete = () => {
        if (!deleteDialog.arsipUnit) return;

        setIsDeleting(true);
        router.delete(`/arsip-unit/${deleteDialog.arsipUnit.id_berkas}`, {
            onSuccess: () => {
                setDeleteDialog({ open: false, arsipUnit: null });
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const handleStatusChange = (arsipUnitId: number, newStatus: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/status`,
            { status: newStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be handled by Laravel
                },
            }
        );
    };

    const handlePublishStatusChange = (arsipUnitId: number, newPublishStatus: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/publish-status`,
            { publish_status: newPublishStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be handled by Laravel
                },
            }
        );
    };

    const handleAssignToBerkas = () => {
        if (!assignDialog.arsipUnit || !selectedBerkasId) return;

        setIsAssigning(true);
        router.patch(
            `/arsip-unit/${assignDialog.arsipUnit.id_berkas}/assign-to-berkas`,
            { berkas_arsip_id: selectedBerkasId },
            {
                onSuccess: () => {
                    setAssignDialog({ open: false, arsipUnit: null });
                    setSelectedBerkasId('');
                },
                onFinish: () => {
                    setIsAssigning(false);
                },
            }
        );
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (dariTanggal) params.append('dari_tanggal', dariTanggal);
        if (sampaiTanggal) params.append('sampai_tanggal', sampaiTanggal);
        if (exportStatus) params.append('status', exportStatus);
        if (exportUnitPengolah) params.append('unit_pengolah_id', exportUnitPengolah);
        
        window.open(`/arsip-unit/export/pdf?${params.toString()}`, '_blank');
        setExportDialog(false);
    };

    const canManageStatus = auth.user.role === 'operator' || auth.user.role === 'admin';

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            diterima: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            ditolak: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return badges[status as keyof typeof badges] || badges.pending;
    };

    const getPublishStatusBadge = (status: string) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return badges[status as keyof typeof badges] || badges.draft;
    };

    return (
        <AppLayout>
            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {t('arsipUnit.title')}
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            {t('users.totalRegistered').replace('pengguna', 'arsip unit')}: {arsipUnits.total}
                        </p>
                    </div>
                    {!['management', 'operator'].includes(auth.user?.role || '') && (
                        <Link
                            href="/arsip-unit/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4" />
                            {t('arsipUnit.add')}
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('arsipUnit.search')}
                                    className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>

                            <div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">{t('arsipUnit.allStatus')}</option>
                                    <option value="pending">{t('arsipUnit.pending')}</option>
                                    <option value="diterima">{t('arsipUnit.diterima')}</option>
                                    <option value="ditolak">{t('arsipUnit.ditolak')}</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={publishStatus}
                                    onChange={(e) => setPublishStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                >
                                    <option value="">{t('arsipUnit.allPublishStatus')}</option>
                                    <option value="draft">{t('arsipUnit.draft')}</option>
                                    <option value="published">{t('arsipUnit.published')}</option>
                                    <option value="archived">{t('arsipUnit.archived')}</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                {t('users.searchBtn')}
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                {t('users.reset')}
                            </button>
                            <button
                                type="button"
                                onClick={() => setExportDialog(true)}
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                            >
                                {t('common.print')}
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
                                        {t('arsipUnit.kodeKlasifikasi')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.indeks')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.uraianInformasi')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.tanggal')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.unitPengolah')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.status')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.publishStatus')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.kategori')}
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                                        {t('arsipUnit.subKategori')}
                                    </th>
                                    <th className="sticky right-0 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {arsipUnits.data.length > 0 ? (
                                    arsipUnits.data.map((arsipUnit, index) => (
                                        <tr
                                            key={arsipUnit.id_berkas}
                                            className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                                            onClick={() => router.visit(`/arsip-unit/${arsipUnit.id_berkas}`)}
                                        >
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnits.from + index}
                                            </td>
                                            <td className="px-4 py-3 text-sm">
                                                {arsipUnit.kode_klasifikasi ? (
                                                    <div>
                                                        <div className="font-medium text-gray-900 dark:text-white">
                                                            {arsipUnit.kode_klasifikasi.kode_klasifikasi}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {arsipUnit.kode_klasifikasi.uraian}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.indeks || '-'}
                                            </td>
                                            <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.uraian_informasi || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.tanggal ? new Date(arsipUnit.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.unit_pengolah?.nama || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                {canManageStatus ? (
                                                    <Select
                                                        value={arsipUnit.status}
                                                        onValueChange={(value) =>
                                                            handleStatusChange(arsipUnit.id_berkas, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">
                                                                {t('arsipUnit.pending')}
                                                            </SelectItem>
                                                            <SelectItem value="diterima">
                                                                {t('arsipUnit.diterima')}
                                                            </SelectItem>
                                                            <SelectItem value="ditolak">
                                                                {t('arsipUnit.ditolak')}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(arsipUnit.status)}`}
                                                    >
                                                        {t(`arsipUnit.${arsipUnit.status}`)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                {canManageStatus ? (
                                                    <Select
                                                        value={arsipUnit.publish_status}
                                                        onValueChange={(value) =>
                                                            handlePublishStatusChange(arsipUnit.id_berkas, value)
                                                        }
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">
                                                                {t('arsipUnit.draft')}
                                                            </SelectItem>
                                                            <SelectItem value="published">
                                                                {t('arsipUnit.published')}
                                                            </SelectItem>
                                                            <SelectItem value="archived">
                                                                {t('arsipUnit.archived')}
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPublishStatusBadge(arsipUnit.publish_status)}`}
                                                    >
                                                        {t(`arsipUnit.${arsipUnit.publish_status}`)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.kategori?.nama || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">
                                                {arsipUnit.sub_kategori?.nama || '-'}
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 whitespace-nowrap px-4 py-3 text-center shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {!['management', 'operator'].includes(auth.user?.role || '') && canManageStatus && (
                                                        <button
                                                            onClick={() => {
                                                                setAssignDialog({ open: true, arsipUnit });
                                                                setSelectedBerkasId(arsipUnit.berkas_arsip_id?.toString() || '');
                                                            }}
                                                            className="text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                                                            title="Masukkan ke Berkas"
                                                        >
                                                            <FolderInput className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    {!['management', 'operator'].includes(auth.user?.role || '') && (
                                                        <>
                                                            <Link
                                                                href={`/arsip-unit/${arsipUnit.id_berkas}/edit`}
                                                                className="text-yellow-600 transition-colors hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                                title={t('users.edit')}
                                                            >
                                                                <SquarePen className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() =>
                                                                    setDeleteDialog({ open: true, arsipUnit })
                                                                }
                                                                className="text-red-600 transition-colors hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                                title={t('users.delete')}
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
                                            colSpan={11}
                                            className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                                        >
                                            {t('arsipUnit.noData')}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {arsipUnits.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-800">
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                {t('users.showing')} {arsipUnits.from} - {arsipUnits.to} {t('users.of')}{' '}
                                {arsipUnits.total}
                            </div>
                            <div className="flex gap-2">
                                {arsipUnits.current_page > 1 && (
                                    <Link
                                        href={`/arsip-unit?page=${arsipUnits.current_page - 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${publishStatus ? `&publish_status=${publishStatus}` : ''}`}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        {t('users.previous')}
                                    </Link>
                                )}
                                {arsipUnits.current_page < arsipUnits.last_page && (
                                    <Link
                                        href={`/arsip-unit?page=${arsipUnits.current_page + 1}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}${publishStatus ? `&publish_status=${publishStatus}` : ''}`}
                                        className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                    >
                                        {t('users.next')}
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, arsipUnit: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('arsipUnit.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('arsipUnit.deleteMessage')} "{deleteDialog.arsipUnit?.no_item_arsip || deleteDialog.arsipUnit?.id_berkas}"?
                            <br />
                            <span className="text-red-600 dark:text-red-400">
                                {t('arsipUnit.deleteWarning')}
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setDeleteDialog({ open: false, arsipUnit: null })}
                            disabled={isDeleting}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isDeleting ? t('users.deleting') : t('common.delete')}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Assign to Berkas Dialog */}
            <Dialog open={assignDialog.open} onOpenChange={(open) => {
                if (!open) {
                    setAssignDialog({ open: false, arsipUnit: null });
                    setSelectedBerkasId('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Masukkan ke Berkas Arsip</DialogTitle>
                        <DialogDescription>
                            Pilih berkas arsip untuk arsip unit ini. Hanya berkas arsip dengan kode klasifikasi dan unit pengolah yang sama yang akan ditampilkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {/* Info tentang arsip unit yang dipilih */}
                        {assignDialog.arsipUnit && (
                            <div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Kode Klasifikasi:</strong>{' '}
                                    {assignDialog.arsipUnit.kode_klasifikasi?.kode_klasifikasi || '-'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Unit Pengolah:</strong>{' '}
                                    {assignDialog.arsipUnit.unit_pengolah?.nama || '-'}
                                </p>
                            </div>
                        )}
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Berkas Arsip
                        </label>
                        {(() => {
                            // Filter berkas arsip berdasarkan kode klasifikasi dan unit pengolah yang sama
                            const filteredBerkasArsips = berkasArsips.filter((berkas) => {
                                const sameKlasifikasi = berkas.klasifikasi_id === assignDialog.arsipUnit?.kode_klasifikasi_id;
                                const sameUnitPengolah = berkas.unit_pengolah_id === assignDialog.arsipUnit?.unit_pengolah_arsip_id;
                                return sameKlasifikasi && sameUnitPengolah;
                            });

                            if (filteredBerkasArsips.length === 0) {
                                return (
                                    <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-600 dark:bg-yellow-900/20">
                                        <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                            Tidak ada berkas arsip yang sesuai dengan kode klasifikasi dan unit pengolah arsip unit ini.
                                        </p>
                                    </div>
                                );
                            }

                            return (
                                <Select value={selectedBerkasId} onValueChange={setSelectedBerkasId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih berkas arsip..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredBerkasArsips.map((berkas) => (
                                            <SelectItem key={berkas.nomor_berkas} value={berkas.nomor_berkas.toString()}>
                                                {berkas.nama_berkas}
                                                {berkas.kode_klasifikasi && (
                                                    <span className="ml-2 text-xs text-gray-500">
                                                        ({berkas.kode_klasifikasi.kode_klasifikasi})
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            );
                        })()}
                        {assignDialog.arsipUnit?.berkas_arsip_id && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Saat ini: {assignDialog.arsipUnit?.berkas_arsip?.nama_berkas || '-'}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => {
                                setAssignDialog({ open: false, arsipUnit: null });
                                setSelectedBerkasId('');
                            }}
                            disabled={isAssigning}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleAssignToBerkas}
                            disabled={isAssigning || !selectedBerkasId}
                            className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAssigning ? t('common.saving') : 'Masukkan ke Berkas'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogContent className="max-w-md bg-gray-900 text-white">
                    <DialogHeader>
                        <DialogTitle className="text-center">Cetak Arsip Unit</DialogTitle>
                        <DialogDescription className="text-center text-gray-400">
                            Pilih format ekspor dan rentang tanggal
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Format Ekspor<span className="text-red-500">*</span>
                            </label>
                            <select
                                value={exportFormat}
                                disabled
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                            >
                                <option value="pdf">PDF</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Dari Tanggal<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={dariTanggal}
                                onChange={(e) => setDariTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                            />
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Sampai Tanggal<span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={sampaiTanggal}
                                onChange={(e) => setSampaiTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                            />
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Filter Status
                            </label>
                            <select
                                value={exportStatus}
                                onChange={(e) => setExportStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="diterima">Diterima</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium">
                                Filter Unit Pengolah
                            </label>
                            <select
                                value={exportUnitPengolah}
                                onChange={(e) => setExportUnitPengolah(e.target.value)}
                                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white"
                            >
                                <option value="">Pilih Unit Pengolah</option>
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <DialogFooter className="flex gap-2">
                        <button
                            onClick={() => setExportDialog(false)}
                            className="flex-1 rounded-lg border border-gray-700 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Konfirmasi!
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
