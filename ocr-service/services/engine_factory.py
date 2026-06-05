"""OCR engine factory for the Tesseract-only runtime."""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

VALID_ENGINES = ("tesseract",)

_engine_cache: dict = {}


def get_default_engine_name() -> str:
    """Return the configured engine name, falling back to Tesseract."""
    name = os.environ.get("OCR_DEFAULT_ENGINE") or os.environ.get("OCR_ENGINE", "tesseract")
    name = name.lower().strip()

    if name not in VALID_ENGINES:
        logger.warning(
            "Unsupported OCR engine '%s'; using 'tesseract'.",
            name,
        )
        return "tesseract"

    return name


def get_engine(name: Optional[str] = None, lang: str = "ind+eng", gpu: Optional[bool] = None):
    """
    Return a Tesseract OCR engine instance.

    The gpu argument is kept for backwards-compatible callers and ignored.
    """
    if name is None:
        name = get_default_engine_name()

    name = name.lower().strip()

    if name not in VALID_ENGINES:
        raise ValueError(
            f"Unknown OCR engine '{name}'. Valid options: {', '.join(VALID_ENGINES)}"
        )

    if name in _engine_cache:
        return _engine_cache[name]

    from services.ocr_engine import OcrEngine

    engine = OcrEngine(lang=lang)
    _engine_cache[name] = engine
    logger.info("Tesseract engine initialised (lang=%s).", lang)
    return engine


def preload_all(lang: str = "ind+eng", gpu: bool = True, paddle_gpu: bool = False):
    """Pre-load the Tesseract engine at startup."""
    try:
        get_engine("tesseract", lang=lang)
    except Exception as exc:
        logger.warning("Could not preload Tesseract: %s", exc)


def list_available_engines() -> list[dict]:
    """Return metadata about the supported OCR engine."""
    try:
        from services.ocr_engine import OcrEngine

        OcrEngine()
        languages = OcrEngine.get_available_languages()
        version = OcrEngine.get_tesseract_version()

        return [{
            "name": "tesseract",
            "available": bool(version or languages),
            "version": version,
            "languages": languages,
        }]
    except Exception:
        return [{"name": "tesseract", "available": False}]
