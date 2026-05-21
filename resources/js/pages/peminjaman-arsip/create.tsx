import AppLayout from '@/layouts/app-layout';
import { type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface ArsipUnit {
    id_berkas: number;
    indeks: string;
    uraian_informasi: string;
    kode_klasifikasi: string;
    unit_pengolah: string;
}

interface PageProps extends SharedData {
    unitPengolahs: UnitPengolah[];
    arsipUnits: ArsipUnit[];
}

export default function Create() {
    const { unitPengolahs, arsipUnits } = usePage<PageProps>().props;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArsip = arsipUnits.filter((arsip) => {
        const searchStr = searchTerm.toLowerCase();
        return (
            arsip.indeks.toLowerCase().includes(searchStr) ||
            (arsip.uraian_informasi && arsip.uraian_informasi.toLowerCase().includes(searchStr)) ||
            (arsip.kode_klasifikasi && arsip.kode_klasifikasi.toLowerCase().includes(searchStr))
        );
    });

    const { data, setData, post, processing, errors } = useForm({
        arsip_unit_id: '',
        peminjam_id: '',
        unit_pengolah_id: '',
        nama_peminjam: '',
        jabatan_peminjam: '',
        tujuan_peminjaman: '',
        tanggal_pinjam: new Date().toISOString().split('T')[0],
        tanggal_harus_kembali: '',
        catatan: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/peminjaman-arsip');
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Peminjaman Arsip', href: '/peminjaman-arsip' },
                { title: 'Pinjam Arsip Baru', href: '/peminjaman-arsip/create' },
            ]}
        >
            <Head title="Pinjam Arsip Baru" />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Pinjam Arsip Baru
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        Catat peminjaman arsip baru ke dalam sistem
                    </p>
                </div>
                <Link
                    href="/peminjaman-arsip"
                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Kembali</span>
                </Link>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Arsip Selection */}
                        <div className="md:col-span-2">
                            <label htmlFor="arsip_unit_id" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Arsip yang Dipinjam <span className="text-red-500">*</span>
                            </label>
                            
                            <div className="mb-2">
                                <input
                                    type="text"
                                    placeholder="Cari arsip berdasarkan indeks atau uraian..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                                />
                            </div>

                            <select
                                id="arsip_unit_id"
                                value={data.arsip_unit_id}
                                onChange={(e) => setData('arsip_unit_id', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.arsip_unit_id ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                size={5}
                            >
                                <option value="" disabled>-- Pilih Arsip --</option>
                                {filteredArsip.map((arsip) => (
                                    <option key={arsip.id_berkas} value={arsip.id_berkas}>
                                        {arsip.indeks} - {arsip.uraian_informasi} ({arsip.kode_klasifikasi})
                                    </option>
                                ))}
                            </select>
                            {errors.arsip_unit_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.arsip_unit_id}</p>}
                            <p className="mt-1 text-xs text-gray-500">Hanya arsip dengan status "Diterima" yang dapat dipinjam.</p>
                        </div>

                        {/* Peminjam Info */}
                        <div>
                            <label htmlFor="nama_peminjam" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Nama Peminjam <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="nama_peminjam"
                                value={data.nama_peminjam}
                                onChange={(e) => setData('nama_peminjam', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.nama_peminjam ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Masukkan nama lengkap peminjam"
                            />
                            {errors.nama_peminjam && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.nama_peminjam}</p>}
                        </div>

                        <div>
                            <label htmlFor="jabatan_peminjam" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Jabatan Peminjam
                            </label>
                            <input
                                type="text"
                                id="jabatan_peminjam"
                                value={data.jabatan_peminjam}
                                onChange={(e) => setData('jabatan_peminjam', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.jabatan_peminjam ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Masukkan jabatan peminjam"
                            />
                            {errors.jabatan_peminjam && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.jabatan_peminjam}</p>}
                        </div>

                        <div>
                            <label htmlFor="unit_pengolah_id" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Unit Pengolah / Instansi
                            </label>
                            <select
                                id="unit_pengolah_id"
                                value={data.unit_pengolah_id}
                                onChange={(e) => setData('unit_pengolah_id', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.unit_pengolah_id ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                            >
                                <option value="">-- Pilih Unit Pengolah --</option>
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                            {errors.unit_pengolah_id && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.unit_pengolah_id}</p>}
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tanggal_pinjam" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Tanggal Pinjam <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="tanggal_pinjam"
                                    value={data.tanggal_pinjam}
                                    onChange={(e) => setData('tanggal_pinjam', e.target.value)}
                                    className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                        errors.tanggal_pinjam ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                />
                                {errors.tanggal_pinjam && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tanggal_pinjam}</p>}
                            </div>
                            
                            <div>
                                <label htmlFor="tanggal_harus_kembali" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                    Tgl. Harus Kembali <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    id="tanggal_harus_kembali"
                                    value={data.tanggal_harus_kembali}
                                    onChange={(e) => setData('tanggal_harus_kembali', e.target.value)}
                                    className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                        errors.tanggal_harus_kembali ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                    }`}
                                />
                                {errors.tanggal_harus_kembali && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tanggal_harus_kembali}</p>}
                            </div>
                        </div>

                        {/* Textareas */}
                        <div className="md:col-span-2">
                            <label htmlFor="tujuan_peminjaman" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Tujuan Peminjaman <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="tujuan_peminjaman"
                                rows={3}
                                value={data.tujuan_peminjaman}
                                onChange={(e) => setData('tujuan_peminjaman', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.tujuan_peminjaman ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Jelaskan tujuan atau keperluan meminjam arsip ini..."
                            />
                            {errors.tujuan_peminjaman && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tujuan_peminjaman}</p>}
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="catatan" className="mb-2 block text-sm font-medium text-gray-900 dark:text-white">
                                Catatan Tambahan (Opsional)
                            </label>
                            <textarea
                                id="catatan"
                                rows={2}
                                value={data.catatan}
                                onChange={(e) => setData('catatan', e.target.value)}
                                className={`block w-full rounded-lg border bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 ${
                                    errors.catatan ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'
                                }`}
                                placeholder="Tambahkan catatan jika diperlukan..."
                            />
                            {errors.catatan && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.catatan}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 dark:focus:ring-blue-800"
                        >
                            <Save className="h-4 w-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Peminjaman'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
