"""
LLM Extractor - Uses Gemini API to extract and correct OCR text into structured fields.
"""

import os
import json
import logging
from typing import Optional
from dotenv import load_dotenv
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Configure Gemini API
API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
USE_LLM = os.getenv("USE_LLM_EXTRACTION", "false").lower() == "true"

class LLMExtractor:
    """Extracts structured fields from OCR text using LLM."""

    def __init__(self):
        self.is_configured = bool(API_KEY and USE_LLM)
        if self.is_configured:
            # Initialize client and models
            self.client = genai.Client(api_key=API_KEY)
            self.model_primary = 'gemini-3.1-flash-lite'
            self.model_fallback = 'gemini-2.5-flash'

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
        # Try Primary Model (gemini-3.1-flash-lite)
        result = self._try_extract(self.model_primary, prompt)
        if result:
            return result
            
        logging.warning("Primary LLM failed (possibly rate limit). Falling back to gemini-2.5-flash...")
        
        # Try Fallback Model (gemini-2.5-flash)
        result = self._try_extract(self.model_fallback, prompt)
        if result:
            return result
            
        logging.error("Both LLM models failed. Falling back to Regex extraction.")
        return None

    def _try_extract(self, model_name: str, prompt: str) -> Optional[dict]:
        try:
            response = self.client.models.generate_content(
                model=model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1, # Low temp for factual extraction
                )
            )
            result_json = response.text.strip()
            data = json.loads(result_json)
            
            return {
                "indeks": data.get("indeks"),
                "tanggal": data.get("tanggal"),
                "uraian_informasi": data.get("uraian_informasi"),
            }
        except Exception as e:
            logging.error(f"Model {model_name} failed: {str(e)}")
            return None

