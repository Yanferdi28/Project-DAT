"""
LLM Extractor - Uses Gemini API to extract and correct OCR text into structured fields.
"""

import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
USE_LLM = os.getenv("USE_LLM_EXTRACTION", "false").lower() == "true"

if API_KEY:
    genai.configure(api_key=API_KEY)

class LLMExtractor:
    """Extracts structured fields from OCR text using LLM."""

    def __init__(self):
        self.is_configured = bool(API_KEY and USE_LLM)
        if self.is_configured:
            # We use gemini-2.5-flash for fast, cheap, and good JSON extraction
            self.model = genai.GenerativeModel('gemini-2.5-flash')

    def extract_all(self, text: str) -> Optional[dict]:
        """
        Extract fields using LLM. Returns None if LLM fails or is not configured,
        so the caller can fallback to Regex extraction.
        """
        if not self.is_configured or not text or len(text.strip()) < 10:
            return None

        prompt = f"""Anda adalah asisten sistem arsip RRI. Berikut adalah teks hasil OCR dari sebuah dokumen. 
Koreksi teks ini jika ada salah baca (typo) karena OCR yang kurang sempurna, lalu ekstrak informasi berikut ke dalam format JSON:

1. "indeks": Garis besar atau perihal dokumen (dokumen ini tentang apa). BUKAN nomor surat.
2. "tanggal": Tanggal dokumen dikeluarkan atau ditetapkan. Format harus YYYY-MM-DD.
3. "uraian_informasi": Ringkasan detail dari isi/konteks dokumen.

Aturan penting:
- Output HANYA JSON murni tanpa markdown block (```json).
- Jika informasi tidak ditemukan di teks, isi dengan null.

Teks OCR:
{text}
"""

        try:
            # We ask for JSON specifically
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                    temperature=0.1, # Low temp for factual extraction
                )
            )
            
            # The output should be a JSON string
            result_json = response.text.strip()
            
            # Parse it
            data = json.loads(result_json)
            
            # Ensure all required keys exist
            return {
                "indeks": data.get("indeks"),
                "tanggal": data.get("tanggal"),
                "uraian_informasi": data.get("uraian_informasi"),
            }
            
        except Exception as e:
            logging.error(f"LLM Extraction failed: {str(e)}")
            return None
