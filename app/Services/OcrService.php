<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OcrService
{
    protected string $baseUrl;
    protected int $timeout;
    protected int $connectTimeout;
    protected string $defaultEngine;

    public function __construct()
    {
        $this->baseUrl = config('ocr.service_url', 'http://127.0.0.1:8102');
        $this->timeout = config('ocr.timeout', 120);
        $this->connectTimeout = config('ocr.connect_timeout', 10);
        $this->defaultEngine = config('ocr.engine', 'tesseract');
    }

    /**
     * Check if the OCR service is available.
     */
    public function isAvailable(): bool
    {
        try {
            $response = Http::timeout(5)
                ->connectTimeout(3)
                ->get("{$this->baseUrl}/health");

            return $response->successful() && $response->json('status') === 'healthy';
        } catch (\Exception $e) {
            Log::warning('OCR Service health check failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Extract text from a document file using OCR.
     *
     * @param string $filePath Path relative to the public disk (e.g., 'dokumen-arsip/file.pdf')
     * @param string|null $engine OCR engine to use ('tesseract' or 'easyocr'). Null = default.
     * @return array{success: bool, text: ?string, confidence: ?float, engine_used: ?string, error: ?string}
     */
    public function extractText(string $filePath, ?string $engine = null): array
    {
        try {
            $fullPath = Storage::disk('public')->path($filePath);

            if (!file_exists($fullPath)) {
                return [
                    'success' => false,
                    'text' => null,
                    'confidence' => null,
                    'engine_used' => null,
                    'error' => "File not found: {$filePath}",
                ];
            }

            // Check file size
            $fileSize = filesize($fullPath);
            $maxSize = config('ocr.max_file_size', 10 * 1024 * 1024);
            if ($fileSize > $maxSize) {
                return [
                    'success' => false,
                    'text' => null,
                    'confidence' => null,
                    'engine_used' => null,
                    'error' => 'File too large for OCR processing',
                ];
            }

            $engineParam = $engine ?? $this->defaultEngine;

            $response = Http::timeout($this->timeout)
                ->connectTimeout($this->connectTimeout)
                ->attach(
                    'file',
                    file_get_contents($fullPath),
                    basename($filePath)
                )
                ->post("{$this->baseUrl}/ocr/extract?engine={$engineParam}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'text' => $data['text'] ?? '',
                    'confidence' => $data['confidence'] ?? 0,
                    'word_count' => $data['word_count'] ?? 0,
                    'pages_processed' => $data['pages_processed'] ?? 0,
                    'engine_used' => $data['engine_used'] ?? $engineParam,
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => $response->json('detail', 'OCR service returned an error'),
            ];
        } catch (ConnectionException $e) {
            Log::error('OCR Service connection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => 'Cannot connect to OCR service. Is it running?',
            ];
        } catch (\Exception $e) {
            Log::error('OCR processing error: ' . $e->getMessage());
            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => 'OCR processing failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Classify document text using AI.
     *
     * @param string $text Extracted text to classify
     * @return array{success: bool, predictions: array, error: ?string}
     */
    public function classifyText(string $text): array
    {
        try {
            $response = Http::timeout(30)
                ->connectTimeout($this->connectTimeout)
                ->post("{$this->baseUrl}/classify/predict", [
                    'text' => $text,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'predictions' => [],
                'error' => $response->json('detail', 'Classification service returned an error'),
            ];
        } catch (ConnectionException $e) {
            Log::error('Classification Service connection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'predictions' => [],
                'error' => 'Cannot connect to classification service.',
            ];
        } catch (\Exception $e) {
            Log::error('Classification error: ' . $e->getMessage());
            return [
                'success' => false,
                'predictions' => [],
                'error' => 'Classification failed: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Get OCR service info.
     */
    public function getInfo(): array
    {
        try {
            $response = Http::timeout(10)
                ->connectTimeout($this->connectTimeout)
                ->get("{$this->baseUrl}/ocr/info");

            if ($response->successful()) {
                return $response->json();
            }

            return ['error' => 'Could not fetch OCR info'];
        } catch (\Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get classifier status.
     */
    public function getClassifierStatus(): array
    {
        try {
            $response = Http::timeout(10)
                ->connectTimeout($this->connectTimeout)
                ->get("{$this->baseUrl}/classify/status");

            if ($response->successful()) {
                return $response->json();
            }

            return ['model_loaded' => false, 'status' => 'error'];
        } catch (\Exception $e) {
            return ['model_loaded' => false, 'status' => 'unreachable'];
        }
    }

    /**
     * Extract text from an uploaded file (UploadedFile instance) without storing it first.
     *
     * @param \Illuminate\Http\UploadedFile $file
     * @param string|null $engine OCR engine to use ('tesseract' or 'easyocr'). Null = default.
     * @return array{success: bool, text: ?string, confidence: ?float, engine_used: ?string, error: ?string}
     */
    public function extractTextFromUpload(\Illuminate\Http\UploadedFile $file, ?string $engine = null): array
    {
        try {
            $maxSize = config('ocr.max_file_size', 10 * 1024 * 1024);
            if ($file->getSize() > $maxSize) {
                return [
                    'success' => false,
                    'text' => null,
                    'confidence' => null,
                    'engine_used' => null,
                    'error' => 'File too large for OCR processing',
                ];
            }

            $engineParam = $engine ?? $this->defaultEngine;

            $response = Http::timeout($this->timeout)
                ->connectTimeout($this->connectTimeout)
                ->attach(
                    'file',
                    file_get_contents($file->getRealPath()),
                    $file->getClientOriginalName()
                )
                ->post("{$this->baseUrl}/ocr/extract?engine={$engineParam}");

            if ($response->successful()) {
                $data = $response->json();
                return [
                    'success' => true,
                    'text' => $data['text'] ?? '',
                    'confidence' => $data['confidence'] ?? 0,
                    'word_count' => $data['word_count'] ?? 0,
                    'pages_processed' => $data['pages_processed'] ?? 0,
                    'engine_used' => $data['engine_used'] ?? $engineParam,
                    'error' => null,
                ];
            }

            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => $response->json('detail', 'OCR service returned an error'),
            ];
        } catch (ConnectionException $e) {
            Log::error('OCR upload extraction failed: ' . $e->getMessage());
            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => 'Cannot connect to OCR service. Is it running?',
            ];
        } catch (\Exception $e) {
            Log::error('OCR upload processing error: ' . $e->getMessage());
            return [
                'success' => false,
                'text' => null,
                'confidence' => null,
                'engine_used' => null,
                'error' => 'OCR processing failed: ' . $e->getMessage(),
            ];
        }
    }
}
