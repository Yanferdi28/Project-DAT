"""
OCR Microservice for Project-DAT
Provides OCR text extraction and document classification endpoints.
"""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ocr, classify

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Project-DAT OCR Service",
    description="OCR text extraction and AI document classification service",
    version="1.0.0",
)

# CORS - allow Laravel backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000", "http://127.0.0.1:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ocr.router, prefix="/ocr", tags=["OCR"])
app.include_router(classify.router, prefix="/classify", tags=["Classification"])


@app.get("/")
async def root():
    return {"status": "ok", "service": "Project-DAT OCR Service", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint for Laravel to verify service is running."""
    import shutil

    tesseract_path = shutil.which("tesseract")
    return {
        "status": "healthy",
        "tesseract_available": tesseract_path is not None,
        "tesseract_path": tesseract_path,
    }
