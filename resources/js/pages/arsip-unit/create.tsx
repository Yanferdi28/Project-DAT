import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Check, ChevronsUpDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    uraian: string;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    status_akhir: string | null;
}

interface UnitPengolah {
    id: number;
    nama: string;
}

interface Kategori {
    id: number;
    nama: string;
}

interface SubKategori {
    id: number;
    nama: string;
    kategori_id: number;
    kategori?: Kategori;
}

interface Props {
    kodeKlasifikasis: KodeKlasifikasi[];
    unitPengolahs: UnitPengolah[];
    kategoris: Kategori[];
    subKategoris: SubKategori[];
}

export default function Create({
    kodeKlasifikasis,
    unitPengolahs,
    kategoris,
    subKategoris,
}: Props) {
    const { t } = useLanguage();
    const [data, setData] = useState({
        kode_klasifikasi_id: '',
        unit_pengolah_arsip_id: '',
        kategori_id: '',
        sub_kategori_id: '',
        retensi_aktif: '',
        retensi_inaktif: '',
        indeks: '',
        uraian_informasi: '',
        tanggal: '',
        jumlah_nilai: '',
        jumlah_satuan: 'lembar',
        tingkat_perkembangan: 'asli',
        skkaad: '',
        ruangan: '',
        no_filling: '',
        no_laci: '',
        no_folder: '',
        no_box: '',
        dokumen: null as File | null,
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState<string>('');
    const [openKodeKlasifikasi, setOpenKodeKlasifikasi] = useState(false);
    const [openUnitPengolah, setOpenUnitPengolah] = useState(false);
    const [openKategori, setOpenKategori] = useState(false);
    const [openSubKategori, setOpenSubKategori] = useState(false);

    // Auto-fill retensi and skkaad when kode_klasifikasi changes
    useEffect(() => {
        if (data.kode_klasifikasi_id) {
            const selected = kodeKlasifikasis.find(
                (k) => k.id === Number(data.kode_klasifikasi_id)
            );
            if (selected) {
                setData((prev) => ({
                    ...prev,
                    retensi_aktif: selected.retensi_aktif?.toString() || '',
                    retensi_inaktif: selected.retensi_inaktif?.toString() || '',
                    skkaad: selected.status_akhir || '',
                }));
            }
        }
    }, [data.kode_klasifikasi_id, kodeKlasifikasis]);

    const filteredSubKategoris = data.kategori_id
        ? subKategoris.filter((sub) => sub.kategori_id === Number(data.kategori_id))
        : [];

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData({ ...data, dokumen: file });
            setFileName(file.name);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                if (key === 'dokumen' && value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === 'string' || typeof value === 'number') {
                    formData.append(key, value.toString());
                }
            }
        });

        router.post('/arsip-unit', formData, {
            onError: (errors) => setErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title={t('arsipUnit.create')} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/arsip-unit">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('common.back')}
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('arsipUnit.create')}</CardTitle>
                                <CardDescription>
                                    {t('arsipUnit.createDescription')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Kode Klasifikasi */}
                                    <div className="space-y-2">
                                        <Label htmlFor="kode_klasifikasi_id">
                                            {t('arsipUnit.kodeKlasifikasi')} *
                                        </Label>
                                        <Popover open={openKodeKlasifikasi} onOpenChange={setOpenKodeKlasifikasi}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openKodeKlasifikasi}
                                                    className="w-full justify-between"
                                                >
                                                    {data.kode_klasifikasi_id
                                                        ? kodeKlasifikasis.find(
                                                              (item) => item.id.toString() === data.kode_klasifikasi_id
                                                          )?.kode_klasifikasi + ' - ' + kodeKlasifikasis.find(
                                                              (item) => item.id.toString() === data.kode_klasifikasi_id
                                                          )?.uraian
                                                        : t('common.select')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[500px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Cari kode klasifikasi..." />
                                                    <CommandList>
                                                        <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {kodeKlasifikasis.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    value={`${item.kode_klasifikasi} - ${item.uraian}`}
                                                                    onSelect={() => {
                                                                        setData({ ...data, kode_klasifikasi_id: item.id.toString() })
                                                                        setOpenKodeKlasifikasi(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.kode_klasifikasi_id === item.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {item.kode_klasifikasi} - {item.uraian}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.kode_klasifikasi_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.kode_klasifikasi_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Unit Pengolah */}
                                    <div className="space-y-2">
                                        <Label htmlFor="unit_pengolah_arsip_id">
                                            {t('arsipUnit.unitPengolah')} *
                                        </Label>
                                        <Popover open={openUnitPengolah} onOpenChange={setOpenUnitPengolah}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openUnitPengolah}
                                                    className="w-full justify-between"
                                                >
                                                    {data.unit_pengolah_arsip_id
                                                        ? unitPengolahs.find(
                                                              (item) => item.id.toString() === data.unit_pengolah_arsip_id
                                                          )?.nama
                                                        : t('common.select')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Cari unit pengolah..." />
                                                    <CommandList>
                                                        <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {unitPengolahs.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    value={item.nama}
                                                                    onSelect={() => {
                                                                        setData({ ...data, unit_pengolah_arsip_id: item.id.toString() })
                                                                        setOpenUnitPengolah(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.unit_pengolah_arsip_id === item.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {item.nama}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.unit_pengolah_arsip_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.unit_pengolah_arsip_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Kategori */}
                                    <div className="space-y-2">
                                        <Label htmlFor="kategori_id">
                                            {t('arsipUnit.kategori')} *
                                        </Label>
                                        <Popover open={openKategori} onOpenChange={setOpenKategori}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openKategori}
                                                    className="w-full justify-between"
                                                >
                                                    {data.kategori_id
                                                        ? kategoris.find(
                                                              (item) => item.id.toString() === data.kategori_id
                                                          )?.nama
                                                        : t('common.select')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Cari kategori..." />
                                                    <CommandList>
                                                        <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {kategoris.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    value={item.nama}
                                                                    onSelect={() => {
                                                                        setData({ ...data, kategori_id: item.id.toString(), sub_kategori_id: '' })
                                                                        setOpenKategori(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.kategori_id === item.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {item.nama}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.kategori_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.kategori_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Sub Kategori */}
                                    <div className="space-y-2">
                                        <Label htmlFor="sub_kategori_id">
                                            {t('arsipUnit.subKategori')} *
                                        </Label>
                                        <Popover open={openSubKategori} onOpenChange={setOpenSubKategori}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openSubKategori}
                                                    className="w-full justify-between"
                                                    disabled={!data.kategori_id}
                                                >
                                                    {data.sub_kategori_id
                                                        ? filteredSubKategoris.find(
                                                              (item) => item.id.toString() === data.sub_kategori_id
                                                          )?.nama
                                                        : t('common.select')}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Cari sub kategori..." />
                                                    <CommandList>
                                                        <CommandEmpty>Tidak ada data ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {filteredSubKategoris.map((item) => (
                                                                <CommandItem
                                                                    key={item.id}
                                                                    value={item.nama}
                                                                    onSelect={() => {
                                                                        setData({ ...data, sub_kategori_id: item.id.toString() })
                                                                        setOpenSubKategori(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            data.sub_kategori_id === item.id.toString()
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {item.nama}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        {errors.sub_kategori_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.sub_kategori_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tanggal */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tanggal">{t('arsipUnit.tanggal')} *</Label>
                                        <Input
                                            id="tanggal"
                                            type="date"
                                            value={data.tanggal}
                                            onChange={(e) => setData({ ...data, tanggal: e.target.value })}
                                            required
                                        />
                                        {errors.tanggal && (
                                            <p className="text-sm text-red-600">{errors.tanggal}</p>
                                        )}
                                    </div>

                                    {/* Indeks */}
                                    <div className="space-y-2">
                                        <Label htmlFor="indeks">{t('arsipUnit.indeks')}</Label>
                                        <Input
                                            id="indeks"
                                            type="text"
                                            value={data.indeks}
                                            onChange={(e) => setData({ ...data, indeks: e.target.value })}
                                        />
                                        {errors.indeks && (
                                            <p className="text-sm text-red-600">{errors.indeks}</p>
                                        )}
                                    </div>

                                    {/* Jumlah Nilai */}
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah_nilai">
                                            {t('arsipUnit.jumlahNilai')} *
                                        </Label>
                                        <Input
                                            id="jumlah_nilai"
                                            type="number"
                                            min="1"
                                            value={data.jumlah_nilai}
                                            onChange={(e) =>
                                                setData({ ...data, jumlah_nilai: e.target.value })
                                            }
                                            required
                                        />
                                        {errors.jumlah_nilai && (
                                            <p className="text-sm text-red-600">
                                                {errors.jumlah_nilai}
                                            </p>
                                        )}
                                    </div>

                                    {/* Jumlah Satuan */}
                                    <div className="space-y-2">
                                        <Label htmlFor="jumlah_satuan">
                                            {t('arsipUnit.jumlahSatuan')} *
                                        </Label>
                                        <Select
                                            value={data.jumlah_satuan}
                                            onValueChange={(value) =>
                                                setData({ ...data, jumlah_satuan: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="lembar">Lembar</SelectItem>
                                                <SelectItem value="jilid">Jilid</SelectItem>
                                                <SelectItem value="bundle">Bundle</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.jumlah_satuan && (
                                            <p className="text-sm text-red-600">
                                                {errors.jumlah_satuan}
                                            </p>
                                        )}
                                    </div>

                                    {/* Tingkat Perkembangan */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tingkat_perkembangan">
                                            {t('arsipUnit.tingkatPerkembangan')} *
                                        </Label>
                                        <Select
                                            value={data.tingkat_perkembangan}
                                            onValueChange={(value) =>
                                                setData({ ...data, tingkat_perkembangan: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="asli">Asli</SelectItem>
                                                <SelectItem value="salinan">Salinan</SelectItem>
                                                <SelectItem value="tembusan">Tembusan</SelectItem>
                                                <SelectItem value="pertinggal">Pertinggal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.tingkat_perkembangan && (
                                            <p className="text-sm text-red-600">
                                                {errors.tingkat_perkembangan}
                                            </p>
                                        )}
                                    </div>

                                    {/* Retensi Aktif - Auto filled */}
                                    <div className="space-y-2">
                                        <Label htmlFor="retensi_aktif">
                                            {t('arsipUnit.retensiAktif')}
                                        </Label>
                                        <Input
                                            id="retensi_aktif"
                                            type="number"
                                            min="0"
                                            value={data.retensi_aktif}
                                            onChange={(e) =>
                                                setData({ ...data, retensi_aktif: e.target.value })
                                            }
                                            disabled
                                            className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Otomatis terisi dari Kode Klasifikasi</p>
                                    </div>

                                    {/* Retensi Inaktif - Auto filled */}
                                    <div className="space-y-2">
                                        <Label htmlFor="retensi_inaktif">
                                            {t('arsipUnit.retensiInaktif')}
                                        </Label>
                                        <Input
                                            id="retensi_inaktif"
                                            type="number"
                                            min="0"
                                            value={data.retensi_inaktif}
                                            onChange={(e) =>
                                                setData({ ...data, retensi_inaktif: e.target.value })
                                            }
                                            disabled
                                            className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Otomatis terisi dari Kode Klasifikasi</p>
                                    </div>

                                    {/* SKKAAD - Auto filled */}
                                    <div className="space-y-2">
                                        <Label htmlFor="skkaad">{t('arsipUnit.skkaad')}</Label>
                                        <Input
                                            id="skkaad"
                                            type="text"
                                            value={data.skkaad}
                                            onChange={(e) => setData({ ...data, skkaad: e.target.value })}
                                            disabled
                                            className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Otomatis terisi dari Kode Klasifikasi</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Section Lokasi Penyimpanan */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Lokasi Penyimpanan & Detail</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Ruangan */}
                                        <div className="space-y-2">
                                        <Label htmlFor="ruangan">{t('arsipUnit.ruangan')}</Label>
                                        <Input
                                            id="ruangan"
                                            type="text"
                                            value={data.ruangan}
                                            onChange={(e) => setData({ ...data, ruangan: e.target.value })}
                                        />
                                        {errors.ruangan && (
                                            <p className="text-sm text-red-600">{errors.ruangan}</p>
                                        )}
                                    </div>

                                    {/* No Filling */}
                                    <div className="space-y-2">
                                        <Label htmlFor="no_filling">
                                            {t('arsipUnit.noFilling')}
                                        </Label>
                                        <Input
                                            id="no_filling"
                                            type="text"
                                            value={data.no_filling}
                                            onChange={(e) => setData({ ...data, no_filling: e.target.value })}
                                        />
                                        {errors.no_filling && (
                                            <p className="text-sm text-red-600">
                                                {errors.no_filling}
                                            </p>
                                        )}
                                    </div>

                                    {/* No Laci */}
                                    <div className="space-y-2">
                                        <Label htmlFor="no_laci">{t('arsipUnit.noLaci')}</Label>
                                        <Input
                                            id="no_laci"
                                            type="text"
                                            value={data.no_laci}
                                            onChange={(e) => setData({ ...data, no_laci: e.target.value })}
                                        />
                                        {errors.no_laci && (
                                            <p className="text-sm text-red-600">
                                                {errors.no_laci}
                                            </p>
                                        )}
                                    </div>

                                    {/* No Folder */}
                                    <div className="space-y-2">
                                        <Label htmlFor="no_folder">{t('arsipUnit.noFolder')}</Label>
                                        <Input
                                            id="no_folder"
                                            type="text"
                                            value={data.no_folder}
                                            onChange={(e) => setData({ ...data, no_folder: e.target.value })}
                                        />
                                        {errors.no_folder && (
                                            <p className="text-sm text-red-600">
                                                {errors.no_folder}
                                            </p>
                                        )}
                                    </div>

                                    {/* No Box */}
                                    <div className="space-y-2">
                                        <Label htmlFor="no_box">{t('arsipUnit.noBox')}</Label>
                                        <Input
                                            id="no_box"
                                            type="text"
                                            value={data.no_box}
                                            onChange={(e) => setData({ ...data, no_box: e.target.value })}
                                        />
                                        {errors.no_box && (
                                            <p className="text-sm text-red-600">{errors.no_box}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Uraian Informasi */}
                                <div className="space-y-2">
                                    <Label htmlFor="uraian_informasi">
                                        {t('arsipUnit.uraianInformasi')} *
                                    </Label>
                                    <Textarea
                                        id="uraian_informasi"
                                        value={data.uraian_informasi}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setData({ ...data, uraian_informasi: e.target.value })
                                        }
                                        rows={4}
                                        required
                                    />
                                    {errors.uraian_informasi && (
                                        <p className="text-sm text-red-600">
                                            {errors.uraian_informasi}
                                        </p>
                                    )}
                                </div>

                                {/* Upload Dokumen */}
                                <div className="space-y-2">
                                    <Label htmlFor="dokumen">
                                        {t('arsipUnit.dokumen')}
                                    </Label>
                                    <div className="flex items-center gap-4">
                                        <Input
                                            id="dokumen"
                                            type="file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                            className="cursor-pointer"
                                        />
                                        {fileName && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Upload className="h-4 w-4" />
                                                <span>{fileName}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Format: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG (Max: 10MB)
                                    </p>
                                    {errors.dokumen && (
                                        <p className="text-sm text-red-600">{errors.dokumen}</p>
                                    )}
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4">
                            <Link href="/arsip-unit">
                                <Button type="button" variant="outline">
                                    {t('common.cancel')}
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? t('common.saving') : t('common.save')}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
