"""
OCR Router - Handles text extraction endpoints.
"""

import glob
import io
import logging
import os
import tempfile
from fastapi import APIRouter, File, UploadFile, HTTPException
from PIL import Image
from services.preprocessor import ImagePreprocessor
from services.ocr_engine import OcrEngine
from services.text_cleaner import TextCleaner

logger = logging.getLogger(__name__)

router = APIRouter()

preprocessor = ImagePreprocessor()
ocr_engine = OcrEngine(lang="ind+eng")
text_cleaner = TextCleaner()

# Supported image extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff", ".bmp"}


def _find_poppler_path() -> str | None:
    """Find poppler binary path on Windows via environment or common locations."""
    env_path = os.environ.get("POPPLER_PATH")
    if env_path and os.path.isdir(env_path):
        return env_path

    # Search common install locations with glob to avoid version-specific paths
    search_patterns = [
        r"C:\poppler\poppler-*\Library\bin",
        r"C:\poppler\poppler-*\bin",
        r"C:\Program Files\poppler*\bin",
        r"C:\Program Files\poppler*\Library\bin",
    ]
    for pattern in search_patterns:
        matches = sorted(glob.glob(pattern), reverse=True)
        if matches:
            return matches[0]

    return None


def convert_pdf_to_images(file_bytes: bytes) -> list:
    """Convert PDF bytes to list of PIL Images."""
    try:
        from pdf2image import convert_from_bytes
        import platform

        kwargs = {"dpi": 300}

        # On Windows, specify poppler path if not in PATH
        if platform.system() == "Windows":
            poppler_path = _find_poppler_path()
            if poppler_path:
                kwargs["poppler_path"] = poppler_path

        images = convert_from_bytes(file_bytes, **kwargs)
        return images
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pdf2image library not installed. Install poppler and pdf2image.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to convert PDF: {str(e)}",
        )


@router.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from an uploaded document (image or PDF).

    Args:
        file: Uploaded file (image or PDF)

    Returns:
        JSON with extracted text, confidence, and metadata
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    extension = os.path.splitext(file.filename)[1].lower()

    # Read file content
    content = await file.read()

    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        all_text = []
        all_confidences = []
        total_words = 0

        if extension == ".pdf":
            # Convert PDF pages to images
            images = convert_pdf_to_images(content)

            for i, img in enumerate(images):
                # Preprocess
                processed = preprocessor.process(img)

                # OCR
                result = ocr_engine.extract_text(processed)

                if result["text"]:
                    all_text.append(f"--- Halaman {i + 1} ---\n{result['text']}")
                    all_confidences.append(result["confidence"])
                    total_words += result["word_count"]

        elif extension in IMAGE_EXTENSIONS:
            # Open image
            img = Image.open(io.BytesIO(content))

            # Preprocess
            processed = preprocessor.process(img)

            # OCR
            result = ocr_engine.extract_text(processed)

            if result["text"]:
                all_text.append(result["text"])
                all_confidences.append(result["confidence"])
                total_words += result["word_count"]

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {extension}. Supported: PDF, JPG, PNG, GIF, WEBP, TIF",
            )

        # Combine text from all pages
        combined_text = "\n\n".join(all_text)

        # Clean the combined text
        cleaned_text = text_cleaner.clean(combined_text)

        # Average confidence across all pages
        avg_confidence = (
            sum(all_confidences) / len(all_confidences)
            if all_confidences
            else 0.0
        )

        return {
            "success": True,
            "text": cleaned_text,
            "confidence": round(avg_confidence, 2),
            "word_count": total_words,
            "pages_processed": len(all_text),
            "filename": file.filename,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(e)}",
        )


@router.get("/info")
async def ocr_info():
    """Get OCR engine information."""
    return {
        "tesseract_version": OcrEngine.get_tesseract_version(),
        "available_languages": OcrEngine.get_available_languages(),
        "supported_extensions": list(IMAGE_EXTENSIONS) + [".pdf"],
    }
