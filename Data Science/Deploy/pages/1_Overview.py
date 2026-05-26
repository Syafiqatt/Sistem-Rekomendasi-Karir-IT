"""PAGE 1 — OVERVIEW & EXECUTIVE SUMMARY"""
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from utils.data_loader import load_data, kpi, top_items
from utils.functions import CSS, P, BASE, hbar, donut

st.set_page_config(page_title="Overview", page_icon="📊", layout="wide")
st.markdown(CSS, unsafe_allow_html=True)

df = load_data()
k  = kpi(df)

st.markdown('<div class="sec-hd">📊 Overview & Executive Summary</div>', unsafe_allow_html=True)
st.caption("Ringkasan eksekutif dataset — distribusi karir, pengalaman, pendidikan, dan kualitas data.")

# ── KPI ──
c = st.columns(5)
cards = [
    ("kpi-g", f"{k['N']:,}",          "Total Developer"),
    ("kpi-b", str(k["n_career"]),     "Career Path"),
    ("kpi-o", str(k["n_skills"]),     "Skills Unik"),
    ("kpi-r", f"{k['avg_yr']} thn",   "Rata-rata Pengalaman"),
    ("kpi-p", f"{k['imbalance']:.2f}×","Imbalance Ratio"),
]
for col,(cls,v,l) in zip(c, cards):
    col.markdown(f'<div class="kpi {cls}"><p class="kpi-v">{v}</p><p class="kpi-l">{l}</p></div>',
                 unsafe_allow_html=True)
st.write("")

# ── DISTRIBUSI KARIR ──
st.markdown('<div class="sec-hd">Distribusi Career Path</div>', unsafe_allow_html=True)
cd = df["career_label"].value_counts().reset_index()
cd.columns = ["career", "count"]

tab_bar, tab_donut, tab_tree = st.tabs(["Bar Chart", "Donut Chart", "Treemap"])

with tab_bar:
    fig = hbar(cd, "count", "career", title="Jumlah Developer per Career Path",
               color_scale="Greens")
    st.plotly_chart(fig, use_container_width=True)

with tab_donut:
    fig = donut(cd, "career", "count", "Proporsi Career Path", h=520)
    st.plotly_chart(fig, use_container_width=True)

with tab_tree:
    fig = px.treemap(cd, path=["career"], values="count",
                     color="count", color_continuous_scale="Greens",
                     title="Treemap Distribusi Career Path")
    fig.update_layout(**BASE, height=520)
    st.plotly_chart(fig, use_container_width=True)

st.markdown('<div class="ins">✅ Imbalance ratio <b>1.25×</b> — sangat mendekati perfect balance. '
            'Backend Developer & Full Stack sedikit lebih banyak karena baseline raw data yang lebih besar, '
            'namun perbedaannya tidak signifikan untuk model ML.</div>', unsafe_allow_html=True)

st.divider()

# ── PENGALAMAN + PENDIDIKAN ──
st.markdown('<div class="sec-hd">Pengalaman & Pendidikan</div>', unsafe_allow_html=True)
left, right = st.columns(2)

with left:
    # Histogram pengalaman
    fig = px.histogram(df, x="years_code", nbins=45,
                       color_discrete_sequence=["#1D9E75"], opacity=.82)
    fig.add_vline(x=df["years_code"].mean(), line_dash="dash", line_color="#C73E1D",
                  annotation_text=f"Mean {df['years_code'].mean():.1f}",
                  annotation_position="top right")
    fig.add_vline(x=df["years_code"].median(), line_dash="dot", line_color="#264653",
                  annotation_text=f"Median {df['years_code'].median():.0f}",
                  annotation_position="top left")
    fig.update_layout(**BASE, title="Distribusi Pengalaman Coding (tahun)",
                      xaxis_title="Years", yaxis_title="Developer", height=380)
    st.plotly_chart(fig, use_container_width=True)

