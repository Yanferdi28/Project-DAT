"""
Embedding Service - Converts text to vector embeddings using sentence-transformers.
Uses a multilingual model for Indonesian language support.
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# Default model - good balance of speed and quality for multilingual text
DEFAULT_MODEL = os.environ.get(
    "RAG_EMBEDDING_MODEL", "paraphrase-multilingual-MiniLM-L12-v2"
)


class EmbeddingService:
    """Converts text to vector embeddings for semantic search."""

    def __init__(self, model_name: str = DEFAULT_MODEL):
        self.model_name = model_name
        self._model = None
        self._dimension: Optional[int] = None

    @property
    def model(self):
        """Lazy load the embedding model (downloads on first use)."""
        if self._model is None:
            logger.info("Loading embedding model: %s ...", self.model_name)
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(self.model_name)
                self._dimension = self._model.get_sentence_embedding_dimension()
                logger.info(
                    "Embedding model loaded. Dimension: %d", self._dimension
                )
            except Exception as e:
                logger.error("Failed to load embedding model: %s", e)
                raise
        return self._model

    @property
    def dimension(self) -> int:
        """Get the embedding vector dimension."""
        if self._dimension is None:
            _ = self.model  # Trigger lazy load
        return self._dimension

    @property
    def is_loaded(self) -> bool:
        return self._model is not None

    def embed_text(self, text: str) -> list[float]:
        """
        Convert a single text to an embedding vector.

        Args:
            text: Input text to embed

        Returns:
            List of floats representing the embedding vector
        """
        if not text or not text.strip():
            raise ValueError("Text cannot be empty")

        # Truncate very long texts (model has max token limit)
        truncated = text[:2000] if len(text) > 2000 else text
        embedding = self.model.encode(truncated, show_progress_bar=False)
        return embedding.tolist()

    def embed_batch(self, texts: list[str], batch_size: int = 32) -> list[list[float]]:
        """
        Convert multiple texts to embedding vectors.

        Args:
            texts: List of input texts
            batch_size: Batch size for encoding

        Returns:
            List of embedding vectors
        """
        if not texts:
            return []

        # Truncate long texts
        truncated = [t[:2000] if len(t) > 2000 else t for t in texts]
        embeddings = self.model.encode(
            truncated, batch_size=batch_size, show_progress_bar=True
        )
        return embeddings.tolist()


# Singleton instance
_embedding_service: Optional[EmbeddingService] = None


def get_embedding_service() -> EmbeddingService:
    """Get or create the singleton EmbeddingService instance."""
    global _embedding_service
    if _embedding_service is None:
        _embedding_service = EmbeddingService()
    return _embedding_service
