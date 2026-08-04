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

        # Remove OCR page headers like "--- Halaman 1 ---"
        clean_text = re.sub(r'---\s*Halaman\s*\d+\s*---', '', text, flags=re.IGNORECASE)

        return {
            "indeks": self.extract_indeks(clean_text),
            "tanggal": self.extract_tanggal(clean_text),
            "uraian_informasi": self.extract_uraian_informasi(clean_text),
        }

    # ------------------------------------------------------------------
    # INDEKS — Garis besar / perihal dokumen (tentang apa)
    # ------------------------------------------------------------------

    def extract_indeks(self, text: str) -> Optional[str]:
        """
        Extract the document subject / perihal combined with document date.
        Format: [Perihal/Judul], [Tanggal Dokumen]
        """
        if not text or len(text.strip()) < 5:
            return None

        # 1. Primary subject from Perihal / Hal / Ringkasan / Title
        subject = self._try_labeled_indeks(text) or self._try_doctype_indeks(text)

        if not subject:
            # Fallback — first meaningful content line
            lines = self._get_meaningful_lines(text)
            for line in lines[:10]:
                if self._is_structural_line(line):
                    continue
                if len(line) >= 15:
                    subject = self._clean_field(line)
                    break

        if not subject:
            return None

        # 2. Extract document date string from execution date (e.g. 20 Juli 2026)
        iso_date = self.extract_tanggal(text)
        date_str = None
        if iso_date:
            parts = iso_date.split('-')
            if len(parts) == 3:
                y, m, d = int(parts[0]), int(parts[1]), int(parts[2])
                month_names_inv = {
                    1: "Januari", 2: "Februari", 3: "Maret", 4: "April",
                    5: "Mei", 6: "Juni", 7: "Juli", 8: "Agustus",
                    9: "September", 10: "Oktober", 11: "November", 12: "Desember"
                }
                m_name = month_names_inv.get(m, str(m))
                date_str = f"{d} {m_name} {y}"

        # 3. Combine subject + date
        subject = self._clean_indeks_title(subject)
        if date_str and date_str.lower() not in subject.lower():
            indeks = f"{subject}, {date_str}"
        else:
            indeks = subject

        return self._clean_field(indeks)[:255]

    def _try_labeled_indeks(self, text: str) -> Optional[str]:
        """Try extracting indeks from explicitly labeled fields."""
        patterns = [
            # "Perihal:" / "Hal:" — common in nota dinas, surat (excludes "Hal-hal")
            (r'\b(?:Perihal|Hal)(?!-hal)\b\s*[^a-zA-Z\n]{0,3}\s*[:]\s*(.+?)(?:\n|$)', re.IGNORECASE),
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
        # For SURAT KESEPAKATAN KERJASAMA / PERJANJIAN KERJASAMA — grab full title block
        match = re.search(
            r'((?:SURAT\s+KESEPAKATAN|PERJANJIAN)\s+KERJASAMA.+?)(?:\n\s*Nomor|\n\s*NOMOR|\n\s*Pada\s+hari|\n\s*Yang\s+bertanda)',
            text, re.DOTALL | re.IGNORECASE,
        )
        if match:
            return self._clean_field(match.group(1))

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
        Prioritizes event/execution date over letter signing/creation date.
        """
        norm_text = text.replace('–', '-').replace('—', '-').replace('s/d', '-').replace('s.d.', '-')

        # Strategy 0 (Highest Priority): Event / Execution Date (Pelaksanaan / Hari/Tanggal / pada tanggal ...)
        execution_patterns = [
            # "Hari/Tanggal : Senin, 20 Juli 2026" or "Tanggal Pelaksanaan : 20 Juli 2026"
            rf'(?:Hari\s*/\s*Tangg?al|Tangg?al\s+Pelaksanaan|Pelaksanaan|Dilaksanakan\s+(?:pada)?)\s*[:]?\s*(?:[A-Za-z]+,\s*)?(\d{{1,2}})\s*(?:-\s*\d{{1,2}})?\s+({_BULAN_NAMES})\s+(\d{{4}})',
            # "pada tanggal 24 - 28 Juli 2023" -> 24 Juli 2023
            rf'\bpada\s+tangg?al\s+(?:[A-Za-z]+,\s*)?(\d{{1,2}})\s*(?:-\s*\d{{1,2}})?\s+({_BULAN_NAMES})\s+(\d{{4}})',
            # "pada hari ... tanggal 20 Juli 2026"
            rf'\bpada\b[^\n]*?\btangg?al\s+(\d{{1,2}})\s*(?:-\s*\d{{1,2}})?\s+({_BULAN_NAMES})\s+(\d{{4}})',
        ]
        for pattern in execution_patterns:
            match = re.search(pattern, norm_text, re.IGNORECASE)
            if match:
                day, month_str, year = match.group(1), match.group(2), match.group(3)
                parsed = self._parse_date(f"{day} {month_str} {year}")
                if parsed:
                    return parsed

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
        Provides a comprehensive, informative summary of the document's contents.
        """
        if not text or len(text.strip()) < 10:
            return None

        lines = [l.strip() for l in text.split('\n') if l.strip()]

        # 1. Extract document type title (e.g. NOTA DINAS, SURAT TUGAS, SURAT KEPUTUSAN, etc.)
        doctype = None
        for l in lines[:12]:
            if re.search(r'\b(NOTA DINAS|SURAT TUGAS|SURAT KEPUTUSAN|KEPUTUSAN|PERJANJIAN KERJASAMA|PERJANJIAN|BERITA ACARA|SURAT EDARAN|PERATURAN|LAPORAN)\b', l, re.I):
                if len(l) < 100:
                    doctype = self._clean_field(l)
                    break

        # 2. Extract Perihal/Hal/Tentang
        perihal = None
        m_perihal = re.search(r'\b(?:Perihal|Hal|Tentang)(?!-hal)\b\s*[:]\s*(.+?)(?:\n|$)', text, re.I)
        if m_perihal:
            candidate = self._clean_field(m_perihal.group(1))
            if candidate and not re.search(r'^(LPP|RADIO|REPUBLIK|KEPUTUSAN|LEMBAGA|hal\b)', candidate, re.I):
                perihal = candidate

        # 3. Extract explicit summary fields if available
        ringkasan = None
        m_ringkasan = re.search(
            r'Ringkasan\s+Isi\s*[^a-zA-Z\n]{0,5}[:]?\s*(.+?)(?:\nLampiran|\nDiteruskan|\n\s*\n|$)',
            text, re.I | re.S
        )
        if m_ringkasan:
            ringkasan = self._clean_field(m_ringkasan.group(1))

        menimbang = None
        m_menimbang = re.search(
            r'Menimbang\s*[^a-zA-Z\n]{0,3}[:]\s*(?:a[.\s]*)?\s*(?:bahwa\s+)?(.+?)(?:\n\s*b[.\s]|\n\s*Mengingat|\n\s*Dasar|$)',
            text, re.I | re.S
        )
        if m_menimbang:
            menimbang = self._clean_field(m_menimbang.group(1))

        # 4. Extract body content lines
        body_parts = []
        in_body = False
        stop_patterns = r'^(Demikian|Ditetapkan di|Dikeluarkan di|Dokumen ini telah|Tembusan:|Yogyakarta,|\bBanjarmasin,|\bJakarta,|\bNIP\b|SURAT PERMINTAAN|Pihak Pertama|Pihak Kedua)'
        start_patterns = r'^(Sehubungan|Dalam rangka|Berdasarkan|Menimbang|Dengan ini|Pada hari|Untuk selanjutnya|MEMBERI PERINTAH|MEMUTUSKAN|Menetapkan|Kedua belah pihak)'

        for l in lines:
            if in_body and re.search(stop_patterns, l, re.I):
                break
            if re.search(start_patterns, l, re.I):
                in_body = True
            if in_body:
                if not re.search(r'^(LEMBAGA|RADIO|REPUBLIK|BANJARMASIN|YOGYAKARTA|Nomor|Kepada|Dari|Tanggal|Tembusan)', l, re.I):
                    if len(l) >= 5 and not self._is_structural_line(l):
                        body_parts.append(l)

        # Fallback body lines if no explicit body trigger matched
        if not body_parts and not ringkasan and not menimbang:
            for l in lines:
                if self._is_structural_line(l):
                    continue
                if len(l) >= 15:
                    body_parts.append(l)

        # Build combined informative summary
        summary_components = []
        if doctype:
            summary_components.append(doctype.title() + ".")
        if perihal and (not doctype or perihal.lower() not in doctype.lower()):
            summary_components.append(f"Perihal: {perihal}.")
        if ringkasan:
            summary_components.append(f"Ringkasan Isi: {ringkasan}.")
        elif menimbang:
            summary_components.append(f"Menimbang: {menimbang}.")

        if body_parts:
            body_str = self._clean_field(' '.join(body_parts))
            if body_str:
                summary_components.append(body_str)

        result = ' '.join(summary_components).strip()
        if not result or len(result) < 10:
            return None

        # Clean OCR artifacts, addresses, phone/email metadata for an LLM-like summary
        cleaned_result = self._clean_uraian_text(result)
        if not cleaned_result or len(cleaned_result) < 10:
            return None

        # Return up to 1000 characters for a rich, full summary
        return cleaned_result[:1000]

    # ------------------------------------------------------------------
    # Utility
    # ------------------------------------------------------------------

    def _clean_indeks_title(self, subject: Optional[str]) -> Optional[str]:
        """Strip Kop Surat institutional noise and truncate run-on clauses to keep indeks concise."""
        if not subject:
            return subject
        # Truncate run-on secondary clauses or detail field labels
        subject = re.split(
            r'\b(?:berkaitan\s+dengan|Nama\s+Acara|Tanggal\s*:|Tempat\s*:|Untuk\s+selanjutnya|dengan\s+ketentuan|Lp\s+RADIO)\b',
            subject, flags=re.IGNORECASE
        )[0]
        # Strip Kop Surat header noise from title
        subject = re.sub(r'^Lp\s+', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'\s+Lp\s+', ' ', subject, flags=re.IGNORECASE)
        subject = re.sub(r'RADIO\s+REPUBLIK\s+INDONESIA\s+\w+', '', subject, flags=re.IGNORECASE)
        subject = re.sub(r'LPP\s+RRI\s+\w+', '', subject, flags=re.IGNORECASE)
        # Collapse whitespace and punctuation artifacts
        subject = re.sub(r'\s+', ' ', subject).strip(' ,.-:;!\'\"‘')
        if len(subject) > 100:
            subject = subject[:100].rsplit(' ', 1)[0]
        return subject.title()

    def _clean_uraian_text(self, text: Optional[str]) -> Optional[str]:
        """Clean OCR symbol artifacts and boilerplate metadata for neat LLM-like output."""
        if not text:
            return text
        # Fix OCR typos and symbol artifacts
        text = text.replace('‘', "'").replace('’', "'").replace('—', '-').replace('|', '').replace('~', '')
        # Remove Kop Surat addresses, phone/fax, emails
        text = re.sub(r'Jalan\s+[^,\n]+(?:,\s*\w+)*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Jl\.[^,\n]+(?:,\s*\w+)*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'(?:Telepon|Telp|Faksimile|Fax|Email|e-mail)\s*[:]?\s*[^\s,]+', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Sekali\s+Di\s+Udara[^\n]*', '', text, flags=re.IGNORECASE)
        text = re.sub(r'Dipindai\s+dengan[^\n]*', '', text, flags=re.IGNORECASE)
        # Fix double spaces and punctuation formatting
        text = re.sub(r'\s+', ' ', text).strip()
        text = re.sub(r'\s+([.,;:?])', r'\1', text)
        text = re.sub(r'([.,;:])([A-Za-z])', r'\1 \2', text)
        return text

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
        # Remove page header artifacts like "--- Halaman 1 ---" or "aman 1 ---"
        cleaned = re.sub(r'---\s*Halaman\s*\d+\s*---', '', cleaned, flags=re.IGNORECASE).strip()
        cleaned = re.sub(r'^\s*aman\s*\d+.*', '', cleaned, flags=re.IGNORECASE).strip()
        # Remove trailing punctuation
        cleaned = cleaned.rstrip('.,;:')
        # Remove leading OCR artifacts (special chars before text)
        cleaned = re.sub(r'^[^a-zA-Z0-9]+', '', cleaned).strip()
        return cleaned if len(cleaned) >= 3 else None
