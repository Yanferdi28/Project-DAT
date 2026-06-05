<?php

namespace App\Jobs;

use App\Models\ArsipUnit;
use App\Models\KodeKlasifikasi;
use App\Services\OcrService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ClassifyDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 60;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public int $arsipUnitId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(OcrService $ocrService): void
    {
        $arsipUnit = ArsipUnit::find($this->arsipUnitId);

        if (!$arsipUnit) {
            Log::warning("ClassifyDocumentJob: ArsipUnit #{$this->arsipUnitId} not found");
            return;
        }

        if (empty($arsipUnit->extracted_text)) {
            Log::info("ClassifyDocumentJob: No extracted text for ArsipUnit #{$this->arsipUnitId}");
            return;
        }

        Log::info("ClassifyDocumentJob: Starting classification for ArsipUnit #{$this->arsipUnitId}");

        $result = $ocrService->classifyText($arsipUnit->extracted_text);

        if (!$result['success'] || empty($result['predictions'])) {
            Log::warning("ClassifyDocumentJob: Classification failed for ArsipUnit #{$this->arsipUnitId}: " . ($result['error'] ?? 'No predictions'));
            return;
        }

        $topPrediction = $result['top_prediction'] ?? $result['predictions'][0];
        $confidence = max(0, min(100, (float) ($topPrediction['confidence'] ?? 0)));

        // Only save suggestion if confidence is above minimum threshold
        $minConfidence = config('ocr.min_confidence', 50);
        if ($confidence >= $minConfidence) {
            // Resolve kode_klasifikasi by its code string from the classifier
            $kodeKlasifikasiCode = $topPrediction['kode_klasifikasi'] ?? null;
            $kodeKlasifikasi = $kodeKlasifikasiCode
                ? KodeKlasifikasi::where('kode_klasifikasi', $kodeKlasifikasiCode)->first()
                : null;

            if (!$kodeKlasifikasi) {
                Log::warning("ClassifyDocumentJob: kode_klasifikasi '{$kodeKlasifikasiCode}' not found in database for ArsipUnit #{$this->arsipUnitId}");
                return;
            }

            $arsipUnit->update([
                'suggested_kode_klasifikasi_id' => $kodeKlasifikasi->id,
                'ai_confidence_score' => $confidence,
                'ai_suggestion_status' => null, // pending review
            ]);

            Log::info("ClassifyDocumentJob: Classification completed for ArsipUnit #{$this->arsipUnitId} - Suggested kode_klasifikasi: {$kodeKlasifikasiCode} (confidence: {$confidence}%)");
        } else {
            Log::info("ClassifyDocumentJob: Confidence too low ({$confidence}%) for ArsipUnit #{$this->arsipUnitId}");
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ClassifyDocumentJob failed for ArsipUnit #{$this->arsipUnitId}: {$exception->getMessage()}");
    }
}
