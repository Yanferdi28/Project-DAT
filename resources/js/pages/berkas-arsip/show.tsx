import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, SquarePen, Plus, Trash2, FileText, Eye } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Badge } from '@/components/ui/badge';
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
    auth: {
        user: {
            role: string;
        };
    };
    [key: string]: any;
}

export default function Show() {
    const { t } = useLanguage();
    const { berkasArsip, availableArsipUnits, auth } = usePage<PageProps>().props;

    const [addDialog, setAddDialog] = useState(false);
    const [removeDialog, setRemoveDialog] = useState<{ open: boolean; arsipUnit: ArsipUnit | null }>({
        open: false,
        arsipUnit: null,
    });
    const [selectedArsipUnitId, setSelectedArsipUnitId] = useState<string>('');
    const [isAdding, setIsAdding] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);

    const canManage = !['management', 'operator'].includes(auth.user?.role || '');

    const handleAddArsipUnit = () => {
        if (!selectedArsipUnitId) return;

        setIsAdding(true);
        router.post(
            `/berkas-arsip/${berkasArsip.nomor_berkas}/add-arsip-unit`,
            { arsip_unit_id: selectedArsipUnitId },
            {
                onSuccess: () => {
                    setAddDialog(false);
                    setSelectedArsipUnitId('');
                },
                onFinish: () => {
                    setIsAdding(false);
                },
            }
        );
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: t('berkasArsip.title'), href: '/berkas-arsip' },
                { title: t('berkasArsip.detail'), href: '' },
            ]}
        >
            <div className="mx-auto max-w-6xl">
                <div className="mb-6">
                    <Link
                        href="/berkas-arsip"
                        className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {t('common.back')}
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
                                {t('berkasArsip.nomorBerkas')}: {berkasArsip.nomor_berkas}
                            </p>
                        </div>
                        {canManage && (
                            <Link
                                href={`/berkas-arsip/${berkasArsip.nomor_berkas}/edit`}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                            >
                                <SquarePen className="h-4 w-4" />
                                {t('common.edit')}
                            </Link>
                        )}
                    </div>
                </div>

                {/* Detail Information */}
                <div className="space-y-6">
                    {/* Informasi Berkas */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {t('berkasArsip.informasiBerkas')}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.namaBerkas')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.nama_berkas}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.kodeKlasifikasi')}
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
                                    {t('berkasArsip.retensiAktif')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.retensi_aktif || '-'} {t('berkasArsip.tahun')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.retensiInaktif')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.retensi_inaktif || '-'} {t('berkasArsip.tahun')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.penyusutanAkhir')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.penyusutan_akhir || '-'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.lokasiFisik')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {berkasArsip.lokasi_fisik || '-'}
                                </p>
                            </div>
                        </div>
                        {berkasArsip.uraian && (
                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('berkasArsip.uraian')}
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
                                {t('berkasArsip.daftarArsipUnit')} ({berkasArsip.arsip_units?.length || 0})
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
                            {t('common.metadata')}
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('common.createdAt')}
                                </label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                                    {new Date(berkasArsip.created_at).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    {t('common.updatedAt')}
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
            <Dialog open={addDialog} onOpenChange={setAddDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tambah Arsip Unit ke Berkas</DialogTitle>
                        <DialogDescription>
                            Pilih arsip unit yang akan ditambahkan ke berkas arsip ini. Hanya arsip unit dengan kode klasifikasi dan unit pengolah yang sama yang ditampilkan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Arsip Unit
                        </label>
                        {availableArsipUnits.length > 0 ? (
                            <Select value={selectedArsipUnitId} onValueChange={setSelectedArsipUnitId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih arsip unit..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableArsipUnits.map((arsip) => (
                                        <SelectItem key={arsip.id_berkas} value={arsip.id_berkas.toString()}>
                                            <div className="flex flex-col">
                                                <span>
                                                    {arsip.indeks || arsip.no_item_arsip || `ID: ${arsip.id_berkas}`}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {arsip.uraian_informasi?.substring(0, 50)}
                                                    {arsip.uraian_informasi && arsip.uraian_informasi.length > 50 ? '...' : ''}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                                setSelectedArsipUnitId('');
                            }}
                            disabled={isAdding}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleAddArsipUnit}
                            disabled={isAdding || !selectedArsipUnitId}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isAdding ? t('common.saving') : 'Tambahkan'}
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
                            {t('common.cancel')}
                        </button>
                        <button
                            onClick={handleRemoveArsipUnit}
                            disabled={isRemoving}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isRemoving ? t('common.saving') : 'Keluarkan'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AppLayout>
    );
}
