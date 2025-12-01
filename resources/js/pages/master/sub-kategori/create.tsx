import { FormEventHandler, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useLanguage } from '@/contexts/LanguageContext';

interface Kategori {
    id: number;
    nama_kategori: string;
}

interface Props {
    kategoris: Kategori[];
    errors?: Record<string, string>;
}

export default function SubKategoriCreate({ kategoris, errors }: Props) {
    const { t } = useLanguage();
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState({
        kategori_id: '',
        nama_sub_kategori: '',
        deskripsi: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/sub-kategori', data, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/sub-kategori">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t('subKategori.create')}</h1>
                        <p className="text-muted-foreground mt-1">{t('subKategori.fillForm')}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-6">
                        {/* Kategori */}
                        <div>
                            <Label htmlFor="kategori_id">{t('subKategori.kategori')} *</Label>
                            <select
                                id="kategori_id"
                                value={data.kategori_id}
                                onChange={(e) => setData({ ...data, kategori_id: e.target.value })}
                                required
                                className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">{t('subKategori.selectKategori')}</option>
                                {kategoris.map((kat) => (
                                    <option key={kat.id} value={kat.id}>
                                        {kat.nama_kategori}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors?.kategori_id} className="mt-2" />
                        </div>

                        {/* Nama Sub Kategori */}
                        <div>
                            <Label htmlFor="nama_sub_kategori">{t('subKategori.namaSubKategori')} *</Label>
                            <Input
                                id="nama_sub_kategori"
                                type="text"
                                value={data.nama_sub_kategori}
                                onChange={(e) => setData({ ...data, nama_sub_kategori: e.target.value })}
                                placeholder={t('subKategori.enterNamaSubKategori')}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.nama_sub_kategori} className="mt-2" />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <Label htmlFor="deskripsi">{t('subKategori.deskripsi')}</Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData({ ...data, deskripsi: e.target.value })}
                                placeholder={t('subKategori.enterDeskripsi')}
                                rows={4}
                                className="mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError message={errors?.deskripsi} className="mt-2" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/sub-kategori">
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
                                    {t('common.save')}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
