import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Clock, Save, FileText, User, Calendar, AlertCircle, CornerDownLeft, CheckCircle } from 'lucide-react';

interface PeminjamanArsip {
    id: number;
    arsipUnit: {
        id_berkas: number;
        indeks: string;
        uraian_informasi: string;
        kode_klasifikasi?: { kode_klasifikasi: string; uraian: string };
        unit_pengolah?: { nama_unit: string };
        kategori?: { nama_kategori: string };
        sub_kategori?: { nama_sub_kategori: string };
    };
    nama_peminjam: string;
    jabatan_peminjam: string | null;
    tujuan_peminjaman: string;
    unitPengolah?: { nama_unit: string };
    tanggal_pinjam: string;
    tanggal_harus_kembali: string;
    tanggal_kembali: string | null;
    status: 'dipinjam' | 'dikembalikan' | 'terlambat';
    kondisi_pengembalian: string | null;
    catatan: string | null;
    dicatatOleh: { name: string };
    dikembalikanOleh?: { name: string };
    created_at: string;
}

interface PageProps extends SharedData {
    peminjaman: PeminjamanArsip;
}

export default function Show() {
    const { peminjaman } = usePage<PageProps>().props;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const { data, setData, patch, processing, errors } = useForm({
        tanggal_kembali: new Date().toISOString().split('T')[0],
        kondisi_pengembalian: 'baik',
        catatan: '',
    });

    const handleKembalikan = (e: React.FormEvent) => {
        e.preventDefault();
        patch(`/peminjaman-arsip/${peminjaman.id}/kembalikan`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Peminjaman Arsip', href: '/peminjaman-arsip' },
                { title: 'Detail Peminjaman', href: `/peminjaman-arsip/${peminjaman.id}` },
            ]}
        >
            <Head title="Detail Peminjaman" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        Detail Peminjaman
                        {peminjaman.status === 'dipinjam' && (
                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                Sedang Dipinjam
                            </span>
                        )}
                        {peminjaman.status === 'terlambat' && (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-500">
                                Terlambat
                            </span>
                        )}
                        {peminjaman.status === 'dikembalikan' && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-500">
                                Dikembalikan
                            </span>
                        )}
                    </h1>
                </div>
                <Link
                    href="/peminjaman-arsip"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Kolom Kiri - Info */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Info Arsip */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            Informasi Arsip
                        </h2>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Indeks Arsip</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">{peminjaman.arsipUnit?.indeks || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit Pencipta/Pengolah</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">{peminjaman.arsipUnit?.unit_pengolah?.nama_unit || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Uraian Informasi</p>
                                <p className="mt-1 text-gray-900 dark:text-white">{peminjaman.arsipUnit?.uraian_informasi || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kode Klasifikasi</p>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                    {peminjaman.arsipUnit?.kode_klasifikasi?.kode_klasifikasi || '-'} 
                                    {peminjaman.arsipUnit?.kode_klasifikasi?.uraian ? ` - ${peminjaman.arsipUnit.kode_klasifikasi.uraian}` : ''}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Kategori</p>
                                <p className="mt-1 text-gray-900 dark:text-white">
                                    {peminjaman.arsipUnit?.kategori?.nama_kategori || '-'}
                                    {peminjaman.arsipUnit?.sub_kategori?.nama_sub_kategori ? ` / ${peminjaman.arsipUnit.sub_kategori.nama_sub_kategori}` : ''}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Link
                                href={`/arsip-unit/${peminjaman.arsipUnit?.id_berkas}`}
                                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Lihat Detail Arsip &rarr;
                            </Link>
                        </div>
                    </div>

                    {/* Info Peminjam */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            Informasi Peminjam
                        </h2>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nama Peminjam</p>
                                <p className="mt-1 font-medium text-gray-900 dark:text-white">{peminjaman.nama_peminjam}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Jabatan</p>
                                <p className="mt-1 text-gray-900 dark:text-white">{peminjaman.jabatan_peminjam || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unit / Instansi</p>
                                <p className="mt-1 text-gray-900 dark:text-white">{peminjaman.unitPengolah?.nama_unit || '-'}</p>
                            </div>
                            <div className="sm:col-span-2">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tujuan Peminjaman</p>
                                <p className="mt-1 rounded-md bg-gray-50 p-3 text-sm text-gray-900 dark:bg-gray-800 dark:text-gray-300">
                                    {peminjaman.tujuan_peminjaman}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Kolom Kanan - Timeline & Aksi */}
                <div className="space-y-6">
                    {/* Timeline */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
                            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-500" />
                            Status Peminjaman
                        </h2>
                        
                        <div className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                            {/* Pinjam */}
                            <div className="relative pl-6">
                                <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 ring-4 ring-white dark:bg-blue-900 dark:ring-gray-900">
                                    <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dipinjam</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(peminjaman.tanggal_pinjam)}</p>
                                <p className="mt-1 text-xs text-gray-500">Dicatat oleh: {peminjaman.dicatatOleh?.name}</p>
                            </div>

                            {/* Deadline */}
                            <div className="relative pl-6">
                                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${
                                    peminjaman.status === 'terlambat' ? 'bg-red-100 dark:bg-red-900' : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                    <AlertCircle className={`h-3 w-3 ${
                                        peminjaman.status === 'terlambat' ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                                    }`} />
                                </span>
                                <h3 className={`text-sm font-semibold ${
                                    peminjaman.status === 'terlambat' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
                                }`}>Batas Waktu Pengembalian</h3>
                                <p className={`text-sm ${
                                    peminjaman.status === 'terlambat' ? 'text-red-500 dark:text-red-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                                }`}>{formatDate(peminjaman.tanggal_harus_kembali)}</p>
                            </div>

                            {/* Kembali */}
                            <div className="relative pl-6">
                                <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-900 ${
                                    peminjaman.status === 'dikembalikan' ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'
                                }`}>
                                    <CheckCircle className={`h-3 w-3 ${
                                        peminjaman.status === 'dikembalikan' ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
                                    }`} />
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Dikembalikan</h3>
                                {peminjaman.status === 'dikembalikan' ? (
                                    <>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(peminjaman.tanggal_kembali)}</p>
                                        <p className="mt-1 text-xs text-gray-500">Diterima oleh: {peminjaman.dikembalikanOleh?.name}</p>
                                        <p className="mt-1 text-xs text-gray-500">Kondisi: <span className="font-medium">{peminjaman.kondisi_pengembalian}</span></p>
                                    </>
                                ) : (
                                    <p className="text-sm text-gray-500 italic dark:text-gray-400">Belum dikembalikan</p>
                                )}
                            </div>
                        </div>

                        {peminjaman.catatan && (
                            <div className="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Catatan Peminjaman</p>
                                <p className="mt-1 text-sm text-gray-900 dark:text-white">{peminjaman.catatan}</p>
                            </div>
                        )}
                    </div>

                    {/* Form Pengembalian */}
                    {peminjaman.status !== 'dikembalikan' && (
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-900/30 dark:bg-blue-900/10">
                            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-blue-900 dark:text-blue-300">
                                <CornerDownLeft className="h-5 w-5" />
                                Proses Pengembalian
                            </h2>
                            
                            <form onSubmit={handleKembalikan} className="space-y-4">
                                <div>
                                    <label htmlFor="tanggal_kembali" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                                        Tanggal Dikembalikan
                                    </label>
                                    <input
                                        type="date"
                                        id="tanggal_kembali"
                                        value={data.tanggal_kembali}
                                        onChange={(e) => setData('tanggal_kembali', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                            errors.tanggal_kembali ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    />
                                    {errors.tanggal_kembali && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.tanggal_kembali}</p>}
                                </div>
                                
                                <div>
                                    <label htmlFor="kondisi_pengembalian" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                                        Kondisi Arsip
                                    </label>
                                    <select
                                        id="kondisi_pengembalian"
                                        value={data.kondisi_pengembalian}
                                        onChange={(e) => setData('kondisi_pengembalian', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                            errors.kondisi_pengembalian ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                    >
                                        <option value="baik">Baik / Lengkap</option>
                                        <option value="rusak ringan">Rusak Ringan</option>
                                        <option value="rusak berat">Rusak Berat / Hilang Sebagian</option>
                                    </select>
                                    {errors.kondisi_pengembalian && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.kondisi_pengembalian}</p>}
                                </div>

                                <div>
                                    <label htmlFor="catatan_kembali" className="mb-1 block text-sm font-medium text-gray-900 dark:text-white">
                                        Tambahan Catatan (Opsional)
                                    </label>
                                    <textarea
                                        id="catatan_kembali"
                                        rows={2}
                                        value={data.catatan}
                                        onChange={(e) => setData('catatan', e.target.value)}
                                        className={`block w-full rounded-lg border bg-white p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                            errors.catatan ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                                        }`}
                                        placeholder="Catatan saat pengembalian..."
                                    />
                                    {errors.catatan && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.catatan}</p>}
                                </div>
                                
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:focus:ring-blue-800"
                                >
                                    <Save className="h-4 w-4" />
                                    {processing ? 'Memproses...' : 'Proses Pengembalian'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
