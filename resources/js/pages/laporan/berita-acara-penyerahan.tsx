import AppLayout from '@/layouts/app-layout';
import { usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, CheckCircle, Search, X, FileSignature, Building2, Calendar, Users, Package } from 'lucide-react';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface KodeKlasifikasi {
    kode_klasifikasi: string;
    deskripsi: string;
}

interface ArsipUnit {
    id_berkas: number;
    no_item_arsip: string;
    uraian_informasi: string;
    tanggal: string;
    ruangan: string;
    no_box: string;
    kode_klasifikasi: KodeKlasifikasi | null;
    unit_pengolah: UnitPengolah | null;
}

interface PageProps {
    unitPengolahs: UnitPengolah[];
    arsipUnits: ArsipUnit[];
    [key: string]: unknown;
}

export default function BeritaAcaraPenyerahan() {
    const { unitPengolahs, arsipUnits } = usePage<PageProps>().props;
    
    const [unitPengolahAsalId, setUnitPengolahAsalId] = useState('');
    const [unitPengolahTujuanId, setUnitPengolahTujuanId] = useState('');
    const [penerimaExternal, setPenerimaExternal] = useState(false);
    const [penerimaNama, setPenerimaNama] = useState('');
    const [penerimaJabatan, setPenerimaJabatan] = useState('');
    const [tanggalPenyerahan, setTanggalPenyerahan] = useState(new Date().toISOString().split('T')[0]);
    const [keterangan, setKeterangan] = useState('');
    const [selectedArsipIds, setSelectedArsipIds] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Filter arsip based on selected unit asal and search term
    const filteredArsip = arsipUnits.filter(arsip => {
        const matchesUnit = !unitPengolahAsalId || arsip.unit_pengolah?.id === parseInt(unitPengolahAsalId);
        const matchesSearch = !searchTerm || 
            arsip.no_item_arsip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arsip.uraian_informasi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            arsip.kode_klasifikasi?.kode_klasifikasi?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesUnit && matchesSearch;
    });

    const toggleArsipSelection = (id: number) => {
        setSelectedArsipIds(prev => 
            prev.includes(id) 
                ? prev.filter(x => x !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedArsipIds(filteredArsip.map(a => a.id_berkas));
    };

    const deselectAll = () => {
        setSelectedArsipIds([]);
    };

    const handleSubmit = async () => {
        // Validation
        const newErrors: Record<string, string> = {};
        
        if (!unitPengolahAsalId) {
            newErrors.unit_pengolah_asal_id = 'Unit pengolah asal harus dipilih';
        }
        
        if (!penerimaExternal && !unitPengolahTujuanId) {
            newErrors.unit_pengolah_tujuan_id = 'Unit pengolah tujuan harus dipilih';
        }
        
        if (penerimaExternal && !penerimaNama) {
            newErrors.penerima_nama = 'Nama penerima harus diisi';
        }
        
        if (!tanggalPenyerahan) {
            newErrors.tanggal_penyerahan = 'Tanggal penyerahan harus diisi';
        }
        
        if (selectedArsipIds.length === 0) {
            newErrors.arsip_ids = 'Pilih minimal 1 arsip untuk diserahkan';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        setIsGenerating(true);

        // Create form data
        const formData = new FormData();
        formData.append('unit_pengolah_asal_id', unitPengolahAsalId);
        formData.append('tanggal_penyerahan', tanggalPenyerahan);
        formData.append('keterangan', keterangan);
        
        if (penerimaExternal) {
            formData.append('penerima_nama', penerimaNama);
            formData.append('penerima_jabatan', penerimaJabatan);
        } else {
            formData.append('unit_pengolah_tujuan_id', unitPengolahTujuanId);
        }
        
        selectedArsipIds.forEach((id, index) => {
            formData.append(`arsip_ids[${index}]`, id.toString());
        });

        // Submit via fetch to get PDF response
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            
            const response = await fetch('/laporan/berita-acara-penyerahan', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/pdf',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
                
                // Reset form after successful submission
                setSelectedArsipIds([]);
                setKeterangan('');
            } else {
                // Try to parse error response
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    if (errorData.errors) {
                        setErrors(errorData.errors);
                    } else if (errorData.message) {
                        setErrors({ general: errorData.message });
                    }
                } else {
                    const text = await response.text();
                    console.error('Server error:', text);
                    setErrors({ general: 'Terjadi kesalahan saat generate PDF. Silakan coba lagi.' });
                }
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            setErrors({ general: 'Gagal terhubung ke server. Silakan coba lagi.' });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Dashboard', href: '/dashboard' },
                { title: 'Laporan', href: '' },
                { title: 'Berita Acara Penyerahan Arsip', href: '' },
            ]}
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Berita Acara Penyerahan Arsip
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Buat berita acara untuk serah terima arsip antar unit atau ke pihak eksternal
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Form Section */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Info Card */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
                        <div className="flex items-start gap-3">
                            <FileSignature className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-800 dark:text-blue-300">Tentang Berita Acara</h3>
                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-400">
                                    Dokumen resmi yang mencatat serah terima arsip dari satu unit ke unit lain atau ke pihak eksternal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Form Penyerahan
                        </h2>

                        <div className="space-y-4">
                            {/* Unit Pengolah Asal */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Building2 className="inline h-4 w-4 mr-1" />
                                    Unit Pengolah Asal <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={unitPengolahAsalId}
                                    onChange={(e) => {
                                        setUnitPengolahAsalId(e.target.value);
                                        setSelectedArsipIds([]);
                                    }}
                                    className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white ${errors.unit_pengolah_asal_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                >
                                    <option value="">-- Pilih Unit Asal --</option>
                                    {unitPengolahs.map((unit) => (
                                        <option key={unit.id} value={unit.id}>
                                            {unit.nama_unit}
                                        </option>
                                    ))}
                                </select>
                                {errors.unit_pengolah_asal_id && (
                                    <p className="mt-1 text-xs text-red-500">{errors.unit_pengolah_asal_id}</p>
                                )}
                            </div>

                            {/* Toggle Penerima */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="penerimaExternal"
                                    checked={penerimaExternal}
                                    onChange={(e) => setPenerimaExternal(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="penerimaExternal" className="text-sm text-gray-700 dark:text-gray-300">
                                    Penerima eksternal (bukan unit internal)
                                </label>
                            </div>

                            {/* Unit Pengolah Tujuan atau Penerima External */}
                            {!penerimaExternal ? (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                        <Building2 className="inline h-4 w-4 mr-1" />
                                        Unit Pengolah Tujuan <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={unitPengolahTujuanId}
                                        onChange={(e) => setUnitPengolahTujuanId(e.target.value)}
                                        className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white ${errors.unit_pengolah_tujuan_id ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                    >
                                        <option value="">-- Pilih Unit Tujuan --</option>
                                        {unitPengolahs
                                            .filter(unit => unit.id !== parseInt(unitPengolahAsalId))
                                            .map((unit) => (
                                                <option key={unit.id} value={unit.id}>
                                                    {unit.nama_unit}
                                                </option>
                                            ))}
                                    </select>
                                    {errors.unit_pengolah_tujuan_id && (
                                        <p className="mt-1 text-xs text-red-500">{errors.unit_pengolah_tujuan_id}</p>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            <Users className="inline h-4 w-4 mr-1" />
                                            Nama Penerima <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={penerimaNama}
                                            onChange={(e) => setPenerimaNama(e.target.value)}
                                            placeholder="Nama lengkap penerima"
                                            className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white ${errors.penerima_nama ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                        />
                                        {errors.penerima_nama && (
                                            <p className="mt-1 text-xs text-red-500">{errors.penerima_nama}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Jabatan Penerima
                                        </label>
                                        <input
                                            type="text"
                                            value={penerimaJabatan}
                                            onChange={(e) => setPenerimaJabatan(e.target.value)}
                                            placeholder="Jabatan penerima (opsional)"
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                        />
                                    </div>
                                </>
                            )}

                            {/* Tanggal Penyerahan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    <Calendar className="inline h-4 w-4 mr-1" />
                                    Tanggal Penyerahan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={tanggalPenyerahan}
                                    onChange={(e) => setTanggalPenyerahan(e.target.value)}
                                    className={`w-full rounded-lg border px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-800 dark:text-white ${errors.tanggal_penyerahan ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'}`}
                                />
                                {errors.tanggal_penyerahan && (
                                    <p className="mt-1 text-xs text-red-500">{errors.tanggal_penyerahan}</p>
                                )}
                            </div>

                            {/* Keterangan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Keterangan
                                </label>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    rows={3}
                                    placeholder="Catatan tambahan (opsional)"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                            </div>

                            {/* Selected Count */}
                            <div className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Arsip dipilih:
                                    </span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {selectedArsipIds.length} item
                                    </span>
                                </div>
                                {errors.arsip_ids && (
                                    <p className="mt-1 text-xs text-red-500">{errors.arsip_ids}</p>
                                )}
                            </div>

                            {/* General Error */}
                            {errors.general && (
                                <div className="rounded-lg bg-red-50 border border-red-200 p-3 dark:bg-red-900/20 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="button"
                                onClick={handleSubmit}
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
                                        <FileSignature className="h-4 w-4" />
                                        Buat Berita Acara PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Arsip Selection Section */}
                <div className="lg:col-span-2">
                    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <div className="border-b border-gray-200 p-4 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Package className="h-5 w-5 text-green-600" />
                                    Pilih Arsip untuk Diserahkan
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={selectAll}
                                        className="text-xs px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                                    >
                                        Pilih Semua
                                    </button>
                                    <button
                                        onClick={deselectAll}
                                        className="text-xs px-3 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                                    >
                                        Batal Pilih
                                    </button>
                                </div>
                            </div>
                            
                            {/* Search */}
                            <div className="mt-3 relative">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Cari arsip berdasarkan kode, nomor item, atau uraian..."
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {!unitPengolahAsalId && (
                                <p className="mt-2 text-sm text-amber-600 dark:text-amber-400">
                                    ⚠️ Pilih unit pengolah asal terlebih dahulu untuk memfilter arsip
                                </p>
                            )}
                        </div>

                        {/* Arsip List */}
                        <div className="max-h-[600px] overflow-y-auto">
                            {filteredArsip.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Package className="mx-auto h-12 w-12 opacity-50" />
                                    <p className="mt-2">
                                        {unitPengolahAsalId 
                                            ? 'Tidak ada arsip yang tersedia untuk unit ini'
                                            : 'Pilih unit pengolah asal untuk menampilkan arsip'}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredArsip.map((arsip) => (
                                        <label
                                            key={arsip.id_berkas}
                                            className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${
                                                selectedArsipIds.includes(arsip.id_berkas)
                                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedArsipIds.includes(arsip.id_berkas)}
                                                onChange={() => toggleArsipSelection(arsip.id_berkas)}
                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                                        {arsip.kode_klasifikasi?.kode_klasifikasi || '-'}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {arsip.no_item_arsip || '-'}
                                                    </span>
                                                    <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                        <CheckCircle className="mr-1 h-3 w-3" />
                                                        Diterima
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {arsip.uraian_informasi || '-'}
                                                </p>
                                                <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
                                                    <span>📅 {arsip.tanggal ? new Date(arsip.tanggal).toLocaleDateString('id-ID') : '-'}</span>
                                                    {arsip.ruangan && <span>📍 {arsip.ruangan}</span>}
                                                    {arsip.unit_pengolah && <span>🏢 {arsip.unit_pengolah.nama_unit}</span>}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-3 dark:border-gray-700">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan {filteredArsip.length} arsip 
                                {selectedArsipIds.length > 0 && (
                                    <span className="ml-2 text-blue-600 dark:text-blue-400">
                                        • {selectedArsipIds.length} dipilih
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
