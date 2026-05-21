import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ArrowLeftRight, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PageProps extends SharedData {
    unitPengolahs: UnitPengolah[];
    userUnitPengolahId?: number | null;
}

export default function LaporanPeminjaman() {
    const { unitPengolahs, userUnitPengolahId } = usePage<PageProps>().props;

    const { data, setData } = useForm({
        status: '',
        unit_pengolah_id: userUnitPengolahId ? userUnitPengolahId.toString() : '',
        dari_tanggal: '',
        sampai_tanggal: '',
    });

    const handleExport = () => {
        const params = new URLSearchParams();
        if (data.status) params.append('status', data.status);
        if (data.unit_pengolah_id) params.append('unit_pengolah_id', data.unit_pengolah_id);
        if (data.dari_tanggal) params.append('dari_tanggal', data.dari_tanggal);
        if (data.sampai_tanggal) params.append('sampai_tanggal', data.sampai_tanggal);

        const url = `/laporan/peminjaman/export?${params.toString()}`;
        window.open(url, '_blank');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Laporan', href: '#' },
                { title: 'Peminjaman / Pengembalian', href: '/laporan/peminjaman' },
            ]}
        >
            <Head title="Laporan Peminjaman & Pengembalian Arsip" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Peminjaman & Pengembalian Arsip</h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Buat laporan peminjaman dan pengembalian arsip berdasarkan status dan periode
                </p>
            </div>

            {/* Info Cards */}
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">Dipinjam</h3>
                            <p className="text-sm text-yellow-600 dark:text-yellow-400">Arsip yang sedang dipinjam</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-green-700 dark:text-green-300">Dikembalikan</h3>
                            <p className="text-sm text-green-600 dark:text-green-400">Arsip yang telah dikembalikan</p>
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
                            <p className="text-sm text-red-600 dark:text-red-400">Melewati batas waktu</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-500">
                            <ArrowLeftRight className="h-5 w-5" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tentang Laporan Ini</h2>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Laporan ini menampilkan daftar peminjaman arsip beserta status pengembaliannya. 
                            Anda dapat memfilter data berdasarkan:
                        </p>
                        <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li>Status (Dipinjam, Dikembalikan, Terlambat)</li>
                            <li>Unit Pengolah (Pencipta Arsip)</li>
                            <li>Rentang Tanggal Peminjaman</li>
                        </ul>
                        <p className="mt-4 text-xs text-gray-500">
                            Laporan akan diunduh dalam format PDF.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-6 text-lg font-semibold text-gray-900 dark:text-white">Filter Laporan</h2>
                        
                        <div className="grid gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Status Peminjaman
                                </label>
                                <select
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                >
                                    <option value="">Semua Status</option>
                                    <option value="dipinjam">Sedang Dipinjam</option>
                                    <option value="dikembalikan">Telah Dikembalikan</option>
                                    <option value="terlambat">Terlambat</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Unit Pengolah
                                </label>
                                <select
                                    value={data.unit_pengolah_id}
                                    onChange={(e) => setData('unit_pengolah_id', e.target.value)}
                                    disabled={!!userUnitPengolahId}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
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
                                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Dari Tanggal Peminjaman
                                </label>
                                <input
                                    type="date"
                                    value={data.dari_tanggal}
                                    onChange={(e) => setData('dari_tanggal', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={data.sampai_tanggal}
                                    onChange={(e) => setData('sampai_tanggal', e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end border-t border-gray-200 pt-6 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleExport}
                                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
                            >
                                <ArrowLeftRight className="h-4 w-4" />
                                Buat Laporan PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
