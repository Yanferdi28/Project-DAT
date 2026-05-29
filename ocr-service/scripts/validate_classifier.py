"""Quick validation script for the trained classifier."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import json
from services.classifier import DocumentClassifier

classifier = DocumentClassifier()
print(f"Model loaded: {classifier.is_loaded}\n")

test_texts = [
    "Surat Perintah Tugas dalam rangka perjalanan dinas ke Jakarta",
    "Nota Dinas tentang kebersihan kantor dan ketertiban lingkungan kerja",
    "Laporan LAKIP dan akuntabilitas kinerja instansi pemerintah",
    "SK pengangkatan pejabat struktural kepala bagian",
    "Dokumen DIPA dan rincian anggaran belanja negara",
    "MoU kerjasama dengan universitas dalam negeri",
    "Daftar gaji pegawai dan kenaikan gaji berkala",
    "Berita acara serah terima jabatan kepala satker",
    "Surat izin cuti tahunan dan cuti besar pegawai",
    "Laporan pemantauan pengawasan internal lembaga",
]

for text in test_texts:
    result = classifier.predict(text)
    if result["success"] and result["top_prediction"]:
        pred = result["top_prediction"]
        print(f"Input : {text[:70]}")
        print(f"Kode  : {pred['kode_klasifikasi']}")
        print(f"Uraian: {pred['uraian']}")
        print(f"Score : {pred['confidence']}%")
        print()
