"""
OCR Microservice for Project-DAT
Provides OCR text extraction and document classification endpoints.
"""

import logging
import os
from contextlib import asynccontextmanager
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


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: preload OCR engines at startup."""
    from services.engine_factory import preload_all

    gpu = os.environ.get("OCR_EASYOCR_GPU", "true").lower() in ("true", "1", "yes")
    lang = os.environ.get("OCR_LANG", "ind+eng")

    logger.info("Pre-loading OCR engines (lang=%s, gpu=%s) ...", lang, gpu)
    preload_all(lang=lang, gpu=gpu)
    logger.info("OCR engines ready.")

    yield  # Application runs here

    logger.info("Shutting down OCR service.")


app = FastAPI(
    title="Project-DAT OCR Service",
    description="OCR text extraction and AI document classification service",
    version="1.1.0",
    lifespan=lifespan,
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
    return {"status": "ok", "service": "Project-DAT OCR Service", "version": "1.1.0"}


@app.get("/health")
async def health_check():
    """Health check endpoint for Laravel to verify service is running."""
    import shutil
    from services.easyocr_engine import EasyOcrEngine
    from services.engine_factory import get_default_engine_name

    tesseract_path = shutil.which("tesseract")
    return {
        "status": "healthy",
        "default_engine": get_default_engine_name(),
        "engines": {
            "tesseract": {
                "available": tesseract_path is not None,
                "path": tesseract_path,
            },
            "easyocr": {
                "available": EasyOcrEngine.is_available(),
                "version": EasyOcrEngine.get_version(),
                "gpu_enabled": os.environ.get("OCR_EASYOCR_GPU", "true").lower()
                in ("true", "1", "yes"),
            },
        },
    }
