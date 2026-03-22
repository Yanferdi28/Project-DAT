"""
RAG Service - Retrieval-Augmented Generation for archive document search.
Orchestrates: embed query → search vectors → call Gemini → format response.
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
RAG_TOP_K = int(os.environ.get("RAG_TOP_K", "5"))
RAG_MAX_CONTEXT_LENGTH = int(os.environ.get("RAG_MAX_CONTEXT_LENGTH", "3000"))

SYSTEM_PROMPT = """Kamu adalah asisten AI untuk Sistem Arsip Digital (DAT) milik RRI Banjarmasin.
Tugasmu adalah membantu pengguna mencari dan memahami dokumen arsip berdasarkan konteks yang diberikan.

ATURAN:
1. Jawab HANYA berdasarkan dokumen yang diberikan dalam konteks. Jangan mengarang informasi.
2. Jika tidak ada dokumen yang relevan, katakan bahwa tidak ditemukan arsip yang sesuai.
3. Jawab dalam Bahasa Indonesia yang baik dan formal.
4. Sebutkan arsip mana yang menjadi sumber informasi (gunakan indeks atau uraian arsip).
5. Jika pertanyaan tidak terkait arsip, arahkan pengguna untuk bertanya tentang dokumen arsip.
6. Berikan jawaban yang ringkas dan informatif."""


class RAGService:
    """Orchestrates RAG pipeline: retrieve relevant docs → generate answer with Gemini."""

    def __init__(self):
        self._genai_client = None
        self._genai_available = False
        self._init_genai()

    def _init_genai(self):
        """Initialize Google Generative AI client."""
        if not GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY not set. RAG will work in search-only mode.")
            return

        try:
            from google import genai

            self._genai_client = genai.Client(api_key=GEMINI_API_KEY)
            self._genai_available = True
            logger.info("Gemini AI client initialized successfully.")
        except Exception as e:
            logger.error("Failed to initialize Gemini client: %s", e)
            self._genai_available = False

    def ask(self, query: str, top_k: int = RAG_TOP_K) -> dict:
        """
        Answer a question using RAG pipeline.

        Args:
            query: User's question in natural language
            top_k: Number of documents to retrieve

        Returns:
            dict with: answer, sources, query
        """
        from services.embedding_service import get_embedding_service
        from services.vector_store import get_vector_store

        embedding_service = get_embedding_service()
        vector_store = get_vector_store()

        # Step 1: Embed the query
        try:
            query_embedding = embedding_service.embed_text(query)
        except Exception as e:
            logger.error("Failed to embed query: %s", e)
            return {
                "success": False,
                "answer": "Maaf, terjadi kesalahan saat memproses pertanyaan Anda.",
                "sources": [],
                "error": str(e),
            }

        # Step 2: Search for relevant documents
        search_results = vector_store.search(query_embedding, top_k=top_k)

        if not search_results:
            return {
                "success": True,
                "answer": "Belum ada dokumen arsip yang terindeks. Silakan lakukan indexing terlebih dahulu melalui menu pengaturan.",
                "sources": [],
            }

        # Step 3: Build context from search results
        context = self._build_context(search_results)
        sources = self._format_sources(search_results)

        # Step 4: Generate answer with Gemini (or fallback to search-only)
        if self._genai_available:
            answer = self._generate_answer(query, context, search_results)
        else:
            answer = self._fallback_answer(query, search_results)

        return {
            "success": True,
            "answer": answer,
            "sources": sources,
        }

    def _build_context(self, search_results: list[dict]) -> str:
        """Build context string from search results for Gemini prompt."""
        context_parts = []
        total_length = 0

        for i, result in enumerate(search_results):
            metadata = result.get("metadata", {})
            indeks = metadata.get("indeks", "N/A")
            uraian = metadata.get("uraian_informasi", "")
            tanggal = metadata.get("tanggal", "")
            kategori = metadata.get("kategori", "")
            text = result.get("text", "")

            header = f"[Dokumen {i + 1}] Indeks: {indeks}"
            if uraian:
                header += f" | Uraian: {uraian}"
            if tanggal:
                header += f" | Tanggal: {tanggal}"
            if kategori:
                header += f" | Kategori: {kategori}"

            # Truncate text to fit context limit
            max_text_len = (RAG_MAX_CONTEXT_LENGTH - total_length) // max(
                1, len(search_results) - i
            )
            truncated_text = text[:max_text_len] if len(text) > max_text_len else text

            part = f"{header}\n{truncated_text}"
            context_parts.append(part)
            total_length += len(part)

            if total_length >= RAG_MAX_CONTEXT_LENGTH:
                break

        return "\n\n---\n\n".join(context_parts)

    def _generate_answer(self, query: str, context: str, search_results: list[dict]) -> str:
        """Generate an answer using Gemini API with model fallback."""
        # Models to try in order of preference
        models_to_try = [
            "gemini-3.1-flash-lite",
            "gemini-2.0-flash-lite",
            "gemini-2.0-flash",
        ]

        prompt = f"""{SYSTEM_PROMPT}

KONTEKS DOKUMEN ARSIP:
{context}

