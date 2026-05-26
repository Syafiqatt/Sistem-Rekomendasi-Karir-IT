"""
Chart builders, global CSS, dan scoring function.
"""
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go

# ─── PALETTE ──────────────────────────────────────────────────────────────────
P = [
    "#1D9E75", "#5DCAA5", "#2E86AB", "#F18F01", "#C73E1D",
    "#A23B72", "#6A4C93", "#264653", "#8AB17D", "#E9C46A",
    "#F77F00", "#386641", "#BC4749", "#287271", "#0A9396",
    "#94D2BD", "#EE9B00", "#BB3E03", "#9B2226",
]

BASE = dict(
    font=dict(family="'DM Sans', 'Segoe UI', sans-serif", size=12, color="#1A2B24"),
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    margin=dict(l=8, r=8, t=48, b=8),
    title_font=dict(size=14, color="#1A2B24"),
)

# ─── GLOBAL CSS ───────────────────────────────────────────────────────────────
CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600&display=swap');

html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif;
    color: #1A2B24;
}

/* Hero banner */
.hero {
    background: linear-gradient(135deg, #0D2B1E 0%, #1D9E75 60%, #5DCAA5 100%);
    border-radius: 16px;
    padding: 2.8rem 2.5rem 2.2rem;
    color: white;
    margin-bottom: 1.8rem;
    position: relative;
    overflow: hidden;
}
.hero::before {
    content: '';
    position: absolute; top: -40px; right: -40px;
    width: 260px; height: 260px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
}
.hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem; margin: 0 0 .6rem;
    color: white; text-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.hero p { font-size: 1.05rem; opacity: .92; margin: 0; }

/* KPI cards */
.kpi { border-radius: 12px; padding: 1.3rem 1rem; text-align: center; color: white; }
.kpi-g  { background: linear-gradient(135deg, #1D9E75, #5DCAA5); }
.kpi-b  { background: linear-gradient(135deg, #2E86AB, #0A9396); }
.kpi-o  { background: linear-gradient(135deg, #F18F01, #EE9B00); }
.kpi-r  { background: linear-gradient(135deg, #C73E1D, #BB3E03); }
.kpi-p  { background: linear-gradient(135deg, #6A4C93, #A23B72); }
.kpi-d  { background: linear-gradient(135deg, #264653, #2E86AB); }
.kpi-v  { font-size: 2rem; font-weight: 700; margin: 0; line-height: 1.1; }
.kpi-l  { font-size: .78rem; opacity: .92; margin: .25rem 0 0; }

/* Insight strip */
.ins {
    background: #E8F5EF; border-left: 4px solid #1D9E75;
    padding: .85rem 1.1rem; border-radius: 0 8px 8px 0;
    margin: .45rem 0; font-size: .9rem; line-height: 1.55;
}
.ins.warn { background: #FFF3E0; border-color: #F18F01; }
.ins.info { background: #E3F2FD; border-color: #2E86AB; }
.ins.danger { background: #FDECEA; border-color: #C73E1D; }

/* Section header */
.sec-hd {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem; font-weight: 700; color: #0D2B1E;
    border-bottom: 3px solid #1D9E75; padding-bottom: .4rem;
    margin: 1.6rem 0 .8rem;
}

/* Career badge */
.badge {
    display: inline-block; padding: .2rem .65rem; border-radius: 20px;
    font-size: .75rem; font-weight: 600; margin: .15rem;
}
.badge-g { background: #D4F1E4; color: #1D9E75; }
.badge-o { background: #FFF3E0; color: #F18F01; }
.badge-r { background: #FDECEA; color: #C73E1D; }
</style>
"""


# ─── CHART BUILDERS ───────────────────────────────────────────────────────────
def hbar(df, x, y, title="", color_scale="Greens", h=None, text_suffix=""):
    fig = px.bar(df, x=x, y=y, orientation="h",
                 text=x, color=x, color_continuous_scale=color_scale)
    fig.update_traces(
        texttemplate=f"%{{text:,}}{text_suffix}",
        textposition="outside",
        cliponaxis=False,
    )
    fig.update_layout(
        **BASE, title=title, showlegend=False,
        coloraxis_showscale=False,
        yaxis={"categoryorder": "total ascending"},
        xaxis_title="", yaxis_title="",
        height=h or max(320, 22 * len(df) + 100),
    )
    return fig


def donut(df, names, values, title="", h=400):
    fig = px.pie(df, names=names, values=values, hole=.52,
                 color_discrete_sequence=P)
    fig.update_traces(textposition="inside", textinfo="percent+label",
                      textfont_size=10)
    fig.update_layout(**BASE, title=title, height=h, showlegend=False)
    return fig


def heatmap(z_df, title="", colorscale="YlGnBu", fmt=".0f", h=None):
    fig = go.Figure(go.Heatmap(
        z=z_df.values, x=z_df.columns, y=z_df.index,
        colorscale=colorscale,
        text=z_df.values, texttemplate=f"%{{text:{fmt}}}",
        textfont={"size": 9},
        hoverongaps=False,
        colorbar=dict(tickfont=dict(size=9)),
    ))
    fig.update_layout(
        **BASE, title=title, xaxis_tickangle=-38,
        height=h or max(500, 24 * len(z_df) + 140),
    )
    return fig


def box_career(df, order=None):
    fig = go.Figure()
    for i, car in enumerate(order or sorted(df["career_label"].unique())):
        d = df[df["career_label"] == car]["years_code"]
        fig.add_trace(go.Box(
            x=d, name=car, orientation="h",
            marker_color=P[i % len(P)],
            boxmean="sd", showlegend=False, boxpoints=False, 
        ))
    fig.update_layout(**BASE,
        title="Distribusi Pengalaman per Career Path",
        xaxis_title="Years of Coding", yaxis_title="",
        height=620)
    return fig


def scatter_exp_skill(df, n=4000):
    s = df.sample(min(n, len(df)), random_state=7)
    z = np.polyfit(s["years_code"], s["num_skills"], 1)
    xl = np.linspace(s["years_code"].min(), s["years_code"].max(), 80)
    fig = px.scatter(s, x="years_code", y="num_skills",
                     color="cohort",
                     color_discrete_sequence=P, opacity=.45)
    fig.add_trace(go.Scatter(
        x=xl, y=z[0]*xl+z[1], mode="lines",
        name=f"Tren (slope={z[0]:.4f})",
        line=dict(color="#C73E1D", width=2.5, dash="dot"),
    ))
    fig.update_layout(**BASE,
        title=f"Pengalaman vs Jumlah Skill  (r={np.corrcoef(s['years_code'],s['num_skills'])[0,1]:.3f})",
        xaxis_title="Years of Coding", yaxis_title="# Skill",
        height=460, legend=dict(font=dict(size=9)))
    return fig


def radar_career(df, careers, dims=None):
    if dims is None:
        dims = ["avg_yr","avg_skill","avg_tool","avg_db","pct_bachelor"]
    from utils.data_loader import career_stats
    cs = career_stats(df).set_index("career")
    # normalise 0-100
    mn = cs[dims].min(); mx = cs[dims].max()
    norm = (cs[dims] - mn) / (mx - mn + 1e-9) * 100
    labels = ["Pengalaman","# Skill","# Tool","# DB","% Bachelor+"]
    fig = go.Figure()
    for i, car in enumerate(careers):
        if car not in norm.index: continue
        vals = norm.loc[car, dims].tolist()
        vals += [vals[0]]  # close
        
        # Get color untuk line
        line_color = P[i % len(P)]
        
        # Convert hex to rgba dengan opacity 0.2 untuk fill
        # Format: #RRGGBB → rgba(R,G,B,0.2)
        hex_color = line_color.lstrip('#')
        r = int(hex_color[0:2], 16)
        g = int(hex_color[2:4], 16)
        b = int(hex_color[4:6], 16)
        fill_color = f'rgba({r},{g},{b},0.2)'
        
        fig.add_trace(go.Scatterpolar(
            r=vals, theta=labels+[labels[0]],
            fill="toself", name=car,
            line=dict(color=line_color, width=2),
            fillcolor=fill_color,
        ))
    fig.update_layout(
        **BASE, title="Radar Profil Career (dinormalisasi 0-100)",
        polar=dict(radialaxis=dict(visible=True, range=[0,100],
                                   tickfont=dict(size=8))),
        height=460,
    )
    return fig


def stacked_cohort(df):
    order = ["0-2 yr (Entry)","2-5 yr (Junior)","5-10 yr (Mid)",
             "10-20 yr (Senior)","20+ yr (Lead)"]
    colors = {"0-2 yr (Entry)":"#5DCAA5","2-5 yr (Junior)":"#1D9E75",
               "5-10 yr (Mid)":"#2E86AB","10-20 yr (Senior)":"#A23B72",
               "20+ yr (Lead)":"#C73E1D"}
    ct = pd.crosstab(df["career_label"], df["cohort"], normalize="index")*100
    ct = ct.reindex(columns=[c for c in order if c in ct.columns])
    sort_col = "10-20 yr (Senior)" if "10-20 yr (Senior)" in ct.columns else ct.columns[0]
    ct = ct.sort_values(sort_col)
    fig = go.Figure()
    for c in ct.columns:
        fig.add_trace(go.Bar(
            y=ct.index, x=ct[c], name=c, orientation="h",
            marker_color=colors.get(c,"#999"),
            hovertemplate=f"{c}: %{{x:.1f}}%<extra></extra>",
        ))
    fig.update_layout(**BASE, barmode="stack",
        title="Komposisi Cohort per Career (%)",
        xaxis_title="%", yaxis_title="", height=560)
    return fig


# ─── SCORING ──────────────────────────────────────────────────────────────────
def score_all(user_sk, user_tl, user_db, years, edu, profiles,
              w=(0.55, 0.20, 0.10, 0.10, 0.05)):
    ws, wt, wd, wy, we = w
    rows = []
    for car, p in profiles.items():
        sk = np.mean([p["skills"].get(s,0) for s in user_sk])*100 if user_sk else 0
        tl = np.mean([p["tools"].get(t,0) for t in user_tl])*100  if user_tl else 0
        db = np.mean([p["db"].get(d,0) for d in user_db])*100      if user_db else 0
        yr = max(0, 100 - abs(years - p["med_yr"]) / 30 * 100)
        ed = max(0, 100 - abs(edu   - p["med_edu"]) /  6 * 100)
        tot = ws*sk + wt*tl + wd*db + wy*yr + we*ed
        rows.append({"career":car,"total":tot,"skill":sk,"tool":tl,
                     "db":db,"exp":yr,"edu":ed})
    return pd.DataFrame(rows).sort_values("total", ascending=False).reset_index(drop=True)
