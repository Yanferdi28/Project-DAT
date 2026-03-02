<?php

namespace App\Jobs;

use App\Models\ArsipUnit;
use App\Services\OcrService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessOcrJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 300;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public int $backoff = 30;

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
            Log::warning("ProcessOcrJob: ArsipUnit #{$this->arsipUnitId} not found");
            return;
        }

        if (!$arsipUnit->dokumen) {
            $arsipUnit->update([
                'ocr_status' => 'skipped',
                'ocr_error' => 'No document file attached',
            ]);
            return;
        }

        // Check if file type is supported for OCR
        if (!$arsipUnit->isOcrEligible()) {
            $arsipUnit->update([
                'ocr_status' => 'skipped',
                'ocr_error' => 'File type not supported for OCR',
            ]);
            return;
        }

        // Update status to processing
        $arsipUnit->update(['ocr_status' => 'processing']);

        Log::info("ProcessOcrJob: Starting OCR for ArsipUnit #{$this->arsipUnitId}");

        // Step 1: Extract text via OCR
        $result = $ocrService->extractText($arsipUnit->dokumen);

        if (!$result['success']) {
            $arsipUnit->update([
                'ocr_status' => 'failed',
                'ocr_error' => $result['error'],
                'ocr_processed_at' => now(),
            ]);

            Log::error("ProcessOcrJob: OCR failed for ArsipUnit #{$this->arsipUnitId}: {$result['error']}");
            return;
        }

        // Save OCR result
        $arsipUnit->update([
            'extracted_text' => $result['text'],
            'ocr_confidence' => $result['confidence'],
            'ocr_status' => 'completed',
            'ocr_error' => null,
            'ocr_processed_at' => now(),
        ]);

        Log::info("ProcessOcrJob: OCR completed for ArsipUnit #{$this->arsipUnitId} (confidence: {$result['confidence']}%)");

        // Step 2: Dispatch classification job if text was extracted
        if (!empty($result['text']) && config('ocr.classification_enabled', true)) {
            ClassifyDocumentJob::dispatch($this->arsipUnitId);
        }
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("ProcessOcrJob failed for ArsipUnit #{$this->arsipUnitId}: {$exception->getMessage()}");

        $arsipUnit = ArsipUnit::find($this->arsipUnitId);
        if ($arsipUnit) {
            $arsipUnit->update([
                'ocr_status' => 'failed',
                'ocr_error' => 'Job failed after max retries: ' . $exception->getMessage(),
                'ocr_processed_at' => now(),
            ]);
        }
    }
}
