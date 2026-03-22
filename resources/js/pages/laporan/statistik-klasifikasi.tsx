import AppLayout from '@/layouts/app-layout';
import { useState } from 'react';
import { BarChart3, FileBarChart, Tag, Layers, Download } from 'lucide-react';

export default function LaporanStatistikKlasifikasi() {
    const [dariTanggal, setDariTanggal] = useState('');
    const [sampaiTanggal, setSampaiTanggal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);

        const params = new URLSearchParams();
        if (dariTanggal) params.append('dari_tanggal', dariTanggal);
        if (sampaiTanggal) params.append('sampai_tanggal', sampaiTanggal);

        window.open(`/laporan/statistik-klasifikasi/export?${params.toString()}`, '_blank');

        setTimeout(() => setIsGenerating(false), 1000);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Laporan', href: '' },
                { title: 'Statistik Klasifikasi', href: '' },
            ]}
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Laporan Statistik Klasifikasi Arsip
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Buat laporan distribusi arsip berdasarkan kode klasifikasi
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Info Section */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Stats Preview Cards */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/50">
                                    <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-700 dark:text-blue-300">Kode</h3>
                                    <p className="text-xs text-blue-500 dark:text-blue-400">Klasifikasi</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                                    <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">Distribusi</h3>
                                    <p className="text-xs text-green-500 dark:text-green-400">Per Grup</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/50">
                                    <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-purple-700 dark:text-purple-300">Proporsi</h3>
                                    <p className="text-xs text-purple-500 dark:text-purple-400">Visual</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Report */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Tentang Laporan Ini
                        </h2>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                Laporan ini menampilkan distribusi arsip berdasarkan kode klasifikasi:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>Ringkasan:</strong> Total arsip, jumlah kode klasifikasi yang digunakan, dan jumlah grup</li>
                                <li><strong>Distribusi per Grup:</strong> Pengelompokan berdasarkan prefix kode (KU, PR, HK, dll)</li>
                                <li><strong>Detail per Kode:</strong> Rincian jumlah dan persentase setiap kode klasifikasi</li>
                                <li><strong>Visualisasi:</strong> Bar chart horizontal untuk memudahkan perbandingan</li>
                            </ul>
                            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-800 dark:text-blue-300">
                                    <strong>Manfaat:</strong>
                                </p>
                                <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-400">
                                    <li>• Mengetahui kategori arsip yang paling banyak digunakan</li>
                                    <li>• Mengidentifikasi kode klasifikasi yang jarang terpakai</li>
                                    <li>• Evaluasi kebijakan pengelolaan arsip berdasarkan jenis</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-2 mb-4">
                        <FileBarChart className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Buat Laporan
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <strong>Tips:</strong> Laporan akan menampilkan statistik semua kode klasifikasi. Gunakan filter tanggal untuk membatasi periode.
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={dariTanggal}
                                onChange={(e) => setDariTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Kosongkan untuk mengambil semua data
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={sampaiTanggal}
                                onChange={(e) => setSampaiTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Kosongkan untuk mengambil sampai hari ini
                            </p>
                        </div>

                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={handleExport}
                                disabled={isGenerating}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4" />
                                        Buat Laporan PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
