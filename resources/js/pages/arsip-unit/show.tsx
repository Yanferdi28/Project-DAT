import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Download, Calendar, FileText, FolderOpen, User, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { OcrResultPanel } from '@/components/ocr-result-panel';
import { AiSuggestionCard } from '@/components/ai-suggestion-card';
import { DocumentPreview } from '@/components/document-preview';

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
    verifikasi_tanggal: string | null;
    verifikasi_keterangan: string | null;
    created_at: string;
    updated_at: string;
    kode_klasifikasi: KodeKlasifikasi;
    unit_pengolah: UnitPengolah;
    kategori: Kategori;
    sub_kategori: SubKategori;
    verified_by_user?: User;
    verifikasi_oleh_user?: User;
    // OCR fields
    extracted_text: string | null;
    ocr_status: string | null;
    ocr_confidence: number | null;
    ocr_error: string | null;
    ocr_processed_at: string | null;
    suggested_kategori?: { id: number; nama_kategori: string } | null;
    suggested_sub_kategori?: { id: number; nama_sub_kategori: string } | null;
    ai_confidence_score: number | null;
    ai_suggestion_status: string | null;
}

interface Props {
    arsipUnit: ArsipUnit;
    userUnitPengolahId?: number | null;
    ocrEnabled?: boolean;
    auth: {
        user: {
            role: string;
            unit_pengolah_id?: number;
        };
    };
}

