import streamlit as st

st.set_page_config(
    page_title="6thSense-Vardaan | Client Entry",
    page_icon="🌼",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# The same botanical flower mark used above the Signal repository heading.
FLOWER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<path d="M60 58 C43 43 43 24 60 8 C77 24 77 43 60 58Z"/>
<path d="M55 58 C34 51 22 35 27 20 C43 26 54 40 55 58Z"/>
<path d="M65 58 C86 51 98 35 93 20 C77 26 66 40 65 58Z"/>
<path d="M49 59 C30 60 16 52 10 40 C28 38 43 45 49 59Z"/>
<path d="M71 59 C90 60 104 52 110 40 C92 38 77 45 71 59Z"/>
<path d="M34 64 Q60 69 86 64"/>
</svg>"""

st.markdown(
    """
    <style>
    #MainMenu, footer, header {visibility: hidden;}
    [data-testid="stAppViewContainer"] {
        background:
          radial-gradient(circle at 50% 0%, rgba(39, 120, 94, .20), transparent 38%),
          linear-gradient(145deg, #071b1a 0%, #0b2522 52%, #101d27 100%);
        color: #f4f5ed;
    }
    [data-testid="stMainBlockContainer"] {
        max-width: 860px;
        padding-top: 2.2rem;
        padding-bottom: 3rem;
    }
    .brand-flower {
        width: 76px;
        height: 52px;
        margin: 0 auto 8px auto;
        color: #c9a76a;
    }
    .brand-flower svg { width: 100%; height: 100%; }
    .welcome {
        text-align: center;
        color: #d9c79f;
        font-size: .95rem;
        letter-spacing: .20em;
        text-transform: uppercase;
        margin-bottom: .25rem;
    }
    .brand-title {
        text-align: center;
        color: #f7f0df;
        font-size: clamp(1.45rem, 6vw, 3.2rem);
        font-weight: 700;
        letter-spacing: .015em;
        white-space: nowrap;
        margin: 0 0 .35rem 0;
    }
    .brand-subtitle {
        text-align: center;
        color: #b8c8bd;
        font-size: 1rem;
        margin-bottom: 2rem;
    }
    .intro-card {
        background: rgba(255,255,255,.055);
        border: 1px solid rgba(201,167,106,.32);
        border-radius: 18px;
        padding: clamp(1.2rem, 4vw, 2rem);
        box-shadow: 0 16px 42px rgba(0,0,0,.18);
    }
    .intro-heading {
        color: #e4c58b;
        font-size: 1.3rem;
        font-weight: 650;
        margin-bottom: .9rem;
    }
    .intro-card p {
        color: #e5e9e2;
        line-height: 1.8;
        font-size: 1rem;
        margin-bottom: .9rem;
    }
    .intro-card p:last-child { margin-bottom: 0; }
    .coming-soon {
        color: #c9d6cd;
        text-align: center;
        font-size: .9rem;
        margin-top: 1.7rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    f'<div class="brand-flower">{FLOWER_SVG}</div>'
    '<div class="welcome">Welcome to</div>'
    '<h1 class="brand-title">6thSense-Vardaan</h1>'
    '<div class="brand-subtitle">Trading Education · Data Analysis · Workshops</div>',
    unsafe_allow_html=True,
)

st.markdown(
    """
    <section class="intro-card">
      <div class="intro-heading">Introduction to the Trading Industry</div>
      <p>
        The trading industry is growing rapidly across the globe. More investors,
        trading institutions, retail traders, Foreign Institutional Investors (FIIs),
        Domestic Institutional Investors (DIIs), and banks are entering this field.
      </p>
      <p>
        Educational institutions have also started offering courses to create
        awareness and build knowledge in the trading field. In addition, SEBI works
        to protect investors' rights and promote a fair securities market.
      </p>
      <p>
        Therefore, mastering the right skills is essential for developing a
        disciplined approach and achieving a more informed trading experience.
      </p>
      <p>
        <strong>6thSense-Vardaan</strong> helps traders become more efficient in
        data analysis through its workshops.
      </p>
    </section>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    '<div class="coming-soon">Client entry form will be added here next.</div>',
    unsafe_allow_html=True,
)
