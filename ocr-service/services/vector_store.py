"""
Vector Store - ChromaDB wrapper for storing and searching document embeddings.
Persistent storage in ocr-service/chroma_db/ directory.
"""

import logging
import os
from typing import Optional

import chromadb

logger = logging.getLogger(__name__)

# ChromaDB persistent storage path
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db")
COLLECTION_NAME = "arsip_documents"


class VectorStore:
    """Manages document embeddings in ChromaDB for semantic search."""

    def __init__(self, db_path: str = CHROMA_DB_PATH):
        self.db_path = db_path
        os.makedirs(db_path, exist_ok=True)

        logger.info("Initializing ChromaDB at: %s", db_path)
        self._client = chromadb.PersistentClient(path=db_path)
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info(
            "ChromaDB ready. Collection '%s' has %d documents.",
            COLLECTION_NAME,
            self._collection.count(),
        )

    def add_document(
        self,
        doc_id: str,
        embedding: list[float],
        text: str,
        metadata: Optional[dict] = None,
    ) -> None:
        """
        Add or update a single document in the vector store.

        Args:
            doc_id: Unique document identifier (arsip_unit id)
            embedding: Pre-computed embedding vector
            text: Original text (stored for retrieval)
            metadata: Additional metadata (indeks, tanggal, etc.)
        """
        safe_metadata = {}
        if metadata:
            for k, v in metadata.items():
                if v is not None:
                    safe_metadata[k] = str(v)

        # Truncate text for storage (ChromaDB has document size limits)
        stored_text = text[:5000] if len(text) > 5000 else text

        self._collection.upsert(
            ids=[str(doc_id)],
            embeddings=[embedding],
            documents=[stored_text],
            metadatas=[safe_metadata] if safe_metadata else None,
        )

    def add_batch(
        self,
        doc_ids: list[str],
        embeddings: list[list[float]],
        texts: list[str],
        metadatas: Optional[list[dict]] = None,
    ) -> None:
        """Add multiple documents at once."""
        if not doc_ids:
            return

        str_ids = [str(d) for d in doc_ids]
        stored_texts = [t[:5000] if len(t) > 5000 else t for t in texts]

        safe_metadatas = None
        if metadatas:
            safe_metadatas = []
            for m in metadatas:
                safe = {}
                if m:
                    for k, v in m.items():
                        if v is not None:
                            safe[k] = str(v)
                safe_metadatas.append(safe)

        # Process in chunks of 100
        chunk_size = 100
        for i in range(0, len(str_ids), chunk_size):
            end = i + chunk_size
            self._collection.upsert(
                ids=str_ids[i:end],
                embeddings=embeddings[i:end],
                documents=stored_texts[i:end],
                metadatas=safe_metadatas[i:end] if safe_metadatas else None,
            )

    def search(
        self, query_embedding: list[float], top_k: int = 5
    ) -> list[dict]:
        """
        Search for similar documents.

        Args:
            query_embedding: Query vector
            top_k: Number of results to return

        Returns:
            List of dicts with: id, text, metadata, similarity_score
        """
        count = self._collection.count()
        if count == 0:
            return []

        # Ensure top_k does not exceed collection size
        actual_k = min(top_k, count)

        results = self._collection.query(
            query_embeddings=[query_embedding],
            n_results=actual_k,
            include=["documents", "metadatas", "distances"],
        )

        search_results = []
        if results and results["ids"] and results["ids"][0]:
            for i, doc_id in enumerate(results["ids"][0]):
                distance = results["distances"][0][i] if results["distances"] else 0
                # ChromaDB cosine distance: 0 = identical, 2 = opposite
                # Convert to similarity: 1 - (distance / 2)
                similarity = round(1 - (distance / 2), 4)

                search_results.append({
                    "id": doc_id,
                    "text": results["documents"][0][i] if results["documents"] else "",
                    "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                    "similarity": similarity,
                })

        return search_results

    def delete_document(self, doc_id: str) -> None:
        """Delete a document from the vector store."""
        try:
            self._collection.delete(ids=[str(doc_id)])
        except Exception as e:
            logger.warning("Failed to delete document %s: %s", doc_id, e)

    def get_count(self) -> int:
        """Get number of documents in the store."""
        return self._collection.count()

    def reset(self) -> None:
        """Delete all documents from the collection."""
        self._client.delete_collection(COLLECTION_NAME)
        self._collection = self._client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )


# Singleton instance
_vector_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    """Get or create the singleton VectorStore instance."""
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
