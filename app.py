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
        position: relative;
        overflow: hidden;
        background:
          radial-gradient(circle at 100% 0%, rgba(201,167,106,.13), transparent 34%),
          linear-gradient(135deg, rgba(255,255,255,.075), rgba(255,255,255,.025));
        border: 1px solid rgba(218,184,121,.42);
        border-radius: 22px;
        padding: clamp(1.35rem, 5vw, 2.5rem);
        box-shadow: 0 22px 60px rgba(0,0,0,.24), inset 0 1px 0 rgba(255,255,255,.07);
    }
    .intro-kicker {
        display: flex;
        align-items: center;
        gap: .65rem;
        color: #d7b879;
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .19em;
        text-transform: uppercase;
        margin-bottom: 1rem;
    }
    .intro-kicker:after {
        content: "";
        display: block;
        width: 42px;
        height: 1px;
        background: linear-gradient(90deg, #d7b879, transparent);
    }
    .intro-heading {
        color: #fff5df;
        font-family: Georgia, serif;
        font-size: clamp(1.7rem, 4.8vw, 2.35rem);
        font-weight: 500;
        line-height: 1.2;
        letter-spacing: -.025em;
        max-width: 680px;
        margin-bottom: 1.35rem;
    }
    .intro-lead {
        color: #e7d7b7;
        font-size: 1.07rem;
        line-height: 1.85;
        border-left: 2px solid #c9a76a;
        padding-left: 1rem;
        margin: 0 0 1.25rem 0;
    }
    .intro-card p {
        color: #d8e2dc;
        line-height: 1.85;
        font-size: .98rem;
        margin-bottom: 1rem;
    }
    .intro-pillars {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: .65rem;
        margin: 1.5rem 0 1.35rem;
    }
    .intro-pillar {
        background: rgba(8,25,24,.48);
        border: 1px solid rgba(201,167,106,.2);
        border-radius: 12px;
        padding: .85rem .8rem;
        color: #e8d6b3;
        font-size: .82rem;
        line-height: 1.45;
        text-align: center;
    }
    .intro-pillar strong {
        display: block;
        color: #f2d59b;
        font-size: .88rem;
        margin-bottom: .25rem;
    }
    .intro-statement {
        border-top: 1px solid rgba(201,167,106,.25);
        padding-top: 1.1rem;
        margin-top: 1.2rem;
        color: #f1e6d0;
        font-size: 1rem;
        line-height: 1.8;
    }
    .intro-statement strong { color: #e7c786; }
    @media (max-width: 560px) {
        .intro-pillars { grid-template-columns: 1fr; }
        .intro-pillar { text-align: left; }
    }
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
      <div class="intro-kicker">Our perspective</div>
      <div class="intro-heading">Building clarity in a rapidly evolving trading world.</div>
      <p class="intro-lead">
        Financial markets are expanding, participation is broadening, and the value
        of informed, disciplined decision-making has never been more important.
      </p>
      <p>
        Across the globe, the trading ecosystem brings together individual investors,
        retail traders, financial institutions, Foreign Institutional Investors (FIIs),
        Domestic Institutional Investors (DIIs), and banks. This growing participation
        is creating an increasing need for practical market knowledge and stronger
        analytical skills.
      </p>
      <p>
        Financial education plays an important role in building awareness and
        understanding. In India, the Securities and Exchange Board of India (SEBI)
        works to protect investors' interests and support a fair, transparent
        securities market.
      </p>
      <div class="intro-pillars">
        <div class="intro-pillar"><strong>Market Awareness</strong>Understand the evolving market landscape</div>
        <div class="intro-pillar"><strong>Disciplined Learning</strong>Build knowledge with a structured approach</div>
        <div class="intro-pillar"><strong>Data Analysis</strong>Develop stronger analytical capabilities</div>
      </div>
      <div class="intro-statement">
        At <strong>6thSense-Vardaan</strong>, our focus is to help traders become more
        efficient in market data analysis through dedicated workshops—encouraging
        a more informed, thoughtful, and disciplined approach to the markets.
      </div>
    </section>
    """,
    unsafe_allow_html=True,
)

st.markdown(
    '<div class="coming-soon">Client entry form will be added here next.</div>',
    unsafe_allow_html=True,
)
