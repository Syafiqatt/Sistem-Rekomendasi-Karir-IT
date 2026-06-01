# 🚀 Panduan Alur Kerja Integrasi AI (Untuk Tim Fullstack)

Dokumen ini berisi panduan langkah demi langkah untuk mengintegrasikan core engine AI (**Model Rekomendasi Karir Deep Learning** dan **Gemini API**) ke dalam sistem aplikasi utama kita.

---

## 🛠️ Persiapan Lingkungan (Setup Environment)

Pastikan di dalam server *Backend* (baik menggunakan FastAPI, Express, Flask, atau framework lainnya) sudah terpasang pustaka dasar berikut. 

### 1. Instalasi Packages via Terminal
```bash
pip install tensorflow==2.15.0 numpy google-generativeai

```

### 2. File yang Wajib Ada di Direktori Backend

Pastikan Anda sudah memindahkan file-file berikut dari AI Engineer ke dalam struktur folder backend Anda:

* `career_recsys_model_custom.keras` (File bobot model biner)
* `ai_service.py` (Script wrapper fungsi prediksi)

### 3. Konfigurasi Variabel Lingkungan (.env)

Jangan melakukan *hardcode* pada API Key. Masukkan ke dalam file `.env` server Anda:

```env
GEMINI_API_KEY="AIzaSyYourActualGeminiAPIKeyHere"

```

---

## 🔄 Alur Kerja Sistem (Workflow Pipeline)

Proses eksekusi di backend harus mengikuti urutan estafet berikut:

```text
[Frontend Form] ➡️ [Backend Endpoint] ➡️ [Sanitization] ➡️ [Keras Predict] ➡️ [Gemini API] ➡️ [JSON Response]

```

1. **Ambil Data dari Frontend:** Ambil payload berisi `years_code`, `education_level`, `all_skills`, `tools`, dan `databases`.
2. **Sanitasi Data (PENTING):** Jika user mengosongkan kolom opsional (seperti `databases`), sistem backend wajib mengubah nilainya menjadi string `"none"`. Jika dibiarkan string kosong `""`, model Keras akan mengembalikan nilai *error* `NaN` akibat pembagian dengan nol pada layer pooling.
3. **Inference Model Keras:** Panggil fungsi `get_career_recommendation(payload)`. Fungsi ini akan otomatis mengembalikan array berisi **Top 3 Rekomendasi Karir** beserta skor kecocokannya, lalu langsung otomatis menembak **Gemini API** untuk mengambil teks *roadmap* belajar berdasarkan peringkat pertama (Top 1).
4. **Kirim JSON Kembali ke Frontend:** Kembalikan satu paket data JSON utuh agar Frontend hanya perlu melakukan 1 kali *request* (Single Roundtrip API Call).

---

## 📐 Kontrak Data & Spesifikasi API

### Endpoint Rekomendasi (Contoh: `POST /api/v1/recommendation`)

#### A. Format Request Body (JSON dari Frontend)

*Catatan UI: Kolom input Database jangan di-set sebagai `required`. Biarkan user bisa mengosongkannya.*

```json
{
  "years_code": 3.0,
  "education_level": 2,
  "all_skills": "html/css javascript react tailwind css ui design wireframing",
  "tools": "visual studio code figma",
  "databases": "" 
}

```

#### B. Format Response Body (JSON dari Backend)

```json
{
  "status": "success",
  "data": {
    "top_recommendations": [
      { "career": "UX Designer", "score": 90.4 },
      { "career": "Frontend Developer", "score": 7.8 },
      { "career": "Full Stack Developer", "score": 1.8 }
  ],
    "ai_roadmap": "### 3 Langkah Taktis Menuju UX Designer:\n\n1. **Kuasai Prototyping Lanjutan:** Tingkatkan kemampuan Figma Anda...\n2. ..."
  }
}

```

---

## 🎨 Panduan Implementasi UI (Frontend Brief)

Untuk menjaga keselarasan estetika aplikasi kita yang modern dan bersih (*clean & minimalist*), mohon ikuti spesifikasi UI berikut saat merender data JSON di atas:

1. **Parsing Markdown `ai_roadmap`:**
Data pada properti `ai_roadmap` dikirim oleh Gemini dalam bentuk string Markdown murni (mengandung karakter ``, `###`, `-`). **Jangan langsung ditampilkan sebagai teks biasa.** Gunakan library parser di Frontend seperti `react-markdown` (jika menggunakan React) agar teks terkonversi menjadi elemen HTML semantik (`h3`, `li`, `strong`) secara rapi.
2. **Desain Mobile-First & Glassmorphism:**
* Desain komponen hasil harus sepenuhnya responsif dan dioptimalkan untuk layar ponsel pintar.
* Gunakan utilitas Tailwind CSS untuk memberikan efek *glassmorphism* (kartu semi-transparan dengan efek *backdrop-blur*) pada pembungkus (*card*) hasil rekomendasi top 3.

3. **High-Quality Typography:**
* Terapkan font **Poppins** untuk seluruh teks instruksi, isi *roadmap*, dan komponen teks umum.
* Gunakan font **Playfair Display** khusus untuk bagian *Heading Utama*, judul kartu hasil karir, atau komponen teks beraksen besar untuk memberikan kesan premium dan profesional.
