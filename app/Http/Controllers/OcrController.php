<?php

namespace App\Http\Controllers;

use App\Jobs\ProcessOcrJob;
use App\Models\ArsipUnit;
use App\Services\OcrService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class OcrController extends Controller
{
    public function __construct(
        protected OcrService $ocrService
    ) {}

    /**
     * Get OCR result for an arsip unit.
     */
    public function result(ArsipUnit $arsipUnit): JsonResponse
    {
        return response()->json([
            'id' => $arsipUnit->id_berkas,
            'ocr_status' => $arsipUnit->ocr_status,
            'extracted_text' => $arsipUnit->extracted_text,
            'ocr_confidence' => $arsipUnit->ocr_confidence,
            'ocr_error' => $arsipUnit->ocr_error,
            'ocr_processed_at' => $arsipUnit->ocr_processed_at?->toDateTimeString(),
            'suggested_kode_klasifikasi' => $arsipUnit->suggestedKodeKlasifikasi?->only(['id', 'kode_klasifikasi', 'uraian']),
            'ai_confidence_score' => $arsipUnit->ai_confidence_score,
            'ai_suggestion_status' => $arsipUnit->ai_suggestion_status,
        ]);
    }

    /**
     * Retry OCR processing for a failed arsip unit.
     */
    public function retry(ArsipUnit $arsipUnit): RedirectResponse
    {
        if (!$arsipUnit->dokumen) {
            return redirect()->back()->with('error', 'Tidak ada dokumen untuk diproses OCR.');
        }

        if (!$arsipUnit->isOcrEligible()) {
            return redirect()->back()->with('error', 'Tipe file tidak didukung untuk OCR.');
        }

        if ($arsipUnit->ocr_status === 'processing') {
            return redirect()->back()->with('error', 'OCR sedang diproses.');
        }

        // Reset OCR fields
        $arsipUnit->update([
            'ocr_status' => 'pending',
            'ocr_error' => null,
            'extracted_text' => null,
            'ocr_confidence' => null,
            'suggested_kode_klasifikasi_id' => null,
            'ai_confidence_score' => null,
            'ai_suggestion_status' => null,
        ]);

        // Dispatch OCR job
        ProcessOcrJob::dispatch($arsipUnit->id_berkas);

        return redirect()->back()->with('success', 'OCR sedang diproses ulang.');
    }

    /**
     * Accept AI classification suggestion.
     */
    public function acceptSuggestion(ArsipUnit $arsipUnit): RedirectResponse
    {
        if (!$arsipUnit->suggested_kode_klasifikasi_id) {
            return redirect()->back()->with('error', 'Tidak ada saran klasifikasi AI.');
        }

        $klasifikasiKeamanan = \App\Models\KodeKlasifikasi::whereKey($arsipUnit->suggested_kode_klasifikasi_id)
            ->value('klasifikasi_keamanan');

        // Apply the AI suggestion to the actual kode_klasifikasi field
        $arsipUnit->update([
            'kode_klasifikasi_id' => $arsipUnit->suggested_kode_klasifikasi_id,
            'klasifikasi_keamanan' => $klasifikasiKeamanan,
            'ai_suggestion_status' => 'accepted',
        ]);

        return redirect()->back()->with('success', 'Saran klasifikasi AI diterima dan diterapkan.');
    }

    /**
     * Reject AI classification suggestion.
     */
    public function rejectSuggestion(ArsipUnit $arsipUnit): RedirectResponse
    {
        if (!$arsipUnit->suggested_kode_klasifikasi_id) {
            return redirect()->back()->with('error', 'Tidak ada saran klasifikasi AI.');
        }

        $arsipUnit->update([
            'ai_suggestion_status' => 'rejected',
        ]);

        return redirect()->back()->with('success', 'Saran klasifikasi AI ditolak.');
    }

    /**
     * Get OCR service status.
     */
    public function status(): JsonResponse
    {
        $serviceAvailable = $this->ocrService->isAvailable();
        $classifierStatus = $serviceAvailable ? $this->ocrService->getClassifierStatus() : ['status' => 'unreachable'];
        $ocrInfo = $serviceAvailable ? $this->ocrService->getInfo() : ['error' => 'Service unreachable'];

        return response()->json([
            'ocr_enabled' => config('ocr.enabled', true),
            'service_available' => $serviceAvailable,
            'classifier_status' => $classifierStatus,
            'ocr_info' => $ocrInfo,
        ]);
    }

    /**
     * Scan an uploaded document: run OCR + AI classification and return suggested fields.
     * Used in the create/edit form to auto-fill fields from a document.
     */
    public function scanDocument(Request $request): JsonResponse
    {
        $request->validate([
            'dokumen' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240',
        ]);

        $file = $request->file('dokumen');

        // Step 1: OCR extraction
        $ocrResult = $this->ocrService->extractTextFromUpload($file);

        if (!$ocrResult['success'] || empty($ocrResult['text'])) {
            return response()->json([
                'success' => false,
                'error' => $ocrResult['error'] ?? 'Tidak ada teks yang terdeteksi dalam dokumen.',
                'extracted_text' => null,
                'suggestions' => null,
            ]);
        }

        // Step 2: AI classification + field extraction
        $suggestions = null;
        if (config('ocr.classification_enabled', true)) {
            $classifyResult = $this->ocrService->classifyText($ocrResult['text']);

            // Get extracted fields (indeks, jumlah_nilai, uraian_informasi) — available even if classification fails
            $extractedFields = $classifyResult['extracted_fields'] ?? [];

            // Classification predictions
            $kodeKlasifikasi = null;
            $kodeKlasifikasiId = null;
            $kodeKlasifikasiKode = null;
            $kodeKlasifikasiUraian = null;
            $confidence = 0;
            $allPredictions = [];

            if ($classifyResult['success'] && !empty($classifyResult['predictions'])) {
                $topPrediction = $classifyResult['predictions'][0];
                $allPredictions = $classifyResult['predictions'];
                $confidence = max(0, min(100, (float) ($topPrediction['confidence'] ?? 0)));
                $kodeKlasifikasiKode = $topPrediction['kode_klasifikasi'] ?? null;
                $kodeKlasifikasiUraian = $topPrediction['uraian'] ?? null;

                // Resolve kode_klasifikasi by its code string
                if ($kodeKlasifikasiKode) {
                    $kodeKlasifikasi = \App\Models\KodeKlasifikasi::where(
                        'kode_klasifikasi',
                        $kodeKlasifikasiKode
                    )->first();
                    $kodeKlasifikasiId = $kodeKlasifikasi?->id;
                    $kodeKlasifikasiUraian = $kodeKlasifikasi?->uraian ?? $kodeKlasifikasiUraian;
                }
            }

            // jumlah_nilai = page count from OCR result
            $pageCount = $ocrResult['pages_processed'] ?? 1;

            // Always build suggestions — at minimum we have page count
            $suggestions = [
                'kode_klasifikasi_id' => $kodeKlasifikasiId,
                'kode_klasifikasi_kode' => $kodeKlasifikasiKode,
                'kode_klasifikasi_uraian' => $kodeKlasifikasiUraian,
                'confidence' => $confidence,
                'indeks' => $extractedFields['indeks'] ?? null,
                'tanggal' => $extractedFields['tanggal'] ?? null,
                'jumlah_nilai' => (string) $pageCount,
                'uraian_informasi' => $extractedFields['uraian_informasi'] ?? null,
                'all_predictions' => $allPredictions,
            ];
        }

        return response()->json([
            'success' => true,
            'extracted_text' => $ocrResult['text'],
            'ocr_confidence' => max(0, min(100, (float) $ocrResult['confidence'])),
            'word_count' => $ocrResult['word_count'] ?? 0,
            'suggestions' => $suggestions,
        ]);
    }
}
