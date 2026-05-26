"""PAGE 2 — EXPLORATORY DATA ANALYSIS (Section A–G)"""
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from itertools import combinations
from utils.data_loader import (load_data, kpi, top_items,
                                career_top_skills, career_stats, cooccurrence)
from utils.functions import (CSS, P, BASE, hbar, heatmap,
                              box_career, scatter_exp_skill, stacked_cohort)

st.set_page_config(page_title="EDA", page_icon="🔬", layout="wide")
st.markdown(CSS, unsafe_allow_html=True)

df = load_data()

# ── SIDEBAR FILTER ──
with st.sidebar:
    st.markdown("### 🔎 Filter EDA")
    sel_careers = st.multiselect("Career path", sorted(df["career_label"].unique()),
                                  default=sorted(df["career_label"].unique()))
    yr_rng = st.slider("Rentang pengalaman", 1, 100, (1, 60))

dff = df[df["career_label"].isin(sel_careers) &
         df["years_code"].between(*yr_rng)]
st.caption(f"📌 Filter aktif: **{len(dff):,}** baris | {dff['career_label'].nunique()} career")

st.markdown('<div class="sec-hd">🔬 Exploratory Data Analysis</div>', unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# A — DATASET OVERVIEW
# ════════════════════════════════════════════════════════════════════
with st.expander("🅐  Dataset Overview & Quality", expanded=True):
    a1,a2,a3,a4 = st.columns(4)
    a1.metric("Records", f"{len(dff):,}")
    a2.metric("Career paths", dff["career_label"].nunique())
    ratio = dff["career_label"].value_counts()
    a3.metric("Imbalance ratio", f"{ratio.max()/max(ratio.min(),1):.2f}×")
    a4.metric("Skill unik (filtered)", len({s for L in dff["skills_list"] for s in L}))

    st.markdown('<div class="ins">✅ Dataset sudah <b>balanced</b> dengan SMOTE — ratio '
                '1.25× jauh di bawah ambang wajar 3×. Tidak perlu re-balancing untuk '
                'model klasifikasi.</div>', unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# B — SKILL ECOSYSTEM
# ════════════════════════════════════════════════════════════════════
with st.expander("🅑  Skill Ecosystem Analysis", expanded=True):
    n_sk, n_tl, n_db = st.columns(3)
    n_top_sk = n_sk.slider("Top N skill", 5, 30, 15, key="b_sk")
    n_top_tl = n_tl.slider("Top N tool", 5, 20, 12, key="b_tl")
    n_top_db = n_db.slider("Top N DB", 5, 20, 10, key="b_db")

    c1, c2, c3 = st.columns(3)
    with c1:
        t = top_items(dff, "skills_list", n_top_sk)
        st.plotly_chart(hbar(t,"count","item","Top Skills",color_scale="Greens"),
                        use_container_width=True)
    with c2:
        t = top_items(dff, "tools_list", n_top_tl)
        st.plotly_chart(hbar(t,"count","item","Top Tools",color_scale="Blues"),
                        use_container_width=True)
    with c3:
        t = top_items(dff, "db_list", n_top_db)
        st.plotly_chart(hbar(t,"count","item","Top Databases",color_scale="Purples"),
                        use_container_width=True)

    # Skill diversity distribution
    fig = px.histogram(dff, x="num_skills", nbins=30, color_discrete_sequence=["#1D9E75"])
    fig.add_vline(x=dff["num_skills"].mean(), line_dash="dash", line_color="#C73E1D",
                  annotation_text=f"Mean {dff['num_skills'].mean():.1f}")
    fig.update_layout(**BASE, title="Distribusi Jumlah Skill per Developer",
                      xaxis_title="Jumlah Skill", yaxis_title="Developer", height=320)
    st.plotly_chart(fig, use_container_width=True)

    top3 = top_items(dff,"skills_list",3)["item"].tolist()
    st.markdown(
        f'<div class="ins">🔥 <b>Top-3 skill universal:</b> {", ".join(top3)} — '
        f'hadir lintas semua career. Rata-rata developer kuasai '
        f'<b>{dff["num_skills"].mean():.1f} skill</b> (median {dff["num_skills"].median():.0f}). '
        f'Kebanyakan developer adalah <b>multi-stack generalist</b>.</div>', unsafe_allow_html=True)

    st.markdown(
        '<div class="ins info">💡 <b>Rekomendasi pelajar:</b> Kuasai top-3 dulu — '
        'Python, JavaScript, SQL membuka pintu ke hampir semua jalur karir IT.</div>',
        unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# C — EXPERIENCE & PROGRESSION
# ════════════════════════════════════════════════════════════════════
with st.expander("🅒  Experience & Career Progression", expanded=True):
    cs = career_stats(dff).sort_values("avg_yr", ascending=False)

    l, r = st.columns([1.5, 1])
    with l:
        order = cs["career"].tolist()
        st.plotly_chart(box_career(dff, order), use_container_width=True)
    with r:
        st.markdown("**Top 5 Senior-Heavy Roles:**")
        st.dataframe(cs.head(5)[["career","avg_yr","med_yr"]].rename(
            columns={"career":"Career","avg_yr":"Mean Exp","med_yr":"Median"}),
            hide_index=True, use_container_width=True)
        st.markdown("**Top 5 Junior-Friendly Roles:**")
        st.dataframe(cs.tail(5)[["career","avg_yr","med_yr"]].rename(
            columns={"career":"Career","avg_yr":"Mean Exp","med_yr":"Median"}),
            hide_index=True, use_container_width=True)

    # Stacked cohort
    st.plotly_chart(stacked_cohort(dff), use_container_width=True)

    senior = cs.iloc[0]
    junior = cs.iloc[-1]
    st.markdown(
        f'<div class="ins">👴 <b>{senior["career"]}</b> = role paling senior-heavy '
        f'(median <b>{senior["med_yr"]:.0f} thn</b>). Butuh expertise mendalam & tanggung jawab strategis.<br>'
        f'🌱 <b>{junior["career"]}</b> = paling junior-friendly '
        f'(median <b>{junior["med_yr"]:.0f} thn</b>). Ideal untuk fresh graduate IT.</div>',
        unsafe_allow_html=True)
    st.markdown(
        '<div class="ins warn">⚠️ <b>Insight penting:</b> Banyak career (Data Scientist, '
        'QA Engineer) bisa dimasuki dengan pengalaman &lt; 5 tahun — '
        '<b>skill lebih menentukan dari seniority</b>.</div>', unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# D — EDUCATION
# ════════════════════════════════════════════════════════════════════
with st.expander("🅓  Education Analysis", expanded=False):
    from utils.data_loader import EDU_MAP
    dl, dr = st.columns(2)

    with dl:
        edu_d = dff["edu_label"].value_counts().reset_index()
        edu_d.columns = ["edu","n"]
        fig = px.pie(edu_d, names="edu", values="n", hole=.5,
                     color_discrete_sequence=P)
        fig.update_traces(textposition="inside", textinfo="percent+label")
        fig.update_layout(**BASE, title="Distribusi Pendidikan Global", height=420)
        st.plotly_chart(fig, use_container_width=True)

    with dr:
        # % Bachelor+ per career
        bp = dff.groupby("career_label").apply(
            lambda g: (g["education_level"]>=2).mean()*100).sort_values(ascending=False
        ).reset_index(); bp.columns=["career","pct_bach"]
        fig = hbar(bp, "pct_bach", "career",
                   "% Bachelor+ per Career", color_scale="Teal", text_suffix="%")
        st.plotly_chart(fig, use_container_width=True)

    # Education × Career heatmap
    edu_order = list(EDU_MAP.values())
    ct = pd.crosstab(dff["career_label"], dff["edu_label"], normalize="index")*100
    ct = ct.reindex(columns=[c for c in edu_order if c in ct.columns])
    st.plotly_chart(heatmap(ct, "% Pendidikan per Career", "Greens", ".0f", h=580),
                    use_container_width=True)

    bach = (dff["edu_label"]=="Bachelor").mean()*100
    self_t = (dff["edu_label"].isin(["None/Self-taught","High School"])).mean()*100
    st.markdown(
        f'<div class="ins">🎓 <b>Bachelor mendominasi</b>: {bach:.1f}%. '
        f'Namun <b>{self_t:.1f}%</b> developer adalah self-taught/HS only — '
        f'industri IT masih sangat terbuka untuk non-formal learners.</div>',
        unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# E — CORRELATION & RELATIONSHIPS
# ════════════════════════════════════════════════════════════════════
with st.expander("🅔  Correlation & Multivariate Relationships", expanded=False):
    cols_num = ["years_code","education_level","num_skills","num_tools","num_db"]
    corr = dff[cols_num].corr().round(3)

    el, er = st.columns(2)
    with el:
        st.plotly_chart(
            heatmap(corr, "Matriks Korelasi Variabel Numerik", "RdBu_r", ".2f", h=400),
            use_container_width=True)
    with er:
        st.plotly_chart(scatter_exp_skill(dff), use_container_width=True)

    # Education vs num_skills box
    fig = px.box(dff, x="edu_label", y="num_skills",
                 color="edu_label", color_discrete_sequence=P,
                 points=False)
    fig.update_layout(**BASE, title="Jumlah Skill per Level Pendidikan",
                      xaxis_title="", yaxis_title="# Skill", showlegend=False, height=360)
    st.plotly_chart(fig, use_container_width=True)

    r_es = corr.loc["years_code","num_skills"]
    r_et = corr.loc["education_level","num_skills"]
    st.markdown(
        f'<div class="ins danger">📉 <b>Pengalaman ↔ skill: r = {r_es:.3f}</b> (sangat lemah!). '
        f'Junior dengan 2 tahun pengalaman bisa menguasai skill sebanyak veteran 15 tahun. '
        f'Implikasi: <b>skill mastery ≠ function of time</b>.<br>'
        f'📚 Pendidikan ↔ skill: r = {r_et:.3f} — lebih kuat sedikit, tapi masih lemah. '
        f'Self-taught developer bisa kompetitif vs lulusan universitas.</div>',
        unsafe_allow_html=True)
    st.markdown(
        '<div class="ins info">💡 <b>Implikasi untuk model AI:</b> Fitur skill jauh lebih '
        'informatif dari fitur pengalaman saja. Model deep learning harus mengutamakan '
        'encoding skill set sebagai input utama.</div>', unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# F — SKILL CO-OCCURRENCE
# ════════════════════════════════════════════════════════════════════
with st.expander("🅕  Skill Co-occurrence — Tech Stacks Populer", expanded=False):
    n_co = st.slider("Top-N skill untuk co-occurrence matrix", 8, 20, 14, key="co_n")
    co = cooccurrence(dff, n_co)

    # Mask upper triangle agar tidak redunant
    mask = np.triu(np.ones(co.shape, dtype=bool), k=1)
    co_vis = co.values.astype(float).copy()
    co_vis[mask] = np.nan

    fig = go.Figure(go.Heatmap(
        z=co_vis, x=co.columns, y=co.index,
        colorscale="Greens", text=co.values,
        texttemplate="%{text:,}", textfont={"size":9},
        hoverongaps=False,
    ))
    fig.update_layout(**BASE, title=f"Co-occurrence Matrix Top-{n_co} Skills",
                      xaxis_tickangle=-35, height=560)
    st.plotly_chart(fig, use_container_width=True)

    # Top pairs tabel
    tops = co.index.tolist()
    pairs = sorted(
        [(a,b,int(co.loc[a,b])) for a,b in combinations(tops,2)],
        key=lambda x: -x[2]
    )[:12]
    pair_df = pd.DataFrame(pairs, columns=["Skill A","Skill B","Co-occurrence"])
    pair_df["% dari total dev"] = (pair_df["Co-occurrence"]/len(dff)*100).round(1)
    c1,c2 = st.columns([1.4,1])
    with c1:
        st.markdown("**Top 12 Pasangan Skill Paling Sering Bersama:**")
        st.dataframe(pair_df, hide_index=True, use_container_width=True)
    with c2:
        # Bar top 8 pairs
        p8 = pair_df.head(8).copy()
        p8["pair"] = p8["Skill A"] + " + " + p8["Skill B"]
        fig = hbar(p8, "Co-occurrence", "pair",
                   "Top Pasangan Skill", color_scale="Greens")
        st.plotly_chart(fig, use_container_width=True)

    st.markdown(
        f'<div class="ins">🥇 Pair terkuat: <b>{pairs[0][0]} + {pairs[0][1]}</b> '
        f'({pairs[0][2]:,} developer = {pairs[0][2]/len(dff)*100:.1f}%). '
        f'Stack web frontend klasik yang selalu berdampingan.<br>'
        f'🥈 Pair #2: <b>{pairs[1][0]} + {pairs[1][1]}</b> ({pairs[1][2]:,}) — '
        f'stack data/backend Python.</div>', unsafe_allow_html=True)
    st.markdown(
        '<div class="ins info">💡 <b>Untuk curriculum design:</b> Pasangkan teknologi ini '
        'dalam satu modul pembelajaran — di industri memang dipakai bersama-sama.</div>',
        unsafe_allow_html=True)

# ════════════════════════════════════════════════════════════════════
# G — CAREER COMPARISON MATRIX (Stakeholder Insights)
# ════════════════════════════════════════════════════════════════════
with st.expander("🅖  Career Comparison Matrix & Stakeholder Insights", expanded=False):
    cs_all = career_stats(dff)
    display_cols = {
        "career":"Career","n":"Populasi",
        "avg_yr":"Avg Exp","med_yr":"Median Exp",
        "avg_skill":"Avg # Skill","avg_tool":"Avg # Tool",
        "avg_db":"Avg # DB","pct_bachelor":"% Bachelor+",
        "top_skill":"Skill Dominan",
    }
    st.dataframe(
        cs_all[list(display_cols.keys())].rename(columns=display_cols)
              .style.background_gradient(
                  cmap="Greens",
                  subset=["Avg Exp","Avg # Skill","Avg # Tool","Avg # DB","% Bachelor+"]
              ).format({
                  "Populasi":"{:,}", "Avg Exp":"{:.1f}",
                  "Median Exp":"{:.1f}", "Avg # Skill":"{:.1f}",
                  "Avg # Tool":"{:.1f}", "Avg # DB":"{:.1f}",
                  "% Bachelor+":"{:.1f}%",
              }),
        use_container_width=True, hide_index=True, height=620,
    )

    # Bubble chart
    fig = px.scatter(cs_all, x="avg_yr", y="avg_skill",
                     size="n", color="avg_tool",
                     text="career",
                     color_continuous_scale="Viridis",
                     size_max=55,
                     labels={"avg_yr":"Avg Experience (yr)",
                              "avg_skill":"Avg # Skills",
                              "avg_tool":"Avg # Tools"})
    fig.update_traces(textposition="top center", textfont_size=9)
    fig.update_layout(**BASE,
        title="Bubble: Pengalaman × Skill (ukuran = populasi, warna = avg tools)",
        height=540)
    st.plotly_chart(fig, use_container_width=True)

    most_skill = cs_all.sort_values("avg_skill", ascending=False).iloc[0]
    most_tool  = cs_all.sort_values("avg_tool",  ascending=False).iloc[0]
    most_sen   = cs_all.sort_values("avg_yr",    ascending=False).iloc[0]
    easiest    = cs_all.sort_values("avg_yr",    ascending=True ).iloc[0]

    st.markdown(f"""
    <div class="ins">
    <b>👔 Insight untuk Recruiter:</b><br>
    • Career paling <i>skill-intensive</i>: <b>{most_skill["career"]}</b>
      ({most_skill["avg_skill"]:.1f} skill avg) — screen kandidat dengan skill breadth test.<br>
    • Career paling senior-heavy: <b>{most_sen["career"]}</b>
      (median {most_sen["med_yr"]:.0f} thn) — pertimbangkan kompensasi lebih tinggi.<br>
    <br>
    <b>🎓 Insight untuk Educator/Bootcamp:</b><br>
    • Track paling tool-heavy: <b>{most_tool["career"]}</b>
      ({most_tool["avg_tool"]:.1f} tools avg) — siapkan lab environment yang kaya tools.<br>
    • Track paling accessible: <b>{easiest["career"]}</b>
      (avg {easiest["avg_yr"]:.1f} thn) — cocok untuk program intensif 6–12 bulan.<br>
    <br>
    <b>👨‍🎓 Insight untuk Mahasiswa IT:</b><br>
    • Mulai dari career dengan experience rendah, bangun skill, lalu pivot ke role lebih senior.<br>
    • Bachelor degree sudah cukup untuk 95%+ posisi — fokus ke portfolio & skill praktis.
    </div>
    """, unsafe_allow_html=True)

st.divider()
st.caption("➡️ Lanjut ke halaman **Visualisasi** untuk eksplorasi interaktif per karir, "
           "atau **Prediksi** untuk rekomendasi karir personal.")
