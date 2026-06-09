"""
Generate synthetic training data for Naive Bayes document classifier.
Based on SKKAD (Peraturan Direktur Utama LPP RRI Nomor 03 Tahun 2023)
Sistem Klasifikasi Keamanan dan Akses Arsip Dinamis.

Each entry maps a classification code + uraian to multiple synthetic text samples
that simulate OCR-extracted document text for that category.
"""

import json
import random
import os

# ---------------------------------------------------------------------------
# Classification codes with keyword-based text templates
# Format: { "kode|uraian": [list of text templates] }
# Each template simulates typical OCR output from a real document
# ---------------------------------------------------------------------------

TRAINING_MAP = {
    # =====================================================================
    # I. PR - PERENCANAAN
    # =====================================================================
    "PR.01.01|Perencanaan Kegiatan": [
        "Nota Dinas perihal rencana kegiatan tahun anggaran berikutnya di lingkungan LPP RRI",
        "Surat tentang perencanaan kegiatan tahunan dan program kerja LPP RRI",
        "Dokumen rencana kegiatan strategis lembaga penyiaran publik radio",
        "Penyusunan rencana kegiatan dan program kerja tahunan RRI",
        "Rencana pelaksanaan kegiatan program prioritas LPP RRI tahun anggaran",
    ],
    "PR.01.02|Penyusunan Anggaran": [
        "Nota Dinas perihal penyusunan anggaran tahun berikutnya",
        "Dokumen penyusunan Rencana Kerja dan Anggaran RRI",
        "Surat penyusunan anggaran belanja dan pendapatan lembaga",
        "Rencana anggaran biaya program dan kegiatan LPP RRI",
        "Penyusunan rencana anggaran pendapatan dan belanja tahunan",
    ],
    "PR.01.03|Analisis Program": [
        "Laporan analisis program kegiatan triwulan LPP RRI",
        "Dokumen analisis program kerja dan capaian kinerja",
        "Hasil analisis pelaksanaan program dan evaluasi capaian",
        "Analisis program siaran dan kegiatan operasional RRI",
        "Kajian analisis program strategis lembaga penyiaran publik",
    ],
    "PR.02.01|Pelaporan Anggaran dan Kinerja": [
        "Laporan realisasi anggaran dan kinerja triwulan",
        "Pelaporan capaian kinerja dan realisasi anggaran semester",
        "Laporan pertanggungjawaban anggaran dan kinerja program",
        "Dokumen pelaporan realisasi anggaran belanja LPP RRI",
        "Laporan kinerja instansi dan realisasi anggaran tahunan",
    ],
    "PR.02.02|Pelaksanaan Anggaran": [
        "Laporan pelaksanaan anggaran belanja satuan kerja",
        "Dokumen pelaksanaan dan penyerapan anggaran DIPA",
        "Monitoring pelaksanaan anggaran dan belanja negara",
        "Realisasi pelaksanaan anggaran belanja modal dan pegawai",
        "Pelaksanaan anggaran program dan kegiatan tahun berjalan",
    ],
    "PR.02.03|Program dan Kegiatan Berkala (Triwulan, Semester, dan Tahunan) serta Insidental": [
        "Laporan program kegiatan berkala triwulan I LPP RRI",
        "Laporan kegiatan semester I dan evaluasi program",
        "Program kerja insidental dan laporan kegiatan tahunan",
        "Laporan berkala program dan kegiatan triwulanan RRI",
        "Rekapitulasi kegiatan berkala semesteran dan tahunan lembaga",
    ],
    "PR.02.04|Akuntabilitas Kinerja Instansi Pemerintah (LAKIP)": [
        "Laporan Akuntabilitas Kinerja Instansi Pemerintah LAKIP LPP RRI",
        "Dokumen LAKIP tahun anggaran Lembaga Penyiaran Publik",
        "Penyusunan Laporan Kinerja Instansi Pemerintah RRI",
        "LAKIP dan evaluasi kinerja instansi pemerintah tahunan",
        "Akuntabilitas kinerja dan capaian sasaran strategis lembaga",
    ],
    "PR.03.01|Evaluasi Perencanaan Kegiatan": [
        "Evaluasi perencanaan kegiatan dan program kerja tahunan",
        "Hasil evaluasi rencana kegiatan tahun anggaran berjalan",
        "Dokumen evaluasi perencanaan program dan kegiatan RRI",
        "Laporan evaluasi perencanaan kegiatan strategis lembaga",
        "Evaluasi capaian perencanaan kegiatan dan program kerja",
    ],
    "PR.03.02|Evaluasi Penyusunan Anggaran": [
        "Evaluasi penyusunan anggaran dan alokasi dana program",
        "Hasil evaluasi proses penyusunan anggaran tahunan",
        "Dokumen evaluasi rencana anggaran dan belanja negara",
        "Laporan evaluasi penyusunan RKA-KL dan DIPA",
        "Evaluasi kesesuaian penyusunan anggaran dengan kebijakan",
    ],
    "PR.03.03|Evaluasi Analisis Program": [
        "Evaluasi hasil analisis program kegiatan lembaga",
        "Laporan evaluasi analisis program dan capaian kinerja",
        "Dokumen evaluasi analisis program kerja tahunan RRI",
        "Evaluasi analisis dampak program dan kegiatan operasional",
        "Hasil evaluasi analisis efektivitas program siaran RRI",
    ],

    # =====================================================================
    # II. PW - PENGAWASAN
    # =====================================================================
    "PW.01.01|Pemantauan": [
        "Laporan pemantauan pelaksanaan kegiatan dan anggaran",
        "Hasil pemantauan pengawasan internal lembaga RRI",
        "Dokumen pemantauan kinerja dan kepatuhan pegawai",
        "Pemantauan pelaksanaan tugas dan fungsi unit kerja",
        "Laporan hasil pemantauan pengawasan operasional lembaga",
    ],
    "PW.01.02|Analisis": [
        "Analisis hasil pengawasan internal dan temuan audit",
        "Dokumen analisis pengawasan dan pemeriksaan lembaga",
        "Laporan analisis risiko dan kepatuhan pengawasan",
        "Hasil analisis temuan pengawasan dan rekomendasi",
        "Analisis data pengawasan dan evaluasi kinerja unit",
    ],
    "PW.01.03|Evaluasi": [
        "Evaluasi hasil pengawasan internal dan eksternal",
        "Laporan evaluasi pelaksanaan pengawasan lembaga",
        "Dokumen evaluasi temuan dan tindak lanjut pengawasan",
        "Evaluasi kinerja pengawasan dan kepatuhan regulasi",
        "Hasil evaluasi pengawasan dan audit internal RRI",
    ],
    "PW.01.04|Pelaporan": [
        "Laporan hasil pengawasan dan pemeriksaan internal",
        "Pelaporan pengawasan triwulanan dan temuan audit",
        "Dokumen pelaporan hasil pengawasan unit kerja",
        "Laporan pengawasan pelaksanaan tugas dan anggaran",
        "Pelaporan temuan pengawasan dan rekomendasi perbaikan",
    ],
    "PW.01.05|LHKPN": [
        "Laporan Harta Kekayaan Penyelenggara Negara LHKPN",
        "Dokumen LHKPN pejabat struktural LPP RRI",
        "Pengisian dan pelaporan LHKPN penyelenggara negara",
        "Laporan harta kekayaan pejabat negara RRI ke KPK",
        "Formulir LHKPN dan bukti pelaporan harta kekayaan",
    ],
    "PW.01.06|Gratifikasi": [
        "Laporan penerimaan gratifikasi pegawai LPP RRI",
        "Dokumen pelaporan gratifikasi ke Komisi Pemberantasan Korupsi",
        "Formulir pelaporan gratifikasi dan hadiah jabatan",
        "Penanganan laporan gratifikasi pejabat dan pegawai",
        "Pelaporan penerimaan gratifikasi kepada unit pengawasan",
    ],
    "PW.01.07|Pelaksanaan Pengawasan Internal dan Eksternal": [
        "Pelaksanaan pengawasan internal oleh Satuan Pengawas Intern",
        "Pengawasan internal dan eksternal pelaksanaan program",
        "Laporan pelaksanaan audit internal dan eksternal lembaga",
        "Koordinasi pengawasan internal dengan BPK dan BPKP",
        "Pelaksanaan pengawasan internal terhadap pengelolaan keuangan",
    ],
    "PW.01.08|Pelaksanaan Pengawasan Lainnya": [
        "Pelaksanaan pengawasan khusus dan pemeriksaan insidental",
        "Pengawasan lainnya di luar program pengawasan reguler",
        "Dokumen pelaksanaan pengawasan melekat dan khusus",
        "Pengawasan dengan tujuan tertentu di lingkungan RRI",
        "Laporan pelaksanaan pengawasan non-reguler lembaga",
    ],
    "PW.02.01|Penyiapan Bahan Evaluasi Atas Laporan hasil pengawasan Aparat Pengawasan Internal Pemerintah": [
        "Penyiapan bahan evaluasi laporan hasil pengawasan APIP",
        "Bahan evaluasi tindak lanjut temuan pengawasan internal",
        "Dokumen persiapan evaluasi laporan audit APIP",
        "Penyiapan bahan tindak lanjut hasil pemeriksaan internal pemerintah",
        "Evaluasi laporan hasil pengawasan aparat intern pemerintah",
    ],
    "PW.02.02|Pengawasan Masyarakat/Publik": [
        "Penanganan pengaduan masyarakat dan publik terkait layanan",
        "Laporan pengawasan berdasarkan aduan masyarakat",
        "Tindak lanjut pengawasan publik dan aspirasi masyarakat",
        "Pengawasan partisipasi masyarakat terhadap layanan publik",
        "Penyelesaian pengaduan masyarakat dan pengawasan publik",
    ],
    "PW.02.03|Pemantauan Penyelesaian Tindak Lanjut Hasil Pengawasan Internal dan Masyarakat/Publik": [
        "Pemantauan tindak lanjut temuan pengawasan internal",
        "Penyelesaian tindak lanjut hasil pengawasan dan pengaduan publik",
        "Monitoring tindak lanjut rekomendasi hasil pemeriksaan",
        "Pemantauan penyelesaian temuan audit internal dan pengawasan masyarakat",
        "Laporan tindak lanjut penyelesaian hasil pengawasan internal dan publik",
    ],
    "PW.03.01|Penyiapan Bahan Evaluasi Atas laporan hasil pengawasan Aparat Pengawasan Internal Pemerintah": [
        "Penyiapan bahan evaluasi temuan audit BPK dan BPKP",
        "Bahan evaluasi laporan pengawasan eksternal pemerintah",
        "Dokumen persiapan tindak lanjut temuan audit eksternal",
        "Penyiapan bahan untuk evaluasi hasil pemeriksaan BPK",
        "Evaluasi atas temuan hasil pengawasan aparat pengawasan eksternal",
    ],
    "PW.03.02|Pengawasan Masyarakat/Publik": [
        "Pengawasan dan penanganan aspirasi masyarakat melalui media",
        "Tindak lanjut pengaduan publik terkait pengawasan eksternal",
        "Penanganan laporan dan pengawasan dari masyarakat umum",
        "Pengawasan publik terkait pelayanan dan kinerja lembaga",
        "Aspirasi dan pengaduan masyarakat kepada lembaga pengawas",
    ],
    "PW.03.03|Pemantauan Penyelesaian Tindak Lanjut Hasil Pengawasan Internal dan Masyarakat/Publik": [
        "Pemantauan tindak lanjut temuan pengawasan eksternal BPK",
        "Monitoring penyelesaian rekomendasi audit eksternal",
        "Pemantauan status tindak lanjut hasil pemeriksaan BPK/BPKP",
        "Laporan pemantauan penyelesaian tindak lanjut temuan eksternal",
        "Progress penyelesaian tindak lanjut rekomendasi audit lembaga",
    ],

    # =====================================================================
    # III. UM - UMUM
    # =====================================================================
    "UM.01.01|Administrasi Persuratan": [
        "Nota Dinas tentang administrasi persuratan dan tata naskah dinas",
        "Surat masuk dan surat keluar administrasi perkantoran RRI",
        "Disposisi surat masuk untuk ditindaklanjuti unit terkait",
        "Administrasi persuratan dinas dan penomoran naskah",
        "Pengelolaan administrasi surat menyurat dan tata naskah",
    ],
    "UM.01.02|Kebersihan, Ketertiban dan Keamanan": [
        "Nota Dinas perihal kebersihan ketertiban dan keamanan kantor",
        "Surat perintah piket keamanan dan ketertiban lingkungan kerja",
        "Penyelenggaraan kebersihan gedung dan lingkungan kantor RRI",
        "Jadwal piket kebersihan ketertiban dan keamanan satker",
        "Pengaturan keamanan dan ketertiban di lingkungan kerja",
    ],
    "UM.01.03|Izin Peyewaan/peminjaman (Alat-alat, Ruangan, Lapangan, dll)": [
        "Surat izin peminjaman ruangan aula untuk kegiatan rapat",
        "Permohonan penyewaan alat dan ruangan studio RRI",
        "Izin penggunaan lapangan dan fasilitas gedung kantor",
        "Surat peminjaman peralatan dan ruangan untuk acara",
        "Permohonan izin pemakaian ruang rapat dan alat presentasi",
    ],
    "UM.01.04|Perumahan Dinas/Kendaraan Dinas": [
        "Surat permohonan penggunaan perumahan dinas pegawai",
        "Pengelolaan kendaraan dinas dan rumah jabatan RRI",
        "Dokumen penggunaan dan pemeliharaan kendaraan dinas",
        "Permohonan rumah dinas dan kendaraan operasional",
        "Administrasi perumahan dinas dan kendaraan jabatan",
    ],
    "UM.01.05|Gedung/Perkantoran/Gudang": [
        "Pemeliharaan gedung kantor dan fasilitas perkantoran RRI",
        "Pengelolaan gudang penyimpanan barang inventaris kantor",
        "Dokumen perawatan gedung perkantoran dan gudang",
        "Perbaikan dan pemeliharaan gedung studio dan kantor",
        "Pengelolaan fasilitas gedung dan perkantoran lembaga",
    ],
    "UM.01.06|Pakaian Dinas": [
        "Pengadaan pakaian dinas harian dan seragam pegawai RRI",
        "Distribusi pakaian dinas dan seragam kerja pegawai",
        "Surat tentang ketentuan pemakaian pakaian dinas harian",
        "Pengadaan seragam dinas dan pakaian kerja pegawai",
        "Aturan penggunaan pakaian dinas di lingkungan kerja",
    ],
    "UM.01.07|Listrik/PAM/Telepon/AC": [
        "Pembayaran tagihan listrik PAM telepon dan AC kantor",
        "Pengelolaan utilitas listrik air telepon dan pendingin ruangan",
        "Laporan penggunaan listrik dan air bersih kantor RRI",
        "Pemeliharaan instalasi listrik telepon dan AC gedung",
        "Tagihan dan pengelolaan utilitas perkantoran bulanan",
    ],
    "UM.01.08|Sumbangan/Bantuan": [
        "Penyaluran sumbangan dan bantuan sosial dari lembaga",
        "Pemberian bantuan dan sumbangan kepada pegawai yang membutuhkan",
        "Dokumen sumbangan sosial dan bantuan kemanusiaan RRI",
        "Permohonan dan penyaluran bantuan sosial lembaga",
        "Administrasi sumbangan dan bantuan dana sosial pegawai",
    ],
    "UM.02.01|Penyimpanan dan Pemeliharaan Arsip": [
        "Pengelolaan penyimpanan arsip dinamis dan statis RRI",
        "Pemeliharaan dan perawatan arsip unit kerja lembaga",
        "Prosedur penyimpanan arsip aktif dan inaktif di records center",
        "Dokumen penyimpanan dan pemeliharaan arsip vital lembaga",
        "Pengelolaan pusat arsip dan pemeliharaan berkas unit",
    ],
    "UM.02.02|Layanan Arsip (Peminjaman dan Penggunaan Arsip)": [
        "Formulir peminjaman arsip dan penggunaan dokumen unit",
        "Layanan peminjaman arsip untuk keperluan dinas dan audit",
        "Permohonan penggunaan arsip dan peminjaman dokumen",
        "Administrasi layanan peminjaman dan pengembalian arsip",
        "Tanda terima peminjaman arsip dan surat penggunaan dokumen",
    ],
    "UM.02.03|Penyusutan Arsip": [
        "Berita acara penyusutan dan pemusnahan arsip yang telah habis retensi",
        "Proses penyusutan arsip inaktif dan pemindahan ke pusat arsip",
        "Jadwal retensi arsip dan penyusutan berkas unit kerja",
        "Pelaksanaan penyusutan arsip sesuai jadwal retensi",
        "Persetujuan penyusutan dan pemusnahan arsip lembaga",
    ],
    "UM.02.04|Berkas Proses Alih Media Arsip": [
        "Proses alih media arsip konvensional ke format digital",
        "Digitalisasi arsip dan alih media dokumen penting lembaga",
        "Berkas proses scanning dan alih media arsip vital",
        "Pelaksanaan alih media arsip fisik ke elektronik",
        "Dokumen proses digitalisasi dan alih media arsip unit",
    ],
    "UM.02.05|Pembinaan Kearsipan": [
        "Kegiatan pembinaan kearsipan untuk petugas arsip unit",
        "Sosialisasi dan bimbingan teknis pengelolaan kearsipan",
        "Program pembinaan kearsipan di lingkungan LPP RRI",
        "Pelatihan dan pembinaan pengelolaan arsip dinamis",
        "Bimbingan teknis kearsipan dan tata kelola arsip unit",
        "Sosialisasi pedoman SKKAD dan penerapan klasifikasi keamanan akses arsip dinamis",
        "Bimbingan teknis sistem klasifikasi keamanan dan akses arsip dinamis bagi pengelola arsip",
        "Pembinaan penerapan pedoman SKKAD dalam pengelolaan arsip dinamis unit kerja",
    ],

    # =====================================================================
    # IV. KP - KEPEGAWAIAN
    # =====================================================================
    "KP.01.01|Data Perorangan/Status/Database/DRH/Statistik": [
        "Pemutakhiran data riwayat hidup dan database pegawai",
        "Dokumen data perorangan DRH dan statistik kepegawaian",
        "Update database status pegawai dan data personal PNS",
        "Pendataan statistik kepegawaian dan profil pegawai RRI",
        "Pengelolaan data perorangan dan daftar riwayat hidup",
    ],
    "KP.01.02|NIP/Kartu Pegawai/Kartu PPNS/Tanda Pengenal": [
        "Permohonan kartu pegawai dan tanda pengenal baru",
        "Penerbitan NIP dan kartu identitas pegawai negeri",
        "Dokumen kartu PPNS dan tanda pengenal dinas pegawai",
        "Pembuatan kartu pegawai NIP dan identitas resmi PNS",
        "Pengajuan kartu pengenal dan nomor induk pegawai baru",
    ],
    "KP.01.03|Penggajian/KGB/Tunjangan Jabatan/Daftar gaji": [
        "Daftar gaji pegawai dan kenaikan gaji berkala KGB",
        "Tunjangan jabatan dan komponen penggajian pegawai",
        "Surat keputusan kenaikan gaji berkala KGB pegawai",
        "Dokumen penggajian dan tunjangan jabatan fungsional",
        "Daftar gaji bulanan dan tunjangan kinerja pegawai RRI",
    ],
    "KP.01.04|Pendaftaran/Keluarga/Perkawinan/Anak/Karis/Karsu": [
        "Pendaftaran anggota keluarga dan kartu istri suami pegawai",
        "Dokumen Karis Karsu dan pendaftaran keluarga PNS",
        "Permohonan kartu istri kartu suami dan data keluarga",
        "Pendaftaran anak dan keluarga pegawai negeri sipil",
        "Administrasi data keluarga perkawinan dan Karis/Karsu",
    ],
    "KP.01.05|Daftar Nominatif/Data Pegawai Honorer (kontrak)": [
        "Daftar nominatif pegawai honorer dan tenaga kontrak",
        "Data pegawai honorer dan daftar nominatif PPNPN",
        "Kontrak kerja pegawai honorer dan tenaga tidak tetap",
        "Daftar pegawai pemerintah non PNS dan data kontrak",
        "Nominatif pegawai honorer dan dokumen kontrak kerja",
    ],
    "KP.01.06|Penugasan/Penunjukan/Surat Perintah/Pemanggilan/PLH/Surat Pernyataan/Surat Keterangan/SPMT": [
        "Surat Perintah Tugas dalam rangka perjalanan dinas RRI",
        "Surat penunjukan pelaksana harian PLH jabatan",
        "Surat perintah pemanggilan pegawai untuk keperluan dinas",
        "SPMT surat pernyataan melaksanakan tugas pegawai baru",
        "Surat keterangan aktif bekerja dan penugasan pegawai",
        "Surat tugas mengikuti kegiatan rapat koordinasi",
        "Penunjukan panitia pelaksana kegiatan dan surat tugas",
        "Surat perintah perjalanan dinas dalam dan luar daerah",
    ],
    "KP.01.07|Penghargaan/Piala/Piagam/tanda Kehormatan": [
        "Pemberian penghargaan Satyalancana kepada pegawai berprestasi",
        "Piagam penghargaan dan tanda kehormatan pegawai RRI",
        "Surat keputusan pemberian piala dan penghargaan dinas",
        "Penghargaan pegawai teladan dan piagam kehormatan",
        "Nominasi dan pemberian tanda kehormatan Satyalancana",
    ],
    "KP.01.08|Pendelegasian Wewenang": [
        "Surat pendelegasian wewenang pejabat kepada bawahan",
        "Pendelegasian kewenangan penandatanganan dokumen dinas",
        "Pelimpahan wewenang pimpinan kepada pejabat di bawahnya",
        "Surat kuasa pendelegasian wewenang jabatan",
        "Dokumen pendelegasian tugas dan wewenang pejabat",
    ],
    "KP.01.09|Sumpah Pegawai": [
        "Berita acara pengambilan sumpah jabatan pegawai negeri",
        "Pelaksanaan sumpah janji PNS dan sumpah jabatan",
        "Dokumen sumpah pegawai dan pengangkatan jabatan resmi",
        "Surat keterangan sumpah jabatan pegawai negeri sipil",
        "Berita acara pelantikan dan sumpah jabatan pegawai",
    ],
    "KP.01.10|Daftar Kepangkatan/DUK": [
        "Daftar urut kepangkatan DUK pegawai negeri sipil",
        "Pemutakhiran daftar kepangkatan dan DUK tahunan",
        "Dokumen daftar urut kepangkatan pegawai RRI",
        "Penyusunan DUK dan daftar kepangkatan unit kerja",
        "Update daftar urut kepangkatan pegawai instansi",
    ],
    "KP.01.11|Cuti": [
        "Permohonan cuti tahunan dan cuti besar pegawai",
        "Surat izin cuti sakit dan cuti melahirkan pegawai",
        "Formulir pengajuan cuti dan persetujuan atasan",
        "Administrasi cuti tahunan cuti besar cuti alasan penting",
        "Rekapitulasi penggunaan hak cuti pegawai tahunan",
    ],
    "KP.01.12|Pelaporan Nikah/Cerai/Rujuk/Izin Perkawinan": [
        "Pelaporan perkawinan dan perceraian pegawai negeri",
        "Surat izin perkawinan dan perceraian PNS",
        "Laporan nikah cerai rujuk pegawai kepada instansi",
        "Dokumen permohonan izin menikah dan laporan perkawinan",
        "Pelaporan perubahan status perkawinan pegawai negeri",
    ],
    "KP.01.13|Surat Kuasa": [
        "Surat kuasa pengurusan dokumen kepegawaian",
        "Pemberian kuasa hukum dan surat kuasa resmi pegawai",
        "Surat kuasa pengambilan berkas dan dokumen dinas",
        "Kuasa khusus pengurusan administrasi kepegawaian",
        "Surat kuasa mewakili dalam urusan kepegawaian",
    ],
    "KP.01.14|Absensi": [
        "Rekapitulasi daftar hadir dan absensi bulanan pegawai",
        "Laporan absensi kehadiran dan ketidakhadiran pegawai",
        "Data absensi elektronik dan finger print pegawai",
        "Daftar hadir kerja dan rekapitulasi absensi bulanan",
        "Monitoring kehadiran dan absensi harian pegawai RRI",
    ],
    "KP.01.15|Izin Kerja/izin Belajar/Izin Dispensasi": [
        "Permohonan izin belajar dan tugas belajar pegawai",
        "Surat izin dispensasi untuk keperluan pribadi pegawai",
        "Izin kerja paruh waktu dan dispensasi kehadiran",
        "Permohonan izin belajar melanjutkan pendidikan pegawai",
        "Surat dispensasi dan izin meninggalkan kantor",
    ],
    "KP.01.16|Uji Kesehatan": [
        "Hasil uji kesehatan dan medical check up pegawai",
        "Surat keterangan sehat untuk persyaratan kepegawaian",
        "Uji kesehatan berkala dan pemeriksaan kesehatan pegawai",
        "Dokumen hasil pemeriksaan kesehatan jasmani dan rohani",
        "Medical check up dan surat keterangan sehat pegawai baru",
    ],
    "KP.02.01|Analisis Jabatan": [
        "Dokumen analisis jabatan dan beban kerja pegawai",
        "Penyusunan analisis jabatan di lingkungan LPP RRI",
        "Hasil analisis jabatan dan uraian tugas pejabat",
        "Analisis jabatan struktural dan fungsional lembaga",
        "Penyusunan dokumen anjab dan ABK unit kerja",
    ],
    "KP.02.02|Formasi Pegawai": [
        "Usulan formasi pegawai dan kebutuhan tenaga kerja",
        "Penyusunan formasi CPNS dan kebutuhan pegawai baru",
        "Dokumen formasi jabatan dan rencana kebutuhan pegawai",
        "Formasi pegawai negeri sipil tahun anggaran berjalan",
        "Rencana formasi dan kebutuhan sumber daya manusia",
    ],
    "KP.02.03|Peta Jabatan": [
        "Penyusunan peta jabatan organisasi LPP RRI",
        "Dokumen peta jabatan dan struktur organisasi",
        "Update peta jabatan dan hierarki organisasi lembaga",
        "Peta jabatan struktural dan fungsional unit kerja",
        "Pengelolaan peta jabatan dan posisi dalam organisasi",
    ],
    "KP.03.01|Seleksi Pegawai": [
        "Pelaksanaan seleksi penerimaan pegawai baru CPNS",
        "Proses seleksi dan rekrutmen calon pegawai negeri",
        "Dokumen seleksi administrasi dan ujian CPNS",
        "Pengumuman seleksi penerimaan pegawai baru RRI",
        "Tahapan seleksi dan pengadaan pegawai negeri sipil",
    ],
    "KP.03.02|Penempatan Pegawai": [
        "Surat keputusan penempatan pegawai baru di unit kerja",
        "Penempatan dan distribusi pegawai pada satuan kerja",
        "Dokumen penempatan CPNS dan orientasi pegawai baru",
        "Penempatan pegawai sesuai formasi dan kebutuhan unit",
        "Surat penempatan kerja dan lokasi tugas pegawai",
    ],
    "KP.03.03|Pengangkatan dan Pengunduran Diri CPNS": [
        "SK pengangkatan CPNS menjadi PNS setelah masa percobaan",
        "Permohonan pengunduran diri CPNS dari status pegawai",
        "Dokumen pengangkatan calon pegawai negeri sipil",
        "Penetapan pengangkatan CPNS dan surat keputusan PNS",
        "Proses pengangkatan CPNS dan pengunduran diri pegawai",
    ],
    "KP.03.04|Pengangkatan PNS": [
        "Surat keputusan pengangkatan pegawai negeri sipil",
        "Penetapan dan pengangkatan PNS dari status CPNS",
        "SK pengangkatan PNS setelah lulus masa percobaan",
        "Dokumen pengangkatan dan pelantikan PNS definitif",
        "Proses pengangkatan dan penempatan PNS baru",
    ],
    "KP.04.01|Pemindahan PNS/Non PNS Antar Unit": [
        "Surat keputusan mutasi pemindahan pegawai antar unit kerja",
        "Mutasi pemindahan PNS dari satu unit ke unit lainnya",
        "Perpindahan pegawai antar satuan kerja di lingkungan RRI",
        "SK mutasi dan pemindahan pegawai internal antar unit",
        "Dokumen pemindahan tugas pegawai dari unit kerja",
    ],
    "KP.04.02|Pemindahan PNS/Non PNS Antar Instansi": [
        "Mutasi pemindahan pegawai antar instansi pemerintah",
        "Perpindahan PNS ke instansi lain di luar LPP RRI",
        "Surat permohonan mutasi antar instansi pemerintah",
        "Dokumen mutasi pegawai dari RRI ke instansi lain",
        "Proses pemindahan pegawai antar kementerian lembaga",
    ],
    "KP.04.03|Pemindahan PNS/Non PNS dengan Status Dipekerjakan/Diperbantukan": [
        "Penugasan pegawai dengan status diperbantukan ke instansi lain",
        "SK penugasan pegawai dipekerjakan pada lembaga mitra",
        "Pemindahan pegawai dengan status diperbantukan DPK",
        "Dokumen pegawai yang dipekerjakan di instansi pemerintah lain",
        "Penugasan DPK dan status diperbantukan pegawai negeri",
    ],
    "KP.04.04|Kenaikan Pangkat Struktural dan Fungsional": [
        "SK kenaikan pangkat reguler dan pilihan PNS",
        "Usulan kenaikan pangkat struktural dan fungsional pegawai",
        "Proses kenaikan pangkat berkala pegawai negeri sipil",
        "Dokumen kenaikan pangkat golongan dan ruang pegawai",
        "Penetapan kenaikan pangkat reguler periode April/Oktober",
    ],
    "KP.04.05|Mutasi Pendidikan": [
        "Laporan mutasi pendidikan dan ijazah baru pegawai",
        "Permohonan penyesuaian ijazah dan mutasi pendidikan",
        "Dokumen mutasi pendidikan pegawai yang melanjutkan studi",
        "Update data pendidikan dan ijazah pegawai negeri",
        "Penyesuaian pendidikan dan mutasi kualifikasi pegawai",
    ],
    "KP.04.06|Pengangkatan, Pemindahan, dan Pemberhentian dalam Jabatan Struktural": [
        "SK pengangkatan pejabat struktural eselon di lingkungan RRI",
        "Pemindahan dan pemberhentian pejabat dalam jabatan struktural",
        "Pengangkatan kepala bagian dan kepala sub bagian",
        "Dokumen mutasi jabatan struktural dan pelantikan pejabat",
        "SK pengangkatan dalam jabatan eselon dan administrator",
    ],
    "KP.04.07|Pengangkatan, Pemindahan, Pemberhentian dan Pembebasan Sementara dalam Jabatan Fungsional": [
        "SK pengangkatan pejabat fungsional arsiparis dan pustakawan",
        "Pemberhentian dan pembebasan sementara jabatan fungsional",
        "Pengangkatan dalam jabatan fungsional tertentu dan umum",
        "Mutasi dan pembebasan sementara pejabat fungsional",
        "Dokumen pengangkatan jabatan fungsional pranata siaran",
    ],
    "KP.04.08|Impasing/Penyesuaian Ijazah": [
        "Permohonan impasing dan penyesuaian ijazah pegawai",
        "Proses penyesuaian ijazah terakhir pegawai negeri",
        "Dokumen impasing dan kenaikan pangkat penyesuaian ijazah",
        "Penyesuaian pangkat berdasarkan ijazah yang diperoleh",
        "SK impasing dan penyesuaian kualifikasi pendidikan",
    ],
    "KP.04.09|Serah Terima Jabatan/Tugas": [
        "Berita acara serah terima jabatan pejabat lama dan baru",
        "Pelaksanaan serah terima tugas dan jabatan pimpinan",
        "Dokumen serah terima jabatan dan inventaris kantor",
        "Proses serah terima tugas dari pejabat yang digantikan",
        "Berita acara serah terima jabatan kepala satuan kerja",
    ],
    "KP.05.01|Tata Usaha Kediklatan (Kurikulum, Modul, Dokumen Adminstrasi, Dokumen Akademik, Dokumen Evaluasi, Sertifikat/STTPL)": [
        "Administrasi pendidikan dan pelatihan kurikulum dan modul",
        "Sertifikat STTPL dan dokumen kediklatan pegawai",
        "Tata usaha diklat dan pengelolaan dokumen pelatihan",
        "Kurikulum modul dan evaluasi hasil diklat pegawai",
        "Administrasi sertifikat pelatihan dan STTPL peserta",
    ],
    "KP.05.02|Pembinaan Mental": [
        "Program pembinaan mental spiritual pegawai RRI",
        "Kegiatan pembinaan mental dan rohani di kantor",
        "Pelaksanaan ceramah agama dan pembinaan mental pegawai",
        "Dokumen pembinaan mental dan kegiatan keagamaan",
        "Program bimbingan spiritual dan pembinaan mental kerja",
    ],
    "KP.05.03|Diklat Prajabatan": [
        "Penyelenggaraan diklat prajabatan CPNS golongan III",
        "Sertifikat diklat prajabatan calon pegawai negeri sipil",
        "Pelaksanaan pelatihan dasar CPNS dan prajabatan",
        "Dokumen diklat prajabatan dan lulus latsar CPNS",
        "Kegiatan diklat prajabatan bagi calon pegawai baru",
    ],
    "KP.05.04|Diklat Pimpinan": [
        "Penyelenggaraan diklat kepemimpinan pejabat administrator",
        "Diklat PIM dan pelatihan kepemimpinan pejabat struktural",
        "Sertifikat diklat pimpinan tingkat pratama dan madya",
        "Pelatihan kepemimpinan dan manajemen pejabat eselon",
        "Dokumen diklat pimpinan administrator dan pengawas",
    ],
    "KP.05.05|Diklat Fungsional": [
        "Pelatihan diklat fungsional arsiparis dan pranata siaran",
        "Diklat fungsional keahlian dan keterampilan pegawai",
        "Penyelenggaraan diklat fungsional tertentu dan umum",
        "Sertifikat diklat fungsional dan kompetensi jabatan",
        "Pelatihan teknis fungsional bagi pejabat fungsional",
    ],
    "KP.05.06|Diklat Teknis": [
        "Pelatihan teknis keahlian khusus bagi pegawai RRI",
        "Diklat teknis broadcasting dan teknologi penyiaran",
        "Penyelenggaraan diklat teknis di bidang kompetensi kerja",
        "Sertifikat pelatihan teknis dan workshop keahlian",
        "Diklat teknis operasional peralatan siaran dan IT",
    ],
    "KP.06.01|Assesment Pegawai": [
        "Pelaksanaan assessment pegawai untuk promosi jabatan",
        "Hasil assessment center dan evaluasi kompetensi pegawai",
        "Dokumen penilaian assessment kompetensi pejabat",
        "Assessment pegawai untuk pengisian jabatan struktural",
        "Ujian assessment dan penilaian potensi pegawai",
    ],
    "KP.06.02|Ujian Dinas, Ujian Penyesuaian Ijazah": [
        "Pelaksanaan ujian dinas dan ujian penyesuaian ijazah",
        "Hasil ujian dinas tingkat I dan II pegawai negeri",
        "Dokumen ujian penyesuaian ijazah dan kenaikan pangkat",
        "Penyelenggaraan ujian dinas untuk kenaikan golongan",
        "Surat kelulusan ujian dinas dan penyesuaian ijazah",
    ],
    "KP.06.03|Teguran/Peringatan/Penundaan gaji dan Pangkat/Penurunan Pangkat": [
        "Surat teguran dan peringatan tertulis kepada pegawai",
        "Hukuman disiplin penundaan kenaikan gaji dan pangkat",
        "Penjatuhan hukuman disiplin berupa penurunan pangkat",
        "Surat peringatan keras dan sanksi disiplin pegawai",
        "Penundaan kenaikan pangkat sebagai hukuman disiplin",
    ],
    "KP.06.04|Skorsing/Hukuman Jabatan": [
        "Keputusan pemberhentian sementara dari jabatan skorsing",
        "Penjatuhan hukuman jabatan dan pembebasan tugas",
        "Skorsing pejabat struktural karena pelanggaran disiplin",
        "Hukuman jabatan berupa pembebasan dari jabatan",
        "Surat keputusan skorsing dan hukuman disiplin berat",
    ],
    "KP.06.05|Rehabilitasi/Permohonan Kerja Kembali": [
        "Permohonan rehabilitasi nama baik pegawai yang dibebaskan",
        "Surat permohonan kembali bekerja setelah skorsing",
        "Rehabilitasi jabatan dan pemulihan hak pegawai",
        "Dokumen permohonan kerja kembali setelah hukuman disiplin",
        "Proses rehabilitasi dan pengembalian hak-hak pegawai",
    ],
    "KP.06.06|Jam Kerja/Disiplin": [
        "Pengaturan jam kerja dan kedisiplinan pegawai RRI",
        "Surat edaran tentang jam kerja dan disiplin kehadiran",
        "Nota Dinas apel kedisiplinan dan jam kerja pegawai",
        "Monitoring disiplin kehadiran dan jam kerja harian",
        "Aturan jam kerja fleksibel dan ketentuan disiplin PNS",
    ],
    "KP.06.07|DP3/SKP": [
        "Penilaian sasaran kerja pegawai SKP tahunan",
        "Dokumen DP3 dan penilaian prestasi kerja PNS",
        "Penyusunan dan penilaian SKP pegawai negeri sipil",
        "Laporan penilaian kinerja dan sasaran kerja tahunan",
        "Rekapitulasi nilai SKP dan capaian kinerja pegawai",
    ],
    "KP.06.08|Angka Kredit Jabatan Fungsional": [
        "Penetapan angka kredit pejabat fungsional arsiparis",
        "Pengajuan dan penilaian angka kredit jabatan fungsional",
        "DUPAK dan angka kredit jabatan fungsional tertentu",
        "Dokumen penetapan angka kredit dan kenaikan jenjang",
        "Penilaian angka kredit pranata siaran dan pustakawan",
    ],
    "KP.07.01|Kesehatan/Klinik": [
        "Pelayanan kesehatan klinik dan poliklinik pegawai",
        "Pengelolaan klinik kesehatan di lingkungan kantor RRI",
        "Layanan kesehatan dan fasilitas klinik untuk pegawai",
        "Dokumen pelayanan kesehatan dan rujukan pegawai",
        "Program kesehatan kerja dan klinik kantor RRI",
    ],
    "KP.07.02|Taspen/Askes/Jasmostek/Bapertarum": [
        "Pendaftaran dan klaim asuransi Taspen pegawai PNS",
        "Pengelolaan BPJS Kesehatan dan Ketenagakerjaan pegawai",
        "Dokumen Bapertarum dan tabungan perumahan PNS",
        "Klaim jaminan sosial Taspen dan asuransi kesehatan",
        "Administrasi BPJS dan jaminan sosial tenaga kerja",
    ],
    "KP.07.03|Olahraga/Kesenian dan Budaya": [
        "Kegiatan olahraga bersama dan senam pagi pegawai RRI",
        "Penyelenggaraan kegiatan seni budaya dan kesenian kantor",
        "Pertandingan olahraga dan lomba seni antar pegawai",
        "Program olahraga dan kesenian di lingkungan kerja",
        "Kegiatan rekreasi olahraga dan budaya pegawai",
    ],
    "KP.08.01|Pemberhentian Dengan Hormat/Mengundurkan Diri": [
        "SK pemberhentian dengan hormat atas permintaan sendiri",
        "Permohonan pengunduran diri dan pemberhentian pegawai",
        "Pemberhentian PNS dengan hormat karena pensiun dini",
        "Surat keputusan pemberhentian dengan hormat pegawai",
        "Dokumen pengunduran diri dan pemberhentian secara hormat",
    ],
    "KP.08.02|Pemberhentian Dengan Tidak Hormat": [
        "SK pemberhentian dengan tidak hormat karena pelanggaran",
        "Pemberhentian pegawai dengan tidak hormat dari PNS",
        "Dokumen pemberhentian tidak hormat karena tindak pidana",
        "Keputusan pemecatan dan pemberhentian tidak hormat",
        "Proses pemberhentian dengan tidak hormat pegawai",
    ],
    "KP.08.03|Masa Persiapan Pensiun (MPP)/Pembekalan Pensiun": [
        "Program masa persiapan pensiun MPP bagi pegawai",
        "Pembekalan pensiun dan persiapan memasuki masa pensiun",
        "Kegiatan MPP dan bimbingan purna tugas pegawai",
        "Dokumen masa persiapan pensiun dan orientasi purna tugas",
        "Pelatihan pembekalan pensiun bagi pegawai yang akan purna",
    ],
    "KP.08.04|Penetapan Uang Pensiun/Pesangon": [
        "Penetapan besaran uang pensiun dan pesangon pegawai",
        "Perhitungan uang pensiun bulanan dan tunjangan",
        "Dokumen penetapan hak pensiun dan pesangon PNS",
        "SK penetapan uang pensiun janda duda dan anak",
        "Administrasi pembayaran uang pensiun dan pesangon",
    ],
    "KP.08.05|Pensiun (BUP)": [
        "Pensiun karena batas usia pensiun BUP pegawai negeri",
        "SK pensiun pegawai yang telah mencapai batas usia",
        "Dokumen pensiun BUP dan penetapan hak pensiun",
        "Proses pensiun karena batas usia pensiun 58/60 tahun",
        "Penetapan pensiun pegawai yang mencapai BUP",
    ],
    "KP.08.06|Pensiun Janda/Duda/Anak": [
        "Penetapan pensiun janda duda atas meninggalnya PNS",
        "Pengajuan pensiun anak yatim dan hak pensiun keluarga",
        "Dokumen pensiun janda dan daftar ahli waris pegawai",
        "SK pensiun janda duda dan anak PNS yang meninggal",
        "Hak pensiun keluarga dan tunjangan janda duda anak",
    ],
    "KP.08.07|Pensiun Meninggal Dunia/Tewas": [
        "Penetapan hak pensiun pegawai yang meninggal dunia",
        "Dokumen pensiun karena tewas dalam melaksanakan tugas",
        "SK pemberian hak pensiun keluarga pegawai yang tewas",
        "Asuransi kematian dan pensiun pegawai meninggal dunia",
        "Penetapan santunan dan pensiun pegawai yang tewas",
    ],
    "KP.08.08|Nominatif Pensiun": [
        "Daftar nominatif pegawai yang akan memasuki pensiun",
        "Rekapitulasi data nominatif calon pensiunan tahun",
        "Dokumen nominatif pegawai yang akan pensiun BUP",
        "Daftar nominatif pensiun dan jadwal pemberhentian",
        "Pendataan nominatif calon pensiunan pegawai RRI",
    ],
    "KP.09.01|KORPRI": [
        "Kegiatan organisasi KORPRI di lingkungan LPP RRI",
        "Surat undangan rapat pengurus KORPRI unit kerja",
        "Dokumen organisasi Korps Pegawai Republik Indonesia",
        "Pelaksanaan HUT KORPRI dan kegiatan organisasi",
        "Susunan pengurus dan kegiatan KORPRI unit RRI",
    ],
    "KP.09.02|Dharma Wanita": [
        "Kegiatan organisasi Dharma Wanita Persatuan RRI",
        "Surat undangan dan rapat pengurus Dharma Wanita",
        "Pelaksanaan kegiatan sosial Dharma Wanita Persatuan",
        "Dokumen organisasi dan program Dharma Wanita",
        "Susunan pengurus Dharma Wanita dan agenda kegiatan",
    ],
    "KP.09.03|Koperasi": [
        "Kegiatan koperasi pegawai dan rapat anggota tahunan",
        "Laporan RAT koperasi pegawai dan SHU tahunan",
        "Pengelolaan koperasi simpan pinjam di lingkungan RRI",
        "Dokumen koperasi pegawai dan administrasi keanggotaan",
        "Rapat anggota dan laporan keuangan koperasi pegawai",
    ],
    "KP.09.04|Organisasi Lainnya": [
        "Kegiatan organisasi profesi dan paguyuban pegawai",
        "Surat tentang organisasi kemasyarakatan di lingkungan kantor",
        "Dokumen organisasi sosial dan kegiatan kemasyarakatan",
        "Pelaksanaan kegiatan organisasi lain di lingkungan RRI",
        "Administrasi organisasi non-kedinasan pegawai",
    ],

    # =====================================================================
    # V. KU - KEUANGAN
    # =====================================================================
    "KU.01.01|DIPA (Rincian RKA-KL, Petunjuk Operasional (PO), Pergeseran/Perubahan/Revisi DIPA dan PO DIPA, APBN)": [
        "Dokumen DIPA dan rincian RKA-KL satuan kerja RRI",
        "Petunjuk Operasional PO DIPA dan revisi anggaran",
        "Pergeseran anggaran dan revisi DIPA tahun berjalan",
        "Rincian DIPA dan alokasi anggaran APBN lembaga",
        "Dokumen RKA-KL dan petunjuk operasional kegiatan",
    ],
    "KU.01.02|ABT (Anggaran Belanja Tambahan)": [
        "Dokumen anggaran belanja tambahan ABT satuan kerja",
        "Pengajuan ABT dan anggaran belanja tambahan program",
        "Permohonan anggaran belanja tambahan untuk kegiatan",
        "ABT dan tambahan alokasi anggaran kegiatan prioritas",
        "Dokumen pengajuan anggaran tambahan satuan kerja",
    ],
    "KU.01.03|Berita Acara, Kontrak/SPK": [
        "Berita acara serah terima pekerjaan dan kontrak pengadaan",
        "Surat Perintah Kerja SPK dan kontrak pekerjaan",
        "Dokumen berita acara pemeriksaan dan penerimaan barang",
        "Kontrak pengadaan barang jasa dan berita acara",
        "SPK dan berita acara penyelesaian pekerjaan",
    ],
    "KU.01.04|SPPD": [
        "Surat Perintah Perjalanan Dinas SPPD pegawai RRI",
        "Dokumen SPPD dan pertanggungjawaban perjalanan dinas",
        "Penerbitan SPPD untuk perjalanan dinas dalam negeri",
        "Surat perjalanan dinas dan biaya transport pegawai",
        "SPPD dan laporan hasil perjalanan dinas pegawai",
    ],
    "KU.01.05|SPP/Surat Permintaan Pembayaran (Belanja Pegawai, Belanja Barang, Belanja Modal, Belanja Lain-lain)": [
        "Surat Permintaan Pembayaran SPP belanja pegawai",
        "SPP belanja barang dan belanja modal satuan kerja",
        "Dokumen SPP LS dan pembayaran tagihan pihak ketiga",
        "Pengajuan SPP belanja operasional dan belanja lain-lain",
        "Surat permintaan pembayaran dan dokumen pendukung",
    ],
    "KU.01.06|SP2D (Surat Perintah Pencairan Dana)": [
        "Surat Perintah Pencairan Dana SP2D dari KPPN",
        "Dokumen SP2D pencairan anggaran satuan kerja",
        "Penerbitan SP2D untuk pembayaran belanja negara",
        "SP2D LS dan pencairan dana langsung dari KPPN",
        "Pencairan dana melalui SP2D dan bukti transfer",
    ],
    "KU.01.07|Neraca (semesteran, Tahunan)": [
        "Laporan neraca keuangan semesteran satuan kerja",
        "Penyusunan neraca tahunan dan laporan keuangan",
        "Dokumen neraca dan posisi keuangan akhir tahun",
        "Neraca percobaan dan laporan realisasi semester",
        "Laporan neraca keuangan dan aset satuan kerja",
    ],
    "KU.01.08|Daftar uang Makan/Uang Lembur/Remunerasi/Honor": [
        "Daftar pembayaran uang makan dan uang lembur pegawai",
        "Remunerasi dan honorarium kegiatan pegawai RRI",
        "Dokumen daftar honor narasumber dan uang lembur",
        "Pembayaran uang makan harian dan tunjangan kinerja",
        "Daftar remunerasi dan honor kegiatan bulanan",
    ],
    "KU.02.01|Loan Agreement/Hibah Luar Negeri": [
        "Dokumen loan agreement dan perjanjian hibah luar negeri",
        "Penerimaan hibah dari lembaga internasional dan donor",
        "Perjanjian pinjaman luar negeri dan grant agreement",
        "Administrasi hibah luar negeri dan loan agreement",
        "Dokumen bantuan teknis dan hibah dari negara asing",
    ],
    "KU.02.02|Ikhtisar Kegiatan": [
        "Ikhtisar kegiatan program bantuan dan pinjaman luar negeri",
        "Ringkasan dan ikhtisar pelaksanaan kegiatan keuangan",
        "Dokumen ikhtisar kegiatan dan realisasi program bantuan",
        "Ikhtisar pelaksanaan program dan penggunaan dana hibah",
        "Laporan ikhtisar kegiatan yang dibiayai bantuan luar negeri",
    ],
    "KU.02.03|Kerangka Acuan Kerja": [
        "Penyusunan kerangka acuan kerja KAK dan TOR kegiatan",
        "Dokumen terms of reference dan kerangka acuan program",
        "Kerangka acuan kerja untuk kegiatan yang dibiayai pinjaman",
        "TOR dan KAK program bantuan dan pinjaman luar negeri",
        "Dokumen kerangka acuan kerja pengadaan barang jasa",
    ],
    "KU.02.04|Studi Kelayakan": [
        "Dokumen studi kelayakan proyek dan program investasi",
        "Feasibility study dan kajian kelayakan kegiatan",
        "Studi kelayakan teknis dan ekonomi proyek lembaga",
        "Hasil studi kelayakan dan analisis biaya manfaat",
        "Dokumen kajian kelayakan investasi dan pengembangan",
    ],
    "KU.02.05|Rincian Anggaran Biaya (RAB)": [
        "Rincian anggaran biaya RAB kegiatan program",
        "Penyusunan RAB dan rincian biaya pelaksanaan kegiatan",
        "Dokumen rincian anggaran biaya pengadaan dan jasa",
        "RAB detail dan rincian biaya operasional program",
        "Estimasi biaya dan rincian anggaran kegiatan proyek",
    ],
    "KU.02.06|Dokumen Kontrak": [
        "Dokumen kontrak kerja sama dan perjanjian keuangan",
        "Kontrak pengadaan dengan sumber dana pinjaman luar negeri",
        "Perjanjian kontrak dan administrasi dokumen keuangan",
        "Dokumen kontrak proyek bantuan dan pinjaman asing",
        "Kontrak kerja sama keuangan dengan lembaga internasional",
    ],
    "KU.02.07|Reimburstment Kepada Negara/Badan Pemberian Bantuan": [
        "Dokumen reimbursement dana kepada negara pemberi bantuan",
        "Pengembalian dana dan reimbursement ke badan donor",
        "Proses reimbursement keuangan kepada lembaga pemberi",
        "Dokumen klaim penggantian biaya kepada badan bantuan",
        "Reimbursement dan pengembalian dana bantuan luar negeri",
    ],
    "KU.02.08|SPP/SPM": [
        "Surat Perintah Membayar SPM dan SPP keuangan",
        "Penerbitan SPM LS dan UP untuk pembayaran",
        "Dokumen SPP dan SPM pencairan dana kegiatan",
        "Proses penerbitan SPM dan verifikasi SPP",
        "SPM dan SPP untuk pembayaran belanja negara",
    ],
    "KU.02.09|Pembukaan LC (Letter of Credit)/Valuta Asing/Penerbitan/Obligasi": [
        "Pembukaan letter of credit LC untuk transaksi internasional",
        "Dokumen valuta asing dan penerbitan obligasi lembaga",
        "Transaksi LC dan pembukaan kredit dokumenter",
        "Pengelolaan valuta asing dan letter of credit bank",
        "Dokumen penerbitan obligasi dan instrumen keuangan",
    ],
    "KU.03.01|Pajak-pajak": [
        "Laporan pemotongan dan penyetoran pajak PPh pegawai",
        "Dokumen perpajakan dan SPT tahunan satuan kerja",
        "Pemotongan pajak PPh 21 dan PPh pasal 23",
        "Administrasi pajak dan bukti potong pajak pegawai",
        "Laporan pajak bulanan dan setoran pajak ke kas negara",
    ],
    "KU.03.02|Pendapatan Bukan Pajak": [
        "Penerimaan negara bukan pajak PNBP dari jasa siaran",
        "Laporan pendapatan bukan pajak satuan kerja RRI",
        "Dokumen PNBP dan pendapatan non-pajak lembaga",
        "Penerimaan iklan dan jasa siaran sebagai PNBP",
        "Setoran PNBP ke kas negara dan laporan pendapatan",
    ],
    "KU.03.03|Sewa Pemanfaatan Aset/barang Milik Negara": [
        "Perjanjian sewa pemanfaatan aset barang milik negara",
        "Dokumen sewa BMN dan pemanfaatan aset lembaga",
        "Kontrak sewa gedung dan fasilitas milik negara",
        "Pemanfaatan BMN melalui sewa dan kerja sama",
        "Persetujuan sewa pemanfaatan aset dan barang inventaris",
    ],
    "KU.04.01|Tuntutan Perbendaharaan/Tuntutan Ganti Rugi (TP/TGR)": [
        "Tuntutan perbendaharaan dan ganti rugi kerugian negara",
        "Dokumen TP/TGR dan penyelesaian kerugian negara",
        "Proses tuntutan ganti rugi atas kerugian keuangan negara",
        "Penyelesaian tuntutan perbendaharaan bendahara",
        "Surat tuntutan ganti rugi dan perbendaharaan TP TGR",
    ],
    "KU.04.02|Tata Usaha Keuangan Negara": [
        "Administrasi tata usaha keuangan negara satuan kerja",
        "Pengelolaan tata usaha keuangan dan pembukuan",
        "Dokumen tata usaha keuangan dan pencatatan transaksi",
        "Tata usaha keuangan dan akuntansi instansi pemerintah",
        "Penyelenggaraan tata usaha keuangan dan laporan",
    ],
    "KU.04.03|Pengelolaan Anggaran (Kuasa Pengguna Anggaran/KPA, Pejabat Pembuat Komitmen/PPK, Pejabat Penguji dan Penandatanganan SPM, Bendahara Pengeluaran, Bendahara Penerimaan)": [
        "SK penunjukan KPA PPK dan bendahara pengeluaran",
        "Pengelolaan anggaran oleh Kuasa Pengguna Anggaran",
        "Dokumen penunjukan pejabat pembuat komitmen PPK",
        "Penetapan bendahara pengeluaran dan penerimaan",
        "Penunjukan pejabat pengelola anggaran KPA dan PPK",
    ],
    "KU.04.04|Rencana Kerja Anggaran (RKA)": [
        "Penyusunan rencana kerja anggaran RKA satuan kerja",
        "Dokumen RKA-KL dan rencana kerja anggaran tahunan",
        "Rencana kerja dan anggaran kementerian lembaga",
        "RKA dan perencanaan anggaran program kegiatan",
        "Penyusunan RKA dan estimasi kebutuhan anggaran",
    ],
    "KU.04.05|Tagihan Dinas": [
        "Penyelesaian tagihan dinas dan pembayaran pihak ketiga",
        "Dokumen tagihan dinas dan kwitansi pembayaran",
        "Verifikasi dan pembayaran tagihan dinas operasional",
        "Tagihan listrik telepon dan utilitas kantor",
        "Administrasi tagihan dinas dan bukti pembayaran",
    ],

    # =====================================================================
    # VI. PL - PERLENGKAPAN
    # =====================================================================
    "PL.01.01|Analisis Data Perencanaan": [
        "Analisis data perencanaan kebutuhan perlengkapan",
        "Dokumen analisis kebutuhan peralatan dan perlengkapan",
        "Analisis data rencana pengadaan barang inventaris",
        "Perencanaan kebutuhan perlengkapan dan peralatan kantor",
        "Analisis kebutuhan dan perencanaan pengadaan BMN",
    ],
    "PL.01.02|Klasifikasi Data": [
        "Klasifikasi data barang dan perlengkapan inventaris",
        "Pengelompokan dan klasifikasi aset barang milik negara",
        "Dokumen klasifikasi data perlengkapan dan peralatan",
        "Klasifikasi jenis barang dan kodefikasi inventaris",
        "Pengelolaan klasifikasi data aset dan perlengkapan",
    ],
    "PL.01.03|Rencana Kebutuhan Pengadaan": [
        "Rencana kebutuhan pengadaan barang dan jasa tahunan",
        "Dokumen RKP dan rencana umum pengadaan",
        "Penyusunan rencana kebutuhan pengadaan perlengkapan",
        "Rencana pengadaan barang modal dan operasional",
        "Dokumen rencana kebutuhan dan pengadaan aset",
    ],
    "PL.01.04|Pengumpulan Data rencana Pengadaan Lembaga": [
        "Pengumpulan data rencana pengadaan dari unit kerja",
        "Konsolidasi data kebutuhan pengadaan seluruh satker",
        "Dokumen pengumpulan rencana pengadaan barang lembaga",
        "Rekapitulasi kebutuhan pengadaan seluruh unit RRI",
        "Kompilasi data rencana pengadaan barang dan jasa",
    ],
    "PL.02.01|Rekanan/Penawaran/Proposal/Brosur": [
        "Dokumen penawaran dan proposal dari rekanan vendor",
        "Brosur dan katalog penawaran barang dari penyedia",
        "Surat penawaran harga dan proposal pengadaan barang",
        "Daftar rekanan dan penawaran penyedia barang jasa",
        "Proposal dan brosur penawaran dari supplier peralatan",
    ],
    "PL.02.02|Tender dan Kontrak/Prakualifikasi dan Pasca Kualifikasi, Penunjukan Pemenang, Sanggahan/ Surat Kuasa Kontrak/Berita Acara": [
        "Pelaksanaan tender dan proses pengadaan barang jasa",
        "Dokumen prakualifikasi dan penetapan pemenang lelang",
        "Kontrak pengadaan dan berita acara hasil tender",
        "Proses tender dan penunjukan pemenang penyedia",
        "Sanggahan dan dokumen pasca kualifikasi pengadaan",
    ],
    "PL.02.03|Harga dan Mutu": [
        "Survei harga pasar dan evaluasi mutu barang",
        "Dokumen analisis harga dan kualitas penawaran vendor",
        "Standar harga dan mutu barang pengadaan lembaga",
        "Evaluasi harga penawaran dan spesifikasi teknis",
        "Perbandingan harga dan mutu produk dari penyedia",
    ],
    "PL.02.04|Pembelian": [
        "Dokumen pembelian barang dan peralatan kantor",
        "Proses pembelian langsung dan pengadaan barang",
        "Bukti pembelian dan kwitansi pengadaan perlengkapan",
        "Pembelian peralatan dan perlengkapan operasional",
        "Dokumen pengadaan melalui pembelian langsung",
    ],
    "PL.03.01|Pembinaan BMN Perlengkapan": [
        "Pembinaan pengelolaan barang milik negara perlengkapan",
        "Dokumen pembinaan BMN dan aset perlengkapan lembaga",
        "Pelatihan pengelolaan dan pembinaan BMN unit kerja",
        "Bimbingan teknis pengelolaan BMN dan perlengkapan",
        "Program pembinaan aset dan barang milik negara",
    ],
    "PL.03.02|Distribusi/Pengiriman": [
        "Distribusi dan pengiriman barang ke satuan kerja daerah",
        "Dokumen pengiriman peralatan dan perlengkapan kantor",
        "Berita acara distribusi barang dan serah terima",
        "Proses distribusi peralatan siaran ke stasiun RRI",
        "Pengiriman barang inventaris ke unit kerja penerima",
    ],
    "PL.03.03|Pemeriksaan Pemanfaatan": [
        "Pemeriksaan pemanfaatan BMN dan aset lembaga",
        "Dokumen audit pemanfaatan barang milik negara",
        "Laporan pemeriksaan penggunaan peralatan dan aset",
        "Inspeksi pemanfaatan BMN di unit kerja RRI",
        "Pemeriksaan kondisi dan pemanfaatan aset negara",
    ],
    "PL.03.04|Rehabilitasi/Pemulihan/Renovasi": [
        "Pelaksanaan rehabilitasi dan renovasi gedung kantor",
        "Dokumen pemulihan dan rehabilitasi fasilitas lembaga",
        "Renovasi gedung studio dan perbaikan fasilitas",
        "Proses rehabilitasi dan renovasi ruang kerja kantor",
        "Pemulihan kondisi gedung dan sarana prasarana",
    ],
    "PL.03.05|Pergudangan/Penyimpanan": [
        "Pengelolaan gudang dan penyimpanan barang persediaan",
        "Administrasi pergudangan dan stok barang inventaris",
        "Dokumen penyimpanan dan pengelolaan gudang satker",
        "Kartu stok gudang dan manajemen penyimpanan barang",
        "Pengelolaan pergudangan dan barang persediaan kantor",
    ],
    "PL.03.06|Pemeliharaan BMN": [
        "Pemeliharaan barang milik negara dan aset lembaga",
        "Jadwal pemeliharaan rutin peralatan dan gedung kantor",
        "Dokumen pemeliharaan dan perawatan BMN berkala",
        "Program pemeliharaan aset dan barang inventaris",
        "Pelaksanaan pemeliharaan rutin dan insidentil BMN",
    ],
    "PL.04.01|Inventarisasi Umum/Mutasi Barang/Serah Terima Aset/Berita Acara Hibah": [
        "Inventarisasi umum barang milik negara dan mutasi aset",
        "Berita acara serah terima aset dan hibah barang",
        "Dokumen mutasi barang dan inventarisasi tahunan",
        "Pelaksanaan sensus BMN dan inventarisasi aset",
        "Serah terima aset hibah dan berita acara penerimaan",
    ],
    "PL.04.02|Barang-barang Bergerak": [
        "Inventarisasi barang bergerak kendaraan dan peralatan",
        "Daftar barang bergerak dan kendaraan dinas unit",
        "Dokumen inventaris barang bergerak mesin dan peralatan",
        "Pengelolaan dan pendataan aset barang bergerak",
        "Kartu inventaris barang bergerak dan kendaraan",
    ],
    "PL.04.03|Barang-barang Tidak Bergerak": [
        "Inventarisasi barang tidak bergerak tanah dan bangunan",
        "Daftar aset tidak bergerak gedung dan infrastruktur",
        "Dokumen inventaris barang tidak bergerak lembaga",
        "Pendataan tanah bangunan dan aset tidak bergerak",
        "Kartu inventaris barang tidak bergerak dan sertifikat",
    ],
    "PL.04.04|Standarisasi/Kodefikasi": [
        "Standarisasi dan kodefikasi barang milik negara",
        "Penerapan kode barang dan standar inventaris",
        "Dokumen standarisasi penomoran dan kodefikasi aset",
        "Sistem kodefikasi dan standarisasi barang inventaris",
        "Penetapan kode dan standar klasifikasi barang BMN",
    ],
    "PL.04.05|Pelaporan Persediaan dan BMN": [
        "Laporan persediaan dan barang milik negara semesteran",
        "Pelaporan BMN dan posisi persediaan barang habis pakai",
        "Dokumen laporan persediaan dan neraca BMN",
        "Rekapitulasi persediaan dan laporan aset tahunan",
        "Laporan mutasi dan posisi BMN per semester",
    ],
    "PL.05.01|Standarisasi/Petunjuk Teknis Penghapusan": [
        "Petunjuk teknis penghapusan barang milik negara",
        "Standar dan prosedur penghapusan BMN dari daftar",
        "Dokumen juknis penghapusan aset dan barang rusak",
        "Pedoman teknis penghapusan dan pemusnahan BMN",
        "SOP penghapusan barang milik negara dan inventaris",
    ],
    "PL.05.02|Usul Penghapusan dan Data Pendukung": [
        "Usulan penghapusan barang rusak berat dan data pendukung",
        "Dokumen usul penghapusan BMN dan foto barang",
        "Pengajuan penghapusan aset dengan data kondisi barang",
        "Surat usulan penghapusan dan dokumentasi pendukung",
        "Proposal penghapusan BMN dan bukti kerusakan",
    ],
    "PL.05.03|Penilaian": [
        "Penilaian kondisi barang untuk proses penghapusan BMN",
        "Dokumen penilaian aset dan appraisal barang inventaris",
        "Hasil penilaian kondisi barang yang akan dihapuskan",
        "Berita acara penilaian fisik barang milik negara",
        "Laporan penilaian dan estimasi nilai sisa aset",
    ],
    "PL.05.04|Penetapan Penghapusan": [
        "SK penetapan penghapusan barang milik negara",
        "Keputusan penghapusan BMN dari daftar inventaris",
        "Dokumen penetapan penghapusan aset dan barang rusak",
        "Surat keputusan penghapusan dan pemusnahan BMN",
        "Penetapan penghapusan barang dari neraca BMN",
    ],
    "PL.05.05|Pelelangan/Penjualan": [
        "Proses pelelangan dan penjualan barang hapus BMN",
        "Dokumen lelang dan penjualan aset yang dihapuskan",
        "Pelaksanaan penjualan barang bekas melalui lelang",
        "Berita acara pelelangan dan penjualan BMN hapus",
        "Proses lelang barang inventaris yang telah dihapus",
    ],
    "PL.05.06|Tukar Guling/Ruislag": [
        "Proses tukar guling aset dan ruislag tanah bangunan",
        "Dokumen tukar menukar BMN dan ruislag lembaga",
        "Pelaksanaan tukar guling aset tanah dan gedung",
        "Perjanjian ruislag dan tukar menukar barang negara",
        "Berita acara tukar guling BMN dan aset pengganti",
    ],

    # =====================================================================
    # VII. HK - HUKUM
    # =====================================================================
    "HK.01.01|Undang-Undang": [
        "Himpunan undang-undang terkait penyiaran dan kearsipan",
        "Dokumen undang-undang penyiaran nomor 32 tahun 2002",
        "Referensi undang-undang yang berlaku di lingkungan RRI",
        "Salinan undang-undang dan peraturan perundang-undangan",
        "Dokumen UU tentang informasi publik dan penyiaran",
    ],
    "HK.01.02|Peraturan Pemerintah": [
        "Peraturan pemerintah tentang pelaksanaan undang-undang",
        "Dokumen PP tentang pengelolaan keuangan negara",
        "Salinan peraturan pemerintah terkait kepegawaian",
        "PP tentang tata cara pengelolaan barang milik negara",
        "Himpunan peraturan pemerintah bidang penyiaran",
    ],
    "HK.01.03|Peraturan Presiden": [
        "Peraturan Presiden tentang pengadaan barang dan jasa",
        "Dokumen Perpres dan kebijakan tata kelola pemerintahan",
        "Salinan peraturan presiden terkait operasional lembaga",
        "Perpres tentang tunjangan kinerja dan remunerasi",
        "Peraturan Presiden bidang informasi dan komunikasi",
    ],
    "HK.01.04|Keputusan Presiden": [
        "Keputusan Presiden tentang pengangkatan pejabat negara",
        "Dokumen Keppres dan penetapan kebijakan nasional",
        "Salinan keputusan presiden terkait lembaga penyiaran",
        "Keppres tentang hari besar dan peringatan nasional",
        "Keputusan Presiden penetapan struktur organisasi",
    ],
    "HK.01.05|Instruksi Presiden": [
        "Instruksi Presiden tentang reformasi birokrasi",
        "Dokumen Inpres dan arahan kebijakan pemerintah",
        "Salinan instruksi presiden untuk kementerian lembaga",
        "Inpres tentang pemberantasan korupsi dan tata kelola",
        "Instruksi Presiden bidang pengembangan penyiaran",
    ],
    "HK.01.06|Surat Edaran": [
        "Surat edaran menteri tentang kebijakan operasional",
        "Dokumen surat edaran lembaga terkait pelaksanaan tugas",
        "SE tentang ketentuan dan pedoman pelaksanaan",
        "Surat edaran tentang penghematan anggaran belanja",
        "Surat edaran pemerintah tentang kebijakan baru",
    ],
    "HK.01.07|Keputusan/Peraturan Lembaga/Badan": [
        "Keputusan lembaga dan badan terkait operasional RRI",
        "Peraturan badan tentang standar pelayanan publik",
        "Dokumen keputusan dan peraturan lembaga pemerintah",
        "Peraturan lembaga tentang tata kelola organisasi",
        "Keputusan badan pengawas dan regulator penyiaran",
    ],
    "HK.02.01|Peraturan Dewan Pengawas": [
        "Peraturan Dewan Pengawas LPP RRI tentang tata kelola",
        "Dokumen peraturan Dewas tentang pengawasan lembaga",
        "Peraturan Dewan Pengawas bidang keuangan dan SDM",
        "Produk hukum Dewan Pengawas tentang kebijakan RRI",
        "Peraturan Dewas tentang mekanisme pengawasan",
    ],
    "HK.02.02|Keputusan Dewan Pengawas": [
        "Keputusan Dewan Pengawas tentang penetapan anggaran",
        "SK Dewas tentang pengangkatan dan pemberhentian direksi",
        "Dokumen keputusan Dewan Pengawas bidang organisasi",
        "Keputusan Dewas tentang evaluasi kinerja direksi",
        "Penetapan keputusan Dewan Pengawas LPP RRI",
    ],
    "HK.02.03|Instruksi Dewan Pengawas": [
        "Instruksi Dewan Pengawas kepada Direksi RRI",
        "Arahan dan instruksi Dewas tentang pelaksanaan tugas",
        "Dokumen instruksi Dewan Pengawas untuk perbaikan",
        "Instruksi Dewas tentang tindak lanjut rekomendasi",
        "Arahan kebijakan Dewan Pengawas kepada manajemen",
    ],
    "HK.02.04|Peraturan Dewan Direksi": [
        "Peraturan Direksi tentang tata kelola operasional RRI",
        "Dokumen peraturan Dewan Direksi bidang siaran",
        "Perdirut tentang standar operasional prosedur",
        "Peraturan Direksi tentang manajemen sumber daya",
        "Produk hukum Direksi tentang kebijakan internal",
        "Peraturan Direktur Utama LPP RRI Nomor 03 Tahun 2023 tentang pedoman sistem klasifikasi keamanan dan akses arsip dinamis",
        "Peraturan Direksi tentang sistem klasifikasi keamanan dan akses arsip dinamis di lingkungan LPP RRI",
        "Produk hukum internal Perdirut RRI memuat menimbang mengingat memutuskan pedoman kearsipan",
        "Salinan Peraturan Direktur Utama tentang SKKAD pengelolaan arsip dinamis dan akses publik",
        "Peraturan Dewan Direksi dengan dasar hukum undang-undang kearsipan tentang klasifikasi keamanan arsip",
    ],
    "HK.02.05|Keputusan Dewan Direksi": [
        "Surat Keputusan Direktur Utama LPP RRI tentang organisasi",
        "SK Direksi tentang pengangkatan pejabat struktural",
        "Keputusan Dewan Direksi tentang kebijakan operasional",
        "SK Dirut tentang penetapan tim dan panitia kerja",
        "Keputusan Direksi tentang pengelolaan program siaran",
    ],
    "HK.02.06|Instruksi Dewan Direksi": [
        "Instruksi Direksi tentang pelaksanaan kegiatan program",
        "Arahan Direktur Utama kepada seluruh unit kerja",
        "Instruksi Dewan Direksi tentang peningkatan kinerja",
        "Dokumen instruksi Direksi untuk perbaikan layanan",
        "Instruksi pimpinan tentang penghematan dan efisiensi",
    ],
    "HK.02.07|Surat Edaran/Nota Dinas": [
        "Surat edaran internal tentang ketentuan pelaksanaan",
        "Nota dinas tentang kebijakan dan arahan pimpinan",
        "SE internal tentang tata tertib dan aturan kantor",
        "Nota dinas edaran tentang prosedur administrasi baru",
        "Surat edaran Direksi tentang pelaksanaan kebijakan",
    ],
    "HK.03.01|Luar Negeri": [
        "MoU kerjasama bilateral dengan lembaga penyiaran asing",
        "Nota kesepakatan bersama dengan radio internasional",
        "Perjanjian kerjasama luar negeri dan MoU bilateral",
        "Memorandum of Understanding dengan broadcaster asing",
        "Kesepakatan bersama dengan lembaga siaran luar negeri",
    ],
    "HK.03.02|Dalam Negeri": [
        "MoU kerjasama dengan universitas dan lembaga domestik",
        "Nota kesepakatan bersama dengan instansi dalam negeri",
        "Perjanjian kerjasama dalam negeri dengan pemerintah daerah",
        "Memorandum of Understanding dengan mitra kerja domestik",
        "Kesepakatan bersama dengan lembaga pendidikan dalam negeri",
    ],
    "HK.04.01|Tentang Orang/Pengaduan/Somasi/Sengketa/Perlindungan Hukum": [
        "Penanganan somasi dan sengketa hukum perdata",
        "Pengaduan dan perlindungan hukum kepentingan lembaga",
        "Dokumen sengketa perdata dan penanganan gugatan",
        "Somasi dan perlindungan hukum terhadap lembaga",
        "Penyelesaian sengketa hukum perdata di pengadilan",
    ],
    "HK.04.02|Tentang Kebendaan": [
        "Sengketa hukum tentang kebendaan dan hak milik",
        "Dokumen perdata terkait kepemilikan aset dan barang",
        "Gugatan perdata tentang hak atas benda dan properti",
        "Penyelesaian sengketa kebendaan tanah dan bangunan",
        "Dokumen hukum perdata tentang status kepemilikan",
    ],
    "HK.04.03|Tentang Perikatan": [
        "Dokumen hukum perdata tentang perikatan dan kontrak",
        "Penyelesaian sengketa perikatan dan perjanjian hukum",
        "Gugatan wanprestasi dan pelanggaran perikatan",
        "Dokumen perikatan hukum dan kewajiban kontraktual",
        "Sengketa perdata terkait perikatan dan perjanjian kerja",
    ],
    "HK.04.04|Tentang Pembuktian dan Kadaluwarsa": [
        "Dokumen pembuktian dan tenggat kadaluwarsa perkara",
        "Bukti-bukti hukum dan batas waktu kadaluwarsa gugatan",
        "Pembuktian fakta hukum dan masa kadaluwarsa klaim",
        "Dokumen bukti dan penghitungan kadaluwarsa hak gugat",
        "Pembuktian sengketa perdata dan tenggat waktu hukum",
    ],
    "HK.05.01|Kejahatan": [
        "Penanganan kasus kejahatan terkait aset dan operasi lembaga",
        "Dokumen pelaporan tindak pidana dan kejahatan",
        "Laporan polisi dan penanganan kasus pidana kejahatan",
        "Proses hukum pidana kejahatan di lingkungan RRI",
        "Dokumen penyidikan dan penuntutan kasus kejahatan",
    ],
    "HK.05.02|Pelanggaran/Peringatan/Teguran/Pencabutan": [
        "Penanganan pelanggaran hukum dan pemberian teguran",
        "Pencabutan izin dan pelanggaran ketentuan hukum",
        "Dokumen pelanggaran pidana ringan dan peringatan",
        "Teguran hukum dan sanksi atas pelanggaran peraturan",
        "Surat peringatan dan teguran hukum kepada pelanggar",
    ],
    "HK.05.03|Korupsi Kolusi Nepotisme (KKN)": [
        "Penanganan kasus korupsi kolusi dan nepotisme KKN",
        "Dokumen pencegahan dan penindakan korupsi di lembaga",
        "Laporan dugaan korupsi dan tindak pidana korupsi",
        "Program anti korupsi dan pencegahan KKN",
        "Penanganan gratifikasi dan potensi korupsi di RRI",
    ],
    "HK.06.01|Gugatan": [
        "Penanganan gugatan tata usaha negara di pengadilan",
        "Dokumen gugatan administrasi negara dan PTUN",
        "Proses hukum gugatan keputusan pejabat pemerintah",
        "Gugatan TUN dan sengketa administrasi pemerintahan",
        "Penyelesaian sengketa tata usaha negara di PTUN",
    ],
    "HK.06.02|Putusan": [
        "Putusan pengadilan tata usaha negara dan PTUN",
        "Dokumen putusan hakim dan eksekusi keputusan hukum",
        "Salinan putusan pengadilan dan pelaksanaan putusan",
        "Putusan TUN dan tindak lanjut putusan pengadilan",
        "Dokumen putusan hukum administrasi negara",
    ],

    # =====================================================================
    # VIII. OT - ORGANISASI DAN TATA LAKSANA
    # =====================================================================
    "OT.01.01|Organisasi (Rencana, Penetapan Struktur dan Evaluasi)": [
        "Penetapan struktur organisasi dan tata kerja LPP RRI",
        "Evaluasi dan rencana perubahan organisasi lembaga",
        "Dokumen SOTK dan struktur organisasi satuan kerja",
        "Penyusunan rencana organisasi dan evaluasi kelembagaan",
        "Penetapan dan evaluasi struktur organisasi tata kerja",
    ],
    "OT.01.02|Reformasi Birokrasi": [
        "Program reformasi birokrasi di lingkungan LPP RRI",
        "Pelaksanaan agenda reformasi birokrasi lembaga",
        "Dokumen roadmap reformasi birokrasi dan rencana aksi",
        "Evaluasi pelaksanaan reformasi birokrasi tahunan",
        "Penilaian mandiri pelaksanaan reformasi birokrasi",
    ],
    "OT.02.01|Rencana, Penetapan dan Evaluasi": [
        "Rencana dan penetapan tata laksana prosedur kerja",
        "Evaluasi tata laksana dan mekanisme kerja unit",
        "Dokumen penetapan dan evaluasi SOP tata laksana",
        "Rencana perbaikan tata laksana dan standar kerja",
        "Penetapan prosedur kerja dan evaluasi tata laksana",
    ],
    "OT.02.02|Pembakuan Mekanisme Kerja/SOP": [
        "Penyusunan SOP dan standar operasional prosedur",
        "Pembakuan mekanisme kerja dan prosedur baku",
        "Dokumen SOP dan pedoman kerja unit organisasi",
        "Penetapan standar operasional prosedur satuan kerja",
        "Pembakuan SOP dan mekanisme kerja pelayanan",
    ],
    "OT.02.03|Logo": [
        "Penetapan penggunaan logo dan identitas visual RRI",
        "Panduan penggunaan logo dan branding lembaga",
        "Dokumen desain logo dan identitas korporat",
        "Aturan penggunaan logo resmi LPP RRI",
        "Pedoman identitas visual dan logo organisasi",
    ],

    # =====================================================================
    # IX. KS - KERJASAMA
    # =====================================================================
    "KS.01.01|Koordinasi Lintas Sektorat": [
        "Koordinasi lintas sektor dengan kementerian lembaga",
        "Rapat koordinasi lintas sektoral bidang penyiaran",
        "Dokumen koordinasi antar lembaga pemerintah sektoral",
        "Kegiatan koordinasi lintas sektor dan kementerian",
        "Forum koordinasi sektoral dan lintas instansi",
    ],
    "KS.01.02|Koordinasi Lintas Daerah": [
        "Koordinasi lintas daerah antar satuan kerja RRI",
        "Rapat koordinasi wilayah dan lintas provinsi",
        "Dokumen koordinasi antar stasiun RRI daerah",
        "Kegiatan koordinasi lintas daerah dan regional",
        "Forum koordinasi stasiun penyiaran se-Indonesia",
    ],
    "KS.01.03|Koordinasi Internal dan Eksternal LPP RRI": [
        "Koordinasi internal antar direktorat di LPP RRI",
        "Rapat koordinasi eksternal dengan mitra kerja lembaga",
        "Dokumen koordinasi internal dan hubungan eksternal",
        "Kegiatan koordinasi lintas unit dan stakeholder",
        "Forum koordinasi internal dan kerjasama eksternal",
    ],

    # =====================================================================
    # X. HM - INFORMASI DAN HUBUNGAN MASYARAKAT
    # =====================================================================
    "HM.01.01|Dokumentasi/liputan kegiatan dinas pimpinan, pengumpulan, pengolahan dan penyajian informasi kegiatan": [
        "Dokumentasi dan liputan kegiatan dinas pimpinan RRI",
        "Pengumpulan pengolahan dan penyajian informasi kegiatan",
        "Liputan kegiatan resmi dan dokumentasi acara lembaga",
        "Dokumen foto dan video kegiatan pimpinan RRI",
        "Penyajian informasi dan dokumentasi kegiatan dinas",
    ],
    "HM.01.02|Hubungan antar lembaga": [
        "Hubungan dan komunikasi antar lembaga pemerintah",
        "Dokumen hubungan kelembagaan dan kerjasama institusi",
        "Komunikasi dan hubungan dengan lembaga mitra",
        "Hubungan antar lembaga penyiaran dan media",
        "Kegiatan hubungan kelembagaan dan networking",
    ],
    "HM.01.03|Dengar Pendapat (RDP) Komisi I DPR RI": [
        "Rapat dengar pendapat dengan Komisi I DPR RI",
        "Dokumen RDP dan pertemuan dengan DPR Komisi I",
        "Bahan dan materi RDP Komisi I DPR RI",
        "Rapat dengar pendapat DPR tentang penyiaran RRI",
        "Laporan hasil RDP dan tindak lanjut arahan DPR",
    ],
    "HM.01.04|Sosialisasi, bahan/materi pidato/sidang MPR, DPR, DPD, kabinet, DPRD Provinsi/Kabupaten/Kota": [
        "Sosialisasi kebijakan dan materi sidang DPR MPR",
        "Bahan pidato dan materi sosialisasi ke DPRD",
        "Dokumen sosialisasi program kepada legislatif dan eksekutif",
        "Materi sosialisasi dan bahan presentasi ke parlemen",
        "Penyusunan bahan pidato dan materi sidang kabinet",
    ],
    "HM.01.05|Lomba, festival, penghargaan/tanda kenang-kenangan kepada masyarakat/publik": [
        "Penyelenggaraan lomba dan festival untuk masyarakat",
        "Pemberian penghargaan dan tanda kenang-kenangan publik",
        "Kegiatan festival dan lomba kreasi masyarakat RRI",
        "Apresiasi dan penghargaan kepada pendengar setia RRI",
        "Pelaksanaan event lomba dan pemberian cinderamata",
    ],
    "HM.01.06|Ucapan terima kasih, ucapan selamat, belasungkawa, dan permohonan maaf di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Surat ucapan selamat dan belasungkawa dari pimpinan",
        "Ucapan terima kasih dan apresiasi kepada mitra kerja",
        "Dokumen ucapan dan permohonan maaf resmi lembaga",
        "Surat belasungkawa dan duka cita keluarga pegawai",
        "Ucapan selamat hari raya dan hari besar nasional",
    ],
    "HM.02.01|Sosialisasi": [
        "Kegiatan sosialisasi informasi dan program lembaga",
        "Pelaksanaan sosialisasi kebijakan kepada masyarakat",
        "Dokumen sosialisasi program dan layanan RRI",
        "Sosialisasi informasi publik melalui media massa",
        "Program sosialisasi dan edukasi masyarakat RRI",
    ],
    "HM.02.02|Pers/Media Massa/Website": [
        "Pengelolaan hubungan media dan pers release lembaga",
        "Konten website dan media sosial resmi LPP RRI",
        "Press release dan siaran pers kegiatan RRI",
        "Pengelolaan portal website dan media digital lembaga",
        "Dokumentasi pemberitaan media massa tentang RRI",
    ],
    "HM.02.03|Pameran/Festival": [
        "Penyelenggaraan pameran dan festival budaya RRI",
        "Partisipasi RRI dalam pameran teknologi dan media",
        "Dokumen kegiatan pameran dan expo lembaga",
        "Festival penyiaran dan pameran produk siaran",
        "Kegiatan pameran dan promosi program RRI",
    ],

    # =====================================================================
    # XI. PB - PUBLIKASI (simplified)
    # =====================================================================
    "PB.01.01|Kehumasan melalui penerbitan/website dalam lingkup Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Penerbitan majalah internal dan publikasi website RRI",
        "Konten kehumasan melalui website resmi dan media sosial",
        "Publikasi informasi melalui penerbitan cetak dan digital",
        "Pengelolaan konten website dan publikasi berita lembaga",
        "Dokumen publikasi kehumasan melalui media cetak dan online",
    ],
    "PB.02.01|Kehumasan, kepustakaan dan perpustakaan di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Pengelolaan perpustakaan dan kepustakaan lembaga RRI",
        "Kegiatan kehumasan dan dokumentasi perpustakaan",
        "Dokumen koleksi pustaka dan arsip perpustakaan RRI",
        "Manajemen perpustakaan dan sistem informasi pustaka",
        "Dokumentasi perpustakaan dan kehumasan lembaga",
    ],

    # =====================================================================
    # XII. DT - DATA DAN SARANA PENYIARAN
    # =====================================================================
    "DT.01.01|Topologi jaringan Backup/Data Recovery Center": [
        "Dokumentasi topologi jaringan dan data recovery center",
        "Infrastruktur backup dan disaster recovery IT RRI",
        "Dokumen topologi jaringan server dan sistem backup",
        "Rencana data recovery dan topologi infrastruktur TI",
        "Desain jaringan backup dan pusat pemulihan data",
    ],
    "DT.01.02|Piranti teknologi penyiaran": [
        "Dokumen piranti teknologi penyiaran radio digital",
        "Spesifikasi perangkat teknologi siaran RRI",
        "Pengelolaan piranti teknologi dan peralatan siaran",
        "Inventaris piranti teknologi penyiaran dan studio",
        "Dokumen perangkat teknologi siaran analog dan digital",
    ],
    "DT.01.03|Pengamanan informasi di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Kebijakan pengamanan informasi dan keamanan data RRI",
        "Dokumen keamanan siber dan proteksi informasi lembaga",
        "Pengelolaan keamanan informasi dan data penyiaran",
        "Standar pengamanan informasi dan proteksi data",
        "Kebijakan cyber security dan pengamanan sistem TI",
    ],
    "DT.02.01|Pemeliharaan portal": [
        "Pemeliharaan portal website dan aplikasi digital RRI",
        "Dokumen maintenance portal berita dan streaming",
        "Pengelolaan dan pemeliharaan portal informasi lembaga",
        "Pemeliharaan rutin portal web dan sistem online",
        "Dokumen pemeliharaan portal dan update konten",
    ],
    "DT.02.02|Pemeliharaan konten": [
        "Pemeliharaan konten digital dan arsip siaran online",
        "Pengelolaan konten website dan media sosial RRI",
        "Dokumen pemeliharaan dan update konten digital",
        "Manajemen konten dan pemeliharaan aset digital",
        "Pemeliharaan database konten dan arsip digital",
    ],
    "DT.02.03|Pengumpulan data": [
        "Pengumpulan data sistem informasi dan statistik siaran",
        "Dokumen pengumpulan data operasional dan teknis",
        "Proses pengumpulan data untuk analisis dan laporan",
        "Pengumpulan data pendengar dan statistik penyiaran",
        "Kompilasi data operasional dan teknis penyiaran",
    ],
    "DT.02.04|Pengolahan data di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Pengolahan data informasi dan analisis data lembaga",
        "Dokumen pengolahan data statistik dan informasi RRI",
        "Proses pengolahan dan analisis data penyiaran",
        "Pengolahan database dan sistem informasi lembaga",
        "Analisis dan pengolahan data operasional RRI",
    ],
    "DT.03.01|Perancangan Aplikasi": [
        "Dokumen perancangan aplikasi dan sistem informasi RRI",
        "Desain dan perancangan aplikasi streaming radio",
        "Perancangan aplikasi mobile dan platform digital",
        "Blueprint perancangan sistem aplikasi penyiaran",
        "Dokumen desain dan perancangan aplikasi internal",
    ],
    "DT.03.02|User Acceptance Test": [
        "Dokumen user acceptance test aplikasi baru RRI",
        "UAT dan pengujian penerimaan pengguna sistem",
        "Hasil user acceptance testing dan evaluasi aplikasi",
        "Skenario UAT dan laporan pengujian sistem",
        "Dokumen UAT dan persetujuan pengguna akhir",
    ],
    "DT.03.03|Pemeliharaan Aplikasi": [
        "Pemeliharaan aplikasi dan sistem informasi lembaga",
        "Maintenance aplikasi dan perbaikan bug sistem",
        "Dokumen pemeliharaan dan update aplikasi RRI",
        "Jadwal pemeliharaan rutin aplikasi dan database",
        "Pemeliharaan dan pengembangan aplikasi internal",
    ],
    "DT.03.04|Audit aplikasi di lingkungan Lembaga Penyiaran Publik Radio Republik Indonesia": [
        "Audit keamanan aplikasi dan sistem informasi RRI",
        "Dokumen audit dan evaluasi aplikasi lembaga",
        "Pelaksanaan audit sistem dan aplikasi penyiaran",
        "Hasil audit keamanan dan performa aplikasi",
        "Audit teknologi informasi dan aplikasi digital",
    ],

    # =====================================================================
    # XIII. LT - PENELITIAN DAN PENGEMBANGAN SDM
    # =====================================================================
    "LT.01|Penelitian Teknologi Sistem Penyiaran": [
        "Penelitian teknologi sistem penyiaran digital RRI",
        "Riset pengembangan teknologi radio dan streaming",
        "Dokumen penelitian inovasi sistem penyiaran",
        "Studi penelitian teknologi broadcasting modern",
        "Penelitian dan pengembangan sistem teknologi siaran",
    ],
    "LT.02|Pengembangan Teknologi Sistem Penyiaran": [
        "Pengembangan teknologi sistem penyiaran radio digital",
        "Implementasi teknologi baru untuk sistem siaran",
        "Dokumen pengembangan infrastruktur teknologi siaran",
        "Modernisasi dan pengembangan sistem penyiaran RRI",
        "Program pengembangan teknologi broadcasting",
    ],
    "LT.03|Pembinaan dan Pengembangan SDM Penyiaran": [
        "Pembinaan sumber daya manusia di bidang penyiaran",
        "Program pengembangan SDM dan pelatihan karyawan siaran",
        "Dokumen pembinaan dan peningkatan kompetensi SDM",
        "Pengembangan kapasitas SDM penyiaran dan teknis",
        "Pembinaan dan pengembangan kompetensi pegawai siaran",
    ],

    # =====================================================================
    # XIV-XIX - Remaining categories (abbreviated for space)
    # =====================================================================
    "STO.01.01|Katalog Peralatan Studio": [
        "Katalog peralatan studio siaran dan rekaman RRI",
        "Daftar inventaris peralatan studio penyiaran",
        "Dokumen katalog alat dan peralatan studio radio",
        "Inventaris peralatan studio audio dan mixing",
        "Katalog perangkat studio siaran analog dan digital",
    ],
    "STO.02.01|Spesifikasi Peralatan Studio": [
        "Spesifikasi teknis peralatan studio siaran RRI",
        "Dokumen spesifikasi mixer audio dan peralatan studio",
        "Detail teknis peralatan rekaman dan siaran studio",
        "Spesifikasi perangkat keras studio penyiaran",
        "Dokumen teknis spesifikasi alat studio broadcasting",
    ],
    "TX.01.01|Katalog Pemancar": [
        "Katalog peralatan pemancar radio AM FM SW RRI",
        "Daftar inventaris pemancar dan transmisi stasiun",
        "Dokumen katalog alat pemancar dan antena radio",
        "Inventaris pemancar siaran dan peralatan transmisi",
        "Katalog perangkat pemancar stasiun RRI daerah",
    ],
    "TX.02.01|Spesifikasi Jenis Pemancar": [
        "Spesifikasi teknis jenis pemancar AM FM dan SW",
        "Dokumen spesifikasi pemancar radio dan daya pancar",
        "Detail teknis pemancar siaran dan frekuensi",
        "Spesifikasi peralatan pemancar digital dan analog",
        "Dokumen teknis jenis pemancar dan karakteristik",
    ],
    "IT.01.01|Barang/Peralatan Multimedia": [
        "Dokumen pengadaan barang dan peralatan multimedia IT",
        "Inventaris peralatan multimedia dan perangkat IT",
        "Pengadaan peralatan multimedia komputer dan jaringan",
        "Daftar barang multimedia dan peralatan informasi teknologi",
        "Dokumen peralatan IT multimedia dan infrastruktur",
    ],
    "IT.01.02|Jaringan/Bandwidth": [
        "Pengelolaan jaringan internet dan bandwidth RRI",
        "Dokumen infrastruktur jaringan dan bandwidth stasiun",
        "Monitoring bandwidth dan kualitas jaringan internet",
        "Pengelolaan koneksi jaringan dan kapasitas bandwidth",
        "Infrastruktur jaringan LAN WAN dan internet lembaga",
    ],
    "PPS.01.01|SK Tim penyusun program dan kebijakan": [
        "SK tim penyusun program dan kebijakan siaran RRI",
        "Surat keputusan pembentukan tim program siaran",
        "Penetapan tim penyusun kebijakan program dan produksi",
        "SK panitia dan tim penyusun program siaran RRI",
        "Dokumen pembentukan tim program produksi siaran",
    ],
    "PPS.01.02|Surat masuk dan keluar": [
        "Surat masuk dan keluar bidang program produksi siaran",
        "Administrasi surat terkait program dan produksi RRI",
        "Pengelolaan surat masuk keluar bidang program siaran",
        "Dokumen surat menyurat program dan produksi siaran",
        "Surat-surat administrasi bidang produksi program",
    ],
    "PPP.01.01|SK Tim penyusun program dan kebijakan": [
        "SK tim penyusun program pemberitaan dan kebijakan berita",
        "Surat keputusan tim program dan kebijakan pemberitaan",
        "Penetapan tim penyusun kebijakan program berita RRI",
        "SK panitia program produksi pemberitaan RRI",
        "Dokumen pembentukan tim program berita dan informasi",
    ],
    "KJM.01.01|SK Tim penyusun kebijakan kerjasama dan multimedia": [
        "SK tim penyusun kebijakan kerjasama dan multimedia RRI",
        "Surat keputusan pembentukan tim kerjasama multimedia",
        "Penetapan tim kebijakan kerjasama dan pengembangan multimedia",
        "SK panitia kerjasama multimedia dan partnership",
        "Dokumen pembentukan tim kebijakan bidang multimedia",
    ],
    "KJM.02.01|Surat-surat MOU Program Siaran": [
        "Surat-surat MOU program siaran dan kerjasama konten",
        "Administrasi MOU kerjasama program siaran RRI",
        "Dokumen MOU program siaran dengan mitra media",
        "Perjanjian kerjasama program siaran dan partnership",
        "Surat perjanjian MOU konten siaran dan kolaborasi",
    ],
    "KJM.08.01|Pengumpulan data audio/video berita": [
        "Pengumpulan data audio dan video berita untuk arsip",
        "Proses alih media dan pengumpulan audio video berita",
        "Dokumen pengumpulan konten audio video pemberitaan",
        "Arsip audio video berita dan pengumpulan data siaran",
        "Koleksi audio video berita dan liputan jurnalistik",
    ],
    "KJM.09.01|Pengumpulan data audio/video non berita": [
        "Pengumpulan data audio video non berita dan hiburan",
        "Proses alih media audio video konten non-berita",
        "Dokumen pengumpulan konten lagu jingle dan filler",
        "Arsip audio video non-berita dan program hiburan",
        "Koleksi audio video sandiwara radio dan drama",
    ],
}


def generate_training_data():
    """Generate the full training_data.json from TRAINING_MAP."""
    training_data = []

    for label, texts in TRAINING_MAP.items():
        for text in texts:
            training_data.append({
                "text": text,
                "label": label
            })

    # Shuffle for better training
    random.seed(42)
    random.shuffle(training_data)

    return training_data


def main():
    data = generate_training_data()

    # Save to the correct location
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(output_dir, exist_ok=True)

    output_path = os.path.join(output_dir, "training_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    # Print stats
    labels = set(item["label"] for item in data)
    print(f"[OK] Training data generated successfully!")
    print(f"   Output: {output_path}")
    print(f"   Total samples: {len(data)}")
    print(f"   Unique labels: {len(labels)}")
    print(f"\n   Top categories:")
    from collections import Counter
    prefix_counts = Counter()
    for label in labels:
        prefix = label.split("|")[0].split(".")[0]
        prefix_counts[prefix] += 1
    for prefix, count in sorted(prefix_counts.items()):
        print(f"     {prefix}: {count} sub-codes")


if __name__ == "__main__":
    main()
