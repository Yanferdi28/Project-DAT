import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileDown, ChevronDown, Filter } from 'lucide-react';
import { useRef, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    nama_klasifikasi: string;
    status_akhir?: string;
}

interface UnitPengolah {
    id: number;
    nama: string;
    nama_unit?: string;
}

interface BerkasArsip {
    nomor_berkas: number;
    nama_berkas: string;
    klasifikasi_id: number;
    unit_pengolah_id: number;
    retensi_aktif: number;
    retensi_inaktif: number;
    penyusutan_akhir: string;
    lokasi_fisik?: string;
    uraian?: string;
    keterangan?: string;
    kurun_waktu?: string;
    kode_klasifikasi?: KodeKlasifikasi;
    unit_pengolah?: UnitPengolah;
    arsip_units_count?: number;
    created_at: string;
}

interface Props {
    berkasArsips: BerkasArsip[];
    kodeKlasifikasis: KodeKlasifikasi[];
    unitPengolahs: UnitPengolah[];
    filters: {
        klasifikasi_id?: string;
        unit_pengolah_id?: string;
        dari_tanggal?: string;
        sampai_tanggal?: string;
    };
    userUnitPengolahId?: number | null;
}

export default function PrintPreview() {
    const { berkasArsips, kodeKlasifikasis, unitPengolahs, filters, userUnitPengolahId } = usePage<{ props: Props }>().props as unknown as Props;
    const printRef = useRef<HTMLDivElement>(null);
    
    // Local filter state
    const [localFilters, setLocalFilters] = useState({
        klasifikasi_id: filters.klasifikasi_id || '',
        unit_pengolah_id: filters.unit_pengolah_id || '',
        dari_tanggal: filters.dari_tanggal || '',
        sampai_tanggal: filters.sampai_tanggal || '',
    });

    const handleDownloadPDF = (format: 'summary' | 'detail') => {
        const params = new URLSearchParams();
        if (localFilters.klasifikasi_id) params.append('klasifikasi_id', localFilters.klasifikasi_id);
        if (localFilters.unit_pengolah_id) params.append('unit_pengolah_id', localFilters.unit_pengolah_id);
        if (localFilters.dari_tanggal) params.append('dari_tanggal', localFilters.dari_tanggal);
        if (localFilters.sampai_tanggal) params.append('sampai_tanggal', localFilters.sampai_tanggal);
        params.append('format', format);
        
        window.location.href = `/berkas-arsip/export/pdf?${params.toString()}`;
    };

    const handleApplyFilter = () => {
        const params = new URLSearchParams();
        if (localFilters.klasifikasi_id) params.append('klasifikasi_id', localFilters.klasifikasi_id);
        if (localFilters.unit_pengolah_id) params.append('unit_pengolah_id', localFilters.unit_pengolah_id);
        if (localFilters.dari_tanggal) params.append('dari_tanggal', localFilters.dari_tanggal);
        if (localFilters.sampai_tanggal) params.append('sampai_tanggal', localFilters.sampai_tanggal);
        
        router.visit(`/berkas-arsip/print-preview?${params.toString()}`);
    };

    const handleResetFilter = () => {
        setLocalFilters({
            klasifikasi_id: '',
            unit_pengolah_id: '',
            dari_tanggal: '',
            sampai_tanggal: '',
        });
        router.visit('/berkas-arsip/print-preview');
    };

    const handleBack = () => {
        router.visit('/berkas-arsip');
    };

    // Get filter names for display
    const getKlasifikasiName = () => {
        if (!localFilters.klasifikasi_id) return 'Semua';
        const klasifikasi = kodeKlasifikasis.find(k => k.id === parseInt(localFilters.klasifikasi_id!));
        return klasifikasi ? `${klasifikasi.kode_klasifikasi} - ${klasifikasi.nama_klasifikasi}` : 'Semua';
    };

    const getUnitPengolahName = () => {
        if (!localFilters.unit_pengolah_id) return 'Semua';
        const unit = unitPengolahs.find(u => u.id === parseInt(localFilters.unit_pengolah_id!));
        return unit ? unit.nama : 'Semua';
    };

    return (
        <>
            <Head title="Print Preview - Berkas Arsip" />
            
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-area, #print-area * {
                        visibility: visible;
                    }
                    #print-area {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        padding: 20px;
                        background: white !important;
                        color: black !important;
                    }
                    #print-area table {
                        background: white !important;
                    }
                    #print-area th, #print-area td {
                        background: white !important;
                        color: black !important;
                        border-color: #e5e7eb !important;
                    }
                    #print-area thead tr {
                        background: #f3f4f6 !important;
                    }
                    #print-area tbody tr:nth-child(even) {
                        background: #f9fafb !important;
                    }
                    .no-print {
                        display: none !important;
                    }
                    @page {
                        size: landscape;
                        margin: 1cm;
                    }
                    table {
                        font-size: 10px;
                    }
                }
            `}</style>

            {/* Control buttons - hidden when printing */}
            <div className="no-print fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali
                    </Button>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <FileDown className="h-4 w-4" />
                                    Download PDF
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownloadPDF('summary')}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Format Summary (Ringkasan)
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPDF('detail')}>
                                    <FileDown className="h-4 w-4 mr-2" />
                                    Format Detail (Lengkap)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Filter Section - hidden when printing */}
            <div className="no-print pt-16 pb-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter className="h-5 w-5 text-gray-500" />
                            <h3 className="font-semibold text-gray-900 dark:text-white">Filter Laporan</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="klasifikasi" className="text-gray-700 dark:text-gray-300">Klasifikasi</Label>
                                <Select
                                    value={localFilters.klasifikasi_id}
                                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, klasifikasi_id: value === 'all' ? '' : value }))}
                                >
                                    <SelectTrigger id="klasifikasi" className="bg-white dark:bg-gray-800">
                                        <SelectValue placeholder="Semua Klasifikasi" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Klasifikasi</SelectItem>
                                        {kodeKlasifikasis.map((k) => (
                                            <SelectItem key={k.id} value={k.id.toString()}>
                                                {k.kode_klasifikasi} - {k.nama_klasifikasi}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {userUnitPengolahId === null && (
                                <div className="space-y-2">
                                    <Label htmlFor="unit_pengolah" className="text-gray-700 dark:text-gray-300">Unit Pengolah</Label>
                                    <Select
                                        value={localFilters.unit_pengolah_id}
                                        onValueChange={(value) => setLocalFilters(prev => ({ ...prev, unit_pengolah_id: value === 'all' ? '' : value }))}
                                    >
                                        <SelectTrigger id="unit_pengolah" className="bg-white dark:bg-gray-800">
                                            <SelectValue placeholder="Semua Unit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Unit</SelectItem>
                                            {unitPengolahs.map((u) => (
                                                <SelectItem key={u.id} value={u.id.toString()}>
                                                    {u.nama}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="dari_tanggal" className="text-gray-700 dark:text-gray-300">Dari Tanggal</Label>
                                <Input
                                    id="dari_tanggal"
                                    type="date"
                                    value={localFilters.dari_tanggal}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, dari_tanggal: e.target.value }))}
                                    className="bg-white dark:bg-gray-800"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="sampai_tanggal" className="text-gray-700 dark:text-gray-300">Sampai Tanggal</Label>
                                <Input
                                    id="sampai_tanggal"
                                    type="date"
                                    value={localFilters.sampai_tanggal}
                                    onChange={(e) => setLocalFilters(prev => ({ ...prev, sampai_tanggal: e.target.value }))}
                                    className="bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={handleResetFilter}>
                                Reset
                            </Button>
                            <Button onClick={handleApplyFilter} className="bg-blue-600 hover:bg-blue-700 text-white">
                                Terapkan Filter
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print area - always use light colors for printing */}
            <div id="print-area" ref={printRef} className="min-h-screen bg-white dark:bg-white pt-4 pb-8 text-gray-900">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-black uppercase tracking-wide">
                            LAPORAN DAFTAR BERKAS ARSIP
                        </h1>
                        {localFilters.unit_pengolah_id && (
                            <p className="text-sm text-black mt-1">
                                UNIT PENGOLAH: {getUnitPengolahName()}
                            </p>
                        )}
                        <p className="text-sm text-black mt-1">
                            {localFilters.dari_tanggal || localFilters.sampai_tanggal ? (
                                <>
                                    PERIODE: {localFilters.dari_tanggal ? new Date(localFilters.dari_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    {' - '}
                                    {localFilters.sampai_tanggal ? new Date(localFilters.sampai_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </>
                            ) : (
                                <>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                            )}
                        </p>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-gray-300 rounded-lg">
                        <table className="w-full text-sm bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">NO</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">KODE KLASIFIKASI</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">NAMA BERKAS</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">TANGGAL BUAT BERKAS</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">KURUN WAKTU</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">JUMLAH ITEM</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">RETENSI AKTIF</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">RETENSI INAKTIF</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">SKKAAD</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">STATUS AKHIR</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">LOKASI FISIK</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border border-gray-300">KETERANGAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {berkasArsips.length === 0 ? (
                                    <tr>
                                        <td colSpan={12} className="px-3 py-8 text-center text-gray-500 bg-white">
                                            Tidak ada data berkas arsip
                                        </td>
                                    </tr>
                                ) : (
                                    berkasArsips.map((berkas, index) => (
                                        <tr key={berkas.nomor_berkas} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">{index + 1}</td>
                                            <td className="px-2 py-1 border border-gray-200 text-gray-900">
                                                {berkas.kode_klasifikasi?.kode_klasifikasi || '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-gray-900">{berkas.nama_berkas || '-'}</td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.created_at ? new Date(berkas.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.kurun_waktu || '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.arsip_units_count ?? 0}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.retensi_aktif ?? '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.retensi_inaktif ?? '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.kode_klasifikasi?.status_akhir || '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-center text-gray-900">
                                                {berkas.penyusutan_akhir || '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-gray-900">
                                                {berkas.lokasi_fisik || '-'}
                                            </td>
                                            <td className="px-2 py-1 border border-gray-200 text-gray-900">
                                                {berkas.keterangan || '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 text-center text-xs text-gray-500">
                        <p>Dicetak dari Sistem Informasi Arsip Digital</p>
                    </div>
                </div>
            </div>
        </>
    );
}
