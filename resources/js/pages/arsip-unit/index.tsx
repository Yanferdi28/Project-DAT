import { useState } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Edit, Trash2, FolderInput, Printer } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: ArsipUnit[];
    links: PaginationLink[];
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

export default function ArsipUnitIndex({ arsipUnits, berkasArsips, unitPengolahs, filters, flash }: PageProps) {
    const { auth, userUnitPengolahId } = usePage<PageProps>().props;
    const { t } = useLanguage();
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [publishStatus, setPublishStatus] = useState(filters.publish_status || '');
    const [perPage, setPerPage] = useState(filters.per_page || 10);
    
    // Check if user has unit_pengolah restriction
    const isUnitPengolahLocked = userUnitPengolahId !== null && userUnitPengolahId !== undefined;
    
    // Export dialog state
    const [exportDialog, setExportDialog] = useState(false);
    const [dariTanggal, setDariTanggal] = useState('');
    const [sampaiTanggal, setSampaiTanggal] = useState('');
    const [exportStatus, setExportStatus] = useState('');
    const [exportUnitPengolah, setExportUnitPengolah] = useState(
        isUnitPengolahLocked ? userUnitPengolahId!.toString() : ''
    );
    
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: ArsipUnit | null }>({
        open: false,
        item: null,
    });
    const [assignDialog, setAssignDialog] = useState<{ open: boolean; item: ArsipUnit | null }>({
        open: false,
        item: null,
    });
    const [selectedBerkasId, setSelectedBerkasId] = useState<string>('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/arsip-unit',
            { search, status, publish_status: publishStatus, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            '/arsip-unit',
            { search, status, publish_status: publishStatus, per_page: newPerPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setStatus('');
        setPublishStatus('');
        setPerPage(10);
        router.get('/arsip-unit');
    };

    const confirmDelete = (item: ArsipUnit) => {
        setDeleteDialog({ open: true, item });
    };

    const handleDelete = () => {
        if (!deleteDialog.item) return;
        
        setIsDeleting(true);
        router.delete(`/arsip-unit/${deleteDialog.item.id_berkas}`, {
            preserveScroll: true,
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialog({ open: false, item: null });
            },
        });
    };

    const handleStatusChange = (arsipUnitId: number, newStatus: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/status`,
            { status: newStatus },
            { preserveScroll: true }
        );
    };

    const handlePublishStatusChange = (arsipUnitId: number, newPublishStatus: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/publish-status`,
            { publish_status: newPublishStatus },
            { preserveScroll: true }
        );
    };

    const handleAssignToBerkas = () => {
        if (!assignDialog.item || !selectedBerkasId) return;

        setIsAssigning(true);
        router.patch(
            `/arsip-unit/${assignDialog.item.id_berkas}/assign-to-berkas`,
            { berkas_arsip_id: selectedBerkasId },
            {
                onSuccess: () => {
                    setAssignDialog({ open: false, item: null });
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
    const canCreateEdit = !['management', 'operator'].includes(auth.user?.role || '');

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
        <AppSidebarLayout
            breadcrumbs={[
                { title: t('nav.dashboard'), href: '/dashboard' },
                { title: t('arsipUnit.title'), href: '/arsip-unit' },
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
                            {t('arsipUnit.title')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {t('users.total')} {arsipUnits.total} {t('arsipUnit.title').toLowerCase()}
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
                            <Link href="/arsip-unit/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('arsipUnit.add')}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder={t('arsipUnit.search')}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            <div>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
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
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                                >
                                    <option value="">{t('arsipUnit.allPublishStatus')}</option>
                                    <option value="draft">{t('arsipUnit.draft')}</option>
                                    <option value="published">{t('arsipUnit.published')}</option>
                                    <option value="archived">{t('arsipUnit.archived')}</option>
                                </select>
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
                                {(search || status || publishStatus) && (
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
                                        {t('arsipUnit.kodeKlasifikasi')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.indeks')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.uraianInformasi')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.tanggal')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.unitPengolah')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.status')}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {t('arsipUnit.publishStatus')}
                                    </th>
                                    <th className="sticky right-0 bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {t('users.actions')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {arsipUnits.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {t('arsipUnit.noData')}
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    arsipUnits.data.map((item, index) => (
                                        <tr
                                            key={item.id_berkas}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.visit(`/arsip-unit/${item.id_berkas}`)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                {(arsipUnits.current_page - 1) * arsipUnits.per_page + index + 1}
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
                                                {item.indeks || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                {item.uraian_informasi || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                                                {item.unit_pengolah?.nama || '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {canManageStatus ? (
                                                    <Select
                                                        value={item.status}
                                                        onValueChange={(value) => handleStatusChange(item.id_berkas, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending">{t('arsipUnit.pending')}</SelectItem>
                                                            <SelectItem value="diterima">{t('arsipUnit.diterima')}</SelectItem>
                                                            <SelectItem value="ditolak">{t('arsipUnit.ditolak')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                                                        {t(`arsipUnit.${item.status}`)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {canManageStatus ? (
                                                    <Select
                                                        value={item.publish_status}
                                                        onValueChange={(value) => handlePublishStatusChange(item.id_berkas, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">{t('arsipUnit.draft')}</SelectItem>
                                                            <SelectItem value="published">{t('arsipUnit.published')}</SelectItem>
                                                            <SelectItem value="archived">{t('arsipUnit.archived')}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPublishStatusBadge(item.publish_status)}`}>
                                                        {t(`arsipUnit.${item.publish_status}`)}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {canCreateEdit && canManageStatus && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => {
                                                                setAssignDialog({ open: true, item });
                                                                setSelectedBerkasId(item.berkas_arsip_id?.toString() || '');
                                                            }}
                                                            className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-950 dark:hover:text-purple-400 dark:hover:border-purple-700"
                                                            title="Masukkan ke Berkas"
                                                        >
                                                            <FolderInput className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canCreateEdit && (
                                                        <>
                                                            <Link href={`/arsip-unit/${item.id_berkas}/edit`}>
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
                    {arsipUnits.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {t('users.showing')}{' '}
                                    <span className="font-medium">{arsipUnits.from}</span> -{' '}
                                    <span className="font-medium">{arsipUnits.to}</span>{' '}
                                    {t('users.of')} <span className="font-medium">{arsipUnits.total}</span>
                                </p>
                                <div className="flex gap-2">
                                    {arsipUnits.links?.map((link, index) => {
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
                        <DialogTitle>{t('arsipUnit.deleteTitle')}</DialogTitle>
                        <DialogDescription>
                            {t('arsipUnit.deleteMessage')} "{deleteDialog.item?.no_item_arsip || deleteDialog.item?.id_berkas}"?
                            <br />
                            <span className="text-red-600 dark:text-red-400">
                                {t('arsipUnit.deleteWarning')}
                            </span>
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

            {/* Assign to Berkas Dialog */}
            <Dialog open={assignDialog.open} onOpenChange={(open) => {
                if (!open) {
                    setAssignDialog({ open: false, item: null });
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
                        {assignDialog.item && (
                            <div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Kode Klasifikasi:</strong> {assignDialog.item.kode_klasifikasi?.kode_klasifikasi || '-'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Unit Pengolah:</strong> {assignDialog.item.unit_pengolah?.nama || '-'}
                                </p>
                            </div>
                        )}
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Berkas Arsip
                        </label>
                        {(() => {
                            const filteredBerkasArsips = berkasArsips.filter((berkas) => {
                                const sameKlasifikasi = berkas.klasifikasi_id === assignDialog.item?.kode_klasifikasi_id;
                                const sameUnitPengolah = berkas.unit_pengolah_id === assignDialog.item?.unit_pengolah_arsip_id;
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
                        {assignDialog.item?.berkas_arsip_id && (
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Saat ini: {assignDialog.item?.berkas_arsip?.nama_berkas || '-'}
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setAssignDialog({ open: false, item: null });
                                setSelectedBerkasId('');
                            }}
                            disabled={isAssigning}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            onClick={handleAssignToBerkas}
                            disabled={isAssigning || !selectedBerkasId}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isAssigning ? t('common.saving') : 'Masukkan ke Berkas'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('common.print')} {t('arsipUnit.title')}</DialogTitle>
                        <DialogDescription>
                            Pilih filter untuk ekspor data
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Dari Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={dariTanggal}
                                    onChange={(e) => setDariTanggal(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Sampai Tanggal
                                </label>
                                <Input
                                    type="date"
                                    value={sampaiTanggal}
                                    onChange={(e) => setSampaiTanggal(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Status
                            </label>
                            <select
                                value={exportStatus}
                                onChange={(e) => setExportStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="diterima">Diterima</option>
                                <option value="ditolak">Ditolak</option>
                            </select>
                        </div>
                        
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Filter Unit Pengolah{isUnitPengolahLocked && ' (terkunci)'}
                            </label>
                            <select
                                value={exportUnitPengolah}
                                onChange={(e) => setExportUnitPengolah(e.target.value)}
                                disabled={isUnitPengolahLocked}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
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