PERTANYAAN PENGGUNA:
{query}

JAWABAN:"""

        for model_name in models_to_try:
            try:
                logger.info("Trying Gemini model: %s", model_name)
                response = self._genai_client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )

                if response.text:
                    logger.info("Success with model: %s", model_name)
                    return response.text.strip()

            except Exception as e:
                error_str = str(e)
                logger.warning("Model %s failed: %s", model_name, error_str[:200])

                # If quota exhausted, try next model
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    continue
                # For other errors, also try next model
                continue

        # All models failed — use fallback
        logger.error("All Gemini models failed. Using fallback answer.")
        return self._fallback_answer(query, search_results)

    def _fallback_answer(self, query: str, search_results: list[dict]) -> str:
        """Fallback answer when Gemini is not available — just list search results."""
        if not search_results:
            return "Tidak ditemukan dokumen arsip yang relevan dengan pencarian Anda."

        lines = [f"Ditemukan {len(search_results)} dokumen arsip yang relevan:\n"]
        for i, result in enumerate(search_results):
            metadata = result.get("metadata", {})
            indeks = metadata.get("indeks", "N/A")
            uraian = metadata.get("uraian_informasi", "-")
            tanggal = metadata.get("tanggal", "")
            similarity = result.get("similarity", 0)
            similarity_pct = round(similarity * 100, 1)

            line = f"{i + 1}. **{indeks}** — {uraian}"
            if tanggal:
                line += f" ({tanggal})"
            line += f" [Relevansi: {similarity_pct}%]"
            lines.append(line)

        lines.append(
            "\n_Catatan: Jawaban AI tidak tersedia. Silakan periksa konfigurasi GEMINI_API_KEY._"
        )
        return "\n".join(lines)

    def _format_sources(self, search_results: list[dict]) -> list[dict]:
        """Format search results as source references."""
        sources = []
        for result in search_results:
            metadata = result.get("metadata", {})
            sources.append({
                "arsip_id": result.get("id"),
                "indeks": metadata.get("indeks", "N/A"),
                "uraian_informasi": metadata.get("uraian_informasi", ""),
                "tanggal": metadata.get("tanggal", ""),
                "kategori": metadata.get("kategori", ""),
                "unit_pengolah": metadata.get("unit_pengolah", ""),
                "similarity": result.get("similarity", 0),
            })
        return sources

    def index_document(
        self,
        doc_id: str,
        text: str,
        metadata: Optional[dict] = None,
    ) -> dict:
        """Index a single document into the vector store."""
        from services.embedding_service import get_embedding_service
        from services.vector_store import get_vector_store

        if not text or len(text.strip()) < 10:
            return {"success": False, "error": "Text too short to index"}

        try:
            embedding = get_embedding_service().embed_text(text)
            get_vector_store().add_document(doc_id, embedding, text, metadata)
            return {"success": True, "doc_id": doc_id}
        except Exception as e:
            logger.error("Failed to index document %s: %s", doc_id, e)
            return {"success": False, "error": str(e)}

    def index_bulk(self, documents: list[dict]) -> dict:
        """
        Bulk index multiple documents.

        Args:
            documents: List of dicts with: id, text, metadata

        Returns:
            dict with: success, indexed_count, failed_count, errors
        """
        from services.embedding_service import get_embedding_service
        from services.vector_store import get_vector_store

        if not documents:
            return {"success": True, "indexed_count": 0, "failed_count": 0}

        # Filter valid documents
        valid_docs = [d for d in documents if d.get("text") and len(d["text"].strip()) >= 10]
        if not valid_docs:
            return {"success": False, "error": "No valid documents to index", "indexed_count": 0}

        try:
            texts = [d["text"] for d in valid_docs]
            doc_ids = [str(d["id"]) for d in valid_docs]
            metadatas = [d.get("metadata", {}) for d in valid_docs]

            # Batch embed
            logger.info("Embedding %d documents...", len(texts))
            embeddings = get_embedding_service().embed_batch(texts)

            # Batch insert
            logger.info("Inserting %d documents into vector store...", len(doc_ids))
            get_vector_store().add_batch(doc_ids, embeddings, texts, metadatas)

            return {
                "success": True,
                "indexed_count": len(valid_docs),
                "skipped_count": len(documents) - len(valid_docs),
            }
        except Exception as e:
            logger.error("Bulk indexing failed: %s", e)
            return {"success": False, "error": str(e), "indexed_count": 0}

    def get_status(self) -> dict:
        """Get RAG system status."""
        from services.embedding_service import get_embedding_service
        from services.vector_store import get_vector_store

        embedding_service = get_embedding_service()

        return {
            "embedding_model": embedding_service.model_name,
            "embedding_loaded": embedding_service.is_loaded,
            "gemini_available": self._genai_available,
            "documents_indexed": get_vector_store().get_count(),
            "top_k": RAG_TOP_K,
            "max_context_length": RAG_MAX_CONTEXT_LENGTH,
        }


# Singleton
_rag_service: Optional[RAGService] = None


def get_rag_service() -> RAGService:
    global _rag_service
    if _rag_service is None:
        _rag_service = RAGService()
    return _rag_service
