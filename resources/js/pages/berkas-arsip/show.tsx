import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Plus, Trash2, FileText, Eye, Search, QrCode, Check } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { QrCodeLabelDialog } from '@/components/qr-code-label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    uraian: string;
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface Kategori {
    id: number;
    nama: string;
}

interface SubKategori {
    id: number;
    nama: string;
}

interface ArsipUnit {
    id_berkas: number;
    no_item_arsip: string | null;
    indeks: string | null;
    uraian_informasi: string | null;
    tanggal: string | null;
    status: 'pending' | 'diterima' | 'ditolak';
    publish_status: 'draft' | 'published' | 'archived';
    kode_klasifikasi?: KodeKlasifikasi;
    unit_pengolah?: UnitPengolah;
    kategori?: Kategori;
    sub_kategori?: SubKategori;
}

interface BerkasArsip {
    nomor_berkas: number;
    nama_berkas: string;
    klasifikasi_id: number;
    unit_pengolah_id: number | null;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    penyusutan_akhir: string | null;
    lokasi_fisik: string | null;
    uraian: string | null;
    created_at: string;
    updated_at: string;
    kode_klasifikasi?: KodeKlasifikasi;
    unit_pengolah?: UnitPengolah;
    arsip_units?: ArsipUnit[];
}

interface PageProps {
    berkasArsip: BerkasArsip;
    availableArsipUnits: ArsipUnit[];
    userUnitPengolahId?: number | null;
    auth: {
        user: {
            role: string;
            unit_pengolah_id?: number;
        };
    };
    [key: string]: any;
}

