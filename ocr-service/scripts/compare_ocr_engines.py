"""
OCR Engines Benchmark & Comparison Script
Compares Tesseract, EasyOCR, and PaddleOCR on sample documents/PDFs.
Generates performance, confidence, and text extraction accuracy metrics for thesis evaluation.
"""

import argparse
import json
import os
import sys
import time
from pathlib import Path

# Add root ocr-service directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from PIL import Image
from services.engine_factory import get_engine, list_available_engines
from services.preprocessor import ImagePreprocessor


def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate character-level similarity (difflib Ratio) between two texts."""
    import difflib
    if not text1 and not text2:
        return 100.0
    if not text1 or not text2:
        return 0.0
    matcher = difflib.SequenceMatcher(None, text1, text2)
    return round(matcher.ratio() * 100.0, 2)


def run_benchmark(file_path: str, engines: list[str] = None):
    """
    Run comparison benchmark across specified engines on a given file.
    """
    if engines is None:
        engines = ["tesseract", "easyocr", "paddleocr"]

    path = Path(file_path)
    if not path.exists():
        print(f"[ERROR] File not found: {file_path}")
        return

    print(f"\n=======================================================")
    print(f"       OCR ENGINES COMPARISON BENCHMARK              ")
    print(f"=======================================================")
    print(f"Target File: {path.resolve()}")
    print(f"Engines    : {', '.join(engines)}")
    print(f"-------------------------------------------------------\n")

    # Load image or first page of PDF
    preprocessor = ImagePreprocessor()
    image = None

    if path.suffix.lower() == ".pdf":
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(str(path))
        page = pdf[0]
        bitmap = page.render(scale=300 / 72)
        image = bitmap.to_pil().convert("RGB")
        bitmap.close()
        page.close()
        pdf.close()
    else:
        image = Image.open(str(path)).convert("RGB")

    processed_image = preprocessor.process(image)

    results = []

    for engine_name in engines:
        print(f"[*] Testing Engine: {engine_name.upper()}...")
        try:
            start_time = time.time()
            engine_inst = get_engine(engine_name)
            res = engine_inst.extract_text(processed_image)
            elapsed_sec = round(time.time() - start_time, 3)

            text_output = res.get("text", "")
            confidence = res.get("confidence", 0.0)
            word_count = res.get("word_count", 0)

            results.append({
                "engine": engine_name,
                "status": "Success",
                "execution_time_sec": elapsed_sec,
                "confidence_score": confidence,
                "word_count": word_count,
                "text_length": len(text_output),
                "sample_text": text_output[:150].replace("\n", " "),
                "full_text": text_output,
            })
            print(f"    -> Done in {elapsed_sec}s | Words: {word_count} | Confidence: {confidence}%\n")
        except Exception as e:
            print(f"    -> [ERROR] Failed to run {engine_name}: {e}\n")
            results.append({
                "engine": engine_name,
                "status": f"Failed: {e}",
                "execution_time_sec": 0,
                "confidence_score": 0,
                "word_count": 0,
                "text_length": 0,
                "sample_text": "",
                "full_text": "",
            })

    # Display Comparison Summary Table
    print(f"\n=========================================================================")
    print(f"                         BENCHMARK RESULTS TABLE                         ")
    print(f"=========================================================================")
    print(f"{'Engine':<12} | {'Time (s)':<10} | {'Confidence (%)':<15} | {'Word Count':<12} | {'Text Length':<12}")
    print(f"-------------------------------------------------------------------------")
    for r in results:
        print(f"{r['engine']:<12} | {r['execution_time_sec']:<10} | {r['confidence_score']:<15} | {r['word_count']:<12} | {r['text_length']:<12}")
    print(f"=========================================================================\n")

    # Generate Markdown Table for Thesis
    md_content = f"""# Tabel Perbandingan Performa Engine OCR

File Uji: `{path.name}`

| Engine OCR | Waktu Eksekusi (detik) | Skor Confidensi (%) | Jumlah Kata | Jumlah Karakter | Status |
| :--- | :---: | :---: | :---: | :---: | :---: |
"""
    for r in results:
        md_content += f"| **{r['engine'].upper()}** | {r['execution_time_sec']} s | {r['confidence_score']}% | {r['word_count']} kata | {r['text_length']} char | {r['status']} |\n"

    md_path = path.parent / f"benchmark_ocr_comparison.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(md_content)

    print(f"[+] Markdown report saved to: {md_path.resolve()}\n")
    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="OCR Engine Benchmark Script")
    parser.add_argument("--file", type=str, help="Path to sample image or PDF file to benchmark")
    args = parser.parse_args()

    if args.file:
        run_benchmark(args.file)
    else:
        # Default sample file search
        sample_file = "../Docs RRI/sintetis/UM.01.01/UM.01.01_001_laporan.pdf"
        if os.path.exists(sample_file):
            run_benchmark(sample_file)
        else:
            print("Usage: python scripts/compare_ocr_engines.py --file <path_to_image_or_pdf>")
