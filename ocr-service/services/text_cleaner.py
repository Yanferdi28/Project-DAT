"""
Text Cleaner - Post-processing for OCR extracted text.
Normalizes and fixes common OCR errors for Indonesian text.
"""

import re


class TextCleaner:
    """Post-processing for OCR extracted text."""

    # Common OCR misreads in Indonesian documents
    COMMON_FIXES = {
        r"\bRl\b": "RI",
        r"\bRll\b": "RRI",
        r"\bl\b(?=[A-Z])": "I",
        r"\bNomor\s*:": "Nomor:",
        r"\bTanggal\s*:": "Tanggal:",
        r"\bPerihal\s*:": "Perihal:",
        r"\bKepada\s*:": "Kepada:",
        r"\bDari\s*:": "Dari:",
    }

    def clean(self, text: str) -> str:
        """
        Apply full text cleaning pipeline.

        Args:
            text: Raw OCR text

        Returns:
            Cleaned text
        """
        if not text:
            return ""

        # Step 1: Fix common OCR misreads
        text = self._fix_common_errors(text)

        # Step 2: Normalize whitespace
        text = self._normalize_whitespace(text)

        # Step 3: Fix punctuation spacing
        text = self._fix_punctuation(text)

        # Step 4: Remove garbage characters
        text = self._remove_garbage(text)

        return text.strip()

    def _fix_common_errors(self, text: str) -> str:
        """Fix common OCR misreads."""
        for pattern, replacement in self.COMMON_FIXES.items():
            text = re.sub(pattern, replacement, text)
        return text

    def _normalize_whitespace(self, text: str) -> str:
        """Normalize various whitespace characters."""
        # Replace tabs with spaces
        text = text.replace("\t", " ")

        # Collapse multiple spaces to one
        text = re.sub(r" {2,}", " ", text)

        # Remove spaces at line beginnings
        text = re.sub(r"(?m)^ +", "", text)

        # Collapse more than 2 newlines
        text = re.sub(r"\n{3,}", "\n\n", text)

        return text

    def _fix_punctuation(self, text: str) -> str:
        """Fix spacing around punctuation."""
        # Remove space before period, comma, colon, semicolon
        text = re.sub(r" +([.,;:])", r"\1", text)

        # Add space after period/comma if missing (but not in numbers like 1.000)
        text = re.sub(r"([.,;:])([A-Za-z])", r"\1 \2", text)

        return text

    def _remove_garbage(self, text: str) -> str:
        """Remove non-meaningful characters that are likely OCR artifacts."""
        # Remove isolated single characters that are likely noise
        # But keep common single-letter words (a, I, etc.)
        text = re.sub(r"(?<= )[^a-zA-Z0-9\s]{3,}(?= )", "", text)

        # Remove lines that are only special characters
        lines = text.split("\n")
        cleaned_lines = []
        for line in lines:
            # Keep line if it has at least some alphanumeric content
            if re.search(r"[a-zA-Z0-9]", line) or line.strip() == "":
                cleaned_lines.append(line)

        return "\n".join(cleaned_lines)
