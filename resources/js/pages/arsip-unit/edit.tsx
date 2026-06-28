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
import { ArrowLeft, Upload, Check, ChevronsUpDown, Brain, Loader2, FileSearch, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import axios from 'axios';

interface KodeKlasifikasi {
    id: number;
    kode_klasifikasi: string;
    uraian: string;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    status_akhir: string | null;
    klasifikasi_keamanan: string | null;
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

interface ArsipUnit {
    id_berkas: number;
    kode_klasifikasi_id: number | null;
    unit_pengolah_arsip_id: number | null;
    kategori_id: number | null;
    sub_kategori_id: number | null;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    indeks: string | null;
    uraian_informasi: string | null;
    tanggal: string | null;
    jumlah_nilai: number;
    jumlah_satuan: string;
    tingkat_perkembangan: string | null;
    klasifikasi_keamanan: string | null;
    ruangan: string | null;
    no_filling: string | null;
    no_laci: string | null;
    no_folder: string | null;
    no_box: string | null;
    dokumen: string | null;
    keterangan: string | null;
}

interface Props {
    arsipUnit: ArsipUnit;
    kodeKlasifikasis: KodeKlasifikasi[];
    unitPengolahs: UnitPengolah[];
    kategoris: Kategori[];
    subKategoris: SubKategori[];
    userUnitPengolahId?: number | null;
    ocrEnabled?: boolean;
}

export default function Edit({
    arsipUnit,
    kodeKlasifikasis,
    unitPengolahs,
    kategoris,
    subKategoris,
    userUnitPengolahId,
    ocrEnabled = false,
}: Props) {
    const isUnitPengolahLocked = userUnitPengolahId !== null && userUnitPengolahId !== undefined;
    const [data, setData] = useState({
        kode_klasifikasi_id: arsipUnit.kode_klasifikasi_id?.toString() || '',
        unit_pengolah_arsip_id: arsipUnit.unit_pengolah_arsip_id?.toString() || '',
        kategori_id: arsipUnit.kategori_id?.toString() || '',
        sub_kategori_id: arsipUnit.sub_kategori_id?.toString() || '',
        retensi_aktif: arsipUnit.retensi_aktif?.toString() || '',
        retensi_inaktif: arsipUnit.retensi_inaktif?.toString() || '',
        indeks: arsipUnit.indeks || '',
        uraian_informasi: arsipUnit.uraian_informasi || '',
        tanggal: arsipUnit.tanggal || '',
        jumlah_nilai: arsipUnit.jumlah_nilai.toString(),
        jumlah_satuan: arsipUnit.jumlah_satuan,
        tingkat_perkembangan: arsipUnit.tingkat_perkembangan || '',
        klasifikasi_keamanan: arsipUnit.klasifikasi_keamanan || '',
        ruangan: arsipUnit.ruangan || '',
        no_filling: arsipUnit.no_filling || '',
        no_laci: arsipUnit.no_laci || '',
        no_folder: arsipUnit.no_folder || '',
        no_box: arsipUnit.no_box || '',
        dokumen: null as File | null,
        keterangan: arsipUnit.keterangan || '',
    });
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [fileName, setFileName] = useState<string>(arsipUnit.dokumen || '');
    const [openKodeKlasifikasi, setOpenKodeKlasifikasi] = useState(false);
    const [openUnitPengolah, setOpenUnitPengolah] = useState(false);
    const [openKategori, setOpenKategori] = useState(false);
    const [openSubKategori, setOpenSubKategori] = useState(false);

    // OCR scan state
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState<{
        success: boolean;
        extracted_text?: string;
        ocr_confidence?: number;
        suggestions?: {
            kode_klasifikasi_id: number | null;
            kode_klasifikasi_kode: string | null;
            kode_klasifikasi_uraian: string | null;
            confidence: number;
            indeks: string | null;
            tanggal: string | null;
            jumlah_nilai: string | null;
            uraian_informasi: string | null;
        } | null;
        error?: string;
    } | null>(null);

    // Auto-fill retensi and klasifikasi keamanan when kode_klasifikasi changes
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
                    klasifikasi_keamanan: selected.klasifikasi_keamanan || '',
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
            setScanResult(null);
        }
    };

    const isOcrEligibleFile = (name: string) => {
        const ext = name.split('.').pop()?.toLowerCase() || '';
        return ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);
    };

    const isSelectedFileUnsupportedForOcr = Boolean(
        ocrEnabled && data.dokumen && fileName && !isOcrEligibleFile(fileName),
    );

    const handleScanDocument = async () => {
        if (!data.dokumen) return;

        setIsScanning(true);
        setScanResult(null);

        try {
            const formData = new FormData();
            formData.append('dokumen', data.dokumen);

            const response = await axios.post('/ocr/scan-document', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 120000,
            });

            const result = response.data;
            setScanResult(result);

            if (result.success && result.suggestions) {
                const updates: Record<string, string> = {};

                if (result.suggestions.kode_klasifikasi_id) {
                    updates.kode_klasifikasi_id = result.suggestions.kode_klasifikasi_id.toString();
                }
                if (result.suggestions.indeks) {
                    updates.indeks = result.suggestions.indeks;
                }
                if (result.suggestions.tanggal) {
                    updates.tanggal = result.suggestions.tanggal;
                }
                if (result.suggestions.jumlah_nilai) {
                    updates.jumlah_nilai = result.suggestions.jumlah_nilai;
                }
                if (result.suggestions.uraian_informasi) {
                    updates.uraian_informasi = result.suggestions.uraian_informasi;
                }

                if (Object.keys(updates).length > 0) {
                    setData((prev) => ({ ...prev, ...updates }));
                }
            }
        } catch (err: any) {
            setScanResult({
                success: false,
                error: err.response?.data?.message || err.response?.data?.error || 'Gagal terhubung ke layanan OCR.',
            });
        } finally {
            setIsScanning(false);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);
        
        const formData = new FormData();
        formData.append('_method', 'PUT');
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                if (key === 'dokumen' && value instanceof File) {
                    formData.append(key, value);
                } else if (typeof value === 'string' || typeof value === 'number') {
                    formData.append(key, value.toString());
                }
            }
        });

        router.post(`/arsip-unit/${arsipUnit.id_berkas}`, formData, {
            onError: (errors) => setErrors(errors),
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout>
            <Head title={'Edit Arsip Unit'} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <Link href="/arsip-unit">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {'Kembali'}
                            </Button>
                        </Link>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>{'Edit Arsip Unit'}</CardTitle>
                                <CardDescription>
                                    {'Perbarui informasi arsip unit'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    {/* Kode Klasifikasi */}
                                    <div className="space-y-2">
                                        <Label htmlFor="kode_klasifikasi_id">
                                            {'Kode Klasifikasi'} *
                                        </Label>
                                        <Popover open={openKodeKlasifikasi} onOpenChange={setOpenKodeKlasifikasi}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openKodeKlasifikasi}
                                                    className="w-full justify-between flex items-center min-w-0"
                                                >
                                                    <span className="truncate text-left mr-2">
                                                        {data.kode_klasifikasi_id
                                                            ? kodeKlasifikasis.find(
                                                                  (item) => item.id.toString() === data.kode_klasifikasi_id
                                                              )?.kode_klasifikasi + ' - ' + kodeKlasifikasis.find(
                                                                  (item) => item.id.toString() === data.kode_klasifikasi_id
                                                              )?.uraian
                                                            : 'Pilih'}
                                                    </span>
                                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                            {'Unit Pengolah'} *{isUnitPengolahLocked && ' (terkunci)'}
                                        </Label>
                                        <Popover open={isUnitPengolahLocked ? false : openUnitPengolah} onOpenChange={isUnitPengolahLocked ? undefined : setOpenUnitPengolah}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openUnitPengolah}
                                                    className={cn("w-full justify-between flex items-center min-w-0", isUnitPengolahLocked && "cursor-not-allowed opacity-70")}
                                                    disabled={isUnitPengolahLocked}
                                                >
                                                    <span className="truncate text-left mr-2">
                                                        {data.unit_pengolah_arsip_id
                                                            ? unitPengolahs.find(
                                                                  (item) => item.id.toString() === data.unit_pengolah_arsip_id
                                                              )?.nama
                                                            : 'Pilih'}
                                                    </span>
                                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                        {isUnitPengolahLocked && (
                                            <p className="text-xs text-muted-foreground">
                                                Unit pengolah terkunci sesuai dengan unit pengolah Anda.
                                            </p>
                                        )}
                                        {errors.unit_pengolah_arsip_id && (
                                            <p className="text-sm text-red-600">
                                                {errors.unit_pengolah_arsip_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Kategori */}
                                    <div className="space-y-2">
                                        <Label htmlFor="kategori_id">
                                            {'Kategori'} *
                                        </Label>
                                        <Popover open={openKategori} onOpenChange={setOpenKategori}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openKategori}
                                                    className="w-full justify-between flex items-center min-w-0"
                                                >
                                                    <span className="truncate text-left mr-2">
                                                        {data.kategori_id
                                                            ? kategoris.find(
                                                                  (item) => item.id.toString() === data.kategori_id
                                                              )?.nama
                                                            : 'Pilih'}
                                                    </span>
                                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                            {'Sub Kategori'} *
                                        </Label>
                                        <Popover open={openSubKategori} onOpenChange={setOpenSubKategori}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openSubKategori}
                                                    className="w-full justify-between flex items-center min-w-0"
                                                    disabled={!data.kategori_id}
                                                >
                                                    <span className="truncate text-left mr-2">
                                                        {data.sub_kategori_id
                                                            ? filteredSubKategoris.find(
                                                                  (item) => item.id.toString() === data.sub_kategori_id
                                                              )?.nama
                                                            : 'Pilih'}
                                                    </span>
                                                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
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
                                        <Label htmlFor="tanggal">{'Tanggal'} *</Label>
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
                                        <Label htmlFor="indeks">{'Indeks'}</Label>
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
                                            {'Jumlah Nilai'} *
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
                                            {'Jumlah Satuan'} *
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
                                            {'Tingkat Perkembangan'} *
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
                                            {'Retensi Aktif'}
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
                                            {'Retensi Inaktif'}
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

                                    {/* Klasifikasi Keamanan - Auto filled */}
                                    <div className="space-y-2">
                                        <Label htmlFor="klasifikasi_keamanan">{'Klasifikasi Keamanan'}</Label>
                                        <Input
                                            id="klasifikasi_keamanan"
                                            type="text"
                                            value={data.klasifikasi_keamanan}
                                            onChange={(e) => setData({ ...data, klasifikasi_keamanan: e.target.value })}
                                            disabled
                                            className="bg-gray-100 dark:bg-gray-800 dark:text-gray-300"
                                        />
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Otomatis terisi dari klasifikasi keamanan pada Kode Klasifikasi</p>
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
                                        <Label htmlFor="ruangan">{'Ruangan'}</Label>
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
                                            {'No. Filling'}
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
                                        <Label htmlFor="no_laci">{'No. Laci'}</Label>
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
                                        <Label htmlFor="no_folder">{'No. Folder'}</Label>
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
                                        <Label htmlFor="no_box">{'No. Box'}</Label>
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
                                        {'Uraian Informasi'} *
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

                                {/* Keterangan */}
                                <div className="space-y-2">
                                    <Label htmlFor="keterangan">
                                        {'Keterangan'}
                                    </Label>
                                    <Textarea
                                        id="keterangan"
                                        value={data.keterangan}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData({ ...data, keterangan: e.target.value })}
                                        rows={3}
                                    />
                                    {errors.keterangan && (
                                        <p className="text-sm text-red-600">{errors.keterangan}</p>
                                    )}
                                </div>

                                {/* Upload Dokumen */}
                                <div className="space-y-2">
                                    <Label htmlFor="dokumen">
                                        {'Dokumen'}
                                    </Label>
                                    
                                    {ocrEnabled && (
                                        <div className="rounded-lg bg-purple-50/60 p-3 border border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/30 flex items-start gap-2.5 text-xs text-purple-800 dark:text-purple-300 mb-2">
                                            <Brain className="h-4 w-4 mt-0.5 text-purple-600 dark:text-purple-400 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-purple-900 dark:text-purple-200">Info Pindai Otomatis (OCR & AI):</span>
                                                <p className="mt-0.5 text-purple-700 dark:text-purple-300/90 leading-relaxed">
                                                    Unggah file <strong>PDF</strong> atau <strong>Gambar (JPG, JPEG, PNG)</strong>, lalu klik tombol <strong>"Scan OCR & Isi Otomatis"</strong> yang muncul setelah file terpilih. Sistem akan mendeteksi teks dan mengisi form (Klasifikasi, Tanggal, Indeks, Uraian) secara otomatis.
                                                </p>
                                            </div>
                                        </div>
                                    )}

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

                                    {isSelectedFileUnsupportedForOcr && (
                                        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300">
                                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                                            <p>
                                                Format dokumen ini bisa diunggah, tetapi tidak didukung untuk OCR.
                                                Gunakan file PDF, JPG, JPEG, atau PNG jika ingin memakai pindai otomatis.
                                            </p>
                                        </div>
                                    )}

                                    {/* OCR Scan Button */}
                                    {ocrEnabled && data.dokumen && isOcrEligibleFile(fileName) && (
                                        <div className="mt-3 space-y-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleScanDocument}
                                                disabled={isScanning}
                                                className="border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-950"
                                            >
                                                {isScanning ? (
                                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Memindai dokumen...</>
                                                ) : (
                                                    <><Brain className="h-4 w-4 mr-2" /> Scan OCR & Isi Otomatis</>
                                                )}
                                            </Button>

                                            {scanResult && (
                                                <div className={`rounded-lg border p-4 ${
                                                    scanResult.success
                                                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                                                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                                                }`}>
                                                    {scanResult.success ? (
                                                        <div className="space-y-3">
                                                            <div className="flex items-center gap-2">
                                                                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                                <span className="text-sm font-medium text-green-800 dark:text-green-300">
                                                                    Dokumen berhasil dipindai
                                                                </span>
                                                                {scanResult.ocr_confidence != null && (
                                                                    <span className="text-xs text-green-600 dark:text-green-400">
                                                                        (kepercayaan: {scanResult.ocr_confidence.toFixed(1)}%)
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {scanResult.suggestions ? (
                                                                <div className="space-y-2">
                                                                    <p className="text-sm text-green-700 dark:text-green-300">
                                                                        <Brain className="inline h-3 w-3 mr-1" />
                                                                        AI menyarankan klasifikasi:
                                                                    </p>
                                                                    <div className="ml-4 space-y-1">
                                                                        {scanResult.suggestions.kode_klasifikasi_kode && (
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Kode Klasifikasi:</strong> {scanResult.suggestions.kode_klasifikasi_kode} - {scanResult.suggestions.kode_klasifikasi_uraian}
                                                                            </p>
                                                                        )}
                                                                        {scanResult.suggestions.indeks && (
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Indeks:</strong> {scanResult.suggestions.indeks}
                                                                            </p>
                                                                        )}
                                                                        {scanResult.suggestions.tanggal && (
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Tanggal:</strong> {scanResult.suggestions.tanggal}
                                                                            </p>
                                                                        )}
                                                                        {scanResult.suggestions.uraian_informasi && (
                                                                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                                                                <strong>Uraian Informasi:</strong> {scanResult.suggestions.uraian_informasi}
                                                                            </p>
                                                                        )}
                                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                            Keyakinan AI: {scanResult.suggestions.confidence.toFixed(1)}%
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs text-green-600 dark:text-green-400 italic">
                                                                        Field telah diisi otomatis berdasarkan hasil OCR. Anda masih bisa mengubahnya.
                                                                    </p>
                                                                </div>
                                                            ) : (
                                                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                                                    Teks berhasil diekstrak tetapi AI tidak dapat menentukan klasifikasi.
                                                                </p>
                                                            )}
                                                            {scanResult.extracted_text && (
                                                                <details className="mt-2">
                                                                    <summary className="cursor-pointer text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700">
                                                                        Lihat teks hasil OCR
                                                                    </summary>
                                                                    <pre className="mt-2 max-h-40 overflow-y-auto rounded border bg-white p-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 whitespace-pre-wrap font-mono">
                                                                        {scanResult.extracted_text}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                            <span className="text-sm text-red-800 dark:text-red-300">
                                                                {scanResult.error || 'Gagal memindai dokumen.'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            </CardContent>
                        </Card>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-4">
                            <Link href="/arsip-unit">
                                <Button type="button" variant="outline">
                                    {'Batal'}
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Memperbarui...' : 'Perbarui'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
