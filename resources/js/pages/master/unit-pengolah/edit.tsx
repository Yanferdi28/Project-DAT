import { FormEventHandler, useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface UnitPengolah {
    id: number;
    nama_unit: string;
}

interface Props {
    unitPengolah: UnitPengolah;
    errors?: Record<string, string>;
}

export default function UnitPengolahEdit({ unitPengolah, errors }: Props) {
    const [processing, setProcessing] = useState(false);
    const [data, setData] = useState({
        nama_unit: unitPengolah.nama_unit,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        router.put(`/unit-pengolah/${unitPengolah.id}`, data, {
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppSidebarLayout>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/unit-pengolah">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{'Edit Unit Pengolah'}</h1>
                        <p className="text-muted-foreground mt-1">{'Perbarui informasi unit pengolah'}</p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="rounded-lg border bg-card p-6">
                    <div className="grid gap-6">
                        {/* Nama Unit */}
                        <div>
                            <Label htmlFor="nama_unit">{'Nama Unit'} *</Label>
                            <Input
                                id="nama_unit"
                                type="text"
                                value={data.nama_unit}
                                onChange={(e) => setData({ ...data, nama_unit: e.target.value })}
                                placeholder={'Masukkan nama unit pengolah'}
                                required
                                className="mt-2"
                            />
                            <InputError message={errors?.nama_unit} className="mt-2" />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex justify-end gap-4">
                        <Link href="/unit-pengolah">
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
                                    {'Simpan Perubahan'}
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppSidebarLayout>
    );
}
