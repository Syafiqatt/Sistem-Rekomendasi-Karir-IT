"""
Data loader — dimuat sekali, di-cache untuk semua page.
"""
import pandas as pd
import numpy as np
import streamlit as st
from collections import Counter
from pathlib import Path

DATA_PATH = Path(__file__).parent.parent.parent / "Data Wrangling" / "dataset_so_smote_balanced_injected.csv"

# Verifikasi file ada
if not DATA_PATH.exists():
    raise FileNotFoundError(
        f"[ERROR] File tidak ditemukan: {DATA_PATH}\n"
        f"Pastikan dataset_so_smote_balanced_injected.csv sudah di lokasi yang benar.\n"
        f"Path yang dicari: {DATA_PATH.absolute()}"
    )
else:
    print(f"[OK] Dataset ditemukan: {DATA_PATH.absolute()}")

EDU_MAP = {
    0.0: "None/Self-taught",
    1.0: "High School",
    2.0: "Bachelor",
    3.0: "Master",
    4.0: "PhD",
    5.0: "Diploma",
    6.0: "Bootcamp/Other",
}

COHORT_ORDER = [
    "0-2 yr (Entry)", "2-5 yr (Junior)",
    "5-10 yr (Mid)", "10-20 yr (Senior)", "20+ yr (Lead)"
]


def _split(s):
    if pd.isna(s) or str(s).strip() == "":
        return []
    return [x.strip().lower() for x in str(s).split(";") if x.strip()]


def _cohort(y):
    if pd.isna(y): return "Unknown"
    if y < 2:   return "0-2 yr (Entry)"
    if y < 5:   return "2-5 yr (Junior)"
    if y < 10:  return "5-10 yr (Mid)"
    if y < 20:  return "10-20 yr (Senior)"
    return "20+ yr (Lead)"


@st.cache_data(show_spinner="⚙️ Memuat dataset...")
def load_data() -> pd.DataFrame:
    df = pd.read_csv(DATA_PATH)
    df["skills_list"] = df["all_skills"].apply(_split)
    df["tools_list"]  = df["tools"].apply(_split)
    df["db_list"]     = df["databases"].apply(_split)
    df["num_skills"]  = df["skills_list"].apply(len)
    df["num_tools"]   = df["tools_list"].apply(len)
    df["num_db"]      = df["db_list"].apply(len)
    df["edu_label"]   = df["education_level"].map(EDU_MAP).fillna("Unknown")
    df["cohort"]      = df["years_code"].apply(_cohort)
    return df


@st.cache_data
def kpi(df):
    return {
        "N":           len(df),
        "n_career":    df["career_label"].nunique(),
        "n_skills":    len({s for L in df["skills_list"] for s in L}),
        "n_tools":     len({t for L in df["tools_list"]  for t in L}),
        "n_db":        len({d for L in df["db_list"]     for d in L}),
        "avg_yr":      round(df["years_code"].mean(), 1),
        "med_yr":      round(df["years_code"].median(), 1),
        "avg_skill":   round(df["num_skills"].mean(), 1),
        "imbalance":   round(df["career_label"].value_counts().max() /
                             df["career_label"].value_counts().min(), 3),
    }


@st.cache_data
def top_items(df, col, n=20):
    c = Counter(s for L in df[col] for s in set(L))
    rows = c.most_common(n)
    return pd.DataFrame(rows, columns=["item", "count"])


@st.cache_data
def career_top_skills(df, career, col="skills_list", n=15):
    g = df[df["career_label"] == career]
    c = Counter(s for L in g[col] for s in set(L))
    out = pd.DataFrame(c.most_common(n), columns=["item", "count"])
    if len(g): out["pct"] = (out["count"] / len(g) * 100).round(1)
    return out


@st.cache_data
def heatmap_career_skills(df, top_n=22):
    tops = top_items(df, "skills_list", top_n)["item"].tolist()
    careers = sorted(df["career_label"].unique())
    mat = {}
    for car in careers:
        g = df[df["career_label"] == car]
        mat[car] = {sk: g["skills_list"].apply(lambda L: sk in L).mean() * 100 for sk in tops}
    return pd.DataFrame(mat, index=tops).T  # career × skill


@st.cache_data
def career_stats(df):
    rows = []
    for car, g in df.groupby("career_label"):
        all_sk = Counter(s for L in g["skills_list"] for s in set(L))
        rows.append({
            "career":        car,
            "n":             len(g),
            "avg_yr":        round(g["years_code"].mean(), 1),
            "med_yr":        round(g["years_code"].median(), 1),
            "avg_skill":     round(g["num_skills"].mean(), 1),
            "avg_tool":      round(g["num_tools"].mean(), 1),
            "avg_db":        round(g["num_db"].mean(), 1),
            "pct_bachelor":  round((g["education_level"] >= 2).mean() * 100, 1),
            "top_skill":     all_sk.most_common(1)[0][0] if all_sk else "-",
        })
    return pd.DataFrame(rows).sort_values("avg_yr", ascending=False)


@st.cache_data
def cooccurrence(df, top_n=14):
    from itertools import combinations
    tops = top_items(df, "skills_list", top_n)["item"].tolist()
    top_set = set(tops)
    co = pd.DataFrame(0, index=tops, columns=tops, dtype=np.int32)
    for L in df["skills_list"]:
        sk = set(L) & top_set
        for a, b in combinations(sk, 2):
            co.loc[a, b] += 1
            co.loc[b, a] += 1
    return co


@st.cache_data
def build_profiles(df):
    """Profil probabilistik per career (untuk scoring rekomendasi)."""
    profiles = {}
    for car, g in df.groupby("career_label"):
        n = len(g)
        sk = Counter(s for L in g["skills_list"] for s in set(L))
        tl = Counter(t for L in g["tools_list"]  for t in set(L))
        db = Counter(d for L in g["db_list"]      for d in set(L))
        profiles[car] = {
            "n":          n,
            "skills":     {k: v/n for k, v in sk.items()},
            "tools":      {k: v/n for k, v in tl.items()},
            "db":         {k: v/n for k, v in db.items()},
            "med_yr":     g["years_code"].median(),
            "med_edu":    g["education_level"].median(),
        }
    return profiles
