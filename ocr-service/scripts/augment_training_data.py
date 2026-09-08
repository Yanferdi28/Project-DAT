"""
Text Augmentation Script for Document Classification Training Data.

Generates additional training samples per class using multiple augmentation
techniques tailored for Indonesian bureaucratic/archival text:

1. Synonym substitution (domain-specific Indonesian synonyms)
2. Word reordering within phrases
3. Prefix/suffix variation (adding document-type prefixes)
4. Keyword emphasis (repeat important domain keywords)
5. OCR noise simulation (common OCR errors for realistic data)
6. Template combination (merge phrases from existing samples)

Usage:
    python augment_training_data.py
    python augment_training_data.py --input data/training_data.json --output data/training_data_augmented.json --target 15
"""

import json
import os
import random
import re
import argparse
from collections import defaultdict
from typing import Optional

random.seed(42)

# ============================================================
# Indonesian bureaucratic synonym groups
# ============================================================
SYNONYM_GROUPS = [
    # Dokumen types
    ["dokumen", "berkas", "naskah", "arsip", "surat"],
    ["laporan", "report", "hasil laporan", "catatan laporan"],
    ["surat keputusan", "SK", "keputusan", "penetapan"],
    ["nota dinas", "nota", "memo dinas", "memorandum"],
    ["berita acara", "BA", "risalah"],
    ["peraturan", "regulasi", "aturan", "ketentuan"],
    ["pedoman", "panduan", "petunjuk", "acuan"],
    ["proposal", "usulan", "ajuan", "rancangan usulan"],

    # Verbs/Actions
    ["pengajuan", "permohonan", "permintaan", "pengiriman"],
    ["pengelolaan", "manajemen", "pengurusan", "tata kelola"],
    ["pelaksanaan", "implementasi", "penerapan", "pengerjaan"],
    ["pengawasan", "pemantauan", "monitoring", "supervisi"],
    ["evaluasi", "penilaian", "review", "pengkajian"],
    ["pembentukan", "pendirian", "penetapan", "pengangkatan"],
    ["penyusunan", "pembuatan", "perancangan", "perumusan"],
    ["pengumpulan", "penghimpunan", "pengadaan", "koleksi"],
    ["penyerahan", "serah terima", "penyampaian", "pengiriman"],
    ["pemeriksaan", "pengecekan", "inspeksi", "audit"],
    ["penanganan", "penyelesaian", "proses", "tindak lanjut"],
    ["pelaporan", "penyampaian laporan", "penyusunan laporan"],

    # Nouns
    ["kegiatan", "aktivitas", "program kerja", "agenda"],
    ["pegawai", "karyawan", "pekerja", "staf", "personel"],
    ["pimpinan", "kepala", "direksi", "atasan"],
    ["lembaga", "instansi", "organisasi", "badan"],
    ["anggaran", "budget", "dana", "alokasi dana"],
    ["keuangan", "finansial", "bendahara", "kas"],
    ["kinerja", "performa", "prestasi kerja", "capaian"],
    ["perjanjian", "kontrak", "kesepakatan", "MOU"],
    ["kerjasama", "kolaborasi", "partnership", "mitra kerja"],
    ["pengadaan", "procurement", "pembelian", "perolehan"],
    ["aset", "barang", "inventaris", "harta"],
    ["peralatan", "perlengkapan", "sarana", "fasilitas"],
    ["siaran", "program siaran", "tayangan", "broadcast"],
    ["penyiaran", "broadcasting", "media penyiaran"],

    # Adjectives/modifiers
    ["tahunan", "per tahun", "setiap tahun"],
    ["bulanan", "per bulan", "setiap bulan"],
    ["internal", "dalam", "lingkup internal"],
    ["eksternal", "luar", "pihak luar"],
    ["resmi", "formal", "dinas"],
    ["operasional", "teknis", "pelaksanaan"],

    # RRI-specific
    ["RRI", "LPP RRI", "Radio Republik Indonesia", "Lembaga Penyiaran Publik RRI"],
    ["satuan kerja", "satker", "unit kerja"],
]

# Build lookup: word -> list of synonyms
SYNONYM_MAP = {}
for group in SYNONYM_GROUPS:
    lower_group = [w.lower() for w in group]
    for word in lower_group:
        SYNONYM_MAP[word] = [w for w in lower_group if w != word]

# Document type prefixes for variation
DOC_PREFIXES = [
    "Dokumen", "Berkas", "Naskah", "Arsip", "Surat", "Formulir",
    "Administrasi", "Data", "Catatan", "File",
]

# Action prefixes
ACTION_PREFIXES = [
    "Pengelolaan", "Pengurusan", "Proses", "Tata kelola",
    "Administrasi", "Manajemen", "Pelaksanaan",
]

# Common OCR character substitutions
OCR_SUBSTITUTIONS = {
    "l": "1",
    "I": "l",
    "O": "0",
    "0": "O",
    "rn": "m",
    "cl": "d",
    "ii": "u",
}


