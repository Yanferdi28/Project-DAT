<?php

use App\Models\ArsipUnit;
use Illuminate\Support\Facades\Http;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Str;

/**
 * Normalise a training label to its classification code.
 */
$normalizeTrainingLabel = function (?string $label): string {
    $label = trim((string) $label);
    $code = trim(Str::before($label, '|'));

    return Str::upper((string) preg_replace('/\s+/', '', $code));
};

/**
 * Build training rows from labeled archive records.
 *
 * @return array<int, array{text: string, label: string}>
 */
$buildTrainingRows = function (bool $acceptedOnly, int $minTextLength) use ($normalizeTrainingLabel): array {
    $rows = [];

    ArsipUnit::query()
        ->with('kodeKlasifikasi:id,kode_klasifikasi,uraian')
        ->whereNotNull('kode_klasifikasi_id')
        ->whereNotNull('extracted_text')
        ->when($acceptedOnly, function ($query) {
            $query->where(function ($q) {
                $q->whereIn('ai_suggestion_status', ['accepted', 'corrected'])
                    ->orWhereNull('ai_suggestion_status');
            });
        })
        ->orderBy('id_berkas')
        ->chunk(200, function ($items) use (&$rows, $minTextLength, $normalizeTrainingLabel) {
            foreach ($items as $item) {
                if (!$item->kodeKlasifikasi) {
                    continue;
                }

                $text = Str::of((string) $item->extracted_text)
                    ->replaceMatches('/\s+/', ' ')
                    ->trim()
                    ->value();

                if (Str::length($text) < $minTextLength) {
                    continue;
                }

                $rows[] = [
                    'text' => $text,
                    'label' => $normalizeTrainingLabel($item->kodeKlasifikasi->kode_klasifikasi),
                ];
            }
        });

    return $rows;
};

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('ai:export-training-data
    {--path=ocr-service/data/training_data.generated.json : Relative path for exported JSON}
    {--accepted-only : Use only rows accepted by AI, manually corrected, or manually finalized}
    {--seed-from=ocr-service/data/training_data.json : Optional seed JSON merged into exported dataset}
    {--min-text=30 : Minimum extracted text length}', function () use ($buildTrainingRows, $normalizeTrainingLabel) {
    $relativePath = (string) $this->option('path');
    $acceptedOnly = (bool) $this->option('accepted-only');
    $minTextLength = max((int) $this->option('min-text'), 10);
    $seedFrom = trim((string) $this->option('seed-from'));

    $rows = $buildTrainingRows($acceptedOnly, $minTextLength);

    if ($seedFrom !== '') {
        $seedPath = base_path($seedFrom);
        if (is_file($seedPath)) {
            $seedRows = json_decode((string) file_get_contents($seedPath), true);

            if (is_array($seedRows)) {
                $rows = collect(array_merge($seedRows, $rows))
                    ->filter(function ($row) {
                        return is_array($row)
                            && !empty($row['text'])
                            && !empty($row['label']);
                    })
                    ->map(function ($row) use ($normalizeTrainingLabel) {
                        return [
                            'text' => Str::of((string) $row['text'])
                                ->replaceMatches('/\s+/', ' ')
                                ->trim()
                                ->value(),
                            'label' => $normalizeTrainingLabel((string) $row['label']),
                        ];
                    })
                    ->unique(function ($row) {
                        return sha1($row['label'].'|'.$row['text']);
                    })
                    ->values()
                    ->all();
            }
        }
    }

    if (count($rows) < 5) {
        $this->error('Dataset terlalu kecil. Tambahkan data berlabel terlebih dahulu.');
        return self::FAILURE;
    }

    $targetPath = base_path($relativePath);
    $targetDir = dirname($targetPath);

    if (!is_dir($targetDir)) {
        mkdir($targetDir, 0755, true);
    }

    file_put_contents(
        $targetPath,
        json_encode($rows, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );

    $classes = collect($rows)->pluck('label')->unique()->count();

    $this->info('Export selesai.');
    $this->line("Path: {$targetPath}");
    $this->line('Samples: '.count($rows));
    $this->line('Classes: '.$classes);

    return self::SUCCESS;
})->purpose('Export labeled arsip data into OCR classifier training JSON');

Artisan::command('ai:retrain-classifier
    {--path=ocr-service/data/training_data.generated.json : Relative path for generated training JSON}
    {--accepted-only : Use only rows accepted by AI, manually corrected, or manually finalized}
    {--min-text=30 : Minimum extracted text length}
    {--service= : OCR service base URL (default from OCR_SERVICE_URL)}
    {--timeout=180 : HTTP timeout in seconds}', function () {
    $relativePath = (string) $this->option('path');
    $serviceUrl = rtrim((string) ($this->option('service') ?: config('ocr.service_url')), '/');
    $timeout = max((int) $this->option('timeout'), 30);

    $exitCode = Artisan::call('ai:export-training-data', [
        '--path' => $relativePath,
        '--accepted-only' => (bool) $this->option('accepted-only'),
        '--min-text' => max((int) $this->option('min-text'), 10),
    ]);

    $this->line(trim(Artisan::output()));

    if ($exitCode !== self::SUCCESS) {
        return $exitCode;
    }

    $trainingDataPath = base_path($relativePath);

    try {
        $response = Http::timeout($timeout)
            ->connectTimeout(10)
            ->post("{$serviceUrl}/classify/train", [
                'training_data_path' => $trainingDataPath,
            ]);

        if (!$response->successful()) {
            $detail = $response->json('detail') ?: $response->body();
            $this->error('Retrain gagal: '.$detail);
            return self::FAILURE;
        }

        $payload = $response->json();

        $this->info('Retrain berhasil.');
        $this->line('Samples: '.($payload['samples'] ?? '-'));
        $this->line('Classes: '.($payload['classes'] ?? '-'));
        $this->line('Training accuracy: '.($payload['training_accuracy'] ?? '-').'%');

        return self::SUCCESS;
    } catch (Throwable $e) {
        $this->error('Retrain gagal: '.$e->getMessage());
        return self::FAILURE;
    }
})->purpose('Generate training data from DB and retrain OCR classifier via API');

Schedule::command('ai:retrain-classifier --accepted-only')
    ->weeklyOn(0, '02:00')
    ->withoutOverlapping();
