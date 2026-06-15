import { useState } from 'react';
import { router, Link, usePage } from '@inertiajs/react';
import { FileText, Plus, Search, Edit, Trash2, FolderInput, Printer, Check, X, Clock, AlertCircle, FileSearch } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { OcrStatusBadge } from '@/components/ocr-status-badge';
import { ContentSearch } from '@/components/content-search';

// Helper function for status translation
const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pending: 'Menunggu',
        diterima: 'Diterima',
        ditolak: 'Ditolak',
        draft: 'Draft',
        published: 'Dipublikasi',
        archived: 'Diarsipkan'
    };
    return labels[status] || status;
};

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
    klasifikasi_keamanan: string | null;
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
    verifikasi_keterangan: string | null;
    verifikasi_oleh: number | null;
    verifikasi_tanggal: string | null;
    // OCR fields
    ocr_status: string | null;
    ai_suggestion_status: string | null;
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
    statusSummary: {
        total: number;
        diterima: number;
        pending: number;
        ditolak: number;
    };
    berkasArsips: BerkasArsip[];
    unitPengolahs: UnitPengolah[];
    filters: {
        search?: string;
        content_search?: string;
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
    ocrEnabled?: boolean;
    [key: string]: any;
}

export default function ArsipUnitIndex({ arsipUnits, statusSummary, berkasArsips, unitPengolahs, filters, flash }: PageProps) {
    const { auth, userUnitPengolahId, ocrEnabled } = usePage<PageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [contentSearch, setContentSearch] = useState(filters.content_search || '');
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
    const [isLoadingBerkas, setIsLoadingBerkas] = useState(false);
    const [berkasSearch, setBerkasSearch] = useState('');

    // Rejection dialog state
    const [rejectDialog, setRejectDialog] = useState<{ open: boolean; item: ArsipUnit | null }>({
        open: false,
        item: null,
    });
    const [rejectReason, setRejectReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    // Accept confirmation dialog state
    const [acceptDialog, setAcceptDialog] = useState<{ open: boolean; item: ArsipUnit | null }>({
        open: false,
        item: null,
    });
    const [isAccepting, setIsAccepting] = useState(false);

    // Publish status confirmation dialog state
    const [publishDialog, setPublishDialog] = useState<{ open: boolean; item: ArsipUnit | null; targetStatus: string }>({
        open: false,
        item: null,
        targetStatus: '',
    });
    const [isPublishing, setIsPublishing] = useState(false);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);

    // Load berkasArsips lazily when assign dialog opens
    const openAssignDialog = (item: ArsipUnit) => {
        setAssignDialog({ open: true, item });
        setSelectedBerkasId(item.berkas_arsip_id?.toString() || '');
        setBerkasSearch('');
        // Reload lazy data if not already loaded
        if (!berkasArsips || berkasArsips.length === 0) {
            setIsLoadingBerkas(true);
            router.reload({ only: ['berkasArsips'], onFinish: () => setIsLoadingBerkas(false) });
        }
    };

    // Filter berkasArsips based on search
    const filteredBerkasArsips = berkasArsips?.filter((berkas) => {
        if (!berkasSearch.trim()) return true;
        const searchLower = berkasSearch.toLowerCase();
        return (
            berkas.nama_berkas.toLowerCase().includes(searchLower) ||
            berkas.kode_klasifikasi?.kode_klasifikasi?.toLowerCase().includes(searchLower) ||
            berkas.kode_klasifikasi?.uraian?.toLowerCase().includes(searchLower) ||
            berkas.unit_pengolah?.nama_unit?.toLowerCase().includes(searchLower)
        );
    }) || [];

    // Load unitPengolahs lazily when export dialog opens
    const openExportDialog = () => {
        setExportDialog(true);
        if (!unitPengolahs || unitPengolahs.length === 0) {
            setIsLoadingUnits(true);
            router.reload({ only: ['unitPengolahs'], onFinish: () => setIsLoadingUnits(false) });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/arsip-unit',
            { search, content_search: contentSearch, status, publish_status: publishStatus, per_page: perPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handlePerPageChange = (value: string) => {
        const newPerPage = parseInt(value);
        setPerPage(newPerPage);
        router.get(
            '/arsip-unit',
            { search, content_search: contentSearch, status, publish_status: publishStatus, per_page: newPerPage },
            { preserveState: true, preserveScroll: true }
        );
    };

    const handleReset = () => {
        setSearch('');
        setContentSearch('');
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

    const handleStatusChange = (arsipUnitId: number, newStatus: string, reason?: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/status`,
            { status: newStatus, verifikasi_keterangan: reason },
            { preserveScroll: true }
        );
    };

    const handleReject = () => {
        if (!rejectDialog.item || !rejectReason.trim()) return;

        setIsRejecting(true);
        router.patch(
            `/arsip-unit/${rejectDialog.item.id_berkas}/status`,
            { status: 'ditolak', verifikasi_keterangan: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setRejectDialog({ open: false, item: null });
                    setRejectReason('');
                },
                onFinish: () => {
                    setIsRejecting(false);
                },
            }
        );
    };

    const openRejectDialog = (item: ArsipUnit) => {
        setRejectDialog({ open: true, item });
        setRejectReason('');
    };

    const openAcceptDialog = (item: ArsipUnit) => {
        setAcceptDialog({ open: true, item });
    };

    const handleAccept = () => {
        if (!acceptDialog.item) return;

        setIsAccepting(true);
        router.patch(
            `/arsip-unit/${acceptDialog.item.id_berkas}/status`,
            { status: 'diterima' },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setAcceptDialog({ open: false, item: null });
                },
                onFinish: () => {
                    setIsAccepting(false);
                },
            }
        );
    };

    const handlePublishStatusChange = (arsipUnitId: number, newPublishStatus: string) => {
        router.patch(
            `/arsip-unit/${arsipUnitId}/publish-status`,
            { publish_status: newPublishStatus },
            { preserveScroll: true }
        );
    };

    const openPublishDialog = (item: ArsipUnit, targetStatus: string) => {
        setPublishDialog({ open: true, item, targetStatus });
    };

    const handlePublishConfirm = () => {
        if (!publishDialog.item || !publishDialog.targetStatus) return;

        setIsPublishing(true);
        router.patch(
            `/arsip-unit/${publishDialog.item.id_berkas}/publish-status`,
            { publish_status: publishDialog.targetStatus },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPublishDialog({ open: false, item: null, targetStatus: '' });
                },
                onFinish: () => {
                    setIsPublishing(false);
                },
            }
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
    const canCreateEdit = auth.user?.role !== 'operator';
    // User can assign berkas (admin and user, not operator)
    const canAssignBerkas = auth.user?.role !== 'operator';

    const summaryCards = [
        {
            label: 'Total Arsip Unit',
            value: statusSummary.total,
            icon: FileText,
            className: 'border-blue-600/60 bg-blue-950/10 text-blue-600 dark:bg-blue-950/30 dark:text-blue-300',
            iconClassName: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',
        },
        {
            label: 'Diterima',
            value: statusSummary.diterima,
            icon: Check,
            className: 'border-emerald-600/60 bg-emerald-950/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-300',
            iconClassName: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300',
        },
        {
            label: 'Pending',
            value: statusSummary.pending,
            icon: Clock,
            className: 'border-yellow-600/60 bg-yellow-950/10 text-yellow-600 dark:bg-yellow-950/30 dark:text-yellow-300',
            iconClassName: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-300',
        },
        {
            label: 'Ditolak',
            value: statusSummary.ditolak,
            icon: X,
            className: 'border-red-600/60 bg-red-950/10 text-red-600 dark:bg-red-950/30 dark:text-red-300',
            iconClassName: 'bg-red-500/15 text-red-600 dark:text-red-300',
        },
    ];

    // Check if user can edit/delete a specific arsip unit
    // Admin can edit/delete all, regular users can only edit/delete their own unit's arsip
    const canEditDelete = (item: ArsipUnit) => {
        if (auth.user.role === 'admin') return true;
        if (!canCreateEdit) return false;
        // User can only edit/delete arsip from their own unit pengolah
        return userUnitPengolahId === null || item.unit_pengolah_arsip_id === userUnitPengolahId;
    };

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
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Arsip Unit', href: '/arsip-unit' },
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
                            {'Arsip Unit'}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {'Kelola'} {'Data Arsip Unit'.toLowerCase()}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600"
                            onClick={() => router.visit('/arsip-unit/print-preview')}
                        >
                            <Printer className="h-4 w-4 mr-2" />
                            {'Cetak'}
                        </Button>
                        {canCreateEdit && (
                            <Link href="/arsip-unit/create">
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {'Tambah Arsip Unit'}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Status Summary */}
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {summaryCards.map((card) => (
                        <div
                            key={card.label}
                            className={`rounded-lg border p-4 ${card.className}`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${card.iconClassName}`}>
                                    <card.icon className="h-4 w-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold">{card.label}</p>
                                    <p className="mt-1 text-2xl font-bold leading-none">
                                        {card.value.toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-800">
                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-4">
                            <div className="relative md:col-span-2">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="text"
                                    placeholder={'Cari no item, uraian, atau indeks...'}
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
                                    <option value="">{'Semua Status'}</option>
                                    <option value="pending">{'Pending'}</option>
                                    <option value="diterima">{'Diterima'}</option>
                                    <option value="ditolak">{'Ditolak'}</option>
                                </select>
                            </div>

                            <div>
                                <select
                                    value={publishStatus}
                                    onChange={(e) => setPublishStatus(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                                >
                                    <option value="">{'Semua Status Publikasi'}</option>
                                    <option value="draft">{'Draft'}</option>
                                    <option value="published">{'Published'}</option>
                                    <option value="archived">{'Diarsipkan'}</option>
                                </select>
                            </div>
                        </div>

                        {/* Content Search (OCR) */}
                        {ocrEnabled && (
                            <div className="relative">
                                <ContentSearch
                                    value={contentSearch}
                                    onChange={setContentSearch}
                                    onSearch={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
                                    onClear={() => {
                                        setContentSearch('');
                                        router.get('/arsip-unit', { search, status, publish_status: publishStatus, per_page: perPage }, { preserveState: true, preserveScroll: true });
                                    }}
                                />
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
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
                            <div className="flex gap-2">
                                <Button type="submit">
                                    <Search className="h-4 w-4 mr-2" />
                                    {'Cari'}
                                </Button>
                                {(search || contentSearch || status || publishStatus) && (
                                    <Button type="button" variant="outline" onClick={handleReset}>
                                        {'Reset'}
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
                                        {'No'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Kode Klasifikasi'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Indeks'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Uraian Informasi'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Tanggal'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Unit Pengolah'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Status'}
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                        {'Status Publikasi'}
                                    </th>
                                    {ocrEnabled && (
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                            {'OCR'}
                                        </th>
                                    )}
                                    <th className="sticky right-0 bg-gray-100 dark:bg-gray-800 px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider shadow-[-2px_0_4px_rgba(0,0,0,0.1)]">
                                        {'Aksi'}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {arsipUnits.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={ocrEnabled ? 10 : 9} className="px-6 py-12 text-center">
                                            <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                {'Tidak ada data arsip unit'}
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
                                                    <div className="flex items-center gap-1">
                                                        {item.status !== 'pending' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(item.id_berkas, 'pending')}
                                                                className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-300 dark:hover:bg-yellow-950 dark:hover:text-yellow-400 dark:hover:border-yellow-700"
                                                                title={'Pending'}
                                                            >
                                                                <Clock className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {item.status !== 'diterima' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openAcceptDialog(item)}
                                                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-950 dark:hover:text-green-400 dark:hover:border-green-700"
                                                                title={'Diterima'}
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {item.status !== 'ditolak' && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => openRejectDialog(item)}
                                                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950 dark:hover:text-red-400 dark:hover:border-red-700"
                                                                title={'Ditolak'}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                        {item.status === 'ditolak' && item.verifikasi_keterangan ? (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <span className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold cursor-help ${getStatusBadge(item.status)}`}>
                                                                        {getStatusLabel(item.status)}
                                                                        <AlertCircle className="h-3 w-3" />
                                                                    </span>
                                                                </TooltipTrigger>
                                                                <TooltipContent className="max-w-xs">
                                                                    <p className="font-semibold mb-1">Alasan Penolakan:</p>
                                                                    <p className="text-sm">{item.verifikasi_keterangan}</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        ) : (
                                                            <span className={`ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                                                                {getStatusLabel(item.status)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    item.status === 'ditolak' && item.verifikasi_keterangan ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold cursor-help ${getStatusBadge(item.status)}`}>
                                                                    {getStatusLabel(item.status)}
                                                                    <AlertCircle className="h-3 w-3" />
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent className="max-w-xs">
                                                                <p className="font-semibold mb-1">Alasan Penolakan:</p>
                                                                <p className="text-sm">{item.verifikasi_keterangan}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    ) : (
                                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(item.status)}`}>
                                                            {getStatusLabel(item.status)}
                                                        </span>
                                                    )
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                {canManageStatus ? (
                                                    <Select
                                                        value={item.publish_status}
                                                        onValueChange={(value) => {
                                                            if (value === 'published' || value === 'archived') {
                                                                openPublishDialog(item, value);
                                                            } else {
                                                                handlePublishStatusChange(item.id_berkas, value);
                                                            }
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="draft">{'Draft'}</SelectItem>
                                                            <SelectItem value="published">{'Published'}</SelectItem>
                                                            <SelectItem value="archived">{'Diarsipkan'}</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPublishStatusBadge(item.publish_status)}`}>
                                                        {getStatusLabel(item.publish_status)}
                                                    </span>
                                                )}
                                            </td>
                                            {ocrEnabled && (
                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                    <OcrStatusBadge status={item.ocr_status as any} />
                                                </td>
                                            )}
                                            <td className="sticky right-0 bg-white dark:bg-gray-900 px-6 py-4 shadow-[-2px_0_4px_rgba(0,0,0,0.1)]" onClick={(e) => e.stopPropagation()}>
                                                <div className="flex items-center justify-center gap-2">
                                                    {canAssignBerkas && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => openAssignDialog(item)}
                                                            className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 dark:hover:bg-purple-950 dark:hover:text-purple-400 dark:hover:border-purple-700"
                                                            title="Masukkan ke Berkas"
                                                        >
                                                            <FolderInput className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {canEditDelete(item) && (
                                                        <>
                                                            <Link href={`/arsip-unit/${item.id_berkas}/edit`}>
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
                                    {'Menampilkan'}{' '}
                                    <span className="font-medium">{arsipUnits.from}</span> -{' '}
                                    <span className="font-medium">{arsipUnits.to}</span>{' '}
                                    {'dari'} <span className="font-medium">{arsipUnits.total}</span>
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
                        <DialogTitle>{'Konfirmasi Hapus Arsip Unit'}</DialogTitle>
                        <DialogDescription>
                            {'Apakah Anda yakin ingin menghapus arsip unit'} "{deleteDialog.item?.no_item_arsip || deleteDialog.item?.id_berkas}"?
                            <br />
                            <span className="text-red-600 dark:text-red-400">
                                {'Tindakan ini tidak dapat dibatalkan.'}
                            </span>
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
                        {isLoadingBerkas ? (
                            <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Memuat data berkas arsip...
                                </p>
                            </div>
                        ) : !berkasArsips || berkasArsips.length === 0 ? (
                            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-3 dark:border-yellow-600 dark:bg-yellow-900/20">
                                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                    Tidak ada berkas arsip yang tersedia.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        type="text"
                                        placeholder="Cari berkas arsip..."
                                        value={berkasSearch}
                                        onChange={(e) => setBerkasSearch(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                {filteredBerkasArsips.length === 0 ? (
                                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Tidak ada berkas arsip yang cocok dengan pencarian "{berkasSearch}"
                                        </p>
                                    </div>
                                ) : (
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
                                                    {berkas.unit_pengolah && (
                                                        <span className="ml-2 text-xs text-gray-500">
                                                            - {berkas.unit_pengolah.nama_unit}
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Menampilkan {filteredBerkasArsips.length} dari {berkasArsips.length} berkas
                                </p>
                            </div>
                        )}
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
                            {'Batal'}
                        </Button>
                        <Button
                            onClick={handleAssignToBerkas}
                            disabled={isAssigning || !selectedBerkasId}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {isAssigning ? 'Menyimpan...' : 'Masukkan ke Berkas'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={exportDialog} onOpenChange={setExportDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{'Cetak'} {'Arsip Unit'}</DialogTitle>
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
                            {isLoadingUnits ? (
                                <div className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-500">
                                    Memuat data unit pengolah...
                                </div>
                            ) : (
                                <select
                                    value={exportUnitPengolah}
                                    onChange={(e) => setExportUnitPengolah(e.target.value)}
                                    disabled={isUnitPengolahLocked}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {!isUnitPengolahLocked && <option value="">Semua Unit Pengolah</option>}
                                    {unitPengolahs && unitPengolahs.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.nama_unit}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {isUnitPengolahLocked && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Unit pengolah terkunci sesuai dengan unit pengolah Anda.
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExportDialog(false)}>
                            {'Batal'}
                        </Button>
                        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
                            {'Cetak'} PDF
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog */}
            <Dialog open={rejectDialog.open} onOpenChange={(open) => {
                if (!open && !isRejecting) {
                    setRejectDialog({ open: false, item: null });
                    setRejectReason('');
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tolak Arsip Unit</DialogTitle>
                        <DialogDescription>
                            Berikan alasan penolakan untuk arsip unit ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {rejectDialog.item && (
                            <div className="mb-4 rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>No. Item:</strong> {rejectDialog.item.no_item_arsip || rejectDialog.item.id_berkas}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Uraian:</strong> {rejectDialog.item.uraian_informasi || '-'}
                                </p>
                            </div>
                        )}
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Alasan Penolakan <span className="text-red-500">*</span>
                        </label>
                        <Textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Masukkan alasan penolakan..."
                            rows={4}
                            className="w-full"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialog({ open: false, item: null });
                                setRejectReason('');
                            }}
                            disabled={isRejecting}
                        >
                            {'Batal'}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isRejecting || !rejectReason.trim()}
                        >
                            {isRejecting ? 'Menolak...' : 'Tolak Arsip'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Accept Confirmation Dialog */}
            <Dialog open={acceptDialog.open} onOpenChange={(open) => {
                if (!open && !isAccepting) {
                    setAcceptDialog({ open: false, item: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Konfirmasi Penerimaan</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menerima arsip unit ini?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {acceptDialog.item && (
                            <div className="rounded-lg bg-green-50 border border-green-200 p-4 dark:bg-green-900/20 dark:border-green-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>No. Item:</strong> {acceptDialog.item.no_item_arsip || acceptDialog.item.id_berkas}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Uraian:</strong> {acceptDialog.item.uraian_informasi || '-'}
                                </p>
                                {acceptDialog.item.kode_klasifikasi && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Kode Klasifikasi:</strong> {acceptDialog.item.kode_klasifikasi.kode_klasifikasi}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setAcceptDialog({ open: false, item: null })}
                            disabled={isAccepting}
                        >
                            {'Batal'}
                        </Button>
                        <Button
                            onClick={handleAccept}
                            disabled={isAccepting}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isAccepting ? 'Memproses...' : 'Terima Arsip'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Publish Status Confirmation Dialog */}
            <Dialog open={publishDialog.open} onOpenChange={(open) => {
                if (!open && !isPublishing) {
                    setPublishDialog({ open: false, item: null, targetStatus: '' });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {publishDialog.targetStatus === 'published' ? 'Konfirmasi Publikasi' : 'Konfirmasi Arsipkan'}
                        </DialogTitle>
                        <DialogDescription>
                            {publishDialog.targetStatus === 'published'
                                ? 'Apakah Anda yakin ingin mempublikasikan arsip unit ini? Arsip yang dipublikasikan akan dapat diakses secara publik.'
                                : 'Apakah Anda yakin ingin mengarsipkan arsip unit ini? Arsip yang diarsipkan tidak akan ditampilkan di daftar utama.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {publishDialog.item && (
                            <div className={`rounded-lg border p-4 ${publishDialog.targetStatus === 'published'
                                ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                                : 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800'
                                }`}>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>No. Item:</strong> {publishDialog.item.no_item_arsip || publishDialog.item.id_berkas}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <strong>Uraian:</strong> {publishDialog.item.uraian_informasi || '-'}
                                </p>
                                {publishDialog.item.kode_klasifikasi && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Kode Klasifikasi:</strong> {publishDialog.item.kode_klasifikasi.kode_klasifikasi}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    <strong>Status saat ini:</strong>{' '}
                                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getPublishStatusBadge(publishDialog.item.publish_status)}`}>
                                        {getStatusLabel(publishDialog.item.publish_status)}
                                    </span>
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setPublishDialog({ open: false, item: null, targetStatus: '' })}
                            disabled={isPublishing}
                        >
                            {'Batal'}
                        </Button>
                        <Button
                            onClick={handlePublishConfirm}
                            disabled={isPublishing}
                            className={publishDialog.targetStatus === 'published'
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-purple-600 hover:bg-purple-700'}
                        >
                            {isPublishing
                                ? 'Memproses...'
                                : publishDialog.targetStatus === 'published'
                                    ? 'Publikasikan'
                                    : 'Arsipkan'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppSidebarLayout>
    );
}