def synonym_replace(text: str, n_replacements: int = 2) -> Optional[str]:
    """Replace random words with their synonyms."""
    words = text.split()
    replaced = False

    for _ in range(n_replacements):
        # Try to find a replaceable word/phrase
        for i in range(len(words)):
            # Try two-word phrase first
            if i + 1 < len(words):
                phrase = f"{words[i]} {words[i+1]}".lower()
                if phrase in SYNONYM_MAP and SYNONYM_MAP[phrase]:
                    replacement = random.choice(SYNONYM_MAP[phrase])
                    rep_words = replacement.split()
                    # Preserve capitalisation of first word
                    if words[i][0].isupper():
                        rep_words[0] = rep_words[0].capitalize()
                    words[i:i+2] = rep_words
                    replaced = True
                    break

            word_lower = words[i].lower().rstrip(".,;:")
            suffix = words[i][len(word_lower):]
            if word_lower in SYNONYM_MAP and SYNONYM_MAP[word_lower]:
                replacement = random.choice(SYNONYM_MAP[word_lower])
                if words[i][0].isupper():
                    replacement = replacement.capitalize()
                words[i] = replacement + suffix
                replaced = True
                break

    if replaced:
        return " ".join(words)
    return None


def word_reorder(text: str) -> Optional[str]:
    """Reorder parts of the text while keeping it meaningful."""
    # Split by "dan", "serta", "atau" and reorder
    for separator in [" dan ", " serta ", " atau "]:
        if separator in text:
            parts = text.split(separator, 1)
            if len(parts) == 2:
                return f"{parts[1].strip()}{separator}{parts[0].strip()}"

    # Swap first and second half around a preposition
    for prep in [" untuk ", " dalam ", " pada ", " di ", " dari ", " ke ", " kepada "]:
        if prep in text:
            parts = text.split(prep, 1)
            if len(parts) == 2 and len(parts[0]) > 10 and len(parts[1]) > 10:
                return f"{parts[1].strip()}{prep}{parts[0].strip()}"

    return None


def add_prefix(text: str) -> str:
    """Add a document-type or action prefix."""
    text_lower = text.lower()

    # Don't add prefix if text already starts with one
    for prefix in DOC_PREFIXES + ACTION_PREFIXES:
        if text_lower.startswith(prefix.lower()):
            return text

    prefix = random.choice(DOC_PREFIXES + ACTION_PREFIXES)
    # Lowercase the original first word if adding prefix
    words = text.split()
    if words and words[0][0].isupper():
        words[0] = words[0][0].lower() + words[0][1:]

    return f"{prefix} {' '.join(words)}"


def add_suffix(text: str) -> str:
    """Add contextual suffixes."""
    suffixes = [
        " RRI",
        " LPP RRI",
        " satuan kerja",
        " tahun berjalan",
        " periode berjalan",
        " lembaga penyiaran",
        " unit kerja",
        " sesuai ketentuan",
        " sesuai regulasi",
    ]

    suffix = random.choice(suffixes)
    # Don't add if the suffix already exists
    if suffix.strip().lower() in text.lower():
        return text + random.choice([" terbaru", " resmi", " internal"])

    return text.rstrip(".") + suffix


def simulate_ocr_noise(text: str) -> str:
    """Add realistic OCR noise to the text."""
    result = list(text)
    n_changes = random.randint(1, 2)

    for _ in range(n_changes):
        pos = random.randint(0, len(result) - 1)
        char = result[pos]
        if char in OCR_SUBSTITUTIONS:
            result[pos] = OCR_SUBSTITUTIONS[char]
        elif random.random() < 0.3:
            # Random space insertion (common OCR error)
            result.insert(pos, " ")

    return "".join(result)


def combine_templates(texts: list[str]) -> Optional[str]:
    """Combine fragments from different samples of the same class."""
    if len(texts) < 2:
        return None

    t1, t2 = random.sample(texts, 2)
    words1 = t1.split()
    words2 = t2.split()

    if len(words1) < 4 or len(words2) < 4:
        return None

    # Take first half of t1 and second half of t2
    mid1 = len(words1) // 2
    mid2 = len(words2) // 2

    combined = " ".join(words1[:mid1] + words2[mid2:])

    # Make sure it's not too similar to originals
    if combined == t1 or combined == t2:
        return None

    return combined


def drop_random_words(text: str, drop_rate: float = 0.15) -> Optional[str]:
    """Randomly drop some words (simulates incomplete OCR extraction)."""
    words = text.split()
    if len(words) < 5:
        return None

    kept = [w for w in words if random.random() > drop_rate]
    if len(kept) < 3:
        return None

    result = " ".join(kept)
    if result != text:
        return result
    return None


