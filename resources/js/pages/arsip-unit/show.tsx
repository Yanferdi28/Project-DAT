import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Calendar, FileText, FolderOpen, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { useLanguage } from '@/contexts/LanguageContext';

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
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface ArsipUnit {
    id_berkas: number;
    kode_klasifikasi_id: number;
    unit_pengolah_arsip_id: number;
    kategori_id: number;
    sub_kategori_id: number;
    retensi_aktif: number | null;
    retensi_inaktif: number | null;
    indeks: string | null;
    uraian_informasi: string;
    tanggal: string;
    jumlah_nilai: number;
    jumlah_satuan: string;
    tingkat_perkembangan: string;
    skkaad: string | null;
    ruangan: string | null;
    no_filling: string | null;
    no_laci: string | null;
    no_folder: string | null;
    no_box: string | null;
    dokumen: string | null;
    keterangan: string | null;
    status: string;
    publish_status: string;
    verified_at: string | null;
    verified_by: number | null;
    verifikasi_oleh: number | null;
    created_at: string;
    updated_at: string;
    kode_klasifikasi: KodeKlasifikasi;
    unit_pengolah: UnitPengolah;
    kategori: Kategori;
    sub_kategori: SubKategori;
    verified_by_user?: User;
    verifikasi_oleh_user?: User;
}

interface Props {
    arsipUnit: ArsipUnit;
    auth: {
        user: {
            role: string;
        };
    };
}

