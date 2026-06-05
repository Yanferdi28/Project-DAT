"""
Tesseract OCR Engine Wrapper
Handles text extraction with confidence scoring.
"""

import logging
import pytesseract
from PIL import Image
from typing import Optional
import platform
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class OcrCandidate:
    text: str
    confidence: float
    word_count: int
    config: str


class OcrEngine:
    """Wrapper around pytesseract for OCR text extraction."""

    TESSERACT_CONFIGS = (
        "--psm 6 --oem 3",   # Uniform block of text.
        "--psm 4 --oem 3",   # Single column, variable text sizes.
        "--psm 3 --oem 3",   # Fully automatic page segmentation.
        "--psm 11 --oem 3",  # Sparse text.
    )

    def __init__(self, lang: str = "ind+eng"):
        """
        Initialize OCR engine.

        Args:
            lang: Tesseract language codes (e.g., 'ind+eng' for Indonesian + English)
        """
        self.lang = lang

        # Set Tesseract path for Windows
        if platform.system() == "Windows":
            import shutil
            tesseract_path = shutil.which("tesseract")
            if tesseract_path:
                pytesseract.pytesseract.tesseract_cmd = tesseract_path
            else:
                # Common Windows install paths
                common_paths = [
                    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                    r"C:\laragon\bin\tesseract\tesseract.exe",
                ]
                for path in common_paths:
                    import os
                    if os.path.exists(path):
                        pytesseract.pytesseract.tesseract_cmd = path
                        break

        # Validate available languages and fallback if needed
        self._validate_lang()

    def _validate_lang(self):
        """Check available Tesseract languages and fallback if needed."""
        try:
            available = pytesseract.get_languages()
            requested = self.lang.split("+")
            valid = [l for l in requested if l in available]
            if valid:
                self.lang = "+".join(valid)
            else:
                # Fallback to eng if available, otherwise use first available
                self.lang = "eng" if "eng" in available else available[0] if available else "eng"
            logger.info("Using languages: %s (available: %s)", self.lang, available)
        except Exception as e:
            logger.warning("Could not validate languages, using default: %s. Error: %s", self.lang, e)

    def extract_text(self, image: Image.Image) -> dict:
        """
        Extract text from a preprocessed image.

        Args:
            image: PIL Image (should be preprocessed)

        Returns:
            dict with 'text' and 'confidence'
        """
        candidates = [
            self._extract_with_config(image, config)
            for config in self.TESSERACT_CONFIGS
        ]
        best = self._choose_best_candidate(candidates)

        return {
            "text": best.text,
            "confidence": round(best.confidence, 2),
            "word_count": best.word_count,
            "ocr_config": best.config,
        }

    def _extract_with_config(self, image: Image.Image, config: str) -> OcrCandidate:
        """Run Tesseract once with a specific page segmentation config."""
        data = pytesseract.image_to_data(
            image,
            lang=self.lang,
            config=config,
            output_type=pytesseract.Output.DICT,
        )

        text = pytesseract.image_to_string(
            image,
            lang=self.lang,
            config=config,
        )

        confidences = [
            value
            for value in (self._parse_confidence(raw) for raw in data.get("conf", []))
            if value > 0
        ]

        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
        avg_confidence = max(0.0, min(100.0, avg_confidence))

        return OcrCandidate(
            text=self._clean_text(text),
            confidence=avg_confidence,
            word_count=len(confidences),
            config=config,
        )

    def _choose_best_candidate(self, candidates: list[OcrCandidate]) -> OcrCandidate:
        """
        Pick the best OCR result without being fooled by tiny high-confidence outputs.

        Tesseract can occasionally return one or two very confident words while
        missing most of the document. We only compare confidence among candidates
        that retain at least half of the maximum detected word count.
        """
        if not candidates:
            return OcrCandidate(text="", confidence=0.0, word_count=0, config="")

        max_words = max(candidate.word_count for candidate in candidates)
        min_words = max(3, int(max_words * 0.5))
        comparable = [
            candidate
            for candidate in candidates
            if candidate.word_count >= min_words
        ] or candidates

        return max(
            comparable,
            key=lambda candidate: (
                candidate.confidence,
                candidate.word_count,
                len(candidate.text),
            ),
        )

    @staticmethod
    def _parse_confidence(value) -> float:
        """Parse Tesseract confidence values, which may be '-1' or float strings."""
        try:
            return float(value)
        except (TypeError, ValueError):
            return -1.0

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
    def get_tesseract_version() -> Optional[str]:
        """Get installed Tesseract version."""
        try:
            return pytesseract.get_tesseract_version().vstring
        except Exception:
            return None

    @staticmethod
    def get_available_languages() -> list:
        """Get list of available Tesseract languages."""
        try:
            return pytesseract.get_languages()
        except Exception:
            return []