export default function Show() {
    const { berkasArsip, availableArsipUnits, userUnitPengolahId, auth } = usePage<PageProps>().props;

    const [addDialog, setAddDialog] = useState(false);
    const [removeDialog, setRemoveDialog] = useState<{ open: boolean; arsipUnit: ArsipUnit | null }>({
        open: false,
        arsipUnit: null,
    });
    const [selectedArsipUnitIds, setSelectedArsipUnitIds] = useState<number[]>([]);
    const [arsipUnitSearch, setArsipUnitSearch] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);

    // Check if user can manage (not operator)
    // Admin and User can assign berkas, operator cannot
    const canManage = auth.user?.role !== 'operator';

    // Filter available arsip units based on search
    const filteredArsipUnits = availableArsipUnits.filter((arsip) => {
        if (!arsipUnitSearch.trim()) return true;
        const searchLower = arsipUnitSearch.toLowerCase();
        return (
            arsip.indeks?.toLowerCase().includes(searchLower) ||
            arsip.no_item_arsip?.toLowerCase().includes(searchLower) ||
            arsip.uraian_informasi?.toLowerCase().includes(searchLower) ||
            arsip.kode_klasifikasi?.kode_klasifikasi?.toLowerCase().includes(searchLower) ||
            arsip.unit_pengolah?.nama_unit?.toLowerCase().includes(searchLower)
        );
    });

    const handleBulkAddArsipUnits = () => {
        if (selectedArsipUnitIds.length === 0) return;

        setIsAdding(true);
        router.post(
            `/berkas-arsip/${berkasArsip.nomor_berkas}/bulk-add-arsip-unit`,
            { arsip_unit_ids: selectedArsipUnitIds },
            {
                onSuccess: () => {
                    setAddDialog(false);
                    setSelectedArsipUnitIds([]);
                    setArsipUnitSearch('');
                },
                onFinish: () => {
                    setIsAdding(false);
                },
            }
        );
    };

    const toggleArsipUnit = (id: number) => {
        setSelectedArsipUnitIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedArsipUnitIds.length === filteredArsipUnits.length) {
            setSelectedArsipUnitIds([]);
        } else {
            setSelectedArsipUnitIds(filteredArsipUnits.map((a) => a.id_berkas));
        }
    };

    const handleRemoveArsipUnit = () => {
        if (!removeDialog.arsipUnit) return;

        setIsRemoving(true);
        router.delete(
            `/berkas-arsip/${berkasArsip.nomor_berkas}/remove-arsip-unit/${removeDialog.arsipUnit.id_berkas}`,
            {
                onSuccess: () => {
                    setRemoveDialog({ open: false, arsipUnit: null });
                },
                onFinish: () => {
                    setIsRemoving(false);
                },
            }
        );
    };

    const getStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            diterima: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            ditolak: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
        return badges[status] || badges.pending;
    };

    const getPublishStatusBadge = (status: string) => {
        const badges: Record<string, string> = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
            published: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        };
        return badges[status] || badges.draft;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    const getArsipUnitTitle = (arsip: ArsipUnit) => {
        return arsip.indeks || arsip.no_item_arsip || `ID: ${arsip.id_berkas}`;
    };

    const getArsipUnitSummary = (arsip: ArsipUnit) => {
        return arsip.uraian_informasi || 'Tanpa uraian informasi';
    };



    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Berkas Arsip', href: '/berkas-arsip' },
                { title: 'Detail Berkas Arsip', href: '' },
            ]}
        >
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <Link
                        href="/berkas-arsip"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {'Kembali'}
                    </Link>
                </div>

                {/* Header Card */}
                <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {berkasArsip.nama_berkas}
                            </h1>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {'Nomor Berkas'}: {berkasArsip.nomor_berkas}
                            </p>
                        </div>
                        {canManage && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQrDialogOpen(true)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    <QrCode className="h-4 w-4" />
                                    QR Label
                                </button>
                                <Link
                                    href={`/berkas-arsip/${berkasArsip.nomor_berkas}/edit`}
                                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                                >
                                    <SquarePen className="h-4 w-4" />
                                    {'Edit'}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Information */}
                <div className="space-y-6">
                    {/* Informasi Berkas */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {'Informasi Berkas'}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Nama Berkas'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.nama_berkas}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Kode Klasifikasi'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.kode_klasifikasi
                                        ? `${berkasArsip.kode_klasifikasi.kode_klasifikasi} - ${berkasArsip.kode_klasifikasi.uraian}`
                                        : '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Unit Pengolah
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.unit_pengolah?.nama_unit || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Retensi Aktif'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.retensi_aktif || '-'} {'Tahun'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Retensi Inaktif'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.retensi_inaktif || '-'} {'Tahun'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Penyusutan Akhir'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.penyusutan_akhir || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Lokasi Fisik'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.lokasi_fisik || '-'}
                                </p>
                            </div>
                        </div>
                        {berkasArsip.uraian && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Uraian'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.uraian}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Daftar Arsip Unit */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {'Daftar Arsip Unit'} ({berkasArsip.arsip_units?.length || 0})
                            </h2>
                            {canManage && availableArsipUnits.length > 0 && (
                                <button
                                    onClick={() => setAddDialog(true)}
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Arsip Unit
                                </button>
                            )}
                        </div>

                        {berkasArsip.arsip_units && berkasArsip.arsip_units.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3">No</th>
                                            <th className="px-4 py-3">Kode Klasifikasi</th>
                                            <th className="px-4 py-3">Indeks</th>
                                            <th className="px-4 py-3">Uraian Informasi</th>
                                            <th className="px-4 py-3">Tanggal</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Status Publikasi</th>
                                            <th className="px-4 py-3 text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {berkasArsip.arsip_units.map((arsip, index) => (
                                            <tr
                                                key={arsip.id_berkas}
                                                className="cursor-pointer bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                                                onClick={() => router.visit(`/arsip-unit/${arsip.id_berkas}`)}
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {arsip.kode_klasifikasi?.kode_klasifikasi || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {arsip.indeks || '-'}
                                                </td>
                                                <td className="max-w-xs truncate px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {arsip.uraian_informasi || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                                    {formatDate(arsip.tanggal)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadge(arsip.status)}`}>
                                                        {arsip.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPublishStatusBadge(arsip.publish_status)}`}>
                                                        {arsip.publish_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link
                                                            href={`/arsip-unit/${arsip.id_berkas}`}
                                                            className="rounded p-1.5 text-blue-600 transition-colors hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                                            title="Lihat Detail"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        {canManage && (
                                                            <button
                                                                onClick={() => setRemoveDialog({ open: true, arsipUnit: arsip })}
                                                                className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                                                                title="Keluarkan dari Berkas"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <FileText className="mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-gray-600 dark:text-gray-400">
                                    Belum ada arsip unit dalam berkas ini.
                                </p>
                                {canManage && availableArsipUnits.length > 0 && (
                                    <button
                                        onClick={() => setAddDialog(true)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Tambah Arsip Unit
                                    </button>
                                )}
                                {availableArsipUnits.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">
                                        Tidak ada arsip unit yang tersedia dengan kode klasifikasi dan unit pengolah yang sama.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Metadata */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {'Metadata'}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Dibuat'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(berkasArsip.created_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {'Terakhir Diupdate'}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(berkasArsip.updated_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Arsip Unit Dialog */}
            <Dialog open={addDialog} onOpenChange={(open) => { setAddDialog(open); if (!open) { setSelectedArsipUnitIds([]); setArsipUnitSearch(''); } }}>
                <DialogContent className="w-[calc(100vw-2rem)] overflow-hidden sm:max-w-xl">
                    <DialogHeader className="min-w-0">
                        <DialogTitle>Tambah Arsip Unit ke Berkas</DialogTitle>
                        <DialogDescription className="max-w-full">
                            Centang arsip unit yang ingin ditambahkan. Hanya arsip unit dengan kode klasifikasi dan unit pengolah yang sama yang ditampilkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="min-w-0 py-4">
                        {availableArsipUnits.length > 0 ? (
                            <div className="min-w-0 space-y-3">
                                <div className="relative min-w-0">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari arsip unit..."
                                        value={arsipUnitSearch}
                                        onChange={(e) => setArsipUnitSearch(e.target.value)}
                                        className="block w-full min-w-0 rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                    />
                                </div>
                                {filteredArsipUnits.length > 0 && (
                                    <div className="flex items-center justify-between">
                                        <button
                                            type="button"
                                            onClick={toggleSelectAll}
                                            className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            {selectedArsipUnitIds.length === filteredArsipUnits.length ? 'Batal pilih semua' : 'Pilih semua'}
                                        </button>
                                        {selectedArsipUnitIds.length > 0 && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                {selectedArsipUnitIds.length} dipilih
                                            </span>
                                        )}
                                    </div>
                                )}
                                <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                                    {filteredArsipUnits.length === 0 ? (
                                        <div className="p-3">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Tidak ada arsip unit yang cocok dengan pencarian "{arsipUnitSearch}"
                                            </p>
                                        </div>
                                    ) : (
                                        filteredArsipUnits.map((arsip) => {
                                            const isChecked = selectedArsipUnitIds.includes(arsip.id_berkas);
                                            return (
                                                <button
                                                    key={arsip.id_berkas}
                                                    type="button"
                                                    onClick={() => toggleArsipUnit(arsip.id_berkas)}
                                                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                                                        isChecked
                                                            ? 'bg-blue-50 dark:bg-blue-900/20'
                                                            : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                                >
                                                    <div className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                                        isChecked
                                                            ? 'border-blue-600 bg-blue-600 text-white'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                        {isChecked && <Check className="h-3 w-3" />}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            {arsip.kode_klasifikasi && (
                                                                <span className="inline-flex shrink-0 items-center rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                                    {arsip.kode_klasifikasi.kode_klasifikasi}
                                                                </span>
                                                            )}
                                                            <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                                                                {getArsipUnitTitle(arsip)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                                            {getArsipUnitSummary(arsip)}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Menampilkan {filteredArsipUnits.length} dari {availableArsipUnits.length} arsip unit
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Tidak ada arsip unit yang tersedia.
                            </p>
                        )}
                    </div>
                    <DialogFooter>
                        <button
                            onClick={() => {
                                setAddDialog(false);
                                setSelectedArsipUnitIds([]);
                                setArsipUnitSearch('');
                            }}
                            disabled={isAdding}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {'Batal'}
                        </button>
                        <button
                            onClick={handleBulkAddArsipUnits}
                            disabled={isAdding || selectedArsipUnitIds.length === 0}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAdding ? 'Menyimpan...' : `Tambahkan ${selectedArsipUnitIds.length > 0 ? `(${selectedArsipUnitIds.length})` : ''}`}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Arsip Unit Dialog */}
            <Dialog open={removeDialog.open} onOpenChange={(open) => {
                if (!open) {
                    setRemoveDialog({ open: false, arsipUnit: null });
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Keluarkan Arsip Unit dari Berkas</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mengeluarkan arsip unit ini dari berkas arsip?
                            <br />
                            <span className="font-medium">
                                {removeDialog.arsipUnit?.indeks || removeDialog.arsipUnit?.no_item_arsip || `ID: ${removeDialog.arsipUnit?.id_berkas}`}
                            </span>
                            <br />
                            <span className="text-yellow-600 dark:text-yellow-400">
                                Arsip unit tidak akan dihapus, hanya dikeluarkan dari berkas ini.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setRemoveDialog({ open: false, arsipUnit: null })}
                            disabled={isRemoving}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {'Batal'}
                        </button>
                        <button
                            onClick={handleRemoveArsipUnit}
                            disabled={isRemoving}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRemoving ? 'Menyimpan...' : 'Keluarkan'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Code Label Dialog */}
            <QrCodeLabelDialog
                open={qrDialogOpen}
                onOpenChange={setQrDialogOpen}
                berkas={berkasArsip}
                baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
            />

        </AppLayout>
    );
}
