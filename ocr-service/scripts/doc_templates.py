"""
Document template definitions, fake data pools, and code-to-template mapping
for generating synthetic PDF documents based on SKKAD classification codes.
"""

from __future__ import annotations

import random
from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


# ---------------------------------------------------------------------------
# Template types
# ---------------------------------------------------------------------------

class DocType(Enum):
    NOTA_DINAS = "nota_dinas"
    SURAT_TUGAS = "surat_tugas"
    SURAT_KEPUTUSAN = "surat_keputusan"
    LAPORAN = "laporan"
    PERJANJIAN = "perjanjian"
    BERITA_ACARA = "berita_acara"
    SURAT_EDARAN = "surat_edaran"
    SURAT_DINAS = "surat_dinas"


# ---------------------------------------------------------------------------
# Fake data pools for content variation
# ---------------------------------------------------------------------------

NAMA_PEJABAT = [
    ("Drs. Ahmad Suryana, M.Si.", "Kepala LPP RRI Banjarmasin"),
    ("Ir. Bambang Sulistyo, M.M.", "Direktur Program dan Usaha"),
    ("Dr. Siti Nurhaliza, M.Pd.", "Direktur SDM dan Umum"),
    ("Drs. Muhammad Fadli, M.A.", "Kepala Bagian Umum"),
    ("Hj. Rahmawati, S.H., M.H.", "Kepala Bagian Hukum"),
    ("Drs. Agus Prasetyo, M.M.", "Kepala Bidang Perencanaan"),
    ("Ir. Dwi Hartono, M.T.", "Kepala Bidang Teknik"),
    ("Dra. Yuliana Sari, M.Si.", "Kepala Bidang Keuangan"),
    ("Dr. Hasan Basri, M.Kom.", "Kepala Bidang Teknologi Informasi"),
    ("Drs. Wahyu Hidayat, M.M.", "Kepala Stasiun RRI Banjarmasin"),
    ("Sri Mulyani, S.E., M.Ak.", "Bendahara Pengeluaran"),
    ("Drs. Rudi Hartono, M.Pd.", "Kepala Sub Bagian Kepegawaian"),
    ("Ir. Andi Wijaya, M.T.", "Kepala Seksi Sarana dan Prasarana"),
    ("Dra. Lestari Dewi, M.Si.", "Kepala Seksi Pengawasan"),
    ("Muhammad Rizki, S.Kom., M.T.I.", "Kepala Seksi IT"),
    ("Drs. Supriyanto, M.M.", "Kepala Satuan Pengawas Intern"),
    ("Hj. Kartini, S.Sos., M.I.Kom.", "Kepala Bidang Pemberitaan"),
    ("Dr. Budi Santoso, M.A.", "Kepala Bidang Siaran"),
    ("Drs. Eko Prasetyo, M.M.", "Pejabat Pembuat Komitmen"),
    ("Ir. Nugroho, M.T.", "Kuasa Pengguna Anggaran"),
]

UNIT_KERJA = [
    "Bagian Umum",
    "Bagian Keuangan",
    "Bagian Kepegawaian dan Organisasi",
    "Bagian Hukum dan Kerjasama",
    "Bidang Perencanaan",
    "Bidang Program dan Evaluasi",
    "Bidang Teknik dan Media Baru",
    "Bidang Pemberitaan",
    "Bidang Siaran",
    "Satuan Pengawas Intern",
    "Seksi Sarana dan Prasarana",
    "Sub Bagian Tata Usaha",
    "Seksi Produksi Siaran",
    "Seksi Teknologi Informasi",
    "Seksi Sumber Daya Manusia",
]

KOTA = [
    "Banjarmasin", "Jakarta", "Surabaya", "Medan", "Makassar",
    "Yogyakarta", "Semarang", "Palembang", "Pontianak", "Denpasar",
    "Balikpapan", "Manado", "Padang", "Bandung", "Malang",
]


def _rand_nip() -> str:
    """Generate a fake NIP (Nomor Induk Pegawai)."""
    y = random.randint(1970, 1995)
    m = random.randint(1, 12)
    d = random.randint(1, 28)
    seq = random.randint(100000, 999999)
    gen = random.choice([1, 2])
    suffix = random.randint(100, 999)
    return f"{y}{m:02d}{d:02d} {seq} {gen} {suffix:03d}"


