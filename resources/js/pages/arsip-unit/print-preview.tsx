import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, FileDown, Filter } from 'lucide-react';
import { useRef, useState } from 'react';
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
}

interface UnitPengolah {
    id: number;
    nama: string;
}

interface ArsipUnit {
    id_berkas: number;
    kode_klasifikasi_id: number;
    unit_pengolah_arsip_id: number;
    indeks?: string;
    no_item_arsip?: string;
    uraian_informasi?: string;
    tanggal?: string;
    jumlah_nilai?: number;
    jumlah_satuan?: string;
    tingkat_perkembangan?: string;
    ruangan?: string;
    no_filling?: string;
    no_laci?: string;
    no_folder?: string;
    no_box?: string;
    keterangan?: string;
    status?: string;
    kode_klasifikasi?: KodeKlasifikasi;
    unit_pengolah?: UnitPengolah;
    created_at: string;
}

interface Props {
    arsipUnits: ArsipUnit[];
    unitPengolahs: UnitPengolah[];
    filters: {
        dari_tanggal?: string;
        sampai_tanggal?: string;
        status?: string;
        unit_pengolah_id?: string;
    };
    userUnitPengolahId?: number | null;
}

export default function PrintPreview() {
    const { arsipUnits, unitPengolahs, filters, userUnitPengolahId } = usePage<{ props: Props }>().props as unknown as Props;
    const printRef = useRef<HTMLDivElement>(null);
    
    // Local filter state
    const [localFilters, setLocalFilters] = useState({
        dari_tanggal: filters.dari_tanggal || '',
        sampai_tanggal: filters.sampai_tanggal || '',
        status: filters.status || '',
        unit_pengolah_id: filters.unit_pengolah_id || '',
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        const params = new URLSearchParams();
        if (localFilters.dari_tanggal) params.append('dari_tanggal', localFilters.dari_tanggal);
        if (localFilters.sampai_tanggal) params.append('sampai_tanggal', localFilters.sampai_tanggal);
        if (localFilters.status) params.append('status', localFilters.status);
        if (localFilters.unit_pengolah_id) params.append('unit_pengolah_id', localFilters.unit_pengolah_id);
        
        window.location.href = `/arsip-unit/export/pdf?${params.toString()}`;
    };

    const handleApplyFilter = () => {
        const params = new URLSearchParams();
        if (localFilters.dari_tanggal) params.append('dari_tanggal', localFilters.dari_tanggal);
        if (localFilters.sampai_tanggal) params.append('sampai_tanggal', localFilters.sampai_tanggal);
        if (localFilters.status) params.append('status', localFilters.status);
        if (localFilters.unit_pengolah_id) params.append('unit_pengolah_id', localFilters.unit_pengolah_id);
        
        router.visit(`/arsip-unit/print-preview?${params.toString()}`);
    };

    const handleResetFilter = () => {
        setLocalFilters({
            dari_tanggal: '',
            sampai_tanggal: '',
            status: '',
            unit_pengolah_id: '',
        });
        router.visit('/arsip-unit/print-preview');
    };

    const handleBack = () => {
        router.visit('/arsip-unit');
    };

    // Get filter names for display
    const getUnitPengolahName = () => {
        if (!localFilters.unit_pengolah_id) return 'Semua';
        const unit = unitPengolahs.find(u => u.id === parseInt(localFilters.unit_pengolah_id!));
        return unit ? unit.nama : 'Semua';
    };

    const getStatusLabel = (status?: string) => {
        if (!status) return 'Semua';
        switch (status) {
            case 'draft': return 'Draft';
            case 'submitted': return 'Diajukan';
            case 'verified': return 'Terverifikasi';
            case 'rejected': return 'Ditolak';
            default: return status;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <>
            <Head title="Print Preview - Arsip Unit" />
            
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
                        font-size: 9px;
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
                        <Button 
                            variant="outline" 
                            onClick={handlePrint}
                            className="flex items-center gap-2"
                        >
                            <Printer className="h-4 w-4" />
                            Cetak
                        </Button>
                        <Button 
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <FileDown className="h-4 w-4" />
                            Download PDF
                        </Button>
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
                                <Label htmlFor="status" className="text-gray-700 dark:text-gray-300">Status</Label>
                                <Select
                                    value={localFilters.status}
                                    onValueChange={(value) => setLocalFilters(prev => ({ ...prev, status: value === 'all' ? '' : value }))}
                                >
                                    <SelectTrigger id="status" className="bg-white dark:bg-gray-800">
                                        <SelectValue placeholder="Semua Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Semua Status</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="submitted">Diajukan</SelectItem>
                                        <SelectItem value="verified">Terverifikasi</SelectItem>
                                        <SelectItem value="rejected">Ditolak</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            
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
                        <h1 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                            LAPORAN DAFTAR ARSIP UNIT
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {localFilters.dari_tanggal || localFilters.sampai_tanggal ? (
                                <>
                                    Periode: {localFilters.dari_tanggal ? new Date(localFilters.dari_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                    {' s/d '}
                                    {localFilters.sampai_tanggal ? new Date(localFilters.sampai_tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                                </>
                            ) : (
                                <>Tanggal: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</>
                            )}
                        </p>
                    </div>

                    {/* Summary */}
                    <div className="mb-4 text-sm text-gray-600">
                        Total Data: <span className="font-semibold text-gray-900">{arsipUnits.length}</span> arsip
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full text-sm bg-white">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">NO</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">KODE KLASIFIKASI</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">UNIT PENGOLAH</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">INDEKS</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">NO. ITEM</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">URAIAN INFORMASI</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border-b border-gray-200">TANGGAL</th>
                                    <th className="px-2 py-2 text-center font-semibold text-gray-700 border-b border-gray-200">JUMLAH</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">TK. PERKEMBANGAN</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">LOKASI</th>
                                    <th className="px-2 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">KETERANGAN</th>
                                </tr>
                            </thead>
                            <tbody>
                                {arsipUnits.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="px-3 py-8 text-center text-gray-500 bg-white">
                                            Tidak ada data arsip unit
                                        </td>
                                    </tr>
                                ) : (
                                    arsipUnits.map((arsip, index) => (
                                        <tr key={arsip.id_berkas} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-2 py-2 border-b border-gray-100 text-gray-900">{index + 1}</td>
                                            <td className="px-2 py-2 border-b border-gray-100 font-mono text-xs text-gray-900">
                                                {arsip.kode_klasifikasi?.kode_klasifikasi || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {arsip.unit_pengolah?.nama || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {arsip.indeks || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {arsip.no_item_arsip || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900 max-w-[200px]">
                                                {arsip.uraian_informasi || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-center text-xs text-gray-900">
                                                {formatDate(arsip.tanggal)}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-center text-xs text-gray-900">
                                                {arsip.jumlah_nilai ? `${arsip.jumlah_nilai} ${arsip.jumlah_satuan || ''}` : '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {arsip.tingkat_perkembangan || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {[arsip.ruangan, arsip.no_filling, arsip.no_laci, arsip.no_folder, arsip.no_box]
                                                    .filter(Boolean)
                                                    .join(' / ') || '-'}
                                            </td>
                                            <td className="px-2 py-2 border-b border-gray-100 text-xs text-gray-900">
                                                {arsip.keterangan || '-'}
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
