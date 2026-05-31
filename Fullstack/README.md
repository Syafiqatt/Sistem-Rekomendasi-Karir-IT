# 🌐 CareerMatch — Web Application

Aplikasi web sistem rekomendasi karir mahasiswa IT berbasis **Deep Learning** dan **Generative AI**. Dibangun dengan React + Vite (frontend), Express.js (backend), FastAPI + TensorFlow (AI service), dan PostgreSQL (database).

---

## 🚀 Live Demo (Railway)

🔗 **https://careermatch.up.railway.app**

---

## 🏗️ Arsitektur Sistem

```
User Browser
    ↓
React + Vite (Frontend)
    ↓ /api/...
Express.js (Backend - Port 8080)
    ↓ http://localhost:8000/predict
FastAPI (AI Service - Port 8000)
    ↓
TensorFlow Model (.keras) + Gemini API
    ↓
PostgreSQL (Riwayat Analisis)
```

---

## 📁 Struktur Project

```
Fullstack/
├── Dockerfile
├── start.sh
├── README_FULLSTACK.md
├── backend/
│   ├── server.js
│   ├── ai_api.py
│   ├── ai_service.py
│   ├── career_recsys_model_custom.keras
│   ├── package.json
│   ├── package-lock.json
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── Loading.jsx
        │   └── Result.jsx
        └── components/
            ├── Sidebar.jsx
            └── SkillSelector.jsx
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8, Tailwind CSS v4, React Router v7 |
| Backend | Node.js 20, Express.js v5 |
| AI Service | Python 3.11, FastAPI, TensorFlow 2.21, Keras |
| Generative AI | Google Gemini API (gemini-2.5-flash) |
| Database | PostgreSQL |
| Deploy | Railway (Docker) |

---

## 🔌 API Endpoints

### Express (Port 8080)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/api/analyze` | Submit profil → rekomendasi karir |
| GET | `/api/history` | 10 riwayat analisis terakhir |
| GET | `/api/history/:id` | Detail satu riwayat |
| DELETE | `/api/history` | Hapus semua riwayat |
| GET | `/api/vocabulary` | Vocab dari model |

### FastAPI (Port 8000, internal)

| Method | Endpoint | Fungsi |
|---|---|---|
| POST | `/predict` | Inference model TensorFlow |
| GET | `/vocabulary` | Layer vocab dari model |

---

## 📐 Format Request & Response

### POST `/api/analyze`

**Request Body:**
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

**Response:**
```json
{
  "status": "success",
  "data": {
    "top_recommendations": [
      { "career": "Frontend Developer", "score": 78.7 },
      { "career": "Full Stack Developer", "score": 11.2 },
      { "career": "Backend Developer", "score": 9.3 }
    ],
    "ai_roadmap": "### Roadmap Frontend Developer\n..."
  }
}
```

---

## 🛠️ Setup Lokal

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL

### 1. Install Dependencies

```bash
# Backend Node
cd backend
npm install

# Backend Python
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Environment Variables

Buat file `.env` di folder `backend/`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql://user:password@localhost:5432/careermatchdb
```

### 3. Jalankan

```bash
# Terminal 1 — FastAPI
cd backend
uvicorn ai_api:app --reload --port 8000

# Terminal 2 — Express
cd backend
node server.js

# Terminal 3 — Frontend
cd frontend
npm run dev
```

Buka **http://localhost:5173**

---

## 🚢 Deploy (Railway)

Environment variables yang wajib diset di Railway:
```
GEMINI_API_KEY=your_key
DATABASE_URL=your_postgresql_url
NODE_ENV=production
```

Build dan start otomatis via `Dockerfile` dan `start.sh`.

---

## 🔄 Alur Aplikasi

```
1. User isi profil (Basic Info → Skills & Tools → Databases)
2. Klik Analyze → Loading page
3. Express terima request → validasi input
4. Forward ke FastAPI → TensorFlow predict
5. Gemini API generate roadmap
6. Hasil disimpan ke PostgreSQL
7. Frontend tampilkan Top 3 karir + AI Roadmap
8. Dashboard tampilkan riwayat analisis
```

---

## 🔧 Changelog dari Versi Sebelumnya

| File | Perubahan |
|---|---|
| `ai_service.py` | Migrasi Gemini SDK: `google.generativeai` → `google-genai` (`from google import genai`) |
| `ai_service.py` | Model load dibungkus try/except dengan error message informatif |
| `ai_service.py` | Tambah `compile=False` untuk bypass error quantization |
| `server.js` | Validasi input `years_code` (0–50) dan `education_level` (0–3) |
| `server.js` | Error handling spesifik ECONNREFUSED ketika FastAPI tidak berjalan |
| `server.js` | INSERT DB pakai variabel parsed bukan raw payload |
| `server.js` | Tambah endpoint `DELETE /api/history` |
| `server.js` | Serve static frontend + PORT 8080 untuk Railway |
| `Loading.jsx` | `useRef` guard mencegah double request di React Strict Mode |
| `SkillSelector.jsx` | Vocab mapping eksplisit by layer name (`text_vectorization_3/4/5`) |
| `Result.jsx` | Glassmorphism card, Notion-style roadmap, filter `none` di databases |
| `Dashboard.jsx` | History section, responsive grid, Clear Data hapus DB + localStorage |
| `Profile.jsx` | Validasi range 0–50, block karakter `e/E/+/-` di number input |
| `Sidebar.jsx` | Fix z-index, spacer `hidden md:block` untuk mobile |
| Semua pages | Responsive mobile dengan `pl-20 md:pl-6` dan grid breakpoints |

---


