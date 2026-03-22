<?php

namespace App\Services;

use App\Models\ArsipUnit;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatService
{
    protected string $baseUrl;
    protected int $timeout;

    public function __construct()
    {
        $this->baseUrl = config('ocr.service_url', 'http://127.0.0.1:8100');
        $this->timeout = config('rag.timeout', 60);
    }

    /**
     * Ask a question to the RAG chatbot.
     */
    public function ask(string $query, int $topK = null): array
    {
        $topK = $topK ?? config('rag.top_k', 5);

        try {
            $response = Http::timeout($this->timeout)
                ->connectTimeout(10)
                ->post("{$this->baseUrl}/chat/ask", [
                    'query' => $query,
                    'top_k' => $topK,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'answer' => 'Maaf, chatbot sedang tidak dapat memproses pertanyaan Anda.',
                'sources' => [],
                'error' => $response->json('detail', 'Service error'),
            ];
        } catch (ConnectionException $e) {
            Log::error('Chat service connection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'answer' => 'Tidak dapat terhubung ke layanan chatbot. Pastikan OCR service sedang berjalan.',
                'sources' => [],
                'error' => 'connection_failed',
            ];
        } catch (\Exception $e) {
            Log::error('Chat service error: ' . $e->getMessage());
            return [
                'success' => false,
                'answer' => 'Terjadi kesalahan pada layanan chatbot.',
                'sources' => [],
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Index all arsip unit documents with extracted text.
     */
    public function indexAll(): array
    {
        try {
            $arsipUnits = ArsipUnit::whereNotNull('extracted_text')
                ->where('ocr_status', 'completed')
                ->where('extracted_text', '!=', '')
                ->with(['kategori:id,nama_kategori', 'unitPengolah:id,nama_unit', 'kodeKlasifikasi:id,kode_klasifikasi,uraian'])
                ->get();

            if ($arsipUnits->isEmpty()) {
                return [
                    'success' => false,
                    'error' => 'Tidak ada dokumen arsip dengan teks OCR yang bisa diindeks.',
                    'indexed_count' => 0,
                ];
            }

            $documents = $arsipUnits->map(function ($arsip) {
                return [
                    'id' => (string) $arsip->id_berkas,
                    'text' => $arsip->extracted_text,
                    'metadata' => [
                        'arsip_id' => $arsip->id_berkas,
                        'indeks' => $arsip->indeks ?? '',
                        'uraian_informasi' => $arsip->uraian_informasi ?? '',
                        'tanggal' => $arsip->tanggal ? $arsip->tanggal->format('Y-m-d') : '',
                        'kategori' => $arsip->kategori->nama_kategori ?? '',
                        'unit_pengolah' => $arsip->unitPengolah->nama_unit ?? '',
                        'kode_klasifikasi' => $arsip->kodeKlasifikasi->kode_klasifikasi ?? '',
                    ],
                ];
            })->toArray();

            $response = Http::timeout(300) // Bulk indexing can take longer
                ->connectTimeout(10)
                ->post("{$this->baseUrl}/chat/index-bulk", [
                    'documents' => $documents,
                ]);

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'error' => $response->json('detail', 'Indexing failed'),
                'indexed_count' => 0,
            ];
        } catch (ConnectionException $e) {
            Log::error('Chat index connection failed: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Tidak dapat terhubung ke layanan chatbot.',
                'indexed_count' => 0,
            ];
        } catch (\Exception $e) {
            Log::error('Chat index error: ' . $e->getMessage());
            return [
                'success' => false,
                'error' => $e->getMessage(),
                'indexed_count' => 0,
            ];
        }
    }

    /**
     * Get RAG chatbot status.
     */
    public function getStatus(): array
    {
        try {
            $response = Http::timeout(10)
                ->connectTimeout(5)
                ->get("{$this->baseUrl}/chat/status");

            if ($response->successful()) {
                return $response->json();
            }

            return ['success' => false, 'error' => 'Status check failed'];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => 'Layanan chatbot tidak dapat dijangkau.',
                'embedding_loaded' => false,
                'gemini_available' => false,
                'documents_indexed' => 0,
            ];
        }
    }
}
