"""
Generate synthetic PDF documents for all SKKAD classification codes.

Each classification code gets at least 5 PDF documents with realistic
Indonesian government letter layouts, varying templates (Nota Dinas,
Surat Tugas, SK, Laporan, etc.), and content that includes the
classification code in the letter number.

Usage:
    python generate_synthetic_docs.py                 # Generate all
    python generate_synthetic_docs.py --dry-run       # Preview counts only
    python generate_synthetic_docs.py --codes PR.01.01 KP.01.06  # Specific codes
    python generate_synthetic_docs.py --limit 10      # First N codes only
"""

from __future__ import annotations

import argparse
import json
import os
import random
import re
import sys
import textwrap
import time
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, PageBreak, KeepTogether,
)
from reportlab.lib.colors import HexColor, black, grey
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Local imports
sys.path.insert(0, os.path.dirname(__file__))
from doc_templates import (
    DocType,
    get_doc_type_for_code,
    get_varied_doc_types,
    get_perihal,
    get_body_paragraphs,
    get_pejabat,
    get_tembusan,
    _rand_date_str,
    _rand_surat_number,
    _rand_nip,
    _rand_year,
    CLOSING_SENTENCES,
    MENIMBANG_TEMPLATES,
    MENGINGAT_TEMPLATES,
    UNIT_KERJA,
    KOTA,
)

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ROOT_DIR = Path(__file__).resolve().parents[2]
SEEDER_PATH = ROOT_DIR / "database" / "seeders" / "KodeKlasifikasiSeeder.php"
TRAINING_SCRIPT = ROOT_DIR / "ocr-service" / "scripts" / "generate_training_data.py"
OUTPUT_DIR = ROOT_DIR / "Docs RRI" / "sintetis"
DOCS_PER_CODE = 5

PAGE_WIDTH, PAGE_HEIGHT = A4  # 595.27, 841.89 points


# ---------------------------------------------------------------------------
# Style configuration
# ---------------------------------------------------------------------------

