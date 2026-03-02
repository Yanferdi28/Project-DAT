<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OCR Service Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the Python OCR microservice that handles
    | text extraction and document classification.
    |
    */

    // Python OCR microservice base URL
    'service_url' => env('OCR_SERVICE_URL', 'http://127.0.0.1:8100'),

    // Request timeout in seconds
    'timeout' => env('OCR_TIMEOUT', 120),

    // Connection timeout in seconds
    'connect_timeout' => env('OCR_CONNECT_TIMEOUT', 10),

    // Maximum file size for OCR processing (in bytes) - default: 10MB
    'max_file_size' => env('OCR_MAX_FILE_SIZE', 10 * 1024 * 1024),

    // Supported file types for OCR processing
    'supported_extensions' => ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'tif', 'tiff'],

    // Supported MIME types for OCR
    'supported_mimes' => [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/tiff',
    ],

    // Minimum confidence score to show AI suggestion (0-100)
    'min_confidence' => env('OCR_MIN_CONFIDENCE', 50),

    // Enable/disable OCR processing
    'enabled' => env('OCR_ENABLED', true),

    // Enable/disable AI classification
    'classification_enabled' => env('OCR_CLASSIFICATION_ENABLED', true),

    // Queue name for OCR jobs
    'queue' => env('OCR_QUEUE', 'ocr'),

    // Maximum retry attempts for failed OCR jobs
    'max_retries' => env('OCR_MAX_RETRIES', 3),

    // Tesseract language (for direct CLI usage fallback)
    'tesseract_lang' => env('OCR_TESSERACT_LANG', 'ind+eng'),

];
