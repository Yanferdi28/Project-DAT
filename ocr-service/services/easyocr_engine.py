"""
EasyOCR Engine Wrapper
Handles text extraction using EasyOCR with GPU support.
"""

import logging
import numpy as np
from PIL import Image
from typing import Optional

logger = logging.getLogger(__name__)

# Singleton reader instance — loaded once and reused across requests.
_reader_instance = None
_reader_langs = None


def _get_reader(langs: list[str], gpu: bool = True):
    """
    Return a cached EasyOCR Reader, creating it on first call.

    Args:
        langs: List of language codes (e.g., ['id', 'en'])
        gpu:   Whether to use CUDA GPU acceleration
    """
    global _reader_instance, _reader_langs

    if _reader_instance is not None and _reader_langs == langs:
        return _reader_instance

    import easyocr

    logger.info("Initializing EasyOCR Reader (langs=%s, gpu=%s) ...", langs, gpu)
    _reader_instance = easyocr.Reader(langs, gpu=gpu, verbose=False)
    _reader_langs = langs
    logger.info("EasyOCR Reader initialized successfully.")
    return _reader_instance


class EasyOcrEngine:
    """Wrapper around EasyOCR for text extraction."""

    # Map common Tesseract language codes to EasyOCR codes
    LANG_MAP = {
        "ind": "id",
        "eng": "en",
        "jpn": "ja",
        "kor": "ko",
        "chi_sim": "ch_sim",
        "chi_tra": "ch_tra",
    }

    def __init__(self, lang: str = "id+en", gpu: bool = True):
        """
        Initialize EasyOCR engine.

        Args:
            lang: Language codes separated by '+' (e.g., 'id+en').
                  Accepts both EasyOCR codes ('id') and Tesseract codes ('ind').
            gpu:  Enable CUDA GPU acceleration (default: True)
        """
        self.gpu = gpu
        self.langs = self._parse_langs(lang)
        self._reader: Optional[object] = None

    def _parse_langs(self, lang: str) -> list[str]:
        """Parse language string and convert Tesseract codes to EasyOCR codes."""
        raw = [l.strip() for l in lang.split("+") if l.strip()]
        parsed = []
        for code in raw:
            mapped = self.LANG_MAP.get(code, code)
            if mapped not in parsed:
                parsed.append(mapped)
        return parsed if parsed else ["id", "en"]

    def preload(self):
        """
        Pre-load the EasyOCR model into memory.
        Call this at application startup to avoid cold-start latency.
        """
        self._reader = _get_reader(self.langs, self.gpu)

    @property
    def reader(self):
        """Lazy-initialise reader if not already loaded."""
        if self._reader is None:
            self._reader = _get_reader(self.langs, self.gpu)
        return self._reader

    def extract_text(self, image: Image.Image) -> dict:
        """
        Extract text from a preprocessed image.

        Args:
            image: PIL Image (should be preprocessed)

        Returns:
            dict with 'text', 'confidence', and 'word_count'
        """
        # Convert PIL Image to numpy array (EasyOCR accepts numpy arrays)
        img_array = np.array(image)

        # Run EasyOCR detection + recognition
        results = self.reader.readtext(img_array, detail=1, paragraph=False)

        # results is a list of (bbox, text, confidence)
        texts = []
        confidences = []

        for bbox, text, conf in results:
            if text and text.strip():
                texts.append(text.strip())
                confidences.append(conf * 100)  # Convert 0-1 to 0-100

        # Build full text from detected lines
        full_text = self._build_text(results)

        avg_confidence = (
            sum(confidences) / len(confidences) if confidences else 0.0
        )

        # Clean up the text
        full_text = self._clean_text(full_text)

        return {
            "text": full_text,
            "confidence": round(avg_confidence, 2),
            "word_count": len(confidences),
        }

    def _build_text(self, results: list) -> str:
        """
        Build structured text from EasyOCR results, attempting to preserve
        line ordering based on vertical (y) position of bounding boxes.
        """
        if not results:
            return ""

        # Sort by top-left y coordinate, then x coordinate
        sorted_results = sorted(results, key=lambda r: (r[0][0][1], r[0][0][0]))

        lines = []
        current_line_parts = []
        prev_y = None
        line_height_threshold = 15  # pixels — group boxes within this y-range

        for bbox, text, conf in sorted_results:
            if not text or not text.strip():
                continue

            top_y = bbox[0][1]  # top-left y

            if prev_y is not None and abs(top_y - prev_y) > line_height_threshold:
                # New line detected
                lines.append(" ".join(current_line_parts))
                current_line_parts = []

            current_line_parts.append(text.strip())
            prev_y = top_y

        # Don't forget the last line
        if current_line_parts:
            lines.append(" ".join(current_line_parts))

        return "\n".join(lines)

    def _clean_text(self, text: str) -> str:
        """Clean OCR output text."""
        import re

        if not text:
            return ""

        # Remove excessive whitespace
        text = re.sub(r"[ \t]+", " ", text)

        # Remove excessive newlines (more than 2)
        text = re.sub(r"\n{3,}", "\n\n", text)

        # Remove leading/trailing whitespace per line
        lines = [line.strip() for line in text.split("\n")]
        text = "\n".join(lines)

        # Remove leading/trailing whitespace of entire text
        text = text.strip()

        return text

    @staticmethod
    def is_available() -> bool:
        """Check if EasyOCR is installed and importable."""
        try:
            import easyocr  # noqa: F401
            return True
        except ImportError:
            return False

    @staticmethod
    def get_version() -> Optional[str]:
        """Get installed EasyOCR version."""
        try:
            import easyocr
            return getattr(easyocr, "__version__", "unknown")
        except ImportError:
            return None
