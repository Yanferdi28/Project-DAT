import { FormEventHandler, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useLanguage } from '@/contexts/LanguageContext';

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    kode_klasifikasi_induk: string | null;
    uraian: string;
    retensi_aktif: number;
    retensi_inaktif: number;
    status_akhir: string;
    klasifikasi_keamanan: string;
}

interface ParentOption {
    kode_klasifikasi: string;
    uraian: string;
}

interface Props {
    kodeKlasifikasi: KodeKlasifikasi;
    parentOptions: ParentOption[];
    errors?: Record<string, string>;
}

export default function KodeKlasifikasiEdit({ kodeKlasifikasi, parentOptions, errors }: Props) {
    const { t } = useLanguage();
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState({
        kode_klasifikasi: kodeKlasifikasi.kode_klasifikasi,
        kode_klasifikasi_induk: kodeKlasifikasi.kode_klasifikasi_induk || '',
        uraian: kodeKlasifikasi.uraian,
        retensi_aktif: kodeKlasifikasi.retensi_aktif.toString(),
        retensi_inaktif: kodeKlasifikasi.retensi_inaktif.toString(),
        status_akhir: kodeKlasifikasi.status_akhir,
        klasifikasi_keamanan: kodeKlasifikasi.klasifikasi_keamanan,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(`/kode-klasifikasi/${kodeKlasifikasi.id}`, data, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/kode-klasifikasi">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('kodeKlasifikasi.edit')}</h1>
                        <p className="text-muted-foreground mt-1">{t('kodeKlasifikasi.updateInfo')}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Kode Klasifikasi */}
                        <div>
                            <Label htmlFor="kode_klasifikasi">{t('kodeKlasifikasi.kode')} *</Label>
                            <Input
                                id="kode_klasifikasi"
                                type="text"
                                value={data.kode_klasifikasi}
                                onChange={(e) => setData({ ...data, kode_klasifikasi: e.target.value })}
                                placeholder={t('kodeKlasifikasi.enterKode')}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.kode_klasifikasi} className="mt-2" />
                        </div>

                        {/* Kode Klasifikasi Induk */}
                        <div>
                            <Label htmlFor="kode_klasifikasi_induk">{t('kodeKlasifikasi.parent')}</Label>
                            <select
                                id="kode_klasifikasi_induk"
                                value={data.kode_klasifikasi_induk}
                                onChange={(e) => setData({ ...data, kode_klasifikasi_induk: e.target.value })}
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="">{t('kodeKlasifikasi.selectParent')}</option>
                                {parentOptions.map((opt) => (
                                    <option key={opt.kode_klasifikasi} value={opt.kode_klasifikasi}>
                                        {opt.kode_klasifikasi} - {opt.uraian}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors?.kode_klasifikasi_induk} className="mt-2" />
                        </div>

                        {/* Uraian */}
                        <div className="md:col-span-2">
                            <Label htmlFor="uraian">{t('kodeKlasifikasi.uraian')} *</Label>
                            <Input
                                id="uraian"
                                type="text"
                                value={data.uraian}
                                onChange={(e) => setData({ ...data, uraian: e.target.value })}
                                placeholder={t('kodeKlasifikasi.enterUraian')}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.uraian} className="mt-2" />
                        </div>

                        {/* Retensi Aktif */}
                        <div>
                            <Label htmlFor="retensi_aktif">{t('kodeKlasifikasi.retensiAktif')} ({t('kodeKlasifikasi.year')}) *</Label>
                            <Input
                                id="retensi_aktif"
                                type="number"
                                min="0"
                                value={data.retensi_aktif}
                                onChange={(e) => setData({ ...data, retensi_aktif: e.target.value })}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.retensi_aktif} className="mt-2" />
                        </div>

                        {/* Retensi Inaktif */}
                        <div>
                            <Label htmlFor="retensi_inaktif">{t('kodeKlasifikasi.retensiInaktif')} ({t('kodeKlasifikasi.year')}) *</Label>
                            <Input
                                id="retensi_inaktif"
                                type="number"
                                min="0"
                                value={data.retensi_inaktif}
                                onChange={(e) => setData({ ...data, retensi_inaktif: e.target.value })}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.retensi_inaktif} className="mt-2" />
                        </div>

                        {/* Status Akhir */}
                        <div>
                            <Label htmlFor="status_akhir">{t('kodeKlasifikasi.statusAkhir')} *</Label>
                            <select
                                id="status_akhir"
                                value={data.status_akhir}
                                onChange={(e) => setData({ ...data, status_akhir: e.target.value })}
                                required
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="Musnah">{t('kodeKlasifikasi.musnah')}</option>
                                <option value="Permanen">{t('kodeKlasifikasi.permanen')}</option>
                                <option value="Dinilai Kembali">{t('kodeKlasifikasi.dinilaiKembali')}</option>
                            </select>
                            <InputError message={errors?.status_akhir} className="mt-2" />
                        </div>

                        {/* Klasifikasi Keamanan */}
                        <div>
                            <Label htmlFor="klasifikasi_keamanan">{t('kodeKlasifikasi.klasifikasiKeamanan')} *</Label>
                            <select
                                id="klasifikasi_keamanan"
                                value={data.klasifikasi_keamanan}
                                onChange={(e) => setData({ ...data, klasifikasi_keamanan: e.target.value })}
                                required
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>option]:bg-white [&>option]:dark:bg-gray-800 [&>option]:text-gray-900 [&>option]:dark:text-gray-100"
                            >
                                <option value="Biasa">{t('kodeKlasifikasi.biasa')}</option>
                                <option value="Rahasia">{t('kodeKlasifikasi.rahasia')}</option>
                                <option value="Terbatas">{t('kodeKlasifikasi.terbatas')}</option>
                            </select>
                            <InputError message={errors?.klasifikasi_keamanan} className="mt-2" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/kode-klasifikasi">
                            <Button type="button" variant="outline" disabled={processing}>
                                {t('users.form.cancel')}
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>{t('users.form.saving')}</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {t('users.form.saveChanges')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