def _rand_year() -> int:
    return random.choice([2023, 2024, 2025, 2026])


def _rand_month_year() -> tuple[str, int]:
    months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ]
    m = random.choice(months)
    y = _rand_year()
    return m, y


def _rand_date_str() -> str:
    day = random.randint(1, 28)
    month, year = _rand_month_year()
    return f"{day} {month} {year}"


def _rand_surat_number(kode: str, doc_type: DocType) -> str:
    """Generate a realistic letter number containing the classification code."""
    seq = random.randint(1, 999)
    year = _rand_year()

    prefix_map = {
        DocType.NOTA_DINAS: "ND",
        DocType.SURAT_TUGAS: "ST",
        DocType.SURAT_KEPUTUSAN: "SK",
        DocType.LAPORAN: "LPR",
        DocType.PERJANJIAN: "PKS",
        DocType.BERITA_ACARA: "BA",
        DocType.SURAT_EDARAN: "SE",
        DocType.SURAT_DINAS: "S",
    }
    prefix = prefix_map.get(doc_type, "S")
    return f"{prefix}-{seq:03d}/{kode}/LPP RRI/{year}"


# ---------------------------------------------------------------------------
# Code → template mapping
# ---------------------------------------------------------------------------

# Default mapping based on prefix patterns.
# More specific overrides come first.
_CODE_TEMPLATE_RULES: list[tuple[str, DocType]] = [
    # Specific codes
    ("KP.01.06", DocType.SURAT_TUGAS),
    ("KP.01.07", DocType.SURAT_KEPUTUSAN),
    ("KP.01.08", DocType.SURAT_KEPUTUSAN),
    ("KP.01.09", DocType.BERITA_ACARA),
    ("KP.03.01", DocType.SURAT_DINAS),
    ("KP.03.02", DocType.SURAT_KEPUTUSAN),
    ("KP.03.03", DocType.SURAT_KEPUTUSAN),
    ("KP.03.04", DocType.SURAT_KEPUTUSAN),
    ("KP.04.01", DocType.SURAT_KEPUTUSAN),
    ("KP.04.02", DocType.SURAT_KEPUTUSAN),
    ("KP.04.03", DocType.SURAT_KEPUTUSAN),
    ("KP.04.04", DocType.SURAT_KEPUTUSAN),
    ("KP.04.06", DocType.SURAT_KEPUTUSAN),
    ("KP.04.07", DocType.SURAT_KEPUTUSAN),
    ("KP.04.09", DocType.BERITA_ACARA),
    ("KP.06.03", DocType.SURAT_KEPUTUSAN),
    ("KP.06.04", DocType.SURAT_KEPUTUSAN),
    ("KP.06.06", DocType.NOTA_DINAS),
    ("KP.08.01", DocType.SURAT_KEPUTUSAN),
    ("KP.08.02", DocType.SURAT_KEPUTUSAN),
    ("KP.08.05", DocType.SURAT_KEPUTUSAN),
    ("UM.01.01", DocType.NOTA_DINAS),

    # KU berita acara / kontrak
    ("KU.01.03", DocType.BERITA_ACARA),

    # HK — peraturan / keputusan
    ("HK.01", DocType.SURAT_EDARAN),
    ("HK.02.01", DocType.SURAT_EDARAN),
    ("HK.02.02", DocType.SURAT_KEPUTUSAN),
    ("HK.02.03", DocType.SURAT_EDARAN),
    ("HK.02.04", DocType.SURAT_EDARAN),
    ("HK.02.05", DocType.SURAT_KEPUTUSAN),
    ("HK.02.06", DocType.SURAT_EDARAN),
    ("HK.02.07", DocType.SURAT_EDARAN),
    ("HK.03", DocType.PERJANJIAN),
    ("HK.04", DocType.SURAT_DINAS),
    ("HK.05", DocType.SURAT_DINAS),
    ("HK.06", DocType.SURAT_DINAS),

    # KS — kerjasama
    ("KS", DocType.PERJANJIAN),

    # KJM.02 — MOU
    ("KJM.02", DocType.PERJANJIAN),

    # HM.01.06 — ucapan
    ("HM.01.06", DocType.SURAT_DINAS),

    # PL — berita acara / nota dinas
    ("PL.04.01", DocType.BERITA_ACARA),
    ("PL.05.04", DocType.SURAT_KEPUTUSAN),

    # OT.01.02 — reformasi birokrasi
    ("OT.01.02", DocType.SURAT_KEPUTUSAN),
    ("OT.02.02", DocType.SURAT_EDARAN),

    # PPS/PPP — SK tim
    ("PPS.01.01", DocType.SURAT_KEPUTUSAN),
    ("PPP.01.01", DocType.SURAT_KEPUTUSAN),
    ("KJM.01.01", DocType.SURAT_KEPUTUSAN),

    # Prefix-level fallbacks (checked after specific codes)
    ("PR.01", DocType.NOTA_DINAS),
    ("PR.02", DocType.LAPORAN),
    ("PR.03", DocType.LAPORAN),
    ("PW.01", DocType.LAPORAN),
    ("PW.02", DocType.LAPORAN),
    ("PW.03", DocType.LAPORAN),
    ("UM", DocType.NOTA_DINAS),
    ("KP.01", DocType.SURAT_DINAS),
    ("KP.02", DocType.NOTA_DINAS),
    ("KP.05", DocType.SURAT_DINAS),
    ("KP.06", DocType.LAPORAN),
    ("KP.07", DocType.SURAT_DINAS),
    ("KP.08", DocType.SURAT_KEPUTUSAN),
    ("KP.09", DocType.SURAT_DINAS),
    ("KU", DocType.SURAT_DINAS),
    ("PL", DocType.NOTA_DINAS),
    ("HK", DocType.SURAT_DINAS),
    ("OT", DocType.NOTA_DINAS),
    ("HM", DocType.SURAT_DINAS),
    ("PB", DocType.SURAT_DINAS),
    ("DT", DocType.NOTA_DINAS),
    ("LT", DocType.LAPORAN),
    ("STO", DocType.NOTA_DINAS),
    ("TX", DocType.NOTA_DINAS),
    ("IT", DocType.NOTA_DINAS),
    ("PPS", DocType.SURAT_DINAS),
    ("PPP", DocType.SURAT_DINAS),
    ("KJM", DocType.SURAT_DINAS),
]


