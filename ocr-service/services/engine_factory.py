"""OCR engine factory supporting Tesseract, EasyOCR, and PaddleOCR."""

import logging
import os
from typing import Optional

logger = logging.getLogger(__name__)

VALID_ENGINES = ("tesseract", "easyocr", "paddleocr")

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


def get_engine(name: Optional[str] = None, lang: str = "ind+eng", gpu: Optional[bool] = False):
    """
<<<<<<< Updated upstream
    Return an OCR engine instance (tesseract, easyocr, paddleocr).
=======
    Return an OCR engine instance by name ('tesseract', 'easyocr', 'paddleocr').
>>>>>>> Stashed changes
    """
    if name is None:
        name = get_default_engine_name()

    name = name.lower().strip()

    if name not in VALID_ENGINES:
        raise ValueError(
            f"Unknown OCR engine '{name}'. Valid options: {', '.join(VALID_ENGINES)}"
        )

    cache_key = f"{name}_{lang}_{bool(gpu)}"
    if cache_key in _engine_cache:
        return _engine_cache[cache_key]

<<<<<<< Updated upstream
    from services.ocr_engine import OcrEngine, EasyOcrEngine, PaddleOcrEngine

    if name == "tesseract":
        engine = OcrEngine(lang=lang)
    elif name == "easyocr":
        easy_langs = ["en"]
        engine = EasyOcrEngine(lang=easy_langs, gpu=bool(gpu))
    elif name == "paddleocr":
        paddle_lang = "id" if ("ind" in lang or "id" in lang) else "en"
        engine = PaddleOcrEngine(lang=paddle_lang, gpu=bool(gpu))
    else:
        raise ValueError(f"Engine '{name}' is not supported.")

    _engine_cache[cache_key] = engine
    logger.info("Engine '%s' initialised (lang=%s).", name, lang)
=======
    if name == "tesseract":
        from services.ocr_engine import OcrEngine
        engine = OcrEngine(lang=lang)
    elif name == "easyocr":
        from services.ocr_engine import EasyOcrEngine
        use_gpu = gpu if gpu is not None else False
        engine = EasyOcrEngine(lang=["en"], gpu=use_gpu)
    elif name == "paddleocr":
        from services.ocr_engine import PaddleOcrEngine
        use_gpu = gpu if gpu is not None else False
        engine = PaddleOcrEngine(lang="en", gpu=use_gpu)
    else:
        raise ValueError(f"Engine '{name}' is not implemented.")

    _engine_cache[name] = engine
    logger.info("OCR engine '%s' initialised.", name)
>>>>>>> Stashed changes
    return engine


def preload_all(lang: str = "ind+eng", gpu: bool = False, paddle_gpu: bool = False):
<<<<<<< Updated upstream
    """Pre-load default Tesseract engine at startup."""
    try:
        get_engine("tesseract", lang=lang)
    except Exception as exc:
        logger.warning("Could not preload Tesseract: %s", exc)
=======
    """Pre-load OCR engines at startup."""
    for eng in ("tesseract", "easyocr", "paddleocr"):
        try:
            get_engine(eng, lang=lang)
        except Exception as exc:
            logger.warning("Could not preload OCR engine '%s': %s", eng, exc)
>>>>>>> Stashed changes


def list_available_engines() -> list[dict]:
    """Return metadata about supported OCR engines."""
<<<<<<< Updated upstream
    results = []

    # 1. Tesseract
    try:
        from services.ocr_engine import OcrEngine
        version = OcrEngine.get_tesseract_version()
        languages = OcrEngine.get_available_languages()
        results.append({
            "name": "tesseract",
            "available": bool(version or languages),
            "version": version,
            "languages": languages,
        })
    except Exception:
        results.append({"name": "tesseract", "available": False})

    # 2. EasyOCR
    try:
        import easyocr
        results.append({
            "name": "easyocr",
            "available": True,
            "version": getattr(easyocr, "__version__", "installed"),
            "languages": ["id", "en"],
        })
    except Exception:
        results.append({"name": "easyocr", "available": False})

    # 3. PaddleOCR
    try:
        import paddleocr
        results.append({
            "name": "paddleocr",
            "available": True,
            "version": getattr(paddleocr, "__version__", "installed"),
            "languages": ["id", "en"],
        })
    except Exception:
        results.append({"name": "paddleocr", "available": False})

    return results
=======
    result = []
    for eng in VALID_ENGINES:
        try:
            get_engine(eng)
            result.append({"name": eng, "available": True})
        except Exception as exc:
            result.append({"name": eng, "available": False, "error": str(exc)})
    return result
>>>>>>> Stashed changes

