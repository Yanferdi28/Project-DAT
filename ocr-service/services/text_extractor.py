"""
Text Field Extractor - Extracts structured fields from OCR text.
Extracts: indeks (document number), jumlah_nilai (monetary value), uraian_informasi (summary).
"""

import re
from typing import Optional


class TextFieldExtractor:
    """Extracts structured archive fields from OCR-extracted text."""

    # Patterns for document numbers / indeks
    INDEKS_PATTERNS = [
        # Nomor Surat / Nomor Dokumen / Nomor Pendaftaran: e.g. "Nomor: 123/LPP.02/2024"
        r'[Nn]o(?:mor)?(?:\s+\w+)?[\s.:]*[:]\s*([\w\-/.]+\d[\w\-/.]*)',
        # Reference with slash pattern: e.g. "B-123/LPP.02/SDM/2024"
        r'\b([A-Z]{1,5}[-\s]?\d{1,6}[/\-][\w.]+[/\-][\w.]+(?:[/\-][\w.]+)*)',
        # Pattern like "KEP-123/LPP/2024"
        r'\b((?:KEP|SK|SE|PER|SPT|SPPD|SPP|SP2D|DIPA)\s*[-/]\s*\d{1,6}[\w\-/.]*)',
        # Nomor followed by colon then digits: e.g. "No. 001/..."
        r'[Nn]o(?:mor)?[.\s:]+(\d{1,6}[/\-][\w.]*\d[\w\-/.]*)',
        # Long numeric identifier like registration number
        r'[Nn]o(?:mor)?(?:\s+\w+)?[\s.:—\-]*\s*(\d{6,}[\w\-]*)',
    ]

    def extract_all(self, text: str) -> dict:
        """
        Extract all fields from OCR text.

        Returns:
            dict with indeks, jumlah_nilai, uraian_informasi
        """
        if not text or len(text.strip()) < 5:
            return {
                "indeks": None,
                "jumlah_nilai": None,
                "uraian_informasi": None,
            }

        return {
            "indeks": self.extract_indeks(text),
            "uraian_informasi": self.extract_uraian_informasi(text),
        }

    def extract_indeks(self, text: str) -> Optional[str]:
        """Extract document number / indeks from text."""
        for pattern in self.INDEKS_PATTERNS:
            match = re.search(pattern, text)
            if match:
                indeks = match.group(1).strip()
                # Clean up: remove trailing dots/spaces
                indeks = indeks.rstrip('. ')
                if len(indeks) >= 3:
                    return indeks
        return None

    def extract_uraian_informasi(self, text: str) -> Optional[str]:
        """
        Extract document description/summary from text.
        Takes the first meaningful lines as document description.
        """
        lines = text.strip().split('\n')

        # Filter out empty lines and very short lines (noise)
        meaningful_lines = []
        for line in lines:
            stripped = line.strip()
            # Skip empty, too short, or purely numeric lines
            if len(stripped) < 5:
                continue
            if stripped.replace(' ', '').isdigit():
                continue
            # Skip page separators like "--- Halaman 1 ---"
            if re.match(r'^[-=\s]*[Hh]alaman\s+\d+\s*[-=\s]*$', stripped):
                continue
            # Skip lines that are mostly special characters (OCR noise)
            alpha_count = sum(1 for c in stripped if c.isalpha())
            if alpha_count < len(stripped) * 0.3 and len(stripped) > 5:
                continue
            meaningful_lines.append(stripped)

        if not meaningful_lines:
            return None

        # Look for title/subject patterns first
        for line in meaningful_lines[:10]:
            # "Perihal:", "Hal:", "Subject:", "Tentang:", "Re:"
            match = re.match(
                r'(?:Perihal|Hal|Subject|Tentang|Re|Lamp(?:iran)?)\s*[:]\s*(.+)',
                line,
                re.IGNORECASE,
            )
            if match:
                return match.group(1).strip()[:255]

        # Otherwise use first 1-3 meaningful lines as summary, up to 255 chars
        summary_parts = []
        total_len = 0
        for line in meaningful_lines[:5]:
            if total_len + len(line) > 255:
                break
            summary_parts.append(line)
            total_len += len(line) + 1  # +1 for space

        return ' '.join(summary_parts)[:255] if summary_parts else None
