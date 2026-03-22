"""
Chat Router - API endpoints for RAG chatbot.
Provides: ask questions, index documents, system status.
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter()


# === Request/Response Models ===


class AskRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000, description="User question")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of documents to retrieve")


class AskResponse(BaseModel):
    success: bool
    answer: str
    sources: list[dict] = []
    error: Optional[str] = None


class IndexDocumentRequest(BaseModel):
    id: str
    text: str
    metadata: Optional[dict] = None


class IndexBulkRequest(BaseModel):
    documents: list[dict] = Field(..., description="List of {id, text, metadata}")


# === Endpoints ===


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest):
    """
    Ask a question about archive documents.
    Returns an AI-generated answer with source references.
    """
    from services.rag_service import get_rag_service

    try:
        result = get_rag_service().ask(query=request.query, top_k=request.top_k)
        return result
    except Exception as e:
        logger.error("Chat ask error: %s", e)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/index")
async def index_document(request: IndexDocumentRequest):
    """Index a single document into the vector store."""
    from services.rag_service import get_rag_service

    result = get_rag_service().index_document(
        doc_id=request.id,
        text=request.text,
        metadata=request.metadata,
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error"))
    return result


@router.post("/index-bulk")
async def index_bulk(request: IndexBulkRequest):
    """
    Bulk index multiple documents.
    Expects: {"documents": [{"id": "1", "text": "...", "metadata": {...}}, ...]}
    """
    from services.rag_service import get_rag_service

    result = get_rag_service().index_bulk(request.documents)
    return result


@router.get("/status")
async def rag_status():
    """Get RAG system status: model loaded, documents indexed, etc."""
    from services.rag_service import get_rag_service

    try:
        status = get_rag_service().get_status()
        return {"success": True, **status}
    except Exception as e:
        logger.error("RAG status check error: %s", e)
        return {
            "success": False,
            "error": str(e),
            "embedding_loaded": False,
            "gemini_available": False,
            "documents_indexed": 0,
        }
