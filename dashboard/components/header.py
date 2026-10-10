import streamlit as st
from datetime import datetime

def render_header(title: str, subtitle: str, action_label: str = "", on_action=None):
    today_str = datetime.now().strftime("%A, %B %d, %Y")

    col_title, col_actions = st.columns([3, 1.2])

    with col_title:
        st.markdown(
            f"""
            <div style="margin-bottom: 20px;">
                <h1 class="page-title">{title}</h1>
                <p class="page-subtitle">{subtitle}</p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with col_actions:
        st.markdown(
            f"""
            <div style="text-align: right; margin-bottom: 10px;">
                <span style="font-size: 0.8rem; color: #64748b; font-weight: 500;">📅 {today_str}</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
        if action_label and on_action:
            if st.button(action_label, use_container_width=True):
                on_action()