def augment_text(text: str, all_texts_for_class: list[str], technique: str) -> Optional[str]:
    """Apply a specific augmentation technique."""
    if technique == "synonym":
        return synonym_replace(text, n_replacements=random.randint(1, 3))
    elif technique == "reorder":
        return word_reorder(text)
    elif technique == "prefix":
        return add_prefix(text)
    elif technique == "suffix":
        return add_suffix(text)
    elif technique == "ocr_noise":
        return simulate_ocr_noise(text)
    elif technique == "combine":
        return combine_templates(all_texts_for_class)
    elif technique == "drop":
        return drop_random_words(text)
    elif technique == "synonym_prefix":
        result = synonym_replace(text, n_replacements=1)
        if result:
            return add_prefix(result)
        return add_prefix(text)
    elif technique == "synonym_suffix":
        result = synonym_replace(text, n_replacements=1)
        if result:
            return add_suffix(result)
        return add_suffix(text)
    return None


def augment_dataset(
    data: list[dict],
    target_per_class: int = 15,
    max_per_class: int = 25,
) -> list[dict]:
    """Augment the training dataset to reach target samples per class.

    Args:
        data: Original training data (list of {text, label} dicts)
        target_per_class: Target number of samples per class
        max_per_class: Maximum samples per class (cap)

    Returns:
        Augmented dataset including original data
    """
    # Group by label
    label_texts = defaultdict(list)
    for item in data:
        label = item.get("label", "").strip()
        text = item.get("text", "").strip()
        if label and text:
            label_texts[label].append(text)

    techniques = [
        "synonym", "reorder", "prefix", "suffix",
        "ocr_noise", "combine", "drop",
        "synonym_prefix", "synonym_suffix",
    ]

    augmented_data = list(data)  # Start with originals
    stats = {"original": len(data), "augmented": 0, "per_class": {}}

    for label, texts in sorted(label_texts.items()):
        current_count = len(texts)
        needed = min(target_per_class, max_per_class) - current_count

        if needed <= 0:
            stats["per_class"][label] = {"original": current_count, "added": 0}
            continue

        generated_texts = set(t.lower() for t in texts)  # Track duplicates
        added = 0
        attempts = 0
        max_attempts = needed * 10  # Prevent infinite loop

        while added < needed and attempts < max_attempts:
            attempts += 1
            # Pick a random source text and technique
            source_text = random.choice(texts)
            technique = random.choice(techniques)

            new_text = augment_text(source_text, texts, technique)

            if new_text and new_text.lower() not in generated_texts and len(new_text) >= 20:
                generated_texts.add(new_text.lower())
                augmented_data.append({"text": new_text, "label": label})
                added += 1

        stats["per_class"][label] = {"original": current_count, "added": added}
        stats["augmented"] += added

    stats["total"] = stats["original"] + stats["augmented"]
    return augmented_data, stats


def main():
    parser = argparse.ArgumentParser(description="Augment training data for document classifier")
    parser.add_argument(
        "--input",
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "training_data.json"),
        help="Path to original training data JSON",
    )
    parser.add_argument(
        "--output",
        default=os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "training_data_augmented.json"),
        help="Path to save augmented training data JSON",
    )
    parser.add_argument(
        "--target", type=int, default=15,
        help="Target number of samples per class (default: 15)",
    )
    parser.add_argument(
        "--max", type=int, default=25,
        help="Maximum number of samples per class (default: 25)",
    )

    args = parser.parse_args()

    if not os.path.exists(args.input):
        print(f"Error: Input file not found: {args.input}")
        return 1

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Original dataset: {len(data)} samples")

    augmented_data, stats = augment_dataset(data, target_per_class=args.target, max_per_class=args.max)

    # Save
    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(augmented_data, f, indent=2, ensure_ascii=False)

    print(f"\nAugmentation completed!")
    print(f"  Original samples:  {stats['original']}")
    print(f"  Augmented samples: {stats['augmented']}")
    print(f"  Total samples:     {stats['total']}")

    # Show distribution of added samples
    added_counts = [v["added"] for v in stats["per_class"].values()]
    print(f"\n  Classes augmented: {sum(1 for c in added_counts if c > 0)} / {len(stats['per_class'])}")
    if added_counts:
        print(f"  Min added per class: {min(added_counts)}")
        print(f"  Max added per class: {max(added_counts)}")
        print(f"  Avg added per class: {sum(added_counts) / len(added_counts):.1f}")

    print(f"\nSaved to: {os.path.abspath(args.output)}")

    # Show some augmented examples
    print(f"\n{'='*60}")
    print("Sample augmented texts:")
    print(f"{'='*60}")

    label_new = defaultdict(list)
    for item in augmented_data[len(data):]:
        label_new[item["label"]].append(item["text"])

    sample_labels = list(label_new.keys())[:3]
    for label in sample_labels:
        print(f"\nLabel: {label}")
        # Show originals
        originals = [d["text"] for d in data if d.get("label") == label]
        print(f"  Originals ({len(originals)}):")
        for t in originals[:2]:
            print(f"    [orig] {t}")
        # Show augmented
        print(f"  Augmented ({len(label_new[label])}):")
        for t in label_new[label][:5]:
            print(f"    [aug]  {t}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
