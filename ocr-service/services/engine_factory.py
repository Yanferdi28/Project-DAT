"""
OCR Engine Factory
Dynamically selects and caches OCR engine instances (Tesseract / EasyOCR).
"""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

# Valid engine identifiers
VALID_ENGINES = ("tesseract", "easyocr")

# Cached engine instances (singleton per engine type)
_engine_cache: dict = {}


def get_default_engine_name() -> str:
    """Return the default engine name from environment, falling back to 'tesseract'."""
    name = os.environ.get("OCR_DEFAULT_ENGINE", "tesseract").lower().strip()
    if name not in VALID_ENGINES:
        logger.warning(
            "Unknown OCR_DEFAULT_ENGINE '%s', falling back to 'tesseract'.", name
        )
        return "tesseract"
    return name


def get_engine(name: Optional[str] = None, lang: str = "ind+eng", gpu: bool = True):
    """
    Return an OCR engine instance by name.

    Args:
        name: Engine identifier ('tesseract' or 'easyocr'). None → default.
        lang: Language codes (Tesseract-style, e.g. 'ind+eng').
        gpu:  Enable GPU for EasyOCR (ignored for Tesseract).

    Returns:
        An engine object that exposes ``extract_text(image) → dict``.

    Raises:
        ValueError: If the requested engine is unknown or unavailable.
    """
    if name is None:
        name = get_default_engine_name()
    name = name.lower().strip()

    if name not in VALID_ENGINES:
        raise ValueError(
            f"Unknown OCR engine '{name}'. Valid options: {', '.join(VALID_ENGINES)}"
        )

    # Return cached instance if available
    if name in _engine_cache:
        return _engine_cache[name]

    if name == "tesseract":
        from services.ocr_engine import OcrEngine

        engine = OcrEngine(lang=lang)
        _engine_cache[name] = engine
        logger.info("Tesseract engine initialised (lang=%s).", lang)
        return engine

    if name == "easyocr":
        from services.easyocr_engine import EasyOcrEngine

        if not EasyOcrEngine.is_available():
            raise ValueError(
                "EasyOCR is not installed. Run: pip install easyocr"
            )

        engine = EasyOcrEngine(lang=lang, gpu=gpu)
        _engine_cache[name] = engine
        logger.info("EasyOCR engine initialised (lang=%s, gpu=%s).", lang, gpu)
        return engine

    # Should never reach here, but just in case
    raise ValueError(f"Unhandled engine: {name}")


def preload_all(lang: str = "ind+eng", gpu: bool = True):
    """
    Pre-load all available engines at startup.
    Silently skips engines that are not installed.
    """
    # Always load Tesseract (lightweight)
    try:
        get_engine("tesseract", lang=lang)
    except Exception as e:
        logger.warning("Could not preload Tesseract: %s", e)

    # Load EasyOCR (heavier — downloads model on first run)
    try:
        engine = get_engine("easyocr", lang=lang, gpu=gpu)
        engine.preload()
    except Exception as e:
        logger.warning("Could not preload EasyOCR: %s", e)


def list_available_engines() -> list[dict]:
    """Return metadata about every known engine and its availability."""
    engines = []

    # Tesseract
    try:
        from services.ocr_engine import OcrEngine

        engines.append({
            "name": "tesseract",
            "available": True,
            "version": OcrEngine.get_tesseract_version(),
            "languages": OcrEngine.get_available_languages(),
        })
    except Exception:
        engines.append({"name": "tesseract", "available": False})

    # EasyOCR
    try:
        from services.easyocr_engine import EasyOcrEngine

        engines.append({
            "name": "easyocr",
            "available": EasyOcrEngine.is_available(),
            "version": EasyOcrEngine.get_version(),
        })
    except Exception:
        engines.append({"name": "easyocr", "available": False})

    return engines