export default function Show({ arsipUnit, auth }: Props) {
    const { t } = useLanguage();

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'diterima':
                return <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> Diterima</Badge>;
            case 'ditolak':
                return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> Ditolak</Badge>;
            case 'pending':
            default:
                return <Badge variant="secondary"><Clock className="mr-1 h-3 w-3" /> Pending</Badge>;
        }
    };

    const getPublishStatusBadge = (status: string) => {
        switch (status) {
            case 'published':
                return <Badge className="bg-blue-500">Published</Badge>;
            case 'draft':
            default:
                return <Badge variant="outline">Draft</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatJumlahSatuan = (satuan: string) => {
        const labels: { [key: string]: string } = {
            lembar: 'Lembar',
            jilid: 'Jilid',
            bundle: 'Bundle',
        };
        return labels[satuan] || satuan;
    };

    const formatTingkatPerkembangan = (tingkat: string) => {
        const labels: { [key: string]: string } = {
            asli: 'Asli',
            salinan: 'Salinan',
            tembusan: 'Tembusan',
            pertinggal: 'Pertinggal',
        };
        return labels[tingkat] || tingkat;
    };

    return (
        <AppLayout>
            <Head title={t('arsipUnit.detail')} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/arsip-unit">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {t('common.back')}
                            </Button>
                        </Link>
                        <div className="flex gap-2">
                            {!['management', 'operator'].includes(auth.user?.role || '') && (
                                <Link href={`/arsip-unit/${arsipUnit.id_berkas}/edit`}>
                                    <Button variant="outline" size="sm">
                                        {t('common.edit')}
                                    </Button>
                                </Link>
                            )}
                            {arsipUnit.dokumen && (
                                <a href={`/storage/${arsipUnit.dokumen}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        {t('arsipUnit.downloadDokumen')}
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Header Card */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl">
                                            {arsipUnit.kode_klasifikasi.kode_klasifikasi} - {arsipUnit.kode_klasifikasi.uraian}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {arsipUnit.uraian_informasi}
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        {getStatusBadge(arsipUnit.status)}
                                        {getPublishStatusBadge(arsipUnit.publish_status)}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Informasi Arsip */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="mr-2 h-5 w-5" />
                                        {t('arsipUnit.informasiArsip')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.kodeKlasifikasi')}</label>
                                        <p className="mt-1 text-sm">
                                            {arsipUnit.kode_klasifikasi.kode_klasifikasi} - {arsipUnit.kode_klasifikasi.uraian}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.unitPengolah')}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.unit_pengolah.nama}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.kategori')}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.kategori.nama}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.subKategori')}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.sub_kategori.nama}</p>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.retensiAktif')}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.retensi_aktif ? `${arsipUnit.retensi_aktif} ${t('arsipUnit.tahun')}` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.retensiInaktif')}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.retensi_inaktif ? `${arsipUnit.retensi_inaktif} ${t('arsipUnit.tahun')}` : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {arsipUnit.indeks && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.indeks')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.indeks}</p>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.tanggal')}</label>
                                            <p className="mt-1 flex items-center text-sm">
                                                <Calendar className="mr-1 h-4 w-4" />
                                                {formatDate(arsipUnit.tanggal)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.jumlah')}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.jumlah_nilai} {formatJumlahSatuan(arsipUnit.jumlah_satuan)}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.tingkatPerkembangan')}</label>
                                        <p className="mt-1 text-sm">{formatTingkatPerkembangan(arsipUnit.tingkat_perkembangan)}</p>
                                    </div>

                                    {arsipUnit.skkaad && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.skkaad')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.skkaad}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Lokasi Penyimpanan & Detail */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FolderOpen className="mr-2 h-5 w-5" />
                                        {t('arsipUnit.lokasiPenyimpanan')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {arsipUnit.ruangan && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.ruangan')}</label>
                                            <p className="mt-1 text-sm">{arsipUnit.ruangan}</p>
                                        </div>
                                    )}

                                    {arsipUnit.no_filling && (
                                        <>
                                            {arsipUnit.ruangan && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.noFilling')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_filling}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_laci && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.noLaci')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_laci}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_folder && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.noFolder')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_folder}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_box && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci || arsipUnit.no_folder) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.noBox')}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_box}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.dokumen && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci || arsipUnit.no_folder || arsipUnit.no_box) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.dokumen')}</label>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <a
                                                        href={`/storage/${arsipUnit.dokumen}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                                                    >
                                                        {arsipUnit.dokumen.split('/').pop()}
                                                    </a>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.keterangan && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.keterangan')}</label>
                                                <p className="mt-1 text-sm whitespace-pre-wrap">{arsipUnit.keterangan}</p>
                                            </div>
                                        </>
                                    )}

                                    {!arsipUnit.ruangan && !arsipUnit.no_filling && !arsipUnit.no_laci && 
                                     !arsipUnit.no_folder && !arsipUnit.no_box && !arsipUnit.dokumen && !arsipUnit.keterangan && (
                                        <p className="text-sm text-muted-foreground">{t('arsipUnit.tidakAdaLokasiPenyimpanan')}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Informasi Verifikasi */}
                        {(arsipUnit.verified_at || arsipUnit.verified_by_user || arsipUnit.verifikasi_oleh_user) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        {t('arsipUnit.informasiVerifikasi')}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {arsipUnit.verified_at && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.tanggalVerifikasi')}</label>
                                            <p className="mt-1 text-sm">{formatDate(arsipUnit.verified_at)}</p>
                                        </div>
                                    )}

                                    {arsipUnit.verified_by_user && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.diverifikasiOleh')}</label>
                                                <p className="mt-1 text-sm">
                                                    {arsipUnit.verified_by_user.name} ({arsipUnit.verified_by_user.email})
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.verifikasi_oleh_user && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{t('arsipUnit.verifikasiOleh')}</label>
                                                <p className="mt-1 text-sm">
                                                    {arsipUnit.verifikasi_oleh_user.name} ({arsipUnit.verifikasi_oleh_user.email})
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{t('common.metadata')}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('common.createdAt')}</label>
                                        <p className="mt-1 text-sm">{formatDate(arsipUnit.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{t('common.updatedAt')}</label>
                                        <p className="mt-1 text-sm">{formatDate(arsipUnit.updated_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
