import { FormEventHandler, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface Props {
    errors?: Record<string, string>;
}

export default function KategoriCreate({ errors }: Props) {
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState({
        nama_kategori: '',
        deskripsi: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.post('/kategori', data, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/kategori">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{'Tambah Kategori Baru'}</h1>
                        <p className="text-muted-foreground mt-1">{'Isi form di bawah untuk menambahkan kategori baru'}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-6">
                        {/* Nama Kategori */}
                        <div>
                            <Label htmlFor="nama_kategori">{'Nama Kategori'} *</Label>
                            <Input
                                id="nama_kategori"
                                type="text"
                                value={data.nama_kategori}
                                onChange={(e) => setData({ ...data, nama_kategori: e.target.value })}
                                placeholder={'Masukkan nama kategori'}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.nama_kategori} className="mt-2" />
                        </div>

                        {/* Deskripsi */}
                        <div>
                            <Label htmlFor="deskripsi">{'Deskripsi'}</Label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => setData({ ...data, deskripsi: e.target.value })}
                                placeholder={'Masukkan deskripsi (opsional)'}
                                className="mt-2 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            <InputError message={errors?.deskripsi} className="mt-2" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/kategori">
                            <Button type="button" variant="outline" disabled={processing}>
                                {'Batal'}
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <>{'Menyimpan...'}</>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {'Simpan'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