with right:
    edu = df["edu_label"].value_counts().reset_index()
    edu.columns = ["edu", "n"]
    fig = donut(edu, "edu", "n", "Distribusi Pendidikan", h=380)
    st.plotly_chart(fig, use_container_width=True)

# Violin pengalaman per cohort
cohort_order = ["0-2 yr (Entry)","2-5 yr (Junior)","5-10 yr (Mid)",
                "10-20 yr (Senior)","20+ yr (Lead)"]
fig = px.violin(df[df["cohort"].isin(cohort_order)],
                x="cohort", y="years_code",
                color="cohort", color_discrete_sequence=P,
                category_orders={"cohort": cohort_order},
                box=True, points=False)
fig.update_layout(**BASE, title="Distribusi Pengalaman per Cohort",
                  xaxis_title="", yaxis_title="Years", showlegend=False, height=380)
st.plotly_chart(fig, use_container_width=True)

st.divider()

# ── TOP SKILL / TOOL / DB ──
st.markdown('<div class="sec-hd">Ekosistem Teknologi (Top Items)</div>', unsafe_allow_html=True)
c1,c2,c3 = st.columns(3)

with c1:
    t = top_items(df, "skills_list", 15)
    fig = hbar(t, "count", "item", "Top 15 Programming Languages & Frameworks",
               color_scale="Greens")
    st.plotly_chart(fig, use_container_width=True)

with c2:
    t = top_items(df, "tools_list", 12)
    fig = hbar(t, "count", "item", "Top 12 Development Tools",
               color_scale="Blues")
    st.plotly_chart(fig, use_container_width=True)

with c3:
    t = top_items(df, "db_list", 12)
    fig = hbar(t, "count", "item", "Top 12 Databases",
               color_scale="Purples")
    st.plotly_chart(fig, use_container_width=True)

st.divider()

# ── DATA QUALITY ──
st.markdown('<div class="sec-hd">Data Quality Report</div>', unsafe_allow_html=True)
ql, qr = st.columns([1.6, 1])

with ql:
    qa_data = {
        "Kolom": ["all_skills","tools","databases","years_code","education_level","career_label"],
        "Tipe": ["String (;-sep)","String (;-sep)","String (;-sep)","Float","Float","String"],
        "Missing (n)": [df[c].isna().sum() for c in
                        ["all_skills","tools","databases","years_code","education_level","career_label"]],
    }
    qa = pd.DataFrame(qa_data)
    qa["Missing (%)"] = (qa["Missing (n)"] / len(df) * 100).round(2)
    qa["Complete (%)"] = (100 - qa["Missing (%)"]).round(2)
    st.dataframe(qa, hide_index=True, use_container_width=True)

with qr:
    dup = df[["all_skills","tools","databases","years_code",
              "education_level","career_label"]].duplicated().sum()
    out_hi = (df["years_code"] > 50).sum()
    out_lo = (df["years_code"] < 1).sum()
    st.markdown(f"""
    **Statistik Kualitas:**
    - Duplikat baris : `{dup:,}` ({dup/len(df)*100:.2f}%)
    - Outlier tahun > 50 : `{out_hi:,}` ({out_hi/len(df)*100:.2f}%)
    - Outlier tahun < 1 : `{out_lo:,}` ({out_lo/len(df)*100:.2f}%)
    - Missing `tools` : wajar (dev tanpa IDE khusus)
    - Missing `databases` : wajar (front-end tidak pakai DB)
    """)
    st.markdown('<div class="ins">✅ Kualitas data <b>sangat baik</b>. Kolom krusial '
                '(all_skills, years_code, career_label) 100% terisi. Missing hanya '
                'pada kolom opsional yang memang tidak wajib diisi semua developer.</div>',
                unsafe_allow_html=True)

# Stats numerik
st.markdown("**Statistik Deskriptif Kolom Numerik:**")
desc = df[["years_code","education_level","num_skills","num_tools","num_db"]].describe().round(2)
st.dataframe(desc, use_container_width=True)
