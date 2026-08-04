# Laporan Hasil Pengujian Klasifikasi Dokumen Arsip RRI

## 1. Ringkasan Dataset Klasifikasi
Dataset yang digunakan dalam penelitian ini dibangun berdasarkan **Teks Uraian Standar Pedoman SKKAD LPP RRI (Peraturan Direktur Utama LPP RRI Nomor 03 Tahun 2023)** dan augmentasi data sintetis (*Synthetic Data Generation*).

- **Total Sampel Dataset**: 2.086 sampel
- **Jumlah Kelas Klasifikasi**: 415 kelas kode klasifikasi (misal: `KP.01.06`, `UM.01.01`, `HK.02.04`, `PR.01.01`)
- **Metode Pembagian Data**: Holdout Validation 80:20
  - **Data Latih (80%)**: 1.668 sampel
  - **Data Uji (20%)**: 418 sampel
- **Ekstraksi Fitur Teks**: Pembobotan TF-IDF Hybrid (Word 1–3 n-gram & Character 3–5 n-gram)
- **Model Klasifikasi**: Logistic Regression dengan penyeimbangan bobot kelas (*balanced class weighting*)

---

## 2. Skenario Pengujian

### Tabel 4.6 Skenario Pengujian Klasifikasi Dokumen
| No. | Jenis Pengujian | Tujuan | Keterangan |
| :---: | :--- | :--- | :--- |
| 1 | **Resubstitution** | Mengetahui kemampuan model mempelajari data latih. | Tidak digunakan sebagai hasil utama karena pengujian dilakukan pada data yang sama dengan data pelatihan. |
| 2 | **Holdout 80:20** | Mengukur kemampuan model memprediksi data baru. | Digunakan sebagai hasil utama karena memakai data uji yang tidak digunakan saat pelatihan. |

---

## 3. Hasil Evaluasi & Performa Model

Dataset yang digunakan berjumlah **2.086 sampel** dengan **415 kelas** kode klasifikasi. Pembagian data dilakukan menggunakan metode *holdout* dengan perbandingan 80% data latih dan 20% data uji. Dari pembagian tersebut diperoleh **1.668 data latih** dan **418 data uji**. Hasil pengujian utama dalam penelitian ini menggunakan data uji hasil *holdout*, karena data tersebut tidak digunakan pada proses pelatihan model.

Selain pengujian *holdout*, dilakukan juga pengujian *resubstitution* sebagai pengujian awal. Hasil *resubstitution* memperoleh *accuracy* sebesar **94,77%** dan *macro F1-score* sebesar **95,00%**. Namun, hasil tersebut tidak dijadikan acuan utama karena pengujian dilakukan terhadap data yang sama dengan data pelatihan. Oleh karena itu, hasil utama yang digunakan adalah pengujian *holdout*.

Berdasarkan pengujian *holdout*, model klasifikasi berbasis pembobotan fitur *TF-IDF* dan *Logistic Regression* memperoleh *accuracy* sebesar **62,68%**, *macro F1-score* sebesar **57,76%**, dan *weighted F1-score* sebesar **61,72%**. Nilai tersebut menunjukkan bahwa model cukup mampu memberikan saran kode klasifikasi arsip, meskipun performa antar kelas belum sepenuhnya merata. Kondisi ini dipengaruhi oleh jumlah kelas yang sangat banyak, yaitu **415 kelas**, sementara sebagian besar kelas memiliki jumlah sampel yang terbatas.

---

### Tabel 4.7 Hasil Pengujian Klasifikasi Dokumen
| Jenis Pengujian | Jumlah Data | Jumlah Kelas | Accuracy | Macro F1-Score | Weighted F1-Score | Keterangan |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Resubstitution** | 2.086 | 415 | **94,77%** | **95,00%** | **95,03%** | Pengujian awal pada data latih |
| **Holdout 80:20** | 418 data uji | 415 | **62,68%** | **57,76%** | **61,72%** | Pengujian utama pada data uji |

---

### Tabel 4.8 Ringkasan Classification Report Holdout
| Metrik | Nilai | Keterangan |
| :--- | :---: | :--- |
| **Accuracy** | **62,68%** | Persentase prediksi kode klasifikasi yang benar dari seluruh data uji. |
| **Macro Precision** | **59,97%** | Rata-rata precision seluruh kelas tanpa mempertimbangkan jumlah data per kelas. |
| **Macro Recall** | **60,42%** | Rata-rata recall seluruh kelas tanpa mempertimbangkan jumlah data per kelas. |
| **Macro F1-Score** | **57,76%** | Rata-rata keseimbangan precision dan recall pada seluruh kelas. |
| **Weighted Precision** | **67,04%** | Rata-rata precision dengan mempertimbangkan jumlah data pada setiap kelas. |
| **Weighted Recall** | **62,68%** | Rata-rata recall dengan mempertimbangkan jumlah data pada setiap kelas. |
| **Weighted F1-Score** | **61,72%** | Rata-rata F1-score dengan mempertimbangkan jumlah data pada setiap kelas. |
