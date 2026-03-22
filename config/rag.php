<?php

return [

    /*
    |--------------------------------------------------------------------------
    | RAG Chatbot Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the AI chatbot that uses Retrieval-Augmented Generation
    | to answer questions about archive documents.
    |
    */

    // Enable/disable RAG chatbot feature
    'enabled' => env('RAG_ENABLED', true),

    // Gemini API key for AI answer generation
    'gemini_api_key' => env('GEMINI_API_KEY', ''),

    // Number of documents to retrieve for context
    'top_k' => env('RAG_TOP_K', 5),

    // Maximum context length sent to LLM
    'max_context_length' => env('RAG_MAX_CONTEXT_LENGTH', 3000),

    // Embedding model name
    'embedding_model' => env('RAG_EMBEDDING_MODEL', 'paraphrase-multilingual-MiniLM-L12-v2'),

    // Request timeout for RAG operations (seconds) - higher because embedding can be slow
    'timeout' => env('RAG_TIMEOUT', 60),

];