def get_doc_type_for_code(kode: str) -> DocType:
    """Return the most appropriate document template type for a classification code."""
    kode_upper = kode.upper().strip()
    for pattern, doc_type in _CODE_TEMPLATE_RULES:
        if kode_upper.startswith(pattern.upper()):
            return doc_type
    return DocType.SURAT_DINAS


def get_varied_doc_types(kode: str, count: int = 5) -> list[DocType]:
    """
    Return a list of DocTypes for generating `count` documents.
    Primary type gets majority, with 1-2 secondary types mixed in for variety.
    """
    primary = get_doc_type_for_code(kode)

    # Secondary types that are always reasonable
    secondary_options = [DocType.NOTA_DINAS, DocType.SURAT_DINAS]
    if primary in secondary_options:
        secondary_options = [
            t for t in [DocType.SURAT_DINAS, DocType.NOTA_DINAS, DocType.LAPORAN]
            if t != primary
        ]

    result = [primary] * max(3, count - 2)

    for _ in range(count - len(result)):
        result.append(random.choice(secondary_options))

    random.shuffle(result)
    return result[:count]


# ---------------------------------------------------------------------------
# Body text paragraph pools per category prefix
# ---------------------------------------------------------------------------

PERIHAL_TEMPLATES: dict[str, list[str]] = {
    "PR": [
        "Perencanaan Kegiatan dan Program Kerja Tahun {year}",
        "Penyusunan Rencana Kerja dan Anggaran Tahun {year}",
        "Evaluasi Program dan Kegiatan Triwulan {quarter}",
        "Laporan Capaian Kinerja Semester {semester}",
        "Penyusunan LAKIP Tahun {year}",
    ],
    "PW": [
        "Pelaksanaan Pengawasan Internal Periode {month} {year}",
        "Pemantauan Tindak Lanjut Hasil Audit",
        "Pelaporan LHKPN Penyelenggara Negara",
        "Hasil Evaluasi Pengawasan Triwulan {quarter}",
        "Tindak Lanjut Temuan BPK/BPKP",
    ],
    "UM": [
        "Administrasi Persuratan dan Tata Naskah Dinas",
        "Pengelolaan Kearsipan dan Penyusutan Arsip",
        "Pemeliharaan Gedung Kantor dan Fasilitas",
        "Kebersihan, Ketertiban dan Keamanan Kantor",
        "Izin Penggunaan Ruangan dan Fasilitas",
    ],
    "KP": [
        "Pengelolaan Data Kepegawaian Tahun {year}",
        "Pelaksanaan Diklat dan Pengembangan SDM",
        "Kenaikan Pangkat Periode {month} {year}",
        "Penilaian Kinerja dan SKP Tahun {year}",
        "Pembinaan Disiplin dan Jam Kerja Pegawai",
        "Pengangkatan dan Mutasi Jabatan Struktural",
        "Administrasi Pensiun dan Pemberhentian",
    ],
    "KU": [
        "Penyusunan DIPA dan RKA-KL Tahun {year}",
        "Realisasi Anggaran Triwulan {quarter}",
        "Pertanggungjawaban Keuangan dan SPJ",
        "Pembayaran Gaji dan Tunjangan Pegawai",
        "Laporan Neraca Keuangan Semester {semester}",
    ],
    "PL": [
        "Inventarisasi Barang Milik Negara Tahun {year}",
        "Pengadaan Barang dan Jasa Operasional",
        "Pemeliharaan dan Perawatan BMN",
        "Penghapusan Barang Inventaris Rusak Berat",
        "Distribusi Peralatan ke Satuan Kerja",
    ],
    "HK": [
        "Penyusunan Produk Hukum Internal",
        "Kerjasama Hukum dengan Instansi Terkait",
        "Penanganan Sengketa dan Bantuan Hukum",
        "Sosialisasi Peraturan Perundang-undangan Baru",
        "Perjanjian Kerjasama Bilateral dan Multilateral",
    ],
    "OT": [
        "Evaluasi Struktur Organisasi dan Tata Kerja",
        "Pelaksanaan Reformasi Birokrasi Tahun {year}",
        "Pembakuan SOP dan Mekanisme Kerja",
        "Penetapan Identitas Visual dan Logo Lembaga",
    ],
    "KS": [
        "Koordinasi Lintas Sektor Bidang Penyiaran",
        "Kerjasama Antar Stasiun RRI Se-Indonesia",
        "Koordinasi Internal dan Eksternal Lembaga",
    ],
    "HM": [
        "Dokumentasi Kegiatan Dinas Pimpinan",
        "Pengelolaan Hubungan Media dan Pers",
        "Penyelenggaraan Pameran dan Festival",
        "Sosialisasi Program kepada Masyarakat",
        "Ucapan Terima Kasih dan Apresiasi",
    ],
    "PB": [
        "Penerbitan Majalah Internal dan Publikasi",
        "Pengelolaan Perpustakaan dan Kepustakaan",
    ],
    "DT": [
        "Pemeliharaan Infrastruktur Teknologi Informasi",
        "Pengembangan Aplikasi dan Sistem Informasi",
        "Pengamanan Informasi dan Keamanan Siber",
        "Pengumpulan dan Pengolahan Data Penyiaran",
    ],
    "LT": [
        "Penelitian Teknologi Penyiaran Digital",
        "Pengembangan SDM Bidang Penyiaran",
        "Modernisasi Sistem Penyiaran Radio",
    ],
    "STO": [
        "Inventarisasi Peralatan Studio Siaran",
        "Spesifikasi Teknis Peralatan Studio",
        "Pemeliharaan Peralatan Studio dan Rekaman",
    ],
    "TX": [
        "Inventarisasi Peralatan Pemancar Radio",
        "Spesifikasi Teknis Jenis Pemancar",
        "Pemeliharaan Pemancar dan Antena",
    ],
    "IT": [
        "Pengadaan Peralatan Multimedia dan IT",
        "Pengelolaan Jaringan dan Bandwidth",
        "Infrastruktur Teknologi Informasi",
    ],
    "PPS": [
        "Penyusunan Program dan Kebijakan Siaran",
        "Administrasi Produksi Siaran",
        "Perencanaan Program Siaran Tahunan",
    ],
    "PPP": [
        "Penyusunan Program Pemberitaan",
        "Kebijakan Redaksional dan Pemberitaan",
        "Evaluasi Program Berita dan Informasi",
    ],
    "KJM": [
        "Kerjasama Multimedia dan Partnership",
        "Pengelolaan Konten Audio Video",
        "MOU Program Siaran dengan Mitra",
    ],
}


