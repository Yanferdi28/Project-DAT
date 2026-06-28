# Sistem Arsip Digital (Project-DAT)

Sistem manajemen arsip digital untuk RRI Banjarmasin dengan fitur OCR otomatis dan klasifikasi dokumen berbasis AI.

## Fitur Utama

- **Manajemen Arsip Unit** — CRUD dokumen arsip dengan upload file, metadata lengkap, dan workflow verifikasi multi-tahap (pending → diterima/ditolak → published)
- **Manajemen Berkas Arsip** — Pengelompokan arsip unit ke dalam berkas arsip dengan informasi retensi dan penyusutan
- **OCR (Optical Character Recognition)** — Ekstraksi teks otomatis dari dokumen PDF/gambar menggunakan Tesseract via microservice Python
- **Klasifikasi AI** — Prediksi kategori dokumen menggunakan TF-IDF + Naive Bayes (scikit-learn)
- **Role-Based Access Control** — 3 level akses: Admin, Operator, User dengan 32+ permission granular
- **Activity Logging** — Audit trail lengkap dengan perbandingan nilai sebelum/sesudah perubahan
- **Laporan & Export PDF** — Laporan penyusutan, status verifikasi, berita acara penyerahan, dan rekap unit pengolah
- **Two-Factor Authentication** — Keamanan tambahan dengan TOTP dan recovery codes
- **Dashboard Analytics** — Grafik tren bulanan, distribusi status, top klasifikasi, dan statistik OCR

## Teknologi

### Backend
- **Laravel 12** — PHP framework
- **Laravel Fortify** — Autentikasi (login, register, 2FA, reset password)
- **DomPDF** — Generasi laporan PDF
- **Queue (Database)** — Background job processing untuk OCR dan klasifikasi

### Frontend
- **React 19** + **TypeScript** — UI framework
- **Inertia.js** — SPA tanpa API (SSR enabled)
- **Tailwind CSS v4** — Styling utility-first
- **Radix UI (shadcn/ui)** — Komponen UI accessible
- **Recharts** — Grafik dashboard
- **Vite 7** — Build tool

### OCR Microservice (Python)
- **FastAPI** — Web framework
- **Tesseract OCR** (pytesseract) — Mesin OCR
- **OpenCV** — Preprocessing gambar (grayscale, denoise, binarize, deskew)
- **scikit-learn** — Machine learning (TF-IDF + Multinomial Naive Bayes)
- **pypdfium2** — Konversi PDF ke gambar tanpa Poppler

### Database
- **SQLite** (development) / **MySQL 8+** (production)

## Prasyarat

- PHP 8.2+
- Composer 2.x
- Node.js 20+ & npm
- Python 3.10+
- Tesseract OCR ([install](https://github.com/tesseract-ocr/tesseract))

## Instalasi

### 1. Clone & Setup Laravel

```bash
git clone <repository-url>
cd Project-DAT

composer install
npm install

cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
```

### 2. Setup OCR Microservice

```bash
cd ocr-service
python -m venv .venv

# Windows
.venv\Scripts\activate
# Linux/Mac
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Konfigurasi Environment

Edit `.env`:

```env
# Database
DB_CONNECTION=sqlite

# OCR Service
OCR_SERVICE_URL=http://127.0.0.1:8102
OCR_ENABLED=true
OCR_CLASSIFICATION_ENABLED=true
OCR_ENGINE=tesseract
OCR_DEFAULT_ENGINE=tesseract
OCR_LANG=ind+eng

# Queue
QUEUE_CONNECTION=database
```

## Menjalankan Aplikasi

Jalankan semua service secara bersamaan:

```bash
# Terminal 1 — Laravel
php artisan serve

# Terminal 2 — Vite (frontend)
npm run dev

# Terminal 3 — Queue Worker (background jobs)
php artisan queue:listen

# Terminal 4 — OCR Service
cd ocr-service
python -m uvicorn main:app --host 127.0.0.1 --port 8102 --reload
```

Atau gunakan composer script:

```bash
composer dev
```

Akses aplikasi di: **http://localhost:8000**

## Akun Default (Seeder)

| Role     | Email                  | Password   |
|----------|------------------------|------------|
| Admin    | admin@example.com      | password   |
| Operator | operator@example.com   | password   |
| User     | user@example.com       | password   |

## Struktur Proyek

```
├── app/
│   ├── Http/
│   │   ├── Controllers/    # 13 controller
│   │   ├── Middleware/      # Role, Verified, Inertia, Appearance
│   │   └── Requests/       # FormRequest validation classes
│   ├── Jobs/               # ProcessOcrJob, ClassifyDocumentJob
│   ├── Models/             # 9 Eloquent models
│   ├── Services/           # OcrService, DashboardService
│   └── Traits/             # LogsActivity
├── ocr-service/            # Python FastAPI microservice
│   ├── routers/            # OCR & Classification endpoints
│   ├── services/           # Preprocessor, OCR Engine, Classifier, dll.
│   ├── models/             # Trained ML models
│   └── data/               # Training data
├── resources/js/           # React + TypeScript frontend
│   ├── pages/              # Halaman Inertia
│   ├── components/         # Komponen reusable + shadcn/ui
│   └── layouts/            # Layout aplikasi
├── database/
│   ├── migrations/         # Schema database
│   └── seeders/            # Data awal
└── tests/                  # Pest PHP tests
```

## Testing

```bash
# Jalankan semua test
php artisan test

# Jalankan test secara paralel
php artisan test --parallel
```

## Workflow Arsip

1. **User** membuat arsip unit dengan upload dokumen
2. **Sistem** otomatis menjalankan OCR → ekstraksi teks → klasifikasi AI
3. **User** mereview dan menerima/menolak saran AI
4. **Operator/Admin** memverifikasi arsip (diterima/ditolak)
5. **Operator/Admin** mengubah status publikasi (draft → published)
6. **User/Admin** mengelompokkan arsip ke dalam berkas arsip
7. **Admin** membuat laporan dan berita acara penyerahan

## Training Ulang Klasifikasi AI

Project ini sudah menyediakan command untuk membangun dataset dari data arsip yang sudah berlabel, lalu retrain model klasifikasi secara otomatis.

### 1. Export dataset training dari database

```bash
php artisan ai:export-training-data
```

Opsi penting:

- `--path=ocr-service/data/training_data.generated.json` lokasi output dataset
- `--accepted-only` hanya gunakan data yang accepted/manual finalized
- `--seed-from=ocr-service/data/training_data.json` gabungkan data seed agar dataset tidak kosong
- `--min-text=30` panjang minimal teks OCR

### 2. Retrain model classifier via API OCR service

Pastikan OCR service aktif di `OCR_SERVICE_URL`, lalu jalankan:

```bash
php artisan ai:retrain-classifier --accepted-only
```

Command ini akan:

1. mengekspor dataset terbaru,
2. memanggil endpoint `/classify/train`,
3. me-reload model classifier pada service OCR.

### 3. Evaluasi kualitas model

Gunakan script evaluasi untuk melihat metrik holdout (accuracy, macro F1, weighted F1, classification report, confusion matrix):

```bash
python ocr-service/models/evaluate_classifier.py --data ocr-service/data/training_data.generated.json
```

Laporan evaluasi disimpan di `ocr-service/models/evaluation_report.json`.

### 4. Retrain otomatis mingguan

Scheduler Laravel sudah didaftarkan untuk retrain mingguan:

```bash
php artisan schedule:list
```

Jalankan worker scheduler di server:

```bash
php artisan schedule:work
```

## Lisensi

Dibuat untuk keperluan akademis — Skripsi.
