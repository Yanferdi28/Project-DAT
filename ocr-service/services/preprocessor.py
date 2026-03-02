"""
Image Preprocessing Pipeline for OCR
Applies a series of image transformations to improve OCR accuracy.
"""

import cv2
import numpy as np
from PIL import Image


class ImagePreprocessor:
    """Preprocesses images to improve Tesseract OCR accuracy."""

    def process(self, image: Image.Image) -> Image.Image:
        """
        Apply full preprocessing pipeline.

        Steps:
        1. Convert to grayscale
        2. Resize if too small
        3. Denoise
        4. Binarize (adaptive thresholding)
        5. Deskew
        6. Remove borders

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

        # 3. Denoise
        denoised = self._denoise(gray)

        # 4. Binarize using adaptive thresholding
        binary = self._binarize(denoised)

        # 5. Deskew
        deskewed = self._deskew(binary)

        # Convert back to PIL
        return Image.fromarray(deskewed)

    def _resize_if_needed(self, img: np.ndarray, min_height: int = 800) -> np.ndarray:
        """Upscale image if it's too small for good OCR results."""
        h, w = img.shape[:2]
        if h < min_height:
            scale = min_height / h
            new_w = int(w * scale)
            new_h = int(h * scale)
            img = cv2.resize(img, (new_w, new_h), interpolation=cv2.INTER_CUBIC)
        return img

    def _denoise(self, img: np.ndarray) -> np.ndarray:
        """Apply non-local means denoising."""
        return cv2.fastNlMeansDenoising(img, None, h=10, templateWindowSize=7, searchWindowSize=21)

    def _binarize(self, img: np.ndarray) -> np.ndarray:
        """Apply adaptive thresholding for binarization."""
        binary = cv2.adaptiveThreshold(
            img, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=11,
            C=2
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
            if abs(angle) > 0.5 and abs(angle) < 10:
                (h, w) = img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                img = cv2.warpAffine(
                    img, M, (w, h),
                    flags=cv2.INTER_CUBIC,
                    borderMode=cv2.BORDER_REPLICATE
                )
        except Exception:
            pass  # If deskew fails, return original

        return img
