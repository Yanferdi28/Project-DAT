"""
Image Preprocessing Pipeline for OCR
Applies a series of image transformations to improve OCR accuracy.
"""

import logging
import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Preprocesses images to improve Tesseract OCR accuracy."""

    # Minimum image height (in pixels) for reliable OCR results.
    # Tesseract works best at ~300 DPI; 800px ensures adequate resolution.
    MIN_HEIGHT = 1200
    MIN_WIDTH = 900
    MAX_DIMENSION = 2600

    # Denoising strength (h parameter for fastNlMeansDenoising).
    # Higher values remove more noise but may blur text. 10 is a balanced default.
    DENOISE_STRENGTH = 10

    # Adaptive threshold block size (must be odd). Controls the size of the
    # neighborhood area used to calculate threshold. 11 works well for documents.
    BINARIZE_BLOCK_SIZE = 11

    # Adaptive threshold constant subtracted from the mean.
    # Small value (2) preserves thin strokes in printed text.
    BINARIZE_C = 2

    # Minimum skew angle (degrees) to trigger deskewing correction.
    DESKEW_MIN_ANGLE = 0.5

    # Maximum skew angle (degrees) allowed for deskewing.
    # Angles beyond this likely indicate a different orientation, not skew.
    DESKEW_MAX_ANGLE = 10

    def process(self, image: Image.Image) -> Image.Image:
        """
        Apply full preprocessing pipeline.

        Steps:
        1. Convert to grayscale
        2. Resize if too small
        3. Normalize contrast
        4. Denoise
        5. Sharpen text strokes
        6. Binarize (adaptive thresholding)
        7. Deskew

        Args:
            image: PIL Image object

        Returns:
            Preprocessed PIL Image
        """
        # Convert PIL to OpenCV format
        img = np.array(image)

        # If image has alpha channel, convert to RGB first
        if len(img.shape) == 3 and img.shape[2] == 4:
            img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)

        # 1. Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
        else:
            gray = img

        # 2. Resize if too small (minimum 300 DPI equivalent)
        gray = self._resize_if_needed(gray)

        # 3. Normalize local contrast
        contrasted = self._normalize_contrast(gray)

        # 4. Denoise
        denoised = self._denoise(contrasted)

        # 5. Sharpen text strokes
        sharpened = self._sharpen(denoised)

        # 6. Binarize using adaptive thresholding
        binary = self._binarize(sharpened)

        # 7. Deskew
        deskewed = self._deskew(binary)

        # Convert back to PIL
        return Image.fromarray(deskewed)

    def _resize_if_needed(self, img: np.ndarray) -> np.ndarray:
        """Upscale image if it's too small for good OCR results."""
        h, w = img.shape[:2]
        scale = max(
            self.MIN_HEIGHT / h if h < self.MIN_HEIGHT else 1,
            self.MIN_WIDTH / w if w < self.MIN_WIDTH else 1,
        )

        if scale > 1:
            max_scale = self.MAX_DIMENSION / max(h, w)
            scale = max(1, min(scale, max_scale))
            new_w = int(w * scale)
            new_h = int(h * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        return img

    def _normalize_contrast(self, img: np.ndarray) -> np.ndarray:
        """Improve local contrast so faint text is easier for OCR to read."""
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        return clahe.apply(img)

    def _denoise(self, img: np.ndarray) -> np.ndarray:
        """Apply non-local means denoising."""
        return cv2.fastNlMeansDenoising(
            img, None,
            h=self.DENOISE_STRENGTH,
            templateWindowSize=7,
            searchWindowSize=21,
        )

    def _sharpen(self, img: np.ndarray) -> np.ndarray:
        """Apply a light unsharp mask to make character edges clearer."""
        blurred = cv2.GaussianBlur(img, (0, 0), 1.0)
        return cv2.addWeighted(img, 1.5, blurred, -0.5, 0)

    def _binarize(self, img: np.ndarray) -> np.ndarray:
        """Apply adaptive thresholding for binarization."""
        binary = cv2.adaptiveThreshold(
            img, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=self.BINARIZE_BLOCK_SIZE,
            C=self.BINARIZE_C,
        )
        return binary

    def _deskew(self, img: np.ndarray) -> np.ndarray:
        """Deskew the image by detecting and correcting rotation angle."""
        # Find all non-zero points
        coords = np.column_stack(np.where(img > 0))

        if len(coords) < 10:
            return img

        # Get the minimum area rectangle
        try:
            angle = cv2.minAreaRect(coords)[-1]

            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle

            # Only deskew if angle is significant but not too large
            if abs(angle) > self.DESKEW_MIN_ANGLE and abs(angle) < self.DESKEW_MAX_ANGLE:
                (h, w) = img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                img = cv2.warpAffine(
                    img, M, (w, h),
                    flags=cv2.INTER_CUBIC,
                    borderMode=cv2.BORDER_REPLICATE
                )
        except Exception as e:
            logger.warning("Deskew failed, returning original image: %s", e)

        return img
