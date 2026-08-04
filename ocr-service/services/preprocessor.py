"""
Image Preprocessing Pipeline for OCR
Minimal preprocessing — convert to grayscale and upscale tiny images.
Tesseract performs best on clean grayscale input without heavy transforms.
"""

import logging
import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Lightweight image preprocessor for Tesseract OCR."""

    # Minimum dimensions for reliable OCR (~300 DPI equivalent)
    MIN_HEIGHT = 1500
    MIN_WIDTH = 1000

    def process(self, image: Image.Image) -> Image.Image:
        """
        Minimal preprocessing pipeline:
        1. Convert to grayscale
        2. Upscale only if image is very small

        Args:
            image: PIL Image object

        Returns:
            Preprocessed PIL Image (grayscale)
        """
        img = np.array(image)

        # Handle RGBA
        if len(img.shape) == 3 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)

        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        else:
            gray = img

        # Upscale only if resolution is too low for Tesseract
        gray = self._resize_if_needed(gray)

        return Image.fromarray(gray)

    def _resize_if_needed(self, img: np.ndarray) -> np.ndarray:
        """Upscale image only if it's too small for reliable OCR."""
        h, w = img.shape[:2]
        if h >= self.MIN_HEIGHT and w >= self.MIN_WIDTH:
            return img

        scale = max(self.MIN_HEIGHT / h if h < self.MIN_HEIGHT else 1.0,
                    self.MIN_WIDTH / w if w < self.MIN_WIDTH else 1.0)
        scale = min(scale, 2.0)

        new_w = int(w * scale)
        new_h = int(h * scale)
        return cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
