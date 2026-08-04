"""
LLM Extractor - Uses Gemini API to extract and correct OCR text into structured fields.
"""

import os
import json
import re
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
            self.model_primary = 'gemini-3.5-flash-lite'
            self.model_fallback = 'gemini-3.1-flash-lite'

    def extract_all(self, text: str) -> Optional[dict]:
        """
        Extract fields using LLM. Returns None if LLM fails or is not configured,
        so the caller can fallback to Regex extraction.
        """
        if not self.is_configured or not text or len(text.strip()) < 10:
            return None

        prompt = f"""Anda adalah asisten sistem arsip RRI. Berikut adalah teks hasil OCR dari sebuah dokumen. 
Koreksi teks ini jika ada salah baca (typo) karena OCR yang kurang sempurna, lalu ekstrak informasi berikut ke dalam format JSON:

1. "indeks": Judul atau perihal dokumen SECARA SINGKAT dan jelas (maksimal 5-8 kata saja), lalu diakhiri dengan koma dan tanggal jika ada. Contoh: "Perjanjian Kerjasama Media Partner, 13 Juni 2024" atau "Apel Kedisiplinan, 20 Juli 2026". DILARANG memasukkan deskripsi panjang, rincian acara, lokasi, atau frasa run-on seperti "berkaitan dengan acara...".
2. "tanggal": Tanggal dokumen dikeluarkan atau ditetapkan. Format harus YYYY-MM-DD.
3. "uraian_informasi": Rangkuman lengkap dan rinci mengenai isi dokumen, konteks, pihak-pihak/petugas terkait, jadwal, serta poin-poin penting dari dokumen tersebut. BUKAN hanya 1-2 kata perihal. Jangan mengulang perihal/indeks secara singkat.

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
            
            raw_indeks = data.get("indeks")
            if raw_indeks:
                from services.text_extractor import TextFieldExtractor
                raw_indeks = TextFieldExtractor()._clean_indeks_title(raw_indeks)

            uraian = data.get("uraian_informasi")
            # If LLM generated an AI complaint instead of document summary, fallback to Regex
            complaint_patterns = r'(?:tidak\s+memungkinkan|terfragmentasi|terpotong|karakter\s+acak|tidak\s+lengkap|gagal\s+membaca|potongan\s+karakter|sangat\s+buruk|tidak\s+dapat\s+dibaca|tidak\s+dapat\s+diekstrak|teks\s+hasil\s+ocr|tidak\s+dapat\s+merangkum)'
            if uraian and re.search(complaint_patterns, str(uraian), re.I):
                logging.warning(f"Model {model_name} returned OCR complaint text. Rejecting LLM output for Regex fallback.")
                return None

            return {
                "indeks": raw_indeks,
                "tanggal": data.get("tanggal"),
                "uraian_informasi": uraian,
            }
        except Exception as e:
            logging.error(f"Model {model_name} failed: {str(e)}")
            return None