export default function Show({ arsipUnit, userUnitPengolahId, ocrEnabled, auth }: Props) {
    // Check if user can edit this arsip unit
    const canEdit = auth.user?.role !== 'operator' && (
        auth.user?.role === 'admin' || 
        userUnitPengolahId === null || 
        arsipUnit.unit_pengolah_arsip_id === userUnitPengolahId
    );

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
            <Head title={'Detail Arsip Unit'} />

            <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-6 flex items-center justify-between">
                        <Link href="/arsip-unit">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                {'Kembali'}
                            </Button>
                        </Link>
                        <div className="flex gap-2">
                            {canEdit && (
                                <Link href={`/arsip-unit/${arsipUnit.id_berkas}/edit`}>
                                    <Button variant="outline" size="sm">
                                        {'Edit'}
                                    </Button>
                                </Link>
                            )}
                            {arsipUnit.dokumen && (
                                <a href={`/storage/${arsipUnit.dokumen}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        {'Download Dokumen'}
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
                                        {'Informasi Arsip'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Kode Klasifikasi'}</label>
                                        <p className="mt-1 text-sm">
                                            {arsipUnit.kode_klasifikasi.kode_klasifikasi} - {arsipUnit.kode_klasifikasi.uraian}
                                        </p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Unit Pengolah'}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.unit_pengolah.nama}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Kategori'}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.kategori.nama}</p>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Sub Kategori'}</label>
                                        <p className="mt-1 text-sm">{arsipUnit.sub_kategori.nama}</p>
                                    </div>

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Retensi Aktif'}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.retensi_aktif ? `${arsipUnit.retensi_aktif} ${'tahun'}` : '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Retensi Inaktif'}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.retensi_inaktif ? `${arsipUnit.retensi_inaktif} ${'tahun'}` : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {arsipUnit.indeks && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'Indeks'}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.indeks}</p>
                                            </div>
                                        </>
                                    )}

                                    <Separator />

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Tanggal'}</label>
                                            <p className="mt-1 flex items-center text-sm">
                                                <Calendar className="mr-1 h-4 w-4" />
                                                {formatDate(arsipUnit.tanggal)}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Jumlah'}</label>
                                            <p className="mt-1 text-sm">
                                                {arsipUnit.jumlah_nilai} {formatJumlahSatuan(arsipUnit.jumlah_satuan)}
                                            </p>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Tingkat Perkembangan'}</label>
                                        <p className="mt-1 text-sm">{formatTingkatPerkembangan(arsipUnit.tingkat_perkembangan)}</p>
                                    </div>

                                    {arsipUnit.skkaad && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'SKKAAD'}</label>
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
                                        {'Lokasi Penyimpanan'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {arsipUnit.ruangan && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Ruangan'}</label>
                                            <p className="mt-1 text-sm">{arsipUnit.ruangan}</p>
                                        </div>
                                    )}

                                    {arsipUnit.no_filling && (
                                        <>
                                            {arsipUnit.ruangan && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'No. Filling'}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_filling}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_laci && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'No. Laci'}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_laci}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_folder && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'No. Folder'}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_folder}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.no_box && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci || arsipUnit.no_folder) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'No. Box'}</label>
                                                <p className="mt-1 text-sm">{arsipUnit.no_box}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.dokumen && (
                                        <>
                                            {(arsipUnit.ruangan || arsipUnit.no_filling || arsipUnit.no_laci || arsipUnit.no_folder || arsipUnit.no_box) && <Separator />}
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'Dokumen'}</label>
                                                <div className="mt-2">
                                                    <DocumentPreview
                                                        dokumen={arsipUnit.dokumen}
                                                        inline={true}
                                                        inlineHeight="h-48"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.keterangan && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'Keterangan'}</label>
                                                <p className="mt-1 text-sm whitespace-pre-wrap">{arsipUnit.keterangan}</p>
                                            </div>
                                        </>
                                    )}

                                    {!arsipUnit.ruangan && !arsipUnit.no_filling && !arsipUnit.no_laci && 
                                     !arsipUnit.no_folder && !arsipUnit.no_box && !arsipUnit.dokumen && !arsipUnit.keterangan && (
                                        <p className="text-sm text-muted-foreground">{'Tidak ada data lokasi penyimpanan'}</p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Informasi Verifikasi */}
                        {(arsipUnit.verified_at || arsipUnit.verified_by_user || arsipUnit.verifikasi_oleh_user || arsipUnit.verifikasi_tanggal || arsipUnit.verifikasi_keterangan) && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="mr-2 h-5 w-5" />
                                        {'Informasi Verifikasi'}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {arsipUnit.verified_at && (
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground">{'Tanggal Verifikasi'}</label>
                                            <p className="mt-1 text-sm">{formatDate(arsipUnit.verified_at)}</p>
                                        </div>
                                    )}

                                    {arsipUnit.verifikasi_tanggal && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">Tanggal Verifikasi Status</label>
                                                <p className="mt-1 text-sm">{formatDate(arsipUnit.verifikasi_tanggal)}</p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.verified_by_user && (
                                        <>
                                            <Separator />
                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground">{'Diverifikasi Oleh'}</label>
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
                                                <label className="text-sm font-medium text-muted-foreground">{'Diverifikasi Oleh'}</label>
                                                <p className="mt-1 text-sm">
                                                    {arsipUnit.verifikasi_oleh_user.name} ({arsipUnit.verifikasi_oleh_user.email})
                                                </p>
                                            </div>
                                        </>
                                    )}

                                    {arsipUnit.status === 'ditolak' && arsipUnit.verifikasi_keterangan && (
                                        <>
                                            <Separator />
                                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                                                <label className="text-sm font-medium text-red-800 dark:text-red-400">Alasan Penolakan</label>
                                                <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap dark:text-red-300">{arsipUnit.verifikasi_keterangan}</p>
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Metadata */}
                        <Card>
                            <CardHeader>
                                <CardTitle>{'Metadata'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Dibuat'}</label>
                                        <p className="mt-1 text-sm">{formatDate(arsipUnit.created_at)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground">{'Terakhir Diupdate'}</label>
                                        <p className="mt-1 text-sm">{formatDate(arsipUnit.updated_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* OCR & AI Section */}
                        {ocrEnabled && arsipUnit.ocr_status && (
                            <div className="space-y-6">
                                <OcrResultPanel
                                    arsipUnitId={arsipUnit.id_berkas}
                                    ocrStatus={arsipUnit.ocr_status}
                                    extractedText={arsipUnit.extracted_text}
                                    ocrConfidence={arsipUnit.ocr_confidence}
                                    ocrError={arsipUnit.ocr_error}
                                    ocrProcessedAt={arsipUnit.ocr_processed_at}
                                />
                                <AiSuggestionCard
                                    arsipUnitId={arsipUnit.id_berkas}
                                    currentKategori={arsipUnit.kategori.nama}
                                    currentSubKategori={arsipUnit.sub_kategori.nama}
                                    suggestedKategori={arsipUnit.suggested_kategori}
                                    suggestedSubKategori={arsipUnit.suggested_sub_kategori}
                                    aiConfidenceScore={arsipUnit.ai_confidence_score}
                                    aiSuggestionStatus={arsipUnit.ai_suggestion_status}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
