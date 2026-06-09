"""
Generate draft classifier training rows for SKKAD codes missing from training data.

The output is intentionally a draft: review and edit the generated text before
merging it into the active training data.
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parents[2]
SEEDER_PATH = ROOT_DIR / "database" / "seeders" / "KodeKlasifikasiSeeder.php"
TRAINING_PATH = ROOT_DIR / "ocr-service" / "data" / "training_data.json"
OUTPUT_JSON = ROOT_DIR / "ocr-service" / "data" / "training_data_missing_skkad_draft.json"
OUTPUT_CSV = ROOT_DIR / "ocr-service" / "data" / "training_data_missing_skkad_draft.csv"
OUTPUT_SUMMARY_CSV = ROOT_DIR / "ocr-service" / "data" / "training_data_missing_skkad_draft.summary.csv"
SAMPLES_PER_LABEL = 5
ACRONYMS = (
    "AI",
    "AM",
    "BA",
    "BMN",
    "CPNS",
    "DAB",
    "DIPA",
    "DRM",
    "FM",
    "IT",
    "KGB",
    "KKN",
    "KORPRI",
    "KPA",
    "LAKIP",
    "LC",
    "LHKPN",
    "LPP",
    "MOU",
    "NIP",
    "PNBP",
    "PPK",
    "PPNS",
    "PNS",
    "RKA",
    "RRI",
    "SK",
    "SOP",
    "SP2D",
    "SPK",
    "SPM",
    "SPMT",
    "SPP",
)


def parse_php_value(value: str) -> str | int | None:
    value = value.strip().rstrip(",")

    if value == "null":
        return None

    if value.startswith("'") and value.endswith("'"):
        return value[1:-1].replace("\\'", "'")

    if value.isdigit():
        return int(value)

    return value


def parse_seeder_entries(path: Path) -> list[dict[str, str | int | None]]:
    content = path.read_text(encoding="utf-8")
    rows: list[dict[str, str | int | None]] = []

    for match in re.finditer(r"\[(.*?)\],", content):
        raw_item = match.group(1)
        if "'kode_klasifikasi'" not in raw_item:
            continue

        row: dict[str, str | int | None] = {}
        for key, value in re.findall(r"'([^']+)'\s*=>\s*('(?:\\'|[^'])*'|null|\d+)", raw_item):
            row[key] = parse_php_value(value)

        if row.get("kode_klasifikasi") and row.get("uraian"):
            rows.append(row)

    return rows


def load_training_codes(path: Path) -> set[str]:
    rows = json.loads(path.read_text(encoding="utf-8"))
    return {
        str(row["label"]).split("|", 1)[0]
        for row in rows
        if isinstance(row, dict) and row.get("label")
    }


def parent_chain(code: str, rows_by_code: dict[str, dict[str, str | int | None]]) -> list[str]:
    chain: list[str] = []
    current = rows_by_code.get(code)

    while current:
        parent_code = current.get("kode_klasifikasi_induk")
        if not parent_code:
            break

        parent = rows_by_code.get(str(parent_code))
        if not parent:
            break

        parent_uraian = str(parent.get("uraian", "")).strip()
        if parent_uraian:
            chain.append(clean_phrase(parent_uraian))

        current = parent

    return list(reversed(chain))


def clean_phrase(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def sentence_phrase(text: str) -> str:
    phrase = clean_phrase(text).lower()

    for acronym in ACRONYMS:
        phrase = re.sub(rf"\b{re.escape(acronym.lower())}\b", acronym, phrase)

    return phrase


def generate_samples(code: str, uraian: str, context: str) -> list[str]:
    subject = clean_phrase(uraian)
    subject_phrase = sentence_phrase(subject)
    context_phrase = f" pada bidang {sentence_phrase(context)}" if context else ""

    samples = [
        f"Dokumen {subject_phrase}{context_phrase} di lingkungan LPP RRI",
        f"Nota dinas perihal {subject_phrase}{context_phrase}",
        f"Berkas arsip {subject_phrase} memuat surat, lampiran, dan data pendukung",
        f"Laporan kegiatan terkait {subject_phrase}{context_phrase}",
        f"Nomor surat menggunakan kode klasifikasi {code} tentang {subject_phrase}",
    ]

    return [clean_phrase(sample) for sample in samples[:SAMPLES_PER_LABEL]]


def main() -> None:
    seeder_rows = parse_seeder_entries(SEEDER_PATH)
    rows_by_code = {
        str(row["kode_klasifikasi"]): row
        for row in seeder_rows
    }
    parent_codes = {
        str(row["kode_klasifikasi_induk"])
        for row in seeder_rows
        if row.get("kode_klasifikasi_induk")
    }
    training_codes = load_training_codes(TRAINING_PATH)

    leaf_rows = [
        row for row in seeder_rows
        if str(row["kode_klasifikasi"]) not in parent_codes
    ]
    missing_rows = [
        row for row in leaf_rows
        if str(row["kode_klasifikasi"]) not in training_codes
    ]
    missing_rows.sort(key=lambda row: str(row["kode_klasifikasi"]))

    draft_rows: list[dict[str, str]] = []
    summary_rows: list[dict[str, str | int]] = []

    for row in missing_rows:
        code = str(row["kode_klasifikasi"])
        uraian = str(row["uraian"])
        context_parts = parent_chain(code, rows_by_code)
        context = " / ".join(context_parts)
        label = f"{code}|{uraian}"
        samples = generate_samples(code, uraian, context)

        summary_rows.append({
            "kode_klasifikasi": code,
            "uraian": uraian,
            "parent_context": context,
            "draft_samples": len(samples),
        })

        for index, sample in enumerate(samples, start=1):
            draft_rows.append({
                "label": label,
                "text": sample,
                "kode_klasifikasi": code,
                "uraian": uraian,
                "parent_context": context,
                "source": "skkad-seeder-missing-code-draft",
                "review_status": "draft",
                "sample_no": str(index),
            })

    OUTPUT_JSON.write_text(
        json.dumps(draft_rows, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    with OUTPUT_CSV.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "label",
                "text",
                "kode_klasifikasi",
                "uraian",
                "parent_context",
                "source",
                "review_status",
                "sample_no",
            ],
        )
        writer.writeheader()
        writer.writerows(draft_rows)

    with OUTPUT_SUMMARY_CSV.open("w", encoding="utf-8", newline="") as csv_file:
        writer = csv.DictWriter(
            csv_file,
            fieldnames=[
                "kode_klasifikasi",
                "uraian",
                "parent_context",
                "draft_samples",
            ],
        )
        writer.writeheader()
        writer.writerows(summary_rows)

    print(f"Seeder codes: {len(seeder_rows)}")
    print(f"Leaf codes: {len(leaf_rows)}")
    print(f"Training codes: {len(training_codes)}")
    print(f"Missing leaf codes: {len(missing_rows)}")
    print(f"Draft rows: {len(draft_rows)}")
    print(f"JSON: {OUTPUT_JSON}")
    print(f"CSV: {OUTPUT_CSV}")
    print(f"Summary: {OUTPUT_SUMMARY_CSV}")


if __name__ == "__main__":
    main()