def _build_styles() -> dict[str, ParagraphStyle]:
    """Build paragraph styles for document generation."""
    base = getSampleStyleSheet()

    styles = {}

    styles["kop_title"] = ParagraphStyle(
        "kop_title",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=17,
        alignment=TA_CENTER,
        textColor=HexColor("#1a237e"),
    )
    styles["kop_subtitle"] = ParagraphStyle(
        "kop_subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        alignment=TA_CENTER,
        textColor=HexColor("#333333"),
    )
    styles["doc_title"] = ParagraphStyle(
        "doc_title",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        alignment=TA_CENTER,
        spaceAfter=2 * mm,
    )
    styles["doc_subtitle"] = ParagraphStyle(
        "doc_subtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
        spaceAfter=4 * mm,
    )
    styles["body"] = ParagraphStyle(
        "body",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        firstLineIndent=1.2 * cm,
        spaceBefore=2 * mm,
        spaceAfter=2 * mm,
    )
    styles["body_no_indent"] = ParagraphStyle(
        "body_no_indent",
        parent=styles["body"],
        firstLineIndent=0,
    )
    styles["label_left"] = ParagraphStyle(
        "label_left",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        alignment=TA_LEFT,
    )
    styles["label_bold"] = ParagraphStyle(
        "label_bold",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=TA_LEFT,
    )
    styles["right_align"] = ParagraphStyle(
        "right_align",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        alignment=TA_RIGHT,
    )
    styles["signature"] = ParagraphStyle(
        "signature",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
    )
    styles["signature_name"] = ParagraphStyle(
        "signature_name",
        parent=base["Normal"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        alignment=TA_CENTER,
    )
    styles["small"] = ParagraphStyle(
        "small",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        alignment=TA_LEFT,
        textColor=HexColor("#666666"),
    )
    styles["list_item"] = ParagraphStyle(
        "list_item",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_JUSTIFY,
        leftIndent=1 * cm,
        spaceBefore=1 * mm,
    )

    return styles


# ---------------------------------------------------------------------------
# Reusable document building blocks
# ---------------------------------------------------------------------------

def _kop_surat(styles: dict) -> list:
    """Generate letter header (kop surat) elements."""
    elements = []
    elements.append(Paragraph(
        "LEMBAGA PENYIARAN PUBLIK",
        styles["kop_title"],
    ))
    elements.append(Paragraph(
        "RADIO REPUBLIK INDONESIA",
        styles["kop_title"],
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        "Jalan Pangeran Antasari No. 2, Banjarmasin 70114, Kalimantan Selatan",
        styles["kop_subtitle"],
    ))
    elements.append(Paragraph(
        "Telepon: (0511) 3352171 — Faksimile: (0511) 3353350 — Email: rribjm@rri.co.id",
        styles["kop_subtitle"],
    ))
    elements.append(Spacer(1, 1 * mm))
    elements.append(HRFlowable(
        width="100%", thickness=2, color=HexColor("#1a237e"),
        spaceBefore=1 * mm, spaceAfter=3 * mm,
    ))
    return elements


def _signature_block(styles: dict, nama: str, jabatan: str, nip: str | None = None) -> list:
    """Generate a signature block."""
    elements = []
    elements.append(Spacer(1, 8 * mm))
    elements.append(Paragraph(jabatan + ",", styles["signature"]))
    elements.append(Spacer(1, 18 * mm))  # Space for actual signature
    elements.append(Paragraph(f"<b>{nama}</b>", styles["signature"]))
    if nip:
        elements.append(Paragraph(f"NIP. {nip}", styles["signature"]))
    return elements


def _tembusan_block(styles: dict) -> list:
    """Generate a tembusan (cc) block."""
    tembusan_list = get_tembusan(random.randint(2, 4))
    elements = []
    elements.append(Spacer(1, 5 * mm))
    elements.append(Paragraph("<b>Tembusan:</b>", styles["label_left"]))
    for i, t in enumerate(tembusan_list, 1):
        elements.append(Paragraph(f"{i}. {t}", styles["list_item"]))
    return elements


# ---------------------------------------------------------------------------
# Document template builders
# ---------------------------------------------------------------------------

def _build_nota_dinas(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Nota Dinas (internal memo) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.NOTA_DINAS)
    tanggal = _rand_date_str()
    pejabat_dari = get_pejabat(1)[0]
    pejabat_kepada = get_pejabat(1)[0]
    # Ensure they are different
    while pejabat_kepada[0] == pejabat_dari[0]:
        pejabat_kepada = get_pejabat(1)[0]

    perihal = get_perihal(kode)

    elements.append(Paragraph("<b>NOTA DINAS</b>", styles["doc_title"]))
    elements.append(Spacer(1, 3 * mm))

    # Header table
    header_data = [
        [Paragraph("Nomor", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(nomor, styles["label_left"])],
        [Paragraph("Kepada", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(f"Yth. {pejabat_kepada[1]}", styles["label_left"])],
        [Paragraph("Dari", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(pejabat_dari[1], styles["label_left"])],
        [Paragraph("Tanggal", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(tanggal, styles["label_left"])],
        [Paragraph("Perihal", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(f"<b>{perihal}</b>", styles["label_left"])],
    ]
    header_table = Table(header_data, colWidths=[2.5 * cm, 0.5 * cm, 12 * cm])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    elements.append(header_table)

    elements.append(Spacer(1, 3 * mm))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=grey, spaceAfter=3 * mm))

    # Body
    paragraphs = get_body_paragraphs(kode, random.randint(2, 4))
    for para in paragraphs:
        elements.append(Paragraph(para, styles["body"]))

    elements.append(Paragraph(random.choice(CLOSING_SENTENCES), styles["body"]))

    # Signature
    elements.extend(_signature_block(styles, pejabat_dari[0], pejabat_dari[1], _rand_nip()))

    return elements


def _build_surat_tugas(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Surat Tugas (assignment letter) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.SURAT_TUGAS)
    tanggal = _rand_date_str()
    pejabat = get_pejabat(1)[0]
    pegawai_list = get_pejabat(random.randint(2, 4))

    elements.append(Paragraph("<b>SURAT TUGAS</b>", styles["doc_title"]))
    elements.append(Paragraph(f"Nomor: {nomor}", styles["doc_subtitle"]))
    elements.append(Spacer(1, 3 * mm))

    elements.append(Paragraph(
        f"Yang bertanda tangan di bawah ini, {pejabat[1]} LPP RRI, "
        f"dengan ini menugaskan:",
        styles["body_no_indent"],
    ))
    elements.append(Spacer(1, 3 * mm))

    # Table of assigned personnel
    table_data = [[
        Paragraph("<b>No</b>", styles["label_bold"]),
        Paragraph("<b>Nama</b>", styles["label_bold"]),
        Paragraph("<b>Jabatan</b>", styles["label_bold"]),
        Paragraph("<b>NIP</b>", styles["label_bold"]),
    ]]
    for i, (nama, jabatan) in enumerate(pegawai_list, 1):
        table_data.append([
            Paragraph(str(i), styles["label_left"]),
            Paragraph(nama, styles["label_left"]),
            Paragraph(jabatan, styles["label_left"]),
            Paragraph(_rand_nip(), styles["label_left"]),
        ])

    t = Table(table_data, colWidths=[1 * cm, 5.5 * cm, 5 * cm, 4 * cm])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, grey),
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#e8eaf6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)
    elements.append(Spacer(1, 4 * mm))

    kota = random.choice(KOTA)
    unit = random.choice(UNIT_KERJA)
    elements.append(Paragraph(
        f"Untuk melaksanakan tugas dinas dalam rangka {uraian.lower()} "
        f"di {unit} LPP RRI {kota}.",
        styles["body_no_indent"],
    ))
    elements.append(Paragraph(
        f"Surat tugas ini berlaku sejak tanggal ditetapkan dan berakhir "
        f"setelah tugas selesai dilaksanakan. Klasifikasi surat: <b>{kode}</b>.",
        styles["body_no_indent"],
    ))

    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"Ditetapkan di Banjarmasin<br/>pada tanggal {tanggal}",
        styles["right_align"],
    ))
    elements.extend(_signature_block(styles, pejabat[0], pejabat[1], _rand_nip()))

    return elements


def _build_surat_keputusan(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Surat Keputusan (decree) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.SURAT_KEPUTUSAN)
    tanggal = _rand_date_str()
    pejabat = get_pejabat(1)[0]

    elements.append(Paragraph("<b>KEPUTUSAN DIREKTUR UTAMA</b>", styles["doc_title"]))
    elements.append(Paragraph(
        "<b>LEMBAGA PENYIARAN PUBLIK RADIO REPUBLIK INDONESIA</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(f"Nomor: {nomor}", styles["doc_subtitle"]))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"<b>TENTANG</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        f"<b>{uraian.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Spacer(1, 4 * mm))
    elements.append(Paragraph(
        "<b>DIREKTUR UTAMA LEMBAGA PENYIARAN PUBLIK RADIO REPUBLIK INDONESIA,</b>",
        styles["doc_title"],
    ))
    elements.append(Spacer(1, 3 * mm))

    # Menimbang
    elements.append(Paragraph("<b>Menimbang</b> :", styles["label_bold"]))
    action_phrase = uraian.lower()
    for i, template in enumerate(random.sample(MENIMBANG_TEMPLATES, min(2, len(MENIMBANG_TEMPLATES)))):
        letter = chr(ord("a") + i)
        text = template.format(action=action_phrase, subject=action_phrase)
        elements.append(Paragraph(f"{letter}. {text}", styles["list_item"]))

    elements.append(Spacer(1, 2 * mm))

    # Mengingat
    elements.append(Paragraph("<b>Mengingat</b> :", styles["label_bold"]))
    for i, ref in enumerate(random.sample(MENGINGAT_TEMPLATES, min(3, len(MENGINGAT_TEMPLATES))), 1):
        elements.append(Paragraph(f"{i}. {ref}", styles["list_item"]))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph("<b>MEMUTUSKAN:</b>", styles["doc_title"]))
    elements.append(Spacer(1, 2 * mm))

    elements.append(Paragraph(
        f"<b>Menetapkan</b> : KEPUTUSAN DIREKTUR UTAMA LPP RRI TENTANG "
        f"{uraian.upper()}.",
        styles["body_no_indent"],
    ))
    elements.append(Spacer(1, 2 * mm))

    elements.append(Paragraph(
        f"<b>KESATU</b> : Menetapkan {uraian} di lingkungan Lembaga "
        f"Penyiaran Publik Radio Republik Indonesia sesuai dengan ketentuan "
        f"yang berlaku. Kode klasifikasi: <b>{kode}</b>.",
        styles["body_no_indent"],
    ))
    elements.append(Paragraph(
        f"<b>KEDUA</b> : Segala biaya yang timbul sebagai akibat "
        f"ditetapkannya keputusan ini dibebankan pada DIPA LPP RRI tahun "
        f"anggaran {_rand_year()}.",
        styles["body_no_indent"],
    ))
    elements.append(Paragraph(
        f"<b>KETIGA</b> : Keputusan ini mulai berlaku pada tanggal ditetapkan "
        f"dengan ketentuan apabila dikemudian hari terdapat kekeliruan akan "
        f"diadakan perbaikan sebagaimana mestinya.",
        styles["body_no_indent"],
    ))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        f"Ditetapkan di Banjarmasin<br/>pada tanggal {tanggal}",
        styles["right_align"],
    ))
    elements.extend(_signature_block(styles, pejabat[0], pejabat[1], _rand_nip()))
    elements.extend(_tembusan_block(styles))

    return elements