BODY_PARAGRAPHS: dict[str, list[str]] = {
    "DEFAULT": [
        "Sehubungan dengan pelaksanaan tugas dan fungsi di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia, dengan ini disampaikan hal-hal sebagai berikut.",
        "Berdasarkan ketentuan yang berlaku dan dalam rangka meningkatkan kinerja organisasi, perlu dilakukan langkah-langkah strategis yang terencana dan terukur.",
        "Mengacu pada Peraturan Direktur Utama LPP RRI dan ketentuan perundang-undangan yang berlaku, dengan ini disampaikan arahan pelaksanaan kegiatan.",
        "Dalam rangka pelaksanaan tugas pokok dan fungsi serta untuk mewujudkan tata kelola pemerintahan yang baik, diperlukan koordinasi dan sinergi antar unit kerja.",
        "Dengan memperhatikan capaian kinerja tahun sebelumnya dan target yang telah ditetapkan, perlu dilakukan evaluasi menyeluruh terhadap pelaksanaan program.",
    ],
    "PR": [
        "Dalam rangka penyusunan rencana kerja dan anggaran tahun berikutnya, setiap unit kerja diminta untuk menyampaikan usulan program dan kegiatan beserta estimasi anggarannya.",
        "Berdasarkan hasil evaluasi capaian kinerja, perlu dilakukan penyesuaian terhadap rencana strategis dan program kerja yang telah ditetapkan sebelumnya.",
        "Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP) merupakan bentuk pertanggungjawaban atas pelaksanaan tugas dan fungsi yang diamanatkan.",
    ],
    "PW": [
        "Satuan Pengawas Intern telah melaksanakan pemeriksaan dan pengawasan terhadap pengelolaan keuangan dan pelaksanaan kegiatan di unit kerja terkait.",
        "Berdasarkan hasil pemantauan, ditemukan beberapa temuan yang perlu ditindaklanjuti oleh masing-masing unit kerja dalam jangka waktu yang telah ditentukan.",
        "Setiap penyelenggara negara wajib melaporkan harta kekayaannya melalui sistem LHKPN sesuai dengan ketentuan yang berlaku.",
    ],
    "KP": [
        "Seluruh pegawai negeri sipil di lingkungan LPP RRI diwajibkan untuk mematuhi ketentuan jam kerja dan disiplin kehadiran sesuai peraturan yang berlaku.",
        "Dalam rangka pengembangan kompetensi sumber daya manusia, akan dilaksanakan program pendidikan dan pelatihan bagi pegawai di berbagai jenjang dan bidang keahlian.",
        "Proses kenaikan pangkat dilaksanakan sesuai dengan ketentuan perundang-undangan dan mempertimbangkan penilaian kinerja serta syarat administratif yang diperlukan.",
        "Berkenaan dengan hal tersebut, diminta kepada seluruh pegawai untuk melengkapi data kepegawaian dan dokumen pendukung yang diperlukan.",
    ],
    "KU": [
        "Pengajuan Surat Permintaan Pembayaran (SPP) harus disertai dengan dokumen pendukung yang lengkap dan telah diverifikasi oleh pejabat yang berwenang.",
        "Realisasi anggaran harus sesuai dengan Daftar Isian Pelaksanaan Anggaran (DIPA) dan petunjuk operasional yang telah ditetapkan.",
        "Setiap transaksi keuangan harus dicatat dan dilaporkan sesuai dengan Standar Akuntansi Pemerintahan dan ketentuan yang berlaku.",
    ],
    "PL": [
        "Inventarisasi barang milik negara dilaksanakan secara berkala untuk memastikan keakuratan data aset dan kondisi barang yang sebenarnya.",
        "Proses pengadaan barang dan jasa harus mengikuti ketentuan Peraturan Presiden tentang Pengadaan Barang/Jasa Pemerintah.",
        "Barang milik negara yang telah rusak berat dan tidak ekonomis untuk diperbaiki dapat diusulkan untuk dihapuskan dari daftar inventaris.",
    ],
    "HK": [
        "Produk hukum internal LPP RRI harus disusun sesuai dengan teknik penyusunan peraturan perundang-undangan dan memperhatikan asas-asas hukum yang berlaku.",
        "Perjanjian kerjasama dengan pihak ketiga harus memuat hak dan kewajiban para pihak secara jelas dan tidak bertentangan dengan peraturan yang berlaku.",
        "Bantuan hukum diberikan kepada pegawai yang menghadapi permasalahan hukum terkait pelaksanaan tugas kedinasan.",
    ],
    "HM": [
        "Dokumentasi kegiatan dinas pimpinan dilaksanakan secara profesional dengan memperhatikan kualitas foto, video, dan penyajian informasi yang akurat.",
        "Hubungan dengan media massa dan pers dikelola secara proaktif untuk membangun citra positif lembaga dan menyebarluaskan informasi program RRI.",
    ],
    "DT": [
        "Pemeliharaan infrastruktur teknologi informasi dilaksanakan secara berkala untuk menjamin ketersediaan dan keandalan sistem yang mendukung operasional penyiaran.",
        "Pengembangan aplikasi dan sistem informasi harus mengikuti standar pengembangan perangkat lunak dan memperhatikan aspek keamanan informasi.",
    ],
}


