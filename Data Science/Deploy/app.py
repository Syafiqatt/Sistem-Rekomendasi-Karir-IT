"""
Developer Career Path Intelligence Dashboard
Entry point — Landing page.
"""
import streamlit as st
from utils.data_loader import load_data, kpi
from utils.functions import CSS, P

st.set_page_config(
    page_title="Career Intelligence Dashboard",
    page_icon="🧭",
    layout="wide",
    initial_sidebar_state="expanded",
)
st.markdown(CSS, unsafe_allow_html=True)

df = load_data()
k  = kpi(df)

# ── HERO ──
st.markdown(f"""
<div class="hero">
  <h1>🧭 Career Intelligence Dashboard</h1>
  <p>
    Analisis mendalam <b>{k['N']:,} developer</b> dari <b>Stack Overflow Developer Survey</b>
    — telah melalui SMOTE balancing & keyword injection.
    Eksplor <b>{k['n_career']} jalur karir</b>, {k['n_skills']} skill unik,
    {k['n_tools']} tools, {k['n_db']} database, dan dapatkan <b>rekomendasi karir
    personal</b> berbasis profil Anda.
  </p>
</div>
""", unsafe_allow_html=True)

# ── KPI ROW ──
cols = st.columns(6)
cards = [
    ("kpi-g",  f"{k['N']:,}",        "Total Developer"),
    ("kpi-b",  str(k["n_career"]),   "Career Path"),
    ("kpi-o",  str(k["n_skills"]),   "Unique Skills"),
    ("kpi-r",  str(k["n_tools"]),    "Unique Tools"),
    ("kpi-p",  str(k["n_db"]),       "Unique Databases"),
    ("kpi-d",  f"{k['avg_yr']} thn", "Avg Pengalaman"),
]
for col, (cls, val, lbl) in zip(cols, cards):
    col.markdown(
        f'<div class="kpi {cls}"><p class="kpi-v">{val}</p>'
        f'<p class="kpi-l">{lbl}</p></div>',
        unsafe_allow_html=True,
    )

st.write("")

# ── ABOUT + QUICK STATS ──
left, right = st.columns([1.4, 1])

with left:
    st.markdown('<div class="sec-hd">Tentang Dashboard</div>', unsafe_allow_html=True)
    st.markdown(f"""
    Dashboard ini dibangun untuk menjawab **pertanyaan bisnis nyata** seputar
    industri teknologi — dari sisi **recruiter, educator, maupun career planner**.

    Dataset berasal dari Stack Overflow Developer Survey yang telah diproses:
    - **Data Cleaning** — 49K baris → 18 career label, 6 kolom terstandarisasi
    - **SMOTE Balancing** — distribusi merata, imbalance ratio {k['imbalance']:.2f}×
    - **Keyword Injection** — penguatan signature skill per career path

    ---
    ### Navigasi Halaman
    | Halaman | Isi Utama |
    |---------|-----------|
    | 📊 **Overview** | KPI, distribusi karir, kualitas data |
    | 🔬 **EDA** | Analisis A–G: skill, exp, edu, korelasi, co-occurrence |
    | 📈 **Visualisasi** | Heatmap, radar, perbandingan, transisi karir |
    """)

with right:
    st.markdown('<div class="sec-hd">Insight Kilat</div>', unsafe_allow_html=True)
    insights = [
        ("", f"Dataset <b>balanced</b> — {k['imbalance']:.2f}× imbalance ratio. Ideal untuk training model klasifikasi."),
        ("", f"Top skill: <b>Python, JavaScript, SQL</b> — hadir di hampir semua jalur karir."),
        ("warn", f"Korelasi pengalaman ↔ jumlah skill hanya <b>r = 0.008</b> — pengalaman lama bukan jaminan banyak skill."),
        ("", f"<b>84%</b> developer berlatar Bachelor. Master hanya 3.7% — gelar bukan penghalang utama."),
        ("info", f"<b>Cybersecurity Analyst</b> paling skill-intensive: rata-rata <b>19.5 skill</b> per developer."),
        ("warn", f"<b>Database Administrator</b> paling senior-heavy: rata-rata <b>20.9 tahun</b> pengalaman."),
    ]
    for cls, txt in insights:
        st.markdown(f'<div class="ins {cls}">{txt}</div>', unsafe_allow_html=True)

st.divider()

# ── METRICS ROW ──
m1,m2,m3,m4 = st.columns(4)
m1.metric("Median Pengalaman", f"{k['med_yr']} thn")
m2.metric("Rata-rata Skill/Dev", f"{k['avg_skill']}")
m3.metric("Missing (tools)", "12.0%")
m4.metric("Missing (databases)", "25.4%")

st.caption(
    "📌 Gunakan sidebar kiri untuk berpindah halaman. "
    "Semua data di-cache — navigasi antar halaman sangat responsif."
)
