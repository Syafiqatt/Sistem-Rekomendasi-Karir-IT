"""PAGE 3 — VISUALISASI INTERAKTIF"""
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from utils.data_loader import (load_data, career_top_skills,
                                heatmap_career_skills, career_stats, top_items)
from utils.functions import CSS, P, BASE, hbar, heatmap, radar_career

st.set_page_config(page_title="Visualisasi", page_icon="📈", layout="wide")
st.markdown(CSS, unsafe_allow_html=True)

df = load_data()
careers_all = sorted(df["career_label"].unique().tolist())

st.markdown('<div class="sec-hd">📈 Visualisasi Interaktif</div>', unsafe_allow_html=True)
st.caption("Deep-dive per career path, heatmap, radar, dan analisis transisi karir.")

tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🎯 Deep Dive per Career",
    "🌡️ Skill × Career Heatmap",
    "📡 Radar Profil",
    "🔄 Transisi Karir",
    "📊 Custom Explorer",
])

# ═══════════════════════════════════════════════
# TAB 1 — DEEP DIVE
# ═══════════════════════════════════════════════
with tab1:
    selected = st.selectbox("Pilih career path", careers_all, key="dd")
    grp = df[df["career_label"] == selected]

    k1,k2,k3,k4,k5 = st.columns(5)
    k1.metric("Populasi", f"{len(grp):,}")
    k2.metric("Avg Pengalaman", f"{grp['years_code'].mean():.1f} thn")
    k3.metric("Median Skill", int(grp["num_skills"].median()))
    k4.metric("Median Tools", int(grp["num_tools"].median()))
    k5.metric("% Bachelor+", f"{(grp['education_level']>=2).mean()*100:.1f}%")

    st.divider()

    c1,c2,c3 = st.columns(3)
    for col, (col_name, label, cscale) in zip(
        [c1,c2,c3],
        [("skills_list","💻 Top 15 Skills","Greens"),
         ("tools_list", "🛠️ Top 10 Tools", "Blues"),
         ("db_list",    "🗄️ Top 10 DB",    "Purples")]
    ):
        with col:
            t = career_top_skills(df, selected, col_name,
                                  n=15 if "skill" in col_name else 10)
            if not t.empty:
                fig = hbar(t, "pct", "item",
                           f"{label} — {selected}",
                           color_scale=cscale, text_suffix="%")
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("Tidak ada data.")

    # Histogram exp + Donut edu side by side
    d1,d2 = st.columns(2)
    with d1:
        fig = px.histogram(grp, x="years_code", nbins=30,
                           color_discrete_sequence=["#1D9E75"], opacity=.82)
        fig.add_vline(x=grp["years_code"].mean(), line_dash="dash", line_color="#C73E1D",
                      annotation_text=f"Mean {grp['years_code'].mean():.1f}")
        fig.update_layout(**BASE, title="Distribusi Pengalaman", height=340,
                          xaxis_title="Years", yaxis_title="")
        st.plotly_chart(fig, use_container_width=True)
    with d2:
        edu = grp["edu_label"].value_counts().reset_index()
        edu.columns = ["edu","n"]
        fig = px.pie(edu, names="edu", values="n", hole=.5,
                     color_discrete_sequence=P)
        fig.update_traces(textposition="inside", textinfo="percent+label")
        fig.update_layout(**BASE, title="Komposisi Pendidikan", height=340,
                          showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

    # Auto-insight
    top3 = career_top_skills(df, selected, "skills_list", 3)["item"].tolist()
    cohort_mode = grp["cohort"].mode().values[0] if not grp["cohort"].mode().empty else "-"
    st.markdown(
        f'<div class="ins">📊 <b>Profil {selected}:</b> Skill esensial yang wajib dikuasai: '
        f'<b>{", ".join(top3)}</b>. Cohort paling banyak: <b>{cohort_mode}</b>. '
        f'Rata-rata {grp["num_skills"].mean():.1f} skill, '
        f'{grp["num_tools"].mean():.1f} tools, '
        f'{grp["num_db"].mean():.1f} databases per developer.</div>',
        unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# TAB 2 — HEATMAP SKILL × CAREER
# ═══════════════════════════════════════════════
with tab2:
    n_h = st.slider("Top N skill", 10, 30, 22, key="hm")
    hm = heatmap_career_skills(df, top_n=n_h)

    fig = go.Figure(go.Heatmap(
        z=hm.values, x=hm.columns, y=hm.index,
        colorscale="YlGnBu",
        text=hm.values, texttemplate="%{text:.0f}",
        textfont={"size": 8},
        colorbar=dict(title="%", tickfont=dict(size=9)),
    ))
    fig.update_layout(**BASE,
        title=f"Heatmap Adopsi Top-{n_h} Skill per Career Path (%)",
        xaxis_tickangle=-40, height=720)
    st.plotly_chart(fig, use_container_width=True)

    st.markdown(
        '<div class="ins">💡 <b>Cara baca:</b> Warna gelap = adopsi tinggi. '
        'Kolom gelap vertikal = skill yang dipakai lintas semua career (Python, SQL). '
        'Cell terang isolated = skill signature spesifik satu career. '
        'Gunakan ini untuk menentukan <b>must-have</b> vs <b>nice-to-have</b> skills.</div>',
        unsafe_allow_html=True)

    # Download heatmap sebagai CSV
    st.download_button(
        "⬇️ Download Heatmap sebagai CSV",
        hm.to_csv().encode(),
        "heatmap_career_skills.csv",
        "text/csv",
    )

# ═══════════════════════════════════════════════
# TAB 3 — RADAR
# ═══════════════════════════════════════════════
with tab3:
    sel_r = st.multiselect(
        "Pilih career untuk dibandingkan (maks 6)",
        careers_all,
        default=careers_all[:5],
        max_selections=6,
        key="radar_sel",
    )
    if sel_r:
        try:
            st.plotly_chart(radar_career(df, sel_r), use_container_width=True)
        except Exception as e:
            st.error(f"Error: {e}")
    else:
        st.info("Pilih minimal 1 career.")

# ═══════════════════════════════════════════════
# TAB 4 — TRANSISI KARIR
# ═══════════════════════════════════════════════
with tab4:
    st.markdown("Analisis **kemudahan transisi** antara dua jalur karir berdasarkan "
                "skill overlap dan Jaccard similarity.")

    ca, cb = st.columns(2)
    car_a = ca.selectbox("Career A (asal)", careers_all, index=0, key="trans_a")
    car_b = cb.selectbox("Career B (target)", careers_all, index=2, key="trans_b")

    if car_a == car_b:
        st.warning("Pilih dua career berbeda.")
    else:
        gA = df[df["career_label"]==car_a]
        gB = df[df["career_label"]==car_b]

        skA_set = set(career_top_skills(df, car_a, "skills_list", 50)["item"])
        skB_set = set(career_top_skills(df, car_b, "skills_list", 50)["item"])
        jaccard  = len(skA_set & skB_set) / len(skA_set | skB_set) * 100 if (skA_set|skB_set) else 0

        j1,j2,j3,j4 = st.columns(4)
        j1.metric("Jaccard Similarity", f"{jaccard:.1f}%")
        j2.metric("Shared Skills (top-50)", len(skA_set & skB_set))
        j3.metric(f"Unique to {car_a}", len(skA_set - skB_set))
        j4.metric(f"Unique to {car_b}", len(skB_set - skA_set))

        # Gauge
        # Ganti gauge dengan bar chart yang lebih reliable
        fig = go.Figure()
        fig.add_trace(go.Bar(
            x=[jaccard],
            y=["Similarity"],
            orientation="h",
            marker_color="#1D9E75",
            text=f"{jaccard:.1f}%",
            textposition="auto",
        ))
        fig.update_layout(**BASE, 
            title="Kemudahan Transisi",
            xaxis_title="Jaccard Similarity (%)",
            height=150)
        st.plotly_chart(fig, use_container_width=True)

        # Skill yang perlu dipelajari
        need_learn = skB_set - skA_set
        t_b = career_top_skills(df, car_b, "skills_list", 30)
        needed_df = t_b[t_b["item"].isin(need_learn)].head(12)

        # Grouped bar: shared skills
        shared = skA_set & skB_set
        t_a = career_top_skills(df, car_a, "skills_list", 30)
        merged = pd.merge(
            t_a[t_a["item"].isin(shared)][["item","pct"]].rename(columns={"pct":car_a}),
            t_b[t_b["item"].isin(shared)][["item","pct"]].rename(columns={"pct":car_b}),
            on="item"
        ).sort_values(car_b, ascending=False).head(15)

        ov1, ov2 = st.columns(2)
        with ov1:
            if not merged.empty:
                melt = merged.melt(id_vars="item", var_name="career", value_name="pct")
                fig = px.bar(melt, x="pct", y="item", color="career",
                             barmode="group", orientation="h",
                             color_discrete_map={car_a:P[0], car_b:P[3]})
                fig.update_layout(**BASE,
                    title=f"Shared Skills: {car_a} vs {car_b}",
                    xaxis_title="% adopsi", yaxis_title="",
                    yaxis={"categoryorder":"total ascending"},
                    height=480)
                st.plotly_chart(fig, use_container_width=True)

        with ov2:
            if not needed_df.empty:
                st.markdown(f"**📚 Skill yang perlu dipelajari untuk {car_b}:**")
                st.dataframe(needed_df.rename(columns={
                    "item":"Skill Baru",
                    "count":"# Dev di B",
                    "pct":f"% di {car_b}",
                }), hide_index=True, use_container_width=True)
            # Estimasi waktu
            n_new = len(needed_df)
            wks = n_new * 3
            st.markdown(
                f'<div class="ins">⏱️ Estimasi waktu transisi: '
                f'sekitar <b>{wks}–{wks+12} minggu</b> belajar intensif '
                f'untuk {n_new} skill baru yang perlu dikuasai.</div>',
                unsafe_allow_html=True)

# ═══════════════════════════════════════════════
# TAB 5 — CUSTOM EXPLORER
# ═══════════════════════════════════════════════
with tab5:
    st.markdown("Buat scatter plot sendiri dari kombinasi variabel numerik.")
    cx1,cx2,cx3 = st.columns(3)
    x_var = cx1.selectbox("Sumbu X", ["years_code","education_level",
                                       "num_skills","num_tools","num_db"], index=0)
    y_var = cx2.selectbox("Sumbu Y", ["num_skills","years_code","education_level",
                                       "num_tools","num_db"], index=0)
    color_by = cx3.selectbox("Warna", ["career_label","cohort","edu_label"], index=0)

    sel_c = st.multiselect("Filter career", careers_all, default=careers_all[:6])

    if sel_c:
        if x_var != y_var:
            try:
                sub = df[df["career_label"].isin(sel_c)].sample(
                    min(6000, len(df[df["career_label"].isin(sel_c)])), random_state=1)
                fig = px.scatter(sub, x=x_var, y=y_var, color=color_by,
                                color_discrete_sequence=P, opacity=.48, height=560)
                fig.update_layout(**BASE, title=f"{x_var} vs {y_var}")
                st.plotly_chart(fig, use_container_width=True)
                r = df[[x_var,y_var]].corr().iloc[0,1]
                st.metric(f"Korelasi {x_var} ↔ {y_var}", f"r = {r:.3f}")
            except Exception as e:
                st.error(f"Error: {e}")
        else:
            st.warning("Pilih X dan Y yang berbeda.")
    else:
        st.warning("Pilih minimal 1 career.")
