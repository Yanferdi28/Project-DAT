import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeftRight,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search,
    Filter,
    Plus,
    Eye,
    CornerDownLeft
} from 'lucide-react';
import { useState, useEffect, type KeyboardEvent } from 'react';

interface PeminjamanArsip {
    id: number;
    arsip_unit: {
        id_berkas: number;
        indeks: string;
        uraian_informasi: string;
        kode_klasifikasi?: { kode_klasifikasi: string };
        unit_pengolah?: { nama_unit: string };
    };
    nama_peminjam: string;
    jabatan_peminjam: string | null;
    tujuan_peminjaman: string;
    unit_pengolah?: { nama_unit: string };
    tanggal_pinjam: string;
    tanggal_harus_kembali: string;
    tanggal_kembali: string | null;
    status: 'dipinjam' | 'dikembalikan' | 'terlambat';
    kondisi_pengembalian: string | null;
    catatan: string | null;
    dicatat_oleh: { name: string };
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PageProps extends SharedData {
    peminjaman: {
        data: PeminjamanArsip[];
        links: any[];
        current_page: number;
        last_page: number;
    };
    unitPengolahs: UnitPengolah[];
    filters: { status?: string; unit_pengolah_id?: string; search?: string };
    stats: { dipinjam: number; terlambat: number; dikembalikan: number };
}

export default function Index() {
    const { peminjaman, unitPengolahs, filters, stats, auth } = usePage<PageProps>().props;

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [unitPengolahId, setUnitPengolahId] = useState(filters.unit_pengolah_id || '');

    // Handle filter changes
    useEffect(() => {
        const timeout = setTimeout(() => {
            router.get(
                '/peminjaman-arsip',
                { search, status, unit_pengolah_id: unitPengolahId },
                { preserveState: true, preserveScroll: true }
            );
        }, 300);

        return () => clearTimeout(timeout);
    }, [search, status, unitPengolahId]);

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const openDetail = (id: number) => {
        router.visit(`/peminjaman-arsip/${id}`);
    };

    const handleRowKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, id: number) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetail(id);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Peminjaman Arsip', href: '/peminjaman-arsip' },
            ]}
        >
            <Head title="Peminjaman Arsip" />

            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Peminjaman Arsip
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Kelola data peminjaman dan pengembalian arsip
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/peminjaman-arsip/create"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Pinjam Arsip Baru</span>
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Sedang Dipinjam</h3>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.dipinjam}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
                            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-red-700 dark:text-red-300">Terlambat</h3>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.terlambat}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-300">Telah Dikembalikan</h3>
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.dikembalikan}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari nama peminjam, indeks arsip..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-gray-500" />
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                        >
                            <option value="">Semua Status</option>
                            <option value="dipinjam">Dipinjam</option>
                            <option value="terlambat">Terlambat</option>
                            <option value="dikembalikan">Dikembalikan</option>
                        </select>
                        <select
                            value={unitPengolahId}
                            onChange={(e) => setUnitPengolahId(e.target.value)}
                            className="rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">No</th>
                                <th className="px-4 py-3">Arsip</th>
                                <th className="px-4 py-3">Peminjam</th>
                                <th className="px-4 py-3">Unit / Divisi</th>
                                <th className="px-4 py-3">Tgl Pinjam</th>
                                <th className="px-4 py-3">Deadline</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {peminjaman.data.length > 0 ? (
                                peminjaman.data.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        role="link"
                                        tabIndex={0}
                                        aria-label={`Lihat detail peminjaman ${item.nama_peminjam}`}
                                        onClick={() => openDetail(item.id)}
                                        onKeyDown={(event) => handleRowKeyDown(event, item.id)}
                                        className="cursor-pointer border-b transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:hover:bg-gray-800/70"
                                    >
                                        <td className="px-4 py-3">
                                            {(peminjaman.current_page - 1) * 15 + index + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {item.arsip_unit.indeks || `#${item.arsip_unit.id_berkas}`}
                                            </div>
                                            <div className="truncate max-w-[200px] text-xs">
                                                {item.arsip_unit.kode_klasifikasi?.kode_klasifikasi} - {item.arsip_unit.uraian_informasi}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-gray-900 dark:text-white">{item.nama_peminjam}</div>
                                            {item.jabatan_peminjam && <div className="text-xs">{item.jabatan_peminjam}</div>}
                                        </td>
                                        <td className="px-4 py-3">{item.unit_pengolah?.nama_unit || '-'}</td>
                                        <td className="px-4 py-3">{formatDate(item.tanggal_pinjam)}</td>
                                        <td className="px-4 py-3 text-gray-900 font-medium dark:text-gray-300">{formatDate(item.tanggal_harus_kembali)}</td>
                                        <td className="px-4 py-3">
                                            {item.status === 'dipinjam' && (
                                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500">
                                                    Dipinjam
                                                </span>
                                            )}
                                            {item.status === 'terlambat' && (
                                                <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-500">
                                                    Terlambat
                                                </span>
                                            )}
                                            {item.status === 'dikembalikan' && (
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-500">
                                                    Dikembalikan
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className="px-4 py-3 text-right"
                                            onClick={(event) => event.stopPropagation()}
                                            onKeyDown={(event) => event.stopPropagation()}
                                        >
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/peminjaman-arsip/${item.id}`}
                                                    className="inline-flex items-center justify-center rounded-lg bg-gray-100 p-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                                        Tidak ada data peminjaman arsip ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {peminjaman.links && peminjaman.links.length > 3 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900 sm:px-6">
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700 dark:text-gray-400">
                                    Menampilkan <span className="font-medium">{(peminjaman.current_page - 1) * 15 + 1}</span> sampai <span className="font-medium">{Math.min(peminjaman.current_page * 15, peminjaman.data.length + (peminjaman.current_page - 1) * 15)}</span> dari total halaman <span className="font-medium">{peminjaman.last_page}</span>
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {peminjaman.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                link.active
                                                    ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800'
                                            } ${!link.url ? 'cursor-not-allowed opacity-50' : ''} ${
                                                i === 0 ? 'rounded-l-md' : i === peminjaman.links.length - 1 ? 'rounded-r-md' : ''
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                            preserveScroll
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
