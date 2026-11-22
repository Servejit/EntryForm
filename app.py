import html
import re
import requests
import streamlit as st

st.set_page_config(
    page_title="6thSense-Vardaan | Client Entry",
    page_icon="🌼",
    layout="centered",
    initial_sidebar_state="collapsed",
)

FLOWER_SVG = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 72" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
<path d="M60 58 C43 43 43 24 60 8 C77 24 77 43 60 58Z"/>
<path d="M55 58 C34 51 22 35 27 20 C43 26 54 40 55 58Z"/>
<path d="M65 58 C86 51 98 35 93 20 C77 26 66 40 65 58Z"/>
<path d="M49 59 C30 60 16 52 10 40 C28 38 43 45 49 59Z"/>
<path d="M71 59 C90 60 104 52 110 40 C92 38 77 45 71 59Z"/>
<path d="M34 64 Q60 69 86 64"/>
</svg>"""

@st.dialog("Congratulations!", width="small")
def show_trial_popup(username, password):
    safe_username = html.escape(str(username))
    safe_password = html.escape(str(password))
    st.markdown(
        f"""
        <div style="
            background:linear-gradient(145deg,#0b2923,#142d35);
            border:1px solid rgba(215,184,121,.65);
            border-radius:20px;padding:24px 20px;text-align:center;
            box-shadow:0 16px 45px rgba(0,0,0,.28);">
          <div style="font-size:38px;margin-bottom:8px;">🎉</div>
          <div style="color:#e9ce91;font-size:22px;font-weight:800;line-height:1.35;">
            Congratulations!
          </div>
          <div style="color:#f7f0df;font-size:17px;font-weight:700;margin:10px 0 18px;">
            You Have Unlocked 10-Days Trial Period
          </div>
          <div style="text-align:left;background:rgba(255,255,255,.07);
              border:1px solid rgba(215,184,121,.35);border-radius:12px;
              padding:13px 15px;margin:10px 0;">
            <div style="color:#d9c79f;font-size:12px;letter-spacing:1px;">USERNAME</div>
            <div style="color:#ffffff;font-size:18px;font-weight:750;overflow-wrap:anywhere;">
              {safe_username}
            </div>
          </div>
          <div style="text-align:left;background:rgba(255,255,255,.07);
              border:1px solid rgba(215,184,121,.35);border-radius:12px;
              padding:13px 15px;margin:10px 0 18px;">
            <div style="color:#d9c79f;font-size:12px;letter-spacing:1px;">PASSWORD</div>
            <div style="color:#ffffff;font-size:18px;font-weight:750;overflow-wrap:anywhere;">
              {safe_password}
            </div>
          </div>
          <div style="color:#cbd8d0;font-size:13px;margin-bottom:13px;">
            Your trial access is ready. Use the credentials above to continue.
          </div>
          <a href="https://6thsense-vardaan.streamlit.app/" target="_blank"
             style="display:block;text-decoration:none;background:linear-gradient(110deg,#e8d09c,#c39b5a);
             color:#14211d;font-weight:800;padding:13px 16px;border-radius:11px;">
             Open 6thSense-Vardaan
          </a>
        </div>
        """,
        unsafe_allow_html=True,
    )


st.markdown(
    """
    <style>
    #MainMenu, footer, header {visibility: hidden;}
    [data-testid="stAppViewContainer"] {
        background:
          radial-gradient(circle at 50% 0%, rgba(39,120,94,.20), transparent 38%),
          linear-gradient(145deg, #071b1a 0%, #0b2522 52%, #101d27 100%);
        color: #f4f5ed;
    }
    [data-testid="stMainBlockContainer"] {
        max-width: 860px;
        padding-top: 2.2rem;
        padding-bottom: 3rem;
    }
    .brand-flower { width:76px; height:52px; margin:0 auto 8px; color:#c9a76a; }
    .brand-flower svg { width:100%; height:100%; }
    .welcome {
        text-align:center; color:#d9c79f; font-size:.95rem;
        letter-spacing:.20em; text-transform:uppercase; margin-bottom:.25rem;
    }
    .brand-title {
        text-align:center; color:#f7f0df; font-size:clamp(1.45rem,6vw,3.2rem);
        font-weight:700; letter-spacing:.015em; white-space:nowrap; margin:0 0 .35rem;
    }
    .brand-subtitle { text-align:center; color:#b8c8bd; font-size:1rem; margin-bottom:2rem; }
    .intro-card, .form-card {
        position:relative; overflow:hidden;
        background:radial-gradient(circle at 100% 0%,rgba(201,167,106,.13),transparent 34%),
          linear-gradient(135deg,rgba(255,255,255,.075),rgba(255,255,255,.025));
        border:1px solid rgba(218,184,121,.42); border-radius:22px;
        padding:clamp(1.35rem,5vw,2.5rem);
        box-shadow:0 22px 60px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.07);
        margin-bottom:1.5rem;
    }
    .intro-kicker {
        display:flex; align-items:center; gap:.65rem; color:#d7b879;
        font-size:.72rem; font-weight:700; letter-spacing:.19em;
        text-transform:uppercase; margin-bottom:1rem;
    }
    .intro-kicker:after {
        content:""; display:block; width:42px; height:1px;
        background:linear-gradient(90deg,#d7b879,transparent);
    }
    .intro-heading {
        color:#fff5df; font-family:Georgia,serif;
        font-size:clamp(1.7rem,4.8vw,2.35rem); font-weight:500;
        line-height:1.2; letter-spacing:-.025em; max-width:680px; margin-bottom:1.35rem;
    }
    .intro-lead {
        color:#e7d7b7; font-size:1.07rem; line-height:1.85;
        border-left:2px solid #c9a76a; padding-left:1rem; margin:0 0 1.25rem;
    }
    .intro-card p { color:#d8e2dc; line-height:1.85; font-size:.98rem; margin-bottom:1rem; }
    .intro-pillars {
        display:grid; grid-template-columns:repeat(3,minmax(0,1fr));
        gap:.65rem; margin:1.5rem 0 1.35rem;
    }
    .intro-pillar {
        background:rgba(8,25,24,.48); border:1px solid rgba(201,167,106,.2);
        border-radius:12px; padding:.85rem .8rem; color:#e8d6b3;
        font-size:.82rem; line-height:1.45; text-align:center;
    }
    .intro-pillar strong { display:block; color:#f2d59b; font-size:.88rem; margin-bottom:.25rem; }
    .intro-statement {
        border-top:1px solid rgba(201,167,106,.25); padding-top:1.1rem;
        margin-top:1.2rem; color:#f1e6d0; font-size:1rem; line-height:1.8;
    }
    .intro-statement strong { color:#e7c786; }
    .section-kicker {
        color:#d7b879; font-size:.72rem; font-weight:800;
        letter-spacing:.18em; text-transform:uppercase; margin-bottom:.5rem;
    }
    .section-heading {
        color:#fff5df; font-family:Georgia,serif; font-size:clamp(1.6rem,4vw,2.1rem);
        line-height:1.2; margin:0 0 .55rem;
    }
    .section-copy { color:#cbd8d0; line-height:1.7; margin-bottom:1.1rem; }
    [data-testid="stWidgetLabel"] p, [data-testid="stMarkdownContainer"] p { color:#e5e7df; }
    [data-testid="stTextInput"] input, [data-testid="stTextArea"] textarea,
    [data-testid="stSelectbox"] [data-baseweb="select"] > div,
    [data-testid="stMultiSelect"] [data-baseweb="select"] > div {
        background:rgba(5,20,20,.72); color:#f7f0df;
        border:1px solid rgba(201,167,106,.34); border-radius:10px;
    }
    [data-testid="stTextInput"] input:focus, [data-testid="stTextArea"] textarea:focus {
        border-color:#d7b879; box-shadow:0 0 0 1px #d7b879;
    }
    [data-testid="stForm"] {
        border:1px solid rgba(201,167,106,.24); border-radius:16px;
        padding:1.1rem; background:rgba(4,17,18,.28);
    }
    [data-testid="stFormSubmitButton"] button {
        width:100%; border:1px solid #d7b879; border-radius:11px;
        color:#14211d; background:linear-gradient(110deg,#e8d09c,#c39b5a);
        font-weight:800; min-height:3rem;
    }
    [data-testid="stFormSubmitButton"] button:hover {
        color:#101d19; border-color:#f0dcae;
        background:linear-gradient(110deg,#f0dfb8,#d1ad70);
    }
    .submission-success {
        color:#dcfce7; background:linear-gradient(120deg,rgba(20,83,45,.62),rgba(22,101,52,.30));
        border:1px solid rgba(74,222,128,.58); border-left:5px solid #4ade80;
        border-radius:13px; padding:1rem 1.15rem; margin:.8rem 0;
        font-weight:750; line-height:1.65;
        box-shadow:0 10px 28px rgba(22,163,74,.12),inset 0 1px 0 rgba(220,252,231,.08);
    }
    .submission-error {
        color:#fee2e2; background:linear-gradient(120deg,rgba(127,29,29,.62),rgba(153,27,27,.30));
        border:1px solid rgba(248,113,113,.62); border-left:5px solid #f87171;
        border-radius:13px; padding:1rem 1.15rem; margin:.8rem 0;
        font-weight:750; line-height:1.65;
        box-shadow:0 10px 28px rgba(220,38,38,.12),inset 0 1px 0 rgba(254,226,226,.08);
    }
    .submission-error-detail {
        color:#fecaca; background:rgba(127,29,29,.22);
        border-left:3px solid #ef4444; border-radius:7px;
        padding:.55rem .8rem; margin:.35rem 0; line-height:1.5;
    }
    .privacy-note {
        color:#aebeb5; font-size:.8rem; line-height:1.6;
        text-align:center; margin-top:.8rem;
    }
    @media (max-width:560px) {
        .intro-pillars { grid-template-columns:1fr; }
        .intro-pillar { text-align:left; }
        [data-testid="stForm"] { padding:.8rem; }
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
    """
    <div class="form-card">
      <div class="section-kicker">Let's connect</div>
      <div class="section-heading">Client Registration & Enquiry</div>
      <div class="section-copy">
        Share a few details so our team can understand your interests and get in touch.
        Fields marked with * are required.
      </div>
    </div>
    """,
    unsafe_allow_html=True,
)

with st.form("client_registration_form", clear_on_submit=False):
    left, right = st.columns(2)
    with left:
        full_name = st.text_input("Full Name *", placeholder="Enter your full name")
        email = st.text_input("Email Address *", placeholder="Enter your email address")
        contact_number = st.text_input("Contact Number *", placeholder="Your primary contact number")
        whatsapp_number = st.text_input("WhatsApp Number *", placeholder="Enter if different from contact number")
        city = st.text_input("City *", placeholder="Your city")
    with right:
        occupation = st.selectbox(
            "Occupation *",
            ["Select occupation", "Student", "Working Professional", "Business Owner",
             "Trader / Investor", "Other"],
        )
        experience = st.selectbox(
            "Trading Experience *",
            ["Select experience", "Beginner", "Less than 1 year", "1–3 years",
             "More than 3 years"],
        )
        interests = st.selectbox(
            "Area of Interest *",
            ["Select one area", "Trading Education", "Market Data Analysis",
             "Practical Workshops", "Financial Market Awareness"],
        )
    message = st.text_area(
        "Message / Enquiry (Optional)",
        placeholder="Tell us what you would like to learn or ask...",
        height=110,
    )
    consent = st.checkbox(
        "I agree that 6thSense-Vardaan may contact me about this enquiry. *"
    )
    submitted = st.form_submit_button("Submit Registration")

if submitted:
    errors = []
    if len(full_name.strip()) < 2:
        errors.append("Please enter your full name.")
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email.strip()):
        errors.append("Please enter a valid email address.")
    digits = re.sub(r"\D", "", whatsapp_number)
    contact_digits = re.sub(r"\D", "", contact_number)
    if not 10 <= len(contact_digits) <= 15:
        errors.append("Please enter a valid contact number with 10–15 digits.")
    digits = re.sub(r"\D", "", whatsapp_number)
    if not 10 <= len(digits) <= 15:
        errors.append("Please enter a valid WhatsApp number with 10–15 digits.")
    if not city.strip():
        errors.append("Please enter your city.")
    if occupation == "Select occupation":
        errors.append("Please select your occupation.")
    if experience == "Select experience":
        errors.append("Please select your trading experience.")
    if interests == "Select one area":
        errors.append("Please select one area of interest.")
    if not consent:
        errors.append("Please confirm the contact consent to submit.")

    if errors:
        st.markdown(
            '<div class="submission-error">❌ FORM REJECTED — Please correct the details below and submit again.</div>',
            unsafe_allow_html=True,
        )
        for error in errors:
            st.markdown(
                f'<div class="submission-error-detail">• {error}</div>',
                unsafe_allow_html=True,
            )
    else:
        config = st.secrets.get("google_sheets", {})
        webhook_url = str(config.get("webhook_url", "")).strip()
        submission_token = str(config.get("submission_token", "")).strip()

        if not webhook_url or not submission_token:
            st.error(
                "❌ FORM REJECTED — The response destination is not connected yet. "
                "Please try again later or contact the website administrator."
            )
        else:
            payload = {
                "token": submission_token,
                "full_name": full_name.strip(),
                "email": email.strip(),
                "contact_number": contact_number.strip(),
                "whatsapp_number": whatsapp_number.strip(),
                "city": city.strip(),
                "occupation": occupation,
                "trading_experience": experience,
                "areas_of_interest": interests,
                "message": message.strip(),
                "contact_consent": consent,
            }
            try:
                response = requests.post(
                    webhook_url,
                    json=payload,
                    timeout=25,
                )
                response.raise_for_status()
                try:
                    result = response.json()
                except ValueError:
                    result = {}

                if result.get("success") is True:
                    assigned_username = result.get("username")
                    assigned_password = result.get("password")
                    if assigned_username and assigned_password:
                        st.balloons()
                        show_trial_popup(assigned_username, assigned_password)
                    else:
                        st.error(
                            "❌ REGISTRATION SAVED, BUT LOGIN CREDENTIALS COULD NOT BE CONFIRMED. "
                            "Please contact the 6thSense-Vardaan team before trying again."
                        )
                else:
                    rejection_reason = result.get(
                        "message",
                        "We could not confirm your submission. Please try again later.",
                    )
                    st.error(f"❌ FORM REJECTED — {rejection_reason}")
            except requests.RequestException:
                st.error(
                    "❌ FORM REJECTED — We could not reach the response service. "
                    "Your form has not been confirmed as submitted. Please try again in a moment."
                )

st.markdown(
    '<div class="privacy-note">Your details are collected only to respond to this '
    'registration or enquiry. Please do not submit passwords, payment details, '
    'or sensitive financial information.</div>',
    unsafe_allow_html=True,
)
