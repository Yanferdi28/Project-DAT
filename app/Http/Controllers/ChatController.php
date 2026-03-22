<?php

namespace App\Http\Controllers;

use App\Services\ChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    protected ChatService $chatService;

    public function __construct(ChatService $chatService)
    {
        $this->chatService = $chatService;
    }

    /**
     * Ask a question to the RAG chatbot.
     */
    public function ask(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'required|string|min:2|max:1000',
            'top_k' => 'nullable|integer|min:1|max:20',
        ]);

        $result = $this->chatService->ask(
            query: $request->input('query'),
            topK: $request->input('top_k'),
        );

        return response()->json($result);
    }

    /**
     * Index all arsip documents with OCR text into vector store.
     */
    public function indexAll(): JsonResponse
    {
        $result = $this->chatService->indexAll();

        return response()->json($result);
    }

    /**
     * Get RAG chatbot status.
     */
    public function status(): JsonResponse
    {
        $result = $this->chatService->getStatus();

        return response()->json($result);
    }
}
