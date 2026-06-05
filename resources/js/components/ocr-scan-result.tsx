import React from 'react';
import { Brain, CheckCircle, AlertCircle } from 'lucide-react';

export interface OcrScanResultData {
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
}

interface Props {
    scanResult: OcrScanResultData;
}

export function OcrScanResult({ scanResult }: Props) {
    if (!scanResult) return null;

    return (
        <div
            className={`rounded-lg border p-4 ${
                scanResult.success
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
            }`}
        >
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
                                        <strong>Kode Klasifikasi:</strong> {scanResult.suggestions.kode_klasifikasi_kode} -{' '}
                                        {scanResult.suggestions.kode_klasifikasi_uraian}
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
    );
}