CLOSING_SENTENCES = [
    "Demikian disampaikan untuk dapat ditindaklanjuti sebagaimana mestinya.",
    "Atas perhatian dan kerjasamanya diucapkan terima kasih.",
    "Demikian untuk menjadi perhatian dan dilaksanakan dengan sebaik-baiknya.",
    "Demikian agar menjadi maklum dan dapat dilaksanakan sebagaimana mestinya.",
    "Atas perhatian Saudara diucapkan terima kasih.",
    "Demikian disampaikan, atas perhatian dan kerjasama yang baik diucapkan terima kasih.",
    "Demikian surat ini dibuat untuk dapat dipergunakan sebagaimana mestinya.",
]


TEMBUSAN = [
    "Direktur Utama LPP RRI (sebagai laporan)",
    "Inspektorat Jenderal Kemkominfo",
    "Dewan Pengawas LPP RRI",
    "Direktur Keuangan LPP RRI",
    "Direktur SDM dan Umum LPP RRI",
    "Arsip",
    "Pertinggal",
]

# For SK
MENIMBANG_TEMPLATES = [
    "bahwa dalam rangka pelaksanaan tugas dan fungsi Lembaga Penyiaran Publik Radio Republik Indonesia, dipandang perlu untuk {action};",
    "bahwa untuk meningkatkan efektivitas dan efisiensi pelaksanaan {subject}, perlu ditetapkan melalui Surat Keputusan;",
    "bahwa berdasarkan pertimbangan sebagaimana dimaksud pada huruf a, perlu menetapkan Keputusan Direktur Utama LPP RRI;",
]