def _build_laporan(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Laporan (report) document."""
    elements = _kop_surat(styles)

    tanggal = _rand_date_str()
    year = _rand_year()

    elements.append(Paragraph("<b>LAPORAN</b>", styles["doc_title"]))
    elements.append(Paragraph(
        f"<b>{uraian.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        f"TAHUN {year}",
        styles["doc_subtitle"],
    ))
    elements.append(Spacer(1, 5 * mm))

    # Sections
    elements.append(Paragraph("<b>I. PENDAHULUAN</b>", styles["label_bold"]))
    elements.append(Paragraph(
        f"Laporan ini disusun sebagai bentuk pertanggungjawaban pelaksanaan "
        f"{uraian.lower()} di lingkungan Lembaga Penyiaran Publik Radio "
        f"Republik Indonesia selama tahun {year}.",
        styles["body"],
    ))

    paragraphs = get_body_paragraphs(kode, 2)
    for para in paragraphs:
        elements.append(Paragraph(para, styles["body"]))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph("<b>II. PELAKSANAAN</b>", styles["label_bold"]))

    elements.append(Paragraph(
        f"Pelaksanaan kegiatan {uraian.lower()} telah dilaksanakan sesuai "
        f"dengan rencana kerja yang telah ditetapkan. Berikut adalah "
        f"ringkasan pelaksanaan kegiatan:",
        styles["body"],
    ))

    # Simple data table
    table_data = [
        [Paragraph("<b>No</b>", styles["label_bold"]),
         Paragraph("<b>Kegiatan</b>", styles["label_bold"]),
         Paragraph("<b>Status</b>", styles["label_bold"]),
         Paragraph("<b>Keterangan</b>", styles["label_bold"])],
    ]
    activities = [
        "Pengumpulan data dan informasi",
        "Analisis dan evaluasi",
        "Penyusunan rekomendasi",
        "Koordinasi antar unit kerja",
        "Pelaporan hasil kegiatan",
    ]
    statuses = ["Selesai", "Selesai", "Selesai", "Dalam Proses", "Selesai"]
    for i, (act, stat) in enumerate(zip(activities, statuses), 1):
        table_data.append([
            Paragraph(str(i), styles["label_left"]),
            Paragraph(act, styles["label_left"]),
            Paragraph(stat, styles["label_left"]),
            Paragraph("-", styles["label_left"]),
        ])

    t = Table(table_data, colWidths=[1 * cm, 6 * cm, 3 * cm, 5 * cm])
    t.setStyle(TableStyle([
        ("GRID", (0, 0), (-1, -1), 0.5, grey),
        ("BACKGROUND", (0, 0), (-1, 0), HexColor("#e8eaf6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    elements.append(t)

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph("<b>III. KESIMPULAN DAN REKOMENDASI</b>", styles["label_bold"]))
    elements.append(Paragraph(
        f"Berdasarkan hasil pelaksanaan kegiatan, dapat disimpulkan bahwa "
        f"program {uraian.lower()} telah berjalan sesuai dengan rencana. "
        f"Direkomendasikan agar kegiatan serupa dapat dilanjutkan dan "
        f"ditingkatkan pada periode berikutnya.",
        styles["body"],
    ))

    pejabat = get_pejabat(1)[0]
    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        f"Banjarmasin, {tanggal}",
        styles["right_align"],
    ))
    elements.extend(_signature_block(styles, pejabat[0], pejabat[1], _rand_nip()))

    return elements


def _build_perjanjian(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Perjanjian Kerjasama / MoU document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.PERJANJIAN)
    tanggal = _rand_date_str()

    mitra_list = [
        "Universitas Lambung Mangkurat",
        "Pemerintah Provinsi Kalimantan Selatan",
        "Komisi Pemilihan Umum Daerah",
        "Badan Meteorologi Klimatologi dan Geofisika",
        "Kementerian Komunikasi dan Informatika",
        "PT Telekomunikasi Indonesia",
        "Badan Nasional Penanggulangan Bencana",
        "Dinas Pendidikan dan Kebudayaan",
    ]
    mitra = random.choice(mitra_list)

    elements.append(Paragraph(
        "<b>PERJANJIAN KERJASAMA</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        "<b>ANTARA</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        f"<b>LEMBAGA PENYIARAN PUBLIK RADIO REPUBLIK INDONESIA</b><br/>"
        f"<b>DENGAN</b><br/>"
        f"<b>{mitra.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"<b>TENTANG</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        f"<b>{uraian.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(f"Nomor: {nomor}", styles["doc_subtitle"]))
    elements.append(Spacer(1, 4 * mm))

    elements.append(Paragraph(
        f"Pada hari ini, {tanggal}, bertempat di Banjarmasin, yang bertanda "
        f"tangan di bawah ini:",
        styles["body_no_indent"],
    ))

    pejabat1 = get_pejabat(1)[0]
    pejabat2 = get_pejabat(1)[0]
    while pejabat2[0] == pejabat1[0]:
        pejabat2 = get_pejabat(1)[0]

    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"<b>PIHAK PERTAMA:</b><br/>"
        f"Nama: {pejabat1[0]}<br/>"
        f"Jabatan: {pejabat1[1]}<br/>"
        f"Bertindak untuk dan atas nama LPP RRI",
        styles["body_no_indent"],
    ))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"<b>PIHAK KEDUA:</b><br/>"
        f"Nama: {pejabat2[0]}<br/>"
        f"Jabatan: Pimpinan {mitra}<br/>"
        f"Bertindak untuk dan atas nama {mitra}",
        styles["body_no_indent"],
    ))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        f"Para pihak sepakat untuk mengadakan kerjasama dalam rangka "
        f"{uraian.lower()} dengan ketentuan sebagai berikut. "
        f"Kode klasifikasi arsip: <b>{kode}</b>.",
        styles["body"],
    ))

    # Pasal
    for i in range(1, 4):
        elements.append(Spacer(1, 2 * mm))
        elements.append(Paragraph(f"<b>Pasal {i}</b>", styles["doc_title"]))
        if i == 1:
            elements.append(Paragraph(
                f"Perjanjian kerjasama ini bertujuan untuk meningkatkan "
                f"sinergi dan kolaborasi antara LPP RRI dengan {mitra} "
                f"dalam bidang {uraian.lower()}.",
                styles["body"],
            ))
        elif i == 2:
            elements.append(Paragraph(
                f"Ruang lingkup kerjasama meliputi pertukaran informasi, "
                f"pemanfaatan sumber daya bersama, dan pelaksanaan kegiatan "
                f"yang saling menguntungkan kedua belah pihak.",
                styles["body"],
            ))
        else:
            elements.append(Paragraph(
                f"Perjanjian ini berlaku selama 2 (dua) tahun sejak tanggal "
                f"ditandatangani dan dapat diperpanjang berdasarkan kesepakatan "
                f"para pihak.",
                styles["body"],
            ))

    # Dual signature
    elements.append(Spacer(1, 5 * mm))
    sig_data = [
        [Paragraph("<b>PIHAK PERTAMA,</b>", styles["signature"]),
         Paragraph("<b>PIHAK KEDUA,</b>", styles["signature"])],
        [Spacer(1, 20 * mm), Spacer(1, 20 * mm)],
        [Paragraph(f"<b>{pejabat1[0]}</b>", styles["signature"]),
         Paragraph(f"<b>{pejabat2[0]}</b>", styles["signature"])],
    ]
    sig_table = Table(sig_data, colWidths=[7.5 * cm, 7.5 * cm])
    sig_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ]))
    elements.append(sig_table)

    return elements


def _build_berita_acara(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Berita Acara (official minutes/record) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.BERITA_ACARA)
    tanggal = _rand_date_str()

    elements.append(Paragraph("<b>BERITA ACARA</b>", styles["doc_title"]))
    elements.append(Paragraph(
        f"<b>{uraian.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(f"Nomor: {nomor}", styles["doc_subtitle"]))
    elements.append(Spacer(1, 4 * mm))

    kota = random.choice(KOTA)
    elements.append(Paragraph(
        f"Pada hari ini, {tanggal}, bertempat di kantor LPP RRI {kota}, "
        f"telah dilaksanakan {uraian.lower()} yang dihadiri oleh pihak-pihak "
        f"sebagai berikut:",
        styles["body_no_indent"],
    ))

    pejabat_list = get_pejabat(random.randint(2, 3))
    for i, (nama, jabatan) in enumerate(pejabat_list, 1):
        elements.append(Paragraph(
            f"{i}. {nama} — {jabatan}",
            styles["list_item"],
        ))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        f"Setelah dilakukan pemeriksaan dan pembahasan bersama, "
        f"diperoleh kesepakatan sebagai berikut:",
        styles["body_no_indent"],
    ))

    kesepakatan = [
        f"Kegiatan {uraian.lower()} telah dilaksanakan sesuai dengan ketentuan yang berlaku.",
        "Seluruh dokumen dan berkas telah diperiksa dan dinyatakan lengkap.",
        "Para pihak menyetujui hasil pelaksanaan kegiatan sebagaimana tercantum dalam berita acara ini.",
    ]
    for i, k in enumerate(kesepakatan, 1):
        elements.append(Paragraph(f"{i}. {k}", styles["list_item"]))

    elements.append(Spacer(1, 3 * mm))
    elements.append(Paragraph(
        f"Demikian berita acara ini dibuat dengan sebenarnya untuk dapat "
        f"dipergunakan sebagaimana mestinya. Kode arsip: <b>{kode}</b>.",
        styles["body"],
    ))

    # Multiple signatures
    elements.append(Spacer(1, 5 * mm))
    if len(pejabat_list) >= 2:
        sig_data = [
            [Paragraph(f"<b>{pejabat_list[0][1]},</b>", styles["signature"]),
             Paragraph(f"<b>{pejabat_list[1][1]},</b>", styles["signature"])],
            [Spacer(1, 18 * mm), Spacer(1, 18 * mm)],
            [Paragraph(f"<b>{pejabat_list[0][0]}</b>", styles["signature"]),
             Paragraph(f"<b>{pejabat_list[1][0]}</b>", styles["signature"])],
        ]
        sig_table = Table(sig_data, colWidths=[7.5 * cm, 7.5 * cm])
        sig_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ]))
        elements.append(sig_table)

    return elements


def _build_surat_edaran(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a Surat Edaran (circular letter) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.SURAT_EDARAN)
    tanggal = _rand_date_str()
    pejabat = get_pejabat(1)[0]

    elements.append(Paragraph("<b>SURAT EDARAN</b>", styles["doc_title"]))
    elements.append(Paragraph(f"Nomor: {nomor}", styles["doc_subtitle"]))
    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(
        f"<b>TENTANG</b>",
        styles["doc_title"],
    ))
    elements.append(Paragraph(
        f"<b>{uraian.upper()}</b>",
        styles["doc_title"],
    ))
    elements.append(Spacer(1, 4 * mm))

    elements.append(Paragraph(
        f"Kepada Yth.<br/>"
        f"Seluruh Pejabat dan Pegawai<br/>"
        f"di Lingkungan LPP RRI",
        styles["label_left"],
    ))
    elements.append(Spacer(1, 4 * mm))

    paragraphs = get_body_paragraphs(kode, random.randint(2, 3))
    for para in paragraphs:
        elements.append(Paragraph(para, styles["body"]))

    elements.append(Paragraph(
        f"Berkenaan dengan hal tersebut di atas, dengan ini disampaikan "
        f"edaran tentang {uraian.lower()} agar menjadi pedoman pelaksanaan "
        f"bagi seluruh unit kerja. Kode klasifikasi: <b>{kode}</b>.",
        styles["body"],
    ))

    # Numbered points
    points = [
        f"Seluruh unit kerja agar mempedomani ketentuan mengenai {uraian.lower()} dalam pelaksanaan tugas sehari-hari.",
        "Kepala unit kerja bertanggung jawab atas sosialisasi dan pelaksanaan surat edaran ini di lingkungan masing-masing.",
        "Surat edaran ini berlaku sejak tanggal ditetapkan sampai dengan adanya ketentuan lebih lanjut.",
    ]
    for i, point in enumerate(points, 1):
        elements.append(Paragraph(f"{i}. {point}", styles["list_item"]))

    elements.append(Spacer(1, 2 * mm))
    elements.append(Paragraph(random.choice(CLOSING_SENTENCES), styles["body"]))

    elements.append(Paragraph(
        f"Ditetapkan di Banjarmasin<br/>pada tanggal {tanggal}",
        styles["right_align"],
    ))
    elements.extend(_signature_block(styles, pejabat[0], pejabat[1], _rand_nip()))
    elements.extend(_tembusan_block(styles))

    return elements


def _build_surat_dinas(kode: str, uraian: str, doc_index: int, styles: dict) -> list:
    """Build a generic Surat Dinas (official letter) document."""
    elements = _kop_surat(styles)

    nomor = _rand_surat_number(kode, DocType.SURAT_DINAS)
    tanggal = _rand_date_str()
    pejabat = get_pejabat(1)[0]
    perihal = get_perihal(kode)

    # Right-aligned date and location
    elements.append(Paragraph(
        f"Banjarmasin, {tanggal}",
        styles["right_align"],
    ))
    elements.append(Spacer(1, 3 * mm))

    # Header info
    header_data = [
        [Paragraph("Nomor", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(nomor, styles["label_left"])],
        [Paragraph("Lampiran", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(f"{random.randint(1, 5)} berkas", styles["label_left"])],
        [Paragraph("Perihal", styles["label_left"]),
         Paragraph(": ", styles["label_left"]),
         Paragraph(f"<b>{perihal}</b>", styles["label_left"])],
    ]
    header_table = Table(header_data, colWidths=[2 * cm, 0.5 * cm, 12 * cm])
    header_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 1),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
    ]))
    elements.append(header_table)

    elements.append(Spacer(1, 4 * mm))

    # Recipient
    penerima = get_pejabat(1)[0]
    while penerima[0] == pejabat[0]:
        penerima = get_pejabat(1)[0]

    elements.append(Paragraph(
        f"Kepada Yth.<br/>"
        f"{penerima[1]}<br/>"
        f"di Tempat",
        styles["label_left"],
    ))
    elements.append(Spacer(1, 4 * mm))

    elements.append(Paragraph(
        "Dengan hormat,",
        styles["body_no_indent"],
    ))

    # Body paragraphs
    paragraphs = get_body_paragraphs(kode, random.randint(2, 4))
    for para in paragraphs:
        elements.append(Paragraph(para, styles["body"]))

    elements.append(Paragraph(random.choice(CLOSING_SENTENCES), styles["body"]))

    elements.extend(_signature_block(styles, pejabat[0], pejabat[1], _rand_nip()))
    elements.extend(_tembusan_block(styles))

    return elements


# ---------------------------------------------------------------------------
# Template dispatcher
# ---------------------------------------------------------------------------

_TEMPLATE_BUILDERS = {
    DocType.NOTA_DINAS: _build_nota_dinas,
    DocType.SURAT_TUGAS: _build_surat_tugas,
    DocType.SURAT_KEPUTUSAN: _build_surat_keputusan,
    DocType.LAPORAN: _build_laporan,
    DocType.PERJANJIAN: _build_perjanjian,
    DocType.BERITA_ACARA: _build_berita_acara,
    DocType.SURAT_EDARAN: _build_surat_edaran,
    DocType.SURAT_DINAS: _build_surat_dinas,
}


# ---------------------------------------------------------------------------
# PDF generation
# ---------------------------------------------------------------------------

def generate_pdf(
    kode: str,
    uraian: str,
    doc_type: DocType,
    doc_index: int,
    output_path: Path,
) -> None:
    """Generate a single PDF document."""
    styles = _build_styles()
    builder = _TEMPLATE_BUILDERS[doc_type]

    elements = builder(kode, uraian, doc_index, styles)

    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=2.5 * cm,
        rightMargin=2 * cm,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
    )
    doc.build(elements)


# ---------------------------------------------------------------------------
# Seeder parsing (reused from generate_missing_training_draft.py)
# ---------------------------------------------------------------------------

def parse_seeder() -> dict[str, dict]:
    """Parse the KodeKlasifikasiSeeder.php to get all classification codes."""
    content = SEEDER_PATH.read_text(encoding="utf-8")

    entries: dict[str, dict] = {}
    for match in re.finditer(r"\[([^\]]*'kode_klasifikasi'[^\]]*)\]", content, re.DOTALL):
        block = match.group(1)
        kode_m = re.search(r"'kode_klasifikasi'\s*=>\s*'([^']+)'", block)
        uraian_m = re.search(r"'uraian'\s*=>\s*'([^']*)'", block)
        parent_m = re.search(r"'kode_klasifikasi_induk'\s*=>\s*'([^']*)'", block)
        if kode_m:
            code = kode_m.group(1).strip()
            entries[code] = {
                "uraian": uraian_m.group(1) if uraian_m else "",
                "parent": parent_m.group(1) if parent_m else None,
            }

    # Identify leaf codes (not a parent of another code)
    parent_codes = {e["parent"] for e in entries.values() if e["parent"]}
    leaf_entries = {
        k: v for k, v in entries.items()
        if k not in parent_codes
    }

    return leaf_entries


# ---------------------------------------------------------------------------
# Main generation orchestrator
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="Generate synthetic PDF documents for SKKAD classification codes.",
    )
    parser.add_argument("--dry-run", action="store_true",
                        help="Preview counts only, don't generate files")
    parser.add_argument("--codes", nargs="+",
                        help="Only generate for specific codes (e.g., PR.01.01 KP.01.06)")
    parser.add_argument("--limit", type=int,
                        help="Only process the first N codes")
    parser.add_argument("--count", type=int, default=DOCS_PER_CODE,
                        help=f"Number of documents per code (default: {DOCS_PER_CODE})")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility")
    parser.add_argument("--output", type=str, default=str(OUTPUT_DIR),
                        help=f"Output directory (default: {OUTPUT_DIR})")
    args = parser.parse_args()

    random.seed(args.seed)
    output_dir = Path(args.output)

    # Parse all leaf codes from the seeder
    print("Parsing classification codes from seeder...")
    leaf_entries = parse_seeder()
    codes = sorted(leaf_entries.keys())

    if args.codes:
        codes = [c for c in codes if c in args.codes]
    if args.limit:
        codes = codes[: args.limit]

    total_docs = len(codes) * args.count
    print(f"Classification codes: {len(codes)}")
    print(f"Documents per code: {args.count}")
    print(f"Total documents to generate: {total_docs}")
    print(f"Output directory: {output_dir}")

    if args.dry_run:
        print("\n[DRY RUN] — No files will be generated.")
        # Show distribution of template types
        type_counts: dict[str, int] = {}
        for kode in codes:
            doc_types = get_varied_doc_types(kode, args.count)
            for dt in doc_types:
                type_counts[dt.value] = type_counts.get(dt.value, 0) + 1

        print("\nTemplate distribution:")
        for tname, count in sorted(type_counts.items(), key=lambda x: -x[1]):
            print(f"  {tname}: {count} documents")

        print(f"\nSample codes and their templates:")
        for kode in codes[:15]:
            info = leaf_entries[kode]
            primary = get_doc_type_for_code(kode)
            print(f"  {kode} [{primary.value}] — {info['uraian'][:60]}")

        return

    # Generate documents
    start_time = time.time()
    generated = 0
    errors = 0

    for code_idx, kode in enumerate(codes):
        info = leaf_entries[kode]
        uraian = info["uraian"]

        # Create directory for this code
        code_dir = output_dir / kode
        code_dir.mkdir(parents=True, exist_ok=True)

        # Get varied document types
        doc_types = get_varied_doc_types(kode, args.count)

        for doc_idx, doc_type in enumerate(doc_types, 1):
            filename = f"{kode}_{doc_idx:03d}_{doc_type.value}.pdf"
            filepath = code_dir / filename

            try:
                generate_pdf(kode, uraian, doc_type, doc_idx, filepath)
                generated += 1
            except Exception as e:
                errors += 1
                print(f"  [ERROR] {filepath.name}: {e}")

        # Progress
        pct = (code_idx + 1) / len(codes) * 100
        if (code_idx + 1) % 25 == 0 or code_idx == len(codes) - 1:
            elapsed = time.time() - start_time
            rate = generated / elapsed if elapsed > 0 else 0
            print(
                f"  [{code_idx+1}/{len(codes)}] {pct:.0f}% — "
                f"{generated} files generated ({rate:.0f}/s) "
                f"| errors: {errors}"
            )

    elapsed = time.time() - start_time
    print(f"\n{'='*50}")
    print(f"Done! Generated {generated} PDF files in {elapsed:.1f}s")
    print(f"Errors: {errors}")
    print(f"Output: {output_dir}")


if __name__ == "__main__":
    main()
