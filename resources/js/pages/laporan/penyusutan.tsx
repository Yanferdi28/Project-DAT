import AppLayout from '@/layouts/app-layout';
import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import { FileText, AlertTriangle, Clock, CalendarCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface PageProps {
    unitPengolahs: UnitPengolah[];
    userUnitPengolahId?: number | null;
    [key: string]: unknown;
}

export default function LaporanPenyusutan() {
    const { unitPengolahs, userUnitPengolahId } = usePage<PageProps>().props;
    const { t } = useLanguage();
    
    const isUnitPengolahLocked = userUnitPengolahId !== null && userUnitPengolahId !== undefined;
    
    const [tahunAcuan, setTahunAcuan] = useState(new Date().getFullYear().toString());
    const [batasWarning, setBatasWarning] = useState('1');
    const [unitPengolahId, setUnitPengolahId] = useState(
        isUnitPengolahLocked ? userUnitPengolahId!.toString() : ''
    );
    const [isGenerating, setIsGenerating] = useState(false);

    const handleExport = () => {
        setIsGenerating(true);
        
        const params = new URLSearchParams();
        params.append('tahun_acuan', tahunAcuan);
        params.append('batas_warning', batasWarning);
        if (unitPengolahId) params.append('unit_pengolah_id', unitPengolahId);
        
        window.open(`/berkas-arsip/export/penyusutan?${params.toString()}`, '_blank');
        
        setTimeout(() => setIsGenerating(false), 1000);
    };

    // Generate year options (current year - 5 to current year + 5)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

    return (
        <AppLayout
            breadcrumbs={[
                { title: t('laporan.dashboard'), href: '/dashboard' },
                { title: t('laporan.title'), href: '' },
                { title: t('laporan.penyusutan.breadcrumb'), href: '' },
            ]}
        >
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {t('laporan.penyusutan.title')}
                </h1>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {t('laporan.penyusutan.description')}
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Info Cards */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
                                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-red-800 dark:text-red-300">{t('laporan.penyusutan.immediateDisposal')}</h3>
                                    <p className="text-sm text-red-600 dark:text-red-400">
                                        {t('laporan.penyusutan.immediateDisposalDesc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/50">
                                    <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">{t('laporan.penyusutan.approachingDisposal')}</h3>
                                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                                        {t('laporan.penyusutan.approachingDisposalDesc')}
                                    </p>
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
                                {t('laporan.penyusutan.aboutDescription')}
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li><strong>{t('laporan.penyusutan.activeRetention')}</strong> {t('laporan.penyusutan.activeRetentionDesc')}</li>
                                <li><strong>{t('laporan.penyusutan.inactiveRetention')}</strong> {t('laporan.penyusutan.inactiveRetentionDesc')}</li>
                                <li><strong>{t('laporan.penyusutan.totalRetention')}</strong> {t('laporan.penyusutan.totalRetentionDesc')}</li>
                                <li><strong>{t('laporan.penyusutan.disposalDate')}</strong> {t('laporan.penyusutan.disposalDateDesc')}</li>
                            </ul>
                            <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                                <p className="text-blue-800 dark:text-blue-300">
                                    <strong>{t('laporan.penyusutan.finalStatus')}</strong>
                                </p>
                                <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-400">
                                    <li>• <span className="font-medium">{t('laporan.penyusutan.destroy')}</span> {t('laporan.penyusutan.destroyDesc')}</li>
                                    <li>• <span className="font-medium">{t('laporan.penyusutan.permanent')}</span> {t('laporan.penyusutan.permanentDesc')}</li>
                                    <li>• <span className="font-medium">{t('laporan.penyusutan.reEvaluate')}</span> {t('laporan.penyusutan.reEvaluateDesc')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                    <div className="flex items-center gap-2 mb-4">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {t('laporan.penyusutan.generateReport')}
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.penyusutan.referenceYear')}
                            </label>
                            <select
                                value={tahunAcuan}
                                onChange={(e) => setTahunAcuan(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white"
                            >
                                {yearOptions.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('laporan.penyusutan.referenceYearDesc')}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.penyusutan.warningLimit')}
                            </label>
                            <select
                                value={batasWarning}
                                onChange={(e) => setBatasWarning(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white"
                            >
                                <option value="1">{t('laporan.penyusutan.year1')}</option>
                                <option value="2">{t('laporan.penyusutan.year2')}</option>
                                <option value="3">{t('laporan.penyusutan.year3')}</option>
                                <option value="5">{t('laporan.penyusutan.year5')}</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('laporan.penyusutan.warningLimitDesc')}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {t('laporan.penyusutan.unitPengolah')}{isUnitPengolahLocked && ' (terkunci)'}
                            </label>
                            <select
                                value={unitPengolahId}
                                onChange={(e) => setUnitPengolahId(e.target.value)}
                                disabled={isUnitPengolahLocked}
                                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {!isUnitPengolahLocked && <option value="">{t('laporan.penyusutan.allUnits')}</option>}
                                {unitPengolahs.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.nama_unit}
                                    </option>
                                ))}
                            </select>
                            {isUnitPengolahLocked ? (
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Unit pengolah terkunci sesuai dengan unit pengolah Anda.
                                </p>
                            ) : (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    {t('laporan.penyusutan.filterByUnit')}
                                </p>
                            )}
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
                                        <CalendarCheck className="h-4 w-4" />
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
