# 🧠 AI-Driven Career Recommendation & Roadmap System (v1.6-Final)

Aplikasi sistem rekomendasi karir mahasiswa IT berbasis **Deep Learning** menggunakan **TensorFlow Functional API** dan **Generative AI**. Proyek ini dirancang sebagai core engine untuk platform bimbingan karir cerdas bagi mahasiswa di Universitas Esa Unggul.

Sistem ini mengintegrasikan model klasifikasi multi-input dengan **Google Gemini API** sebagai *AI Career Coach* untuk menyajikan rekomendasi karir top 3 beserta *learning roadmap* taktis secara otomatis.

---

## 🚀 Fitur Utama & Capaian (v1.6)

- **Arsitektur Multi-Input Multi-Modal:** Menggabungkan data teks (`all_skills`, `tools`, `databases`) melalui layer *Embedding* dan data numerik (`years_code`, `education_level`) secara simultan menggunakan *Functional API*.
- **Dataset Skala Besar & Seimbang:** Dilatih menggunakan data survei industri yang telah diproses ulang melalui teknik **SMOTE (Synthetic Minority Over-sampling Technique)** dengan total **139.079 baris data** seimbang untuk 18 rumpun karir IT spesifik.
- **Natural Probability Distribution:** Mengimplementasikan **Custom Loss Function (Label Smoothing: 0.15)** pada *Binary Crossentropy* untuk meredam *Network Overconfidence* (skor 100% bulat), menghasilkan distribusi probabilitas Top 3 yang logis dan humanis.
- **Fail-Safe Input Sanitization:** Proteksi *Backend handler* otomatis terhadap *error* pembagian nol (`NaN`) jika pengguna mengosongkan kolom opsional seperti *databases*.
- **Generative AI Relay Coaching:** Hasil inferensi *Jaringan Saraf* secara estafet diteruskan ke **Gemini API (`gemini-1.5-flash-latest`)** untuk merangkai 3 langkah taktis *Roadmap Belajar* berbasis Bahasa Indonesia.

---

## 📊 Performa Model (Metrik Capstone)

Proyek ini telah berhasil melampaui seluruh ambang batas minimum (*Sidequest Threshold*) yang ditetapkan dalam kriteria pengembangan:

* **Validation Accuracy:** `> 90%` (Metrik murni tanpa label smoothing menyentuh **98.6%**)
* **Validation MAE:** Stabil di kisaran `~0.07` (Mengalami *trade-off* teoretis yang disengaja akibat penerapan *Label Smoothing* guna menghindari *overfitting* ekstrem).

---

## 📂 Struktur Repositori

```text
├── logs/
│   └── gradient_tape/         # 📑 File Log biner TensorBoard (Bukti Pelatihan Otentik)
├── ai_service.py              # ⚙️ Skrip Inferensi Utama & Integrasi Gemini API
├── career_recsys_model_custom.keras  # 🧠 File Bobot Model Akhir Jaringan Saraf
├── requirements.txt           # 📦 Daftar Pustaka Dependensi Server
└── README.md                  # 📘 Dokumentasi Proyek
