import AppLayout from '@/layouts/app-layout';
import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { useState, FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    uraian: string;
    retensi_aktif?: number;
    retensi_inaktif?: number;
    status_akhir?: string;
}

interface UnitPengolah {
    id: number;
    nama_unit: string;
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
    kode_klasifikasi?: KodeKlasifikasi;
    unit_pengolah?: UnitPengolah;
}

interface PageProps {
    berkasArsip: BerkasArsip;
    kodeKlasifikasis: KodeKlasifikasi[];
    unitPengolahs: UnitPengolah[];
    userUnitPengolahId?: number | null;
    errors: Record<string, string>;
    [key: string]: any;
}

export default function Edit() {
    const { berkasArsip, kodeKlasifikasis, unitPengolahs, userUnitPengolahId, errors } = usePage<PageProps>().props;
    const [processing, setProcessing] = useState(false);
    
    // Check if user has unit_pengolah restriction
    const isUnitPengolahLocked = userUnitPengolahId !== null && userUnitPengolahId !== undefined;
    
    const [data, setData] = useState({
        nama_berkas: berkasArsip.nama_berkas || '',
        klasifikasi_id: berkasArsip.klasifikasi_id?.toString() || '',
        unit_pengolah_id: isUnitPengolahLocked ? userUnitPengolahId.toString() : (berkasArsip.unit_pengolah_id?.toString() || ''),
        retensi_aktif: berkasArsip.retensi_aktif?.toString() || '',
        retensi_inaktif: berkasArsip.retensi_inaktif?.toString() || '',
        penyusutan_akhir: berkasArsip.penyusutan_akhir || '',
        lokasi_fisik: berkasArsip.lokasi_fisik || '',
        uraian: berkasArsip.uraian || '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(`/berkas-arsip/${berkasArsip.nomor_berkas}`, data, {
            onFinish: () => setProcessing(false),
        });
    };

    const handleKlasifikasiChange = (klasifikasiId: string) => {
        const selectedKlasifikasi = kodeKlasifikasis.find(
            (k) => k.id.toString() === klasifikasiId
        );

        if (selectedKlasifikasi) {
            setData({
                ...data,
                klasifikasi_id: klasifikasiId,
                retensi_aktif: selectedKlasifikasi.retensi_aktif?.toString() || '',
                retensi_inaktif: selectedKlasifikasi.retensi_inaktif?.toString() || '',
                penyusutan_akhir: selectedKlasifikasi.status_akhir || '',
            });
        } else {
            setData({ ...data, klasifikasi_id: klasifikasiId });
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Berkas Arsip', href: '/berkas-arsip' },
                { title: 'Edit Berkas Arsip', href: '' },
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

                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {'Edit Berkas Arsip'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {'Perbarui informasi berkas arsip'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Left Column - Informasi Utama */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Informasi Utama
                            </h3>
                            <div className="space-y-4">
                                
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {'Nama Berkas'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nama_berkas}
                                        onChange={(e) => setData({ ...data, nama_berkas: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        placeholder={'Masukkan nama berkas'}
                                    />
                                    <InputError message={errors.nama_berkas} />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Klasifikasi <span className="text-red-500">*</span>
                                    </Label>
                                    <Combobox
                                        options={kodeKlasifikasis.map((kode) => ({
                                            value: kode.id.toString(),
                                            label: `${kode.kode_klasifikasi} - ${kode.uraian}`,
                                            searchValue: `${kode.kode_klasifikasi} ${kode.uraian}`,
                                        }))}
                                        value={data.klasifikasi_id}
                                        onValueChange={handleKlasifikasiChange}
                                        placeholder="Pilih klasifikasi"
                                        searchPlaceholder="Cari klasifikasi..."
                                        emptyMessage="Klasifikasi tidak ditemukan."
                                        className="w-full"
                                    />
                                    <InputError message={errors.klasifikasi_id} />
                                </div>

                                <div>
                                    <Label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Unit Pengolah {isUnitPengolahLocked && <span className="text-xs text-gray-500">(terkunci)</span>}
                                    </Label>
                                    <Combobox
                                        options={unitPengolahs.map((unit) => ({
                                            value: unit.id.toString(),
                                            label: unit.nama_unit,
                                        }))}
                                        value={data.unit_pengolah_id}
                                        onValueChange={(value) => !isUnitPengolahLocked && setData({ ...data, unit_pengolah_id: value })}
                                        placeholder="Pilih unit pengolah"
                                        searchPlaceholder="Cari unit pengolah..."
                                        emptyMessage="Unit pengolah tidak ditemukan."
                                        className="w-full"
                                        disabled={isUnitPengolahLocked}
                                    />
                                    {isUnitPengolahLocked && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Unit pengolah terkunci sesuai akun Anda
                                        </p>
                                    )}
                                    <InputError message={errors.unit_pengolah_id} />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {'Retensi Aktif'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.retensi_aktif}
                                            onChange={(e) => setData({ ...data, retensi_aktif: e.target.value })}
                                            disabled
                                            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                            placeholder="0"
                                        />
                                        <InputError message={errors.retensi_aktif} />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {'Retensi Inaktif'}
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={data.retensi_inaktif}
                                            onChange={(e) => setData({ ...data, retensi_inaktif: e.target.value })}
                                            disabled
                                            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                            placeholder="0"
                                        />
                                        <InputError message={errors.retensi_inaktif} />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {'Penyusutan Akhir'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.penyusutan_akhir}
                                        onChange={(e) => setData({ ...data, penyusutan_akhir: e.target.value })}
                                        disabled
                                        className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400"
                                        placeholder={'Masukkan penyusutan akhir'}
                                    />
                                    <InputError message={errors.penyusutan_akhir} />
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Detail Berkas */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                                Detail Berkas
                            </h3>
                            <div className="space-y-4">
                                
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {'Lokasi Fisik'}
                                    </label>
                                    <input
                                        type="text"
                                        value={data.lokasi_fisik}
                                        onChange={(e) => setData({ ...data, lokasi_fisik: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        placeholder={'Masukkan lokasi fisik'}
                                    />
                                    <InputError message={errors.lokasi_fisik} />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        {'Uraian'}
                                    </label>
                                    <textarea
                                        value={data.uraian}
                                        onChange={(e) => setData({ ...data, uraian: e.target.value })}
                                        rows={10}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        placeholder={'Masukkan uraian (opsional)'}
                                    />
                                    <InputError message={errors.uraian} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                            >
                                {processing ? 'Memperbarui...' : 'Perbarui'}
                            </button>
                            <Link
                                href="/berkas-arsip"
                                className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Batal
                            </Link>
                        </div>
                    </form>
            </div>
        </AppLayout>
    );
}
