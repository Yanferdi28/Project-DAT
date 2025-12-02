import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, CheckCircle, Clock, XCircle, FileCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PageProps {
    unitPengolahs: UnitPengolah[];
    [key: string]: unknown;
}

export default function LaporanStatusVerifikasi() {
    const { unitPengolahs } = usePage<PageProps>().props;
    const { t } = useLanguage();
    
    const [filterStatus, setFilterStatus] = useState('');
    const [unitPengolahId, setUnitPengolahId] = useState('');
    const [dariTanggal, setDariTanggal] = useState('');
    const [sampaiTanggal, setSampaiTanggal] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);
        
        const params = new URLSearchParams();
        if (filterStatus) params.append('status', filterStatus);
        if (unitPengolahId) params.append('unit_pengolah_id', unitPengolahId);
        if (dariTanggal) params.append('dari_tanggal', dariTanggal);
        if (sampaiTanggal) params.append('sampai_tanggal', sampaiTanggal);
        
        window.open(`/laporan/status-verifikasi/export?${params.toString()}`, '_blank');
        
        setTimeout(() => setIsGenerating(false), 1000);
    };

    const statusOptions = [
        { value: '', label: t('laporan.statusVerifikasi.allStatus'), icon: FileText, color: 'gray' },
        { value: 'pending', label: t('laporan.statusVerifikasi.pending'), icon: Clock, color: 'yellow' },
        { value: 'diterima', label: t('laporan.statusVerifikasi.accepted'), icon: CheckCircle, color: 'green' },
        { value: 'ditolak', label: t('laporan.statusVerifikasi.rejected'), icon: XCircle, color: 'red' },
    ];

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('laporan.dashboard'), href: '/dashboard' },
                { title: t('laporan.title'), href: '' },
                { title: t('laporan.statusVerifikasi.breadcrumb'), href: '' },
            ]}
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('laporan.statusVerifikasi.title')}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('laporan.statusVerifikasi.description')}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Info Cards */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Status Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-yellow-700 dark:text-yellow-300">{t('laporan.statusVerifikasi.pending')}</h3>
                                    <p className="text-xs text-yellow-500 dark:text-yellow-400">{t('laporan.statusVerifikasi.pendingDesc')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/50">
                                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">{t('laporan.statusVerifikasi.accepted')}</h3>
                                    <p className="text-xs text-green-500 dark:text-green-400">{t('laporan.statusVerifikasi.acceptedDesc')}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
                                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-700 dark:text-red-300">{t('laporan.statusVerifikasi.rejected')}</h3>
                                    <p className="text-xs text-red-500 dark:text-red-400">{t('laporan.statusVerifikasi.rejectedDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            {t('laporan.aboutReport')}
                        </h2>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                            <p>
                                {t('laporan.statusVerifikasi.aboutDescription')}
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>{t('laporan.statusVerifikasi.pending')}:</strong> {t('laporan.statusVerifikasi.pendingInfo')}</li>
                                <li><strong>{t('laporan.statusVerifikasi.accepted')}:</strong> {t('laporan.statusVerifikasi.acceptedInfo')}</li>
                                <li><strong>{t('laporan.statusVerifikasi.rejected')}:</strong> {t('laporan.statusVerifikasi.rejectedInfo')}</li>
                            </ul>
                            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-800 dark:text-blue-300">
                                    <strong>{t('laporan.statusVerifikasi.verificationInfo')}</strong>
                                </p>
                                <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-400">
                                    <li>• {t('laporan.statusVerifikasi.verifierName')}</li>
                                    <li>• {t('laporan.statusVerifikasi.verificationDateTime')}</li>
                                    <li>• {t('laporan.statusVerifikasi.notes')}</li>
                                    <li>• {t('laporan.statusVerifikasi.publishStatus')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-2 mb-4">
                        <FileCheck className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('laporan.penyusutan.generateReport')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.statusVerifikasi.filterStatus')}
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('laporan.statusVerifikasi.selectAllStatus')}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.penyusutan.unitPengolah')}
                            </label>
                            <select
                                value={unitPengolahId}
                                onChange={(e) => setUnitPengolahId(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="">{t('laporan.penyusutan.allUnits')}</option>
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.statusVerifikasi.fromDate')}
                            </label>
                            <input
                                type="date"
                                value={dariTanggal}
                                onChange={(e) => setDariTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.statusVerifikasi.toDate')}
                            </label>
                            <input
                                type="date"
                                value={sampaiTanggal}
                                onChange={(e) => setSampaiTanggal(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
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
                                        {t('laporan.generating')}
                                    </>
                                ) : (
                                    <>
                                        <FileCheck className="h-4 w-4" />
                                        {t('laporan.generatePdf')}
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
