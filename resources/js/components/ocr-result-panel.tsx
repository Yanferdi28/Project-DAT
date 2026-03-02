import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileSearch, Copy, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { OcrStatusBadge } from '@/components/ocr-status-badge';
import { router } from '@inertiajs/react';

interface OcrResultPanelProps {
    arsipUnitId: number;
    ocrStatus: string | null;
    extractedText: string | null;
    ocrConfidence: number | null;
    ocrError: string | null;
    ocrProcessedAt: string | null;
    canRetry?: boolean;
}

export function OcrResultPanel({
    arsipUnitId,
    ocrStatus,
    extractedText,
    ocrConfidence,
    ocrError,
    ocrProcessedAt,
    canRetry = true,
}: OcrResultPanelProps) {
    const [copied, setCopied] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    const handleCopy = async () => {
        if (!extractedText) return;
        await navigator.clipboard.writeText(extractedText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRetry = () => {
        setIsRetrying(true);
        router.post(`/arsip-unit/${arsipUnitId}/ocr-retry`, {}, {
            preserveScroll: true,
            onFinish: () => setIsRetrying(false),
        });
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-600 dark:text-green-400';
        if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getConfidenceLabel = (confidence: number) => {
        if (confidence >= 80) return 'Tinggi';
        if (confidence >= 60) return 'Sedang';
        return 'Rendah';
    };

    if (!ocrStatus) return null;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <FileSearch className="h-5 w-5" />
                        Hasil OCR
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <OcrStatusBadge status={ocrStatus as 'pending' | 'processing' | 'completed' | 'failed' | 'skipped'} />
                        {canRetry && (ocrStatus === 'failed' || ocrStatus === 'completed') && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRetry}
                                disabled={isRetrying}
                            >
                                <RefreshCw className={`h-4 w-4 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
                                {isRetrying ? 'Memproses...' : 'Ulangi'}
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Status: Processing */}
                {ocrStatus === 'processing' && (
                    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <RefreshCw className="h-5 w-5 animate-spin text-blue-600 dark:text-blue-400" />
                        <div>
                            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Sedang memproses OCR...</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400">Muat ulang halaman untuk melihat hasilnya.</p>
                        </div>
                    </div>
                )}

                {/* Status: Pending */}
                {ocrStatus === 'pending' && (
                    <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">OCR dalam antrian untuk diproses.</p>
                    </div>
                )}

                {/* Status: Failed */}
                {ocrStatus === 'failed' && ocrError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">OCR Gagal</p>
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{ocrError}</p>
                    </div>
                )}

                {/* Status: Completed */}
                {ocrStatus === 'completed' && extractedText && (
                    <>
                        {/* Confidence & Metadata */}
                        <div className="grid grid-cols-2 gap-4">
                            {ocrConfidence !== null && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Tingkat Kepercayaan</label>
                                    <p className={`mt-1 text-lg font-bold ${getConfidenceColor(Number(ocrConfidence))}`}>
                                        {Number(ocrConfidence).toFixed(1)}%
                                        <span className="ml-1 text-xs font-normal">({getConfidenceLabel(Number(ocrConfidence))})</span>
                                    </p>
                                </div>
                            )}
                            {ocrProcessedAt && (
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Diproses Pada</label>
                                    <p className="mt-1 text-sm">
                                        {new Date(ocrProcessedAt).toLocaleDateString('id-ID', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Extracted Text */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-muted-foreground">Teks Hasil Ekstraksi</label>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={handleCopy}>
                                        {copied ? (
                                            <><Check className="h-3 w-3 mr-1" /> Disalin</>
                                        ) : (
                                            <><Copy className="h-3 w-3 mr-1" /> Salin</>
                                        )}
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
                                        {expanded ? (
                                            <><ChevronUp className="h-3 w-3 mr-1" /> Sembunyikan</>
                                        ) : (
                                            <><ChevronDown className="h-3 w-3 mr-1" /> Tampilkan</>
                                        )}
                                    </Button>
                                </div>
                            </div>
                            {expanded && (
                                <div className="max-h-80 overflow-y-auto rounded-lg border bg-gray-50 p-3 dark:bg-gray-800 dark:border-gray-700">
                                    <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
                                        {extractedText}
                                    </pre>
                                </div>
                            )}
                            {!expanded && (
                                <div className="rounded-lg border bg-gray-50 p-3 dark:bg-gray-800 dark:border-gray-700">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                                        {extractedText}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Completed but no text */}
                {ocrStatus === 'completed' && !extractedText && (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                            OCR selesai tetapi tidak ada teks yang terdeteksi dalam dokumen.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
