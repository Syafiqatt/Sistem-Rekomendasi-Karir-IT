# 🧭 Sistem Rekomendasi Karir IT

> **AI-Driven Career Recommendation & Roadmap System**
> Platform bimbingan karir cerdas untuk mahasiswa IT berbasis **Deep Learning** & **Generative AI**.

Aplikasi ini memprediksi **Top 3 rekomendasi karir** seorang mahasiswa/developer IT berdasarkan profil keterampilan mereka (skills, tools, databases, pengalaman, & pendidikan), lalu menghasilkan **learning roadmap taktis** secara otomatis menggunakan **Google Gemini API**.

🔗 **Live Demo:** [https://careermatch.up.railway.app](https://careermatch.up.railway.app)

---

## 📚 Daftar Isi

1. [Gambaran Umum](#-gambaran-umum)
2. [Arsitektur Sistem](#-arsitektur-sistem)
3. [Pipeline End-to-End](#-pipeline-end-to-end)
4. [Struktur Repositori](#-struktur-repositori)
5. [Performa Model](#-performa-model)
6. [Tech Stack](#-tech-stack)
7. [Prasyarat](#-prasyarat)
8. [Instalasi](#-instalasi)
9. [Cara Menjalankan](#-cara-menjalankan)
10. [Spesifikasi API](#-spesifikasi-api)
11. [Environment Variables](#-environment-variables)
12. [Deployment](#-deployment)
13. [Tim & Lisensi](#-tim--lisensi)

---

## 🎯 Gambaran Umum

Proyek ini merupakan **capstone project** yang mengintegrasikan tiga disiplin sekaligus dalam satu pipeline utuh, masing-masing direpresentasikan oleh sebuah folder:

| Folder | Peran | Output |
|---|---|---|
| **`Data Science/`** | Pembersihan data, EDA, balancing dataset (SMOTE), & dashboard analitik | Dataset bersih + dashboard Streamlit |
| **`AI Engineer/`** | Training & inferensi model Deep Learning multi-input + integrasi Gemini | Model `.keras` + service inferensi |
| **`Fullstack/`** | Aplikasi web (React + Express + FastAPI + PostgreSQL) yang menyajikan model ke end-user | Web App production |

### Fitur Utama

- **🧠 Arsitektur Multi-Input Multi-Modal** — Menggabungkan data teks (`all_skills`, `tools`, `databases`) melalui layer *Embedding* dan data numerik (`years_code`, `education_level`) secara simultan menggunakan TensorFlow **Functional API**.
- **📊 Dataset Skala Besar & Seimbang** — Dilatih dengan **139.079 baris data** seimbang (via **SMOTE**) untuk **18 rumpun karir IT** spesifik, bersumber dari Stack Overflow Developer Survey.
- **🎲 Natural Probability Distribution** — Menerapkan **Custom Loss Function (Label Smoothing: 0.15)** untuk meredam *network overconfidence*, menghasilkan distribusi probabilitas Top 3 yang logis & humanis.
- **🛡️ Fail-Safe Input Sanitization** — Proteksi otomatis terhadap error pembagian nol (`NaN`) saat kolom opsional (mis. `databases`) dikosongkan.
- **🔐 Autentikasi** — Sistem login & register, seluruh data analisis terisolasi per user.
- **🤖 Generative AI Relay Coaching** — Hasil inferensi diteruskan ke **Gemini API** untuk merangkai langkah taktis *learning roadmap* berbahasa Indonesia.

---

## 🏗️ Arsitektur Sistem

```
                          ┌─────────────────────────┐
                          │      User Browser        │
                          └────────────┬────────────┘
                                       │
                          ┌────────────▼────────────┐
                          │  React + Vite (Frontend) │
                          │       Port 5173/8080     │
                          └────────────┬────────────┘
                                       │ /api/...
                          ┌────────────▼────────────┐
                          │  Express.js (Backend)    │
                          │       Port 8080          │
                          └────────────┬────────────┘
                                       │ http://localhost:8000/predict
                          ┌────────────▼────────────┐
                          │  FastAPI (AI Service)    │
                          │       Port 8000          │
                          └────────────┬────────────┘
                                       │
              ┌────────────────────────┼────────────────────────┐
              ▼                        ▼                        ▼
   ┌──────────────────┐   ┌──────────────────────┐   ┌──────────────────┐
   │  TensorFlow      │   │   Google Gemini API   │   │   PostgreSQL     │
   │  Model (.keras)  │   │   (Roadmap Generator) │   │  (Users & Data)  │
   └──────────────────┘   └──────────────────────┘   └──────────────────┘
```

---

## 🔄 Pipeline End-to-End

Ketiga folder learn path bekerja secara berurutan membentuk satu alur data:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  DATA SCIENCE   │ ──▶ │  AI ENGINEER    │ ──▶ │   FULLSTACK     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ • Data Cleaning │     │ • Train model   │     │ • Web UI        │
│ • EDA           │     │   (.keras)      │     │ • RESTful API   │
│ • SMOTE Balance │     │ • Inferensi     │     │ • Auth          │
│ • Dashboard     │     │ • Gemini relay  │     │ • DB per user   │
└─────────────────┘     └─────────────────┘     │ • Deploy        │
   dataset bersih          model + service       └─────────────────┘
                                                    produk akhir
```

### Alur Aplikasi (Runtime)

1. User **register/login** → sesi dimulai.
2. User mengisi profil (Basic Info → Skills & Tools → Databases).
3. Klik **Analyze** → tampil halaman *Loading*.
4. Express menerima request → validasi autentikasi + validasi input (`years_code` 0–50, `education_level` 0–3).
5. Express forward ke FastAPI → **TensorFlow** melakukan prediksi.
6. **Gemini API** men-generate roadmap berdasarkan karir Top 1.
7. Hasil disimpan ke **PostgreSQL** (terisolasi per user).
8. Frontend menampilkan **Top 3 karir + AI Roadmap**.
9. Dashboard menampilkan statistik & riwayat analisis user.

---

## 📂 Struktur Repositori

```text
Sistem-Rekomendasi-Karir-IT/
│
├── README.md                       # 📘 Dokumentasi terpusat (file ini)
├── requirements.txt                # 📦 Dependencies Python terpusat (semua learn path)
│
├── AI Engineer/                    # 🧠 Deep Learning Core Engine
│   ├── [Capstone]DL_Sistem_Rekomendasi_v1_6.ipynb  # Notebook training model
│   ├── ai_service.py               # Skrip inferensi + integrasi Gemini
│   ├── career_recsys_model_custom.keras            # Bobot model akhir
│   └── logs/                       # Log TensorBoard (bukti pelatihan)
│
├── Data Science/                   # 📊 Data Wrangling & Analytics
│   ├── Data Wrangling/
│   │   ├── Data_cleaning.ipynb
│   │   ├── EDA_StackOverflow_Career_Classification.ipynb
│   │   ├── ab_testing_stackoverflow_experiment.ipynb
│   │   ├── survey_results_public.csv               # Dataset mentah
│   │   ├── dataset_so_clean.csv                    # Dataset hasil cleaning
│   │   └── dataset_so_smote_balanced*.csv          # Dataset hasil SMOTE
│   └── Deploy/                     # Dashboard Streamlit
│       ├── app.py                  # Landing page dashboard
│       ├── pages/                  # Overview, EDA, Visualisasi
│       └── utils/                  # Data loader & helper functions
│
└── Fullstack/                      # 🌐 Web Application (CareerMatch)
    ├── Dockerfile                  # Build image untuk deployment
    ├── start.sh                    # Entry point (jalankan FastAPI + Express)
    ├── backend/
    │   ├── server.js               # Express server (Port 8080) — RESTful API + Autentikasi
    │   ├── ai_api.py               # FastAPI wrapper (Port 8000)
    │   ├── ai_service.py           # Logika inferensi + Gemini
    │   ├── career_recsys_model_custom.keras        # Model (copy dari AI Engineer)
    │   ├── requirements.txt        # Deps Python khusus Docker build
    │   ├── package-lock.json
    │   └── package.json            # Dependencies Node backend
    └── frontend/
        ├── index.html
        ├── vite.config.js
        ├── eslint.config.js
        ├── package-lock.json
        ├── package.json            # Dependencies Node frontend
        ├── public/
        │   ├── favicon.svg
        │   └── icons.svg
        └── src/
            ├── App.jsx             # Routing utama + PrivateRoute (JWT guard)
            ├── App.css
            ├── index.css
            ├── main.jsx
            ├── assets/
            │   └── hero.png
            ├── components/
            │   ├── Sidebar.jsx         # Navigasi utama + logout
            │   └── SkillSelector.jsx   # Input skill dengan autocomplete vocabulary
            └── pages/              # Dashboard, Profile, Loading, Result, Login, Settings
```

---

## 📈 Performa Model

Proyek telah melampaui seluruh ambang batas minimum kriteria pengembangan:

| Metrik | Hasil | Keterangan |
|---|---|---|
| **Validation Accuracy** | `> 90%` | Metrik murni tanpa label smoothing menyentuh **98.6%** |
| **Validation MAE** | `~0.07` | *Trade-off* disengaja akibat Label Smoothing untuk menghindari overfitting |
| **Total Data Latih** | `139.079 baris` | Seimbang via SMOTE |
| **Jumlah Kelas Karir** | `18 rumpun` | Karir IT spesifik |

---

## ⚙️ Tech Stack

| Layer | Teknologi |
|---|---|
| **Data Science** | Python, Pandas, NumPy, Plotly, Streamlit, SMOTE (imbalanced-learn) |
| **AI / Model** | Python 3.11, TensorFlow 2.21, Keras 3.x |
| **Generative AI** | Google Gemini API (`google-genai`) |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Router v7, React Markdown |
| **Backend** | Node.js 20, Express.js v5, bcryptjs, jsonwebtoken |
| **AI Service** | FastAPI, Uvicorn, Pydantic |
| **Database** | PostgreSQL |
| **Deployment** | Railway (Docker) |

---

## 📋 Prasyarat

Pastikan sudah terpasang:

- **Python** 3.11 atau lebih baru
- **Node.js** 20 atau lebih baru
- **PostgreSQL** (untuk Fullstack)
- **Google Gemini API Key** ([dapatkan di sini](https://aistudio.google.com/app/apikey))

---

## 🚀 Instalasi

### 1. Clone Repositori

```bash
git clone <repository-url>
cd Sistem-Rekomendasi-Karir-IT
```

### 2. Install Dependencies Python (Terpusat)

```bash
# (Disarankan) buat virtual environment
python -m venv venv
# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# Install semua dependencies Python
pip install -r requirements.txt
```

> ℹ️ **Catatan:** `requirements.txt` di root adalah acuan **pengembangan terpusat** (mencakup semua learn path). Folder `Fullstack/backend/` memiliki `requirements.txt` tersendiri berisi **subset khusus** (FastAPI + TensorFlow + Gemini) yang dipakai oleh **Docker build**. Untuk dev lokal, cukup gunakan yang di root.

### 3. Install Dependencies Node (Fullstack)

```bash
# Backend Express
cd Fullstack/backend
npm install

# Frontend React
cd ../frontend
npm install
```

---

## ▶️ Cara Menjalankan

### A. Dashboard Data Science (Streamlit)

```bash
cd "Data Science/Deploy"
streamlit run app.py
```
Buka **http://localhost:8501**

### B. Eksplorasi / Training Model (AI Engineer)

```bash
cd "AI Engineer"
jupyter notebook "[Capstone]DL_Sistem_Rekomendasi_v1_6.ipynb"
```
Untuk uji inferensi langsung:
```bash
python ai_service.py
```

### C. Aplikasi Web Fullstack

Jalankan **3 terminal** secara paralel:

```bash
# Terminal 1 — FastAPI (AI Service)
cd Fullstack/backend
uvicorn ai_api:app --reload --port 8000

# Terminal 2 — Express (Backend)
cd Fullstack/backend
node server.js

# Terminal 3 — React (Frontend)
cd Fullstack/frontend
npm run dev
```
Buka **http://localhost:5173**

> 💡 **Alternatif (Docker):** Dari folder `Fullstack/`, jalankan `docker build -t careermatch .` lalu `docker run -p 8080:8080 careermatch`. Script `start.sh` otomatis menjalankan FastAPI + Express.

---

## 📐 Spesifikasi API

### Endpoint Express (Port 8080)

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/api/register` | Registrasi akun baru |
| `POST` | `/api/login` | Login & mendapatkan token JWT |
| `POST` | `/api/analyses` | Submit profil → rekomendasi karir + roadmap |
| `GET` | `/api/analyses` | 10 riwayat analisis terakhir milik user |
| `GET` | `/api/analyses/:id` | Detail satu riwayat analisis |
| `DELETE` | `/api/analyses` | Hapus semua riwayat milik user |
| `PATCH` | `/api/user` | Update username atau password |
| `GET` | `/api/vocabulary` | Vocabulary dari model |

### Endpoint FastAPI (Port 8000, internal)

| Method | Endpoint | Fungsi |
|---|---|---|
| `POST` | `/predict` | Inferensi model TensorFlow |
| `GET` | `/vocabulary` | Layer vocabulary dari model |

### Format Request — `POST /api/analyses`
```json
{
  "years_code": 3.0,
  "education_level": 2,
  "all_skills": "javascript react python",
  "tools": "visual studio code git",
  "databases": "postgresql"
}
```

**Education Level:**

| Value | Label |
|---|---|
| 0 | Diploma (D3/D4) |
| 1 | Pascasarjana (S2/S3) |
| 2 | Sarjana (S1) |
| 3 | SMA/SMK/Sederajat |

> ⚠️ **Penting:** Kolom opsional seperti `databases` jangan di-set `required` di UI. Jika dikosongkan, backend otomatis mengubah nilainya menjadi string `"none"` agar model tidak mengembalikan `NaN`.

### Format Response

```json
{
  "status": "success",
  "data": {
    "top_recommendations": [
      { "career": "Frontend Developer", "score": 78.7 },
      { "career": "Full Stack Developer", "score": 11.2 },
      { "career": "Backend Developer", "score": 9.3 }
    ],
    "ai_roadmap": "### Roadmap Frontend Developer\n1. **Kuasai ...**"
  }
}
```

> 💡 **Frontend note:** Properti `ai_roadmap` dikirim dalam format **Markdown**. Render dengan library seperti `react-markdown` agar menjadi HTML semantik yang rapi.

---

## 🔐 Environment Variables

Buat file `.env` di dalam folder `Fullstack/backend/`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/careermatchdb

```

---

## 🚢 Deployment

Aplikasi di-deploy ke **Railway** menggunakan Docker. Environment variables yang wajib diset di Railway:

```env
GEMINI_API_KEY=your_key
DATABASE_URL=your_postgresql_url
NODE_ENV=production
```

Build & start otomatis ditangani oleh `Fullstack/Dockerfile` dan `Fullstack/start.sh`.

---

## 👥 Tim & Lisensi

Proyek capstone pengembangan platform bimbingan karir cerdas untuk mahasiswa IT.

- **Data Science** — Data wrangling, EDA, & dashboard analitik
- **AI Engineer** — Pemodelan Deep Learning & integrasi Generative AI
- **Fullstack** — Pengembangan aplikasi web & deployment

> Dikembangkan sebagai bagian dari program pembelajaran. Gunakan & modifikasi sesuai kebutuhan.
