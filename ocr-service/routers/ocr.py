"""
OCR Router - Handles text extraction endpoints.
"""

import io
import logging
import os
from typing import Optional
from fastapi import APIRouter, File, Query, UploadFile, HTTPException
from PIL import Image
from services.preprocessor import ImagePreprocessor
from services.engine_factory import get_engine, get_default_engine_name, list_available_engines, VALID_ENGINES
from services.text_cleaner import TextCleaner

logger = logging.getLogger(__name__)

router = APIRouter()

preprocessor = ImagePreprocessor()
text_cleaner = TextCleaner()

# Supported image extensions
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".tif", ".tiff", ".bmp"}


def convert_pdf_to_images(file_bytes: bytes, dpi: int = 300) -> list[Image.Image]:
    """Convert PDF bytes to PIL Images without requiring Poppler."""
    try:
        import pypdfium2 as pdfium
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="pypdfium2 library not installed. Run: pip install -r ocr-service/requirements.txt",
        )

    pdf = None
    try:
        pdf = pdfium.PdfDocument(file_bytes)
        scale = dpi / 72
        images: list[Image.Image] = []

        for page_index in range(len(pdf)):
            page = pdf[page_index]
            bitmap = None
            try:
                bitmap = page.render(scale=scale)
                images.append(bitmap.to_pil().convert("RGB"))
            finally:
                if bitmap is not None:
                    bitmap.close()
                page.close()

        return images
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Failed to convert PDF: {str(e)}",
        )
    finally:
        if pdf is not None:
            pdf.close()


@router.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    engine: Optional[str] = Query(
        default=None,
        description="OCR engine to use: 'tesseract'. Defaults to server config.",
    ),
):
    """
    Extract text from an uploaded document (image or PDF).

    Args:
        file: Uploaded file (image or PDF)
        engine: OCR engine to use ('tesseract'). Optional.

    Returns:
        JSON with extracted text, confidence, metadata, and engine used
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    # Validate engine parameter
    engine_name = engine or get_default_engine_name()
    if engine_name not in VALID_ENGINES:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown engine '{engine_name}'. Valid options: {', '.join(VALID_ENGINES)}",
        )

    # Get the requested engine
    try:
        ocr_engine = get_engine(engine_name)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

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
            "engine_used": engine_name,
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
        "default_engine": get_default_engine_name(),
        "engines": list_available_engines(),
        "supported_extensions": list(IMAGE_EXTENSIONS) + [".pdf"],
    }
