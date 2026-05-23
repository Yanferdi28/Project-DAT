"""Quick test script to see raw OCR output and field extraction results."""

import os
import sys
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from PIL import Image
from services.preprocessor import ImagePreprocessor
from services.engine_factory import get_engine, get_default_engine_name
from services.text_cleaner import TextCleaner
from services.text_extractor import TextFieldExtractor
from services.llm_extractor import LLMExtractor

preprocessor = ImagePreprocessor()
text_cleaner = TextCleaner()
extractor = TextFieldExtractor()
llm_extractor = LLMExtractor()

# Test with documents in docs-reference
docs_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "..", "docs-reference", "Dataset RRI")

test_files = [
    "dispo_dir_utama_1.png",
    "MOU-STKIP-PGRI-Sumatera-Barat-dengan-RRI-Padang.jpeg",
    "surat_tugas_official_bintang_radio_2023_1_1.png",
]

engine = get_engine(get_default_engine_name())

for fname in test_files:
    fpath = os.path.join(docs_dir, fname)
    if not os.path.exists(fpath):
        print(f"SKIP: {fname} not found")
        continue

    print(f"\n{'='*80}")
    print(f"FILE: {fname}")
    print(f"{'='*80}")

    img = Image.open(fpath)
    processed = preprocessor.process(img)
    result = engine.extract_text(processed)
    cleaned = text_cleaner.clean(result["text"])

    print(f"\n--- RAW OCR TEXT (cleaned) ---")
    print(cleaned[:2000])

    print(f"\n--- REGEX EXTRACTION ---")
    fields = extractor.extract_all(cleaned)
    print(json.dumps(fields, indent=2, ensure_ascii=False))

    print(f"\n--- LLM EXTRACTION ---")
    llm_fields = llm_extractor.extract_all(cleaned)
    if llm_fields:
        print(json.dumps(llm_fields, indent=2, ensure_ascii=False))
    else:
        print("LLM Extraction skipped (API Key not configured or failed)")
    print()
