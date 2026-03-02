"""
Tesseract OCR Engine Wrapper
Handles text extraction with confidence scoring.
"""

import pytesseract
from PIL import Image
from typing import Optional
import platform


class OcrEngine:
    """Wrapper around pytesseract for OCR text extraction."""

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
            print(f"[OCR] Using languages: {self.lang} (available: {available})")
        except Exception as e:
            print(f"[OCR] Could not validate languages, using default: {self.lang}. Error: {e}")

    def extract_text(self, image: Image.Image) -> dict:
        """
        Extract text from a preprocessed image.

        Args:
            image: PIL Image (should be preprocessed)

        Returns:
            dict with 'text' and 'confidence'
        """
        # Get detailed data with confidence scores
        data = pytesseract.image_to_data(
            image,
            lang=self.lang,
            config="--psm 6 --oem 3",
            output_type=pytesseract.Output.DICT,
        )

        # Extract full text
        text = pytesseract.image_to_string(
            image,
            lang=self.lang,
            config="--psm 6 --oem 3",
        )

        # Calculate average confidence (only for words with conf > 0)
        confidences = [
            int(c) for c in data["conf"] if int(c) > 0
        ]
        avg_confidence = (
            sum(confidences) / len(confidences) if confidences else 0.0
        )

        # Clean up the text
        text = self._clean_text(text)

        return {
            "text": text,
            "confidence": round(avg_confidence, 2),
            "word_count": len(confidences),
        }

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
