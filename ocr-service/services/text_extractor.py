"""
Text Field Extractor - Extracts structured fields from OCR text.
Extracts: indeks (document subject/perihal), tanggal (date), uraian_informasi (summary).
"""

import re
from typing import Optional


# Indonesian month name mapping
BULAN_MAP = {
    "januari": 1, "februari": 2, "maret": 3, "april": 4,
    "mei": 5, "juni": 6, "juli": 7, "agustus": 8,
    "september": 9, "oktober": 10, "november": 11, "desember": 12,
    # Common OCR misreads
    "januani": 1, "pebruari": 2, "nopember": 11, "des": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4,
    "jun": 6, "jul": 7, "agu": 8, "ags": 8, "aug": 8,
    "sep": 9, "okt": 10, "nov": 11,
}

# Indonesian month names for regex (full names only for inline matching)
_BULAN_NAMES = (
    "Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|"
    "September|Oktober|Nopember|November|Desember|Pebruari"
)


class TextFieldExtractor:
    """Extracts structured archive fields from OCR-extracted text."""

    def extract_all(self, text: str) -> dict:
        """
        Extract all fields from OCR text.

        Returns:
            dict with indeks, tanggal, uraian_informasi
        """
        if not text or len(text.strip()) < 5:
            return {
                "indeks": None,
                "tanggal": None,
                "uraian_informasi": None,
            }

        return {
            "indeks": self.extract_indeks(text),
            "tanggal": self.extract_tanggal(text),
            "uraian_informasi": self.extract_uraian_informasi(text),
        }

    # ------------------------------------------------------------------
    # INDEKS — Garis besar / perihal dokumen (tentang apa)
    # ------------------------------------------------------------------

    def extract_indeks(self, text: str) -> Optional[str]:
        """
        Extract the document subject / perihal (what the document is about).
        This is NOT the document number — it is the brief topic description.
        """
        # Strategy 1: Look for labeled subject fields (highest priority)
        # These patterns allow optional colon and OCR artifacts before the colon
        labeled = self._try_labeled_indeks(text)
        if labeled:
            return labeled[:255]

        # Strategy 2: Document-type specific extraction
        doctype = self._try_doctype_indeks(text)
        if doctype:
            return doctype[:255]

        # Strategy 3: Fallback — first meaningful content line
        lines = self._get_meaningful_lines(text)
        for line in lines[:10]:
            if self._is_structural_line(line):
                continue
            if len(line) >= 15:
                return self._clean_field(line)[:255]

        return None

    def _try_labeled_indeks(self, text: str) -> Optional[str]:
        """Try extracting indeks from explicitly labeled fields."""
        patterns = [
            # "Perihal:" / "Hal:" — common in nota dinas, surat
            (r'(?:Perihal|Hal)\s*[^a-zA-Z\n]{0,3}\s*[:]\s*(.+?)(?:\n|$)', re.IGNORECASE),
            # "Ringkasan Isi" — used in disposisi. Colon may have OCR artifacts
            (r'Ringkasan\s+Isi\s*[^a-zA-Z\n]{0,5}[:]\s*(.+?)(?:\n\s*\n|\nLampiran|\nDiteruskan|$)', re.IGNORECASE | re.DOTALL),
            # "Ringkasan Isi" without colon — OCR may drop it entirely
            (r'Ringkasan\s+Isi\s+([A-Z].+?)(?:\n\s*\n|\nLampiran|\nDiteruskan|$)', re.IGNORECASE | re.DOTALL),
            # "TENTANG" in SK/decree titles (content on next line)
            (r'TENTANG\s*\n\s*(.+?)(?:\n\s*\n|\nKEPALA|$)', re.DOTALL),
            # "Untuk:" in Surat Tugas
            (r'Untuk\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n\s*Demikian|\n\s*\n|$)', re.IGNORECASE | re.DOTALL),
        ]
        for pattern, flags in patterns:
            match = re.search(pattern, text, flags)
            if match:
                result = self._clean_field(match.group(1))
                if result and len(result) >= 10:
                    return result
        return None

    def _try_doctype_indeks(self, text: str) -> Optional[str]:
        """Try extracting indeks from document type title patterns."""
        # For NOTA KESEPAKATAN — grab the full title block
        match = re.search(
            r'(NOTA\s+KESEPAKATAN\s+.+?)(?:\n\s*Nomor|\n\s*Pada\s+hari)',
            text, re.DOTALL | re.IGNORECASE,
        )
        if match:
            return self._clean_field(match.group(1))

        # For SURAT KEPUTUSAN ... TENTANG ... — grab the TENTANG part
        match = re.search(
            r'SURAT\s+KEPUTUSAN.*?TENTANG\s*\n?\s*(.+?)(?:\n\s*\n|\nKEPALA|$)',
            text, re.DOTALL | re.IGNORECASE,
        )
        if match:
            return self._clean_field(match.group(1))

        return None

    # ------------------------------------------------------------------
    # TANGGAL — Tanggal dokumen (output: YYYY-MM-DD)
    # ------------------------------------------------------------------

    def extract_tanggal(self, text: str) -> Optional[str]:
        """
        Extract document date and return in ISO format (YYYY-MM-DD).
        Prioritizes formal date fields (Dikeluarkan/Ditetapkan, Tgl.Penerimaan)
        over inline dates to get the document's own date, not referenced dates.
        """
        # Strategy 1: Formal issuance date ("Dikeluarkan di..., tanggal...")
        # These are the most authoritative dates on a document
        issuance_patterns = [
            # "Dikeluarkan di: Fakfak\nt gal: 17 November 2023" — OCR may split/corrupt 'tanggal'
            r'(?:Ditetapkan|Dikeluarkan)\s+di.*?\n.*?(?:Pada\s+)?(?:[Tt]\s*(?:angg?)?al|gal)\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)',
            # "Pada tanggal : DD Bulan YYYY" standalone
            r'Pada\s+tangg?al\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)',
            # "t gal: 17 November 2023" or "gal: ..." — OCR may split/drop 'tan' from tanggal
            r'(?:^|\n)\s*(?:t\s+)?gal\s*[^a-zA-Z\n]{0,3}[:]\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})(?:\n|$)',
        ]
        for pattern in issuance_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                parsed = self._parse_date(match.group(1).strip())
                if parsed:
                    return parsed

        # Strategy 2: "Tgl.Penerimaan" / "Tgl.Surat" (used in disposisi)
        receipt_patterns = [
            r'Tgl[.\s]*Penerimaan\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)',
            r'Tgl[.\s]*Surat\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)',
        ]
        for pattern in receipt_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                parsed = self._parse_date(match.group(1).strip())
                if parsed:
                    return parsed

        # Strategy 3: "Tanggal :" labeled field
        match = re.search(r'Tangg?al\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)', text, re.IGNORECASE)
        if match:
            date_str = match.group(1).strip()
            # Skip if it says something like "tanggal, 9 November" inside Menimbang
            # (we only want standalone Tanggal: fields)
            parsed = self._parse_date(date_str)
            if parsed:
                return parsed

        # Strategy 4: "Pada hari ini, ... tanggal ... bulan ... tahun ..." (MOU style)
        match = re.search(
            r'Pada\s+hari\s+ini.*?tanggal\s+(\w+)\s+bulan\s+(\w+)\s+tahun\s+(.+?)(?:\s+kami|\n)',
            text, re.IGNORECASE,
        )
        if match:
            parsed = self._parse_spelled_date(
                match.group(1), match.group(2), match.group(3)
            )
            if parsed:
                return parsed

        # Strategy 5: First standalone "DD NamaBulan YYYY" in the text (not inside Nomor/No patterns)
        for match in re.finditer(
            rf'\b(\d{{1,2}})\s+({_BULAN_NAMES})\s+(\d{{4}})\b',
            text, re.IGNORECASE,
        ):
            # Skip if preceded by "Nomor" or "No" (it's a reference number date)
            start = max(0, match.start() - 50)
            preceding = text[start:match.start()]
            if re.search(r'(?:Nomor|No[.:])\s*$', preceding, re.IGNORECASE):
                continue
            parsed = self._parse_date(match.group(0))
            if parsed:
                return parsed

        return None

    def _parse_date(self, date_str: str) -> Optional[str]:
        """Parse a date string into YYYY-MM-DD format."""
        if not date_str:
            return None

        date_str = date_str.strip().rstrip('.,;')

        # Try "DD NamaBulan YYYY"
        match = re.match(
            r'(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})',
            date_str,
        )
        if match:
            day = int(match.group(1))
            month_name = match.group(2).lower()
            year = int(match.group(3))

            month = BULAN_MAP.get(month_name)
            if month and 1 <= day <= 31 and 1900 <= year <= 2100:
                return f"{year:04d}-{month:02d}-{day:02d}"

        # Try "DD/MM/YYYY" or "DD-MM-YYYY"
        match = re.match(r'(\d{1,2})[/\-](\d{1,2})[/\-](\d{4})', date_str)
        if match:
            day, month, year = int(match.group(1)), int(match.group(2)), int(match.group(3))
            if 1 <= day <= 31 and 1 <= month <= 12 and 1900 <= year <= 2100:
                return f"{year:04d}-{month:02d}-{day:02d}"

        return None

    def _parse_spelled_date(self, day_word: str, month_word: str, year_phrase: str) -> Optional[str]:
        """Parse a fully spelled-out Indonesian date (e.g. 'Sebelas bulan Desember tahun Dua Ribu ...')."""
        # Parse day
        day_word_lower = day_word.lower()
        day = self._word_to_number(day_word_lower)
        if day is None:
            try:
                day = int(day_word)
            except ValueError:
                return None

        # Parse month
        month = BULAN_MAP.get(month_word.lower())
        if not month:
            return None

        # Parse year from phrase like "Dua Ribu Sembilan Belas"
        year = self._parse_year_phrase(year_phrase.strip())
        if not year:
            return None

        if 1 <= day <= 31 and 1900 <= year <= 2100:
            return f"{year:04d}-{month:02d}-{day:02d}"
        return None

    def _word_to_number(self, word: str) -> Optional[int]:
        """Convert Indonesian number word to integer (1-31)."""
        simple = {
            "satu": 1, "dua": 2, "tiga": 3, "empat": 4, "lima": 5,
            "enam": 6, "tujuh": 7, "delapan": 8, "sembilan": 9, "sepuluh": 10,
            "sebelas": 11,
        }
        if word in simple:
            return simple[word]

        # "dua belas" = 12, etc.
        match = re.match(r'(\w+)\s+belas', word)
        if match:
            base = simple.get(match.group(1))
            if base:
                return base + 10

        # "dua puluh satu" = 21, etc.
        match = re.match(r'(\w+)\s+puluh(?:\s+(\w+))?', word)
        if match:
            tens = simple.get(match.group(1))
            ones = simple.get(match.group(2)) if match.group(2) else 0
            if tens:
                return tens * 10 + (ones or 0)

        return None

    def _parse_year_phrase(self, phrase: str) -> Optional[int]:
        """Parse year from Indonesian words like 'Dua Ribu Sembilan Belas'."""
        phrase = phrase.lower().strip().rstrip('.,;')
        words = phrase.split()

        # Try as number first
        try:
            return int(phrase)
        except ValueError:
            pass

        # "dua ribu ..." = 2000+
        if len(words) >= 2 and words[0] == "dua" and words[1] == "ribu":
            year = 2000
            rest = " ".join(words[2:])
            if not rest:
                return year
            addon = self._word_to_number(rest)
            if addon is not None:
                return year + addon
            # Try "sembilan belas" = 19
            if "belas" in rest:
                addon = self._word_to_number(rest)
                if addon is not None:
                    return year + addon

        return None

    # ------------------------------------------------------------------
    # URAIAN INFORMASI — Deskripsi / ringkasan isi dokumen
    # ------------------------------------------------------------------

    def extract_uraian_informasi(self, text: str) -> Optional[str]:
        """
        Extract document description/summary.
        Provides a more detailed summary than indeks.
        """
        # Strategy 1: "Menimbang" section (SK, Surat Tugas)
        match = re.search(
            r'Menimbang\s*[^a-zA-Z\n]{0,3}[:]\s*(?:a[.\s]*)?\s*(?:bahwa\s+)?(.+?)(?:\n\s*b[.\s]|\n\s*Mengingat|\n\s*Dasar)',
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            result = self._clean_field(match.group(1))
            if result and len(result) >= 20:
                return result[:255]

        # Strategy 2: "Ringkasan Isi" (disposisi) — colon may have OCR artifacts
        match = re.search(
            r'Ringkasan\s+Isi\s*[^a-zA-Z\n]{0,5}[:]\s*(.+?)(?:\nLampiran|\nDiteruskan|\n\s*\n|$)',
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            result = self._clean_field(match.group(1))
            if result and len(result) >= 10:
                return result[:255]

        # Strategy 2b: "Ringkasan Isi" without colon
        match = re.search(
            r'Ringkasan\s+Isi\s+([A-Z].+?)(?:\nLampiran|\nDiteruskan|\n\s*\n|$)',
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            result = self._clean_field(match.group(1))
            if result and len(result) >= 10:
                return result[:255]

        # Strategy 3: "Perihal:" / "Hal:"
        match = re.search(
            r'(?:Perihal|Hal)\s*[^a-zA-Z\n]{0,3}[:]\s*(.+?)(?:\n|$)',
            text,
            re.IGNORECASE,
        )
        if match:
            result = self._clean_field(match.group(1))
            if result and len(result) >= 10:
                return result[:255]

        # Strategy 4: "Bersepakat" clause (MOU/perjanjian)
        match = re.search(
            r'(?:Bersepakat|Sepakat|Menyepakati)\s+(.+?)(?:\n\s*\n|\n(?:Pelaksanaan|Pasal)|$)',
            text,
            re.IGNORECASE | re.DOTALL,
        )
        if match:
            result = self._clean_field(match.group(0))  # Include "Bersepakat" for context
            if result and len(result) >= 20:
                return result[:255]

        # Strategy 5: First meaningful paragraph (skip structural lines)
        lines = self._get_meaningful_lines(text)
        content_lines = []
        for line in lines:
            if self._is_structural_line(line):
                continue
            if len(line) < 15:
                continue
            # Skip all-uppercase short lines (headers)
            if line.isupper() and len(line) < 80:
                continue
            content_lines.append(line)

        if not content_lines:
            return None

        summary_parts = []
        total_len = 0
        for line in content_lines[:3]:
            if total_len + len(line) > 255:
                break
            summary_parts.append(line)
            total_len += len(line) + 1

        return ' '.join(summary_parts)[:255] if summary_parts else None

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    def _is_structural_line(self, line: str) -> bool:
        """Check if a line is a structural/header line to skip."""
        # Document metadata fields
        if re.match(
            r'^(Nomor|No[.:]|Tgl|Tanggal|Kepada|Dari|Yth|Lampiran|'
            r'Agenda|Tkt|Diteruskan|KASUBAG|KOORDINATOR|SEKRETARIAT|'
            r'Tembusan|Dikeluarkan|Ditetapkan|NIP|'
            r'Menimbang|Mengingat|Memperhatikan|Menetapkan|'
            r'Pertama|Kedua|Ketiga|Dasar|'
            r'MEMBERI\s+TUGAS|MEMUTUSKAN|MENUGASKAN|'
            r'Tel\b|Tgl\b)',
            line, re.IGNORECASE,
        ):
            return True

        # Organizational headers
        if re.match(
            r'^(RADIO|REPUBLIK|INDONESIA|DIREKTUR|LEMBAGA|LEMBAR|'
            r'Lembaga\s+Peny|RRI\s+\w|PIHAK)',
            line, re.IGNORECASE,
        ):
            return True

        # OCR noise patterns
        noise_patterns = [
            r'Sekali Di Udara',
            r'Dipindai dengan CamScanner',
            r'^[0-9\s.,:;/\-]+$',  # Lines with only numbers and punctuation
            r'^\w{1,3}$',  # Very short words (likely OCR noise)
            r'^\W+$',  # Lines with only special characters
            r'Stkel|OlUder',  # Common OCR noise from RRI logo
        ]
        for pattern in noise_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                return True

        return False

    def _get_meaningful_lines(self, text: str) -> list[str]:
        """Filter out noise lines from OCR text."""
        lines = text.strip().split('\n')
        meaningful = []

        for line in lines:
            stripped = line.strip()
            if len(stripped) < 5:
                continue
            if stripped.replace(' ', '').isdigit():
                continue

            # Skip lines that are mostly special characters (OCR noise)
            alpha_count = sum(1 for c in stripped if c.isalpha())
            if alpha_count < len(stripped) * 0.3 and len(stripped) > 5:
                continue

            meaningful.append(stripped)

        return meaningful

    def _clean_field(self, raw: str) -> Optional[str]:
        """Clean extracted field text."""
        if not raw:
            return None
        # Collapse whitespace and newlines into single spaces
        cleaned = re.sub(r'\s+', ' ', raw).strip()
        # Remove trailing punctuation
        cleaned = cleaned.rstrip('.,;:')
        # Remove leading OCR artifacts (special chars before text)
        cleaned = re.sub(r'^[^a-zA-Z0-9]+', '', cleaned).strip()
        return cleaned if len(cleaned) >= 3 else None