MENGINGAT_TEMPLATES = [
    "Undang-Undang Nomor 32 Tahun 2002 tentang Penyiaran;",
    "Peraturan Pemerintah Nomor 12 Tahun 2005 tentang Lembaga Penyiaran Publik Radio Republik Indonesia;",
    "Peraturan Direktur Utama LPP RRI Nomor 03 Tahun 2023 tentang Pedoman Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis;",
    "Peraturan Menteri Keuangan tentang Pengelolaan Barang Milik Negara;",
    "Undang-Undang Nomor 5 Tahun 2014 tentang Aparatur Sipil Negara;",
]


def get_perihal(kode: str) -> str:
    """Get a random perihal (subject) appropriate for the classification code."""
    prefix = kode.split(".")[0].upper()
    templates = PERIHAL_TEMPLATES.get(prefix, PERIHAL_TEMPLATES.get("PR", []))
    template = random.choice(templates) if templates else "Pelaksanaan Tugas dan Fungsi"

    quarter = random.choice(["I", "II", "III", "IV"])
    semester = random.choice(["I", "II"])
    month, year = _rand_month_year()

    return template.format(
        year=year, quarter=quarter, semester=semester, month=month,
    )


def get_body_paragraphs(kode: str, count: int = 3) -> list[str]:
    """Get a random selection of body paragraphs for the document."""
    prefix = kode.split(".")[0].upper()
    pool = BODY_PARAGRAPHS.get(prefix, []) + BODY_PARAGRAPHS["DEFAULT"]
    return random.sample(pool, min(count, len(pool)))


def get_pejabat(count: int = 1) -> list[tuple[str, str]]:
    """Get random officials (name, title)."""
    return random.sample(NAMA_PEJABAT, min(count, len(NAMA_PEJABAT)))


def get_tembusan(count: int = 3) -> list[str]:
    """Get random tembusan list."""
    return random.sample(TEMBUSAN, min(count, len(TEMBUSAN)))
