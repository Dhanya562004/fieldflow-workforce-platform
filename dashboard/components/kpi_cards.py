import streamlit as st
from typing import Dict, Any

def render_kpi_cards(summary: Dict[str, Any]):
    total = summary.get("totalJobs", 0)
    in_progress = summary.get("inProgress", 0)
    completed = summary.get("completed", 0)
    overdue = summary.get("overdue", 0)
    completion_rate = summary.get("completionRate", 0)
    active_techs = summary.get("activeTechnicians", 0)

    c1, c2, c3, c4 = st.columns(4)

    with c1:
        st.markdown(
            f"""
            <div class="kpi-card kpi-total">
                <span class="kpi-label">Total Jobs</span>
                <span class="kpi-value">{total}</span>
                <span class="kpi-subtext">Active operational volume</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with c2:
        st.markdown(
            f"""
            <div class="kpi-card kpi-inprogress">
                <span class="kpi-label">In Progress</span>
                <span class="kpi-value">{in_progress}</span>
                <span class="kpi-subtext">Across {active_techs} active technicians</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with c3:
        st.markdown(
            f"""
            <div class="kpi-card kpi-completed">
                <span class="kpi-label">Completed</span>
                <span class="kpi-value">{completed}</span>
                <span class="kpi-subtext"><strong>{completion_rate}%</strong> completion rate</span>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with c4:
        overdue_style = "color: #dc2626;" if overdue > 0 else "color: #16a34a;"
        st.markdown(
            f"""
            <div class="kpi-card kpi-overdue">
                <span class="kpi-label">Overdue Risk</span>
                <span class="kpi-value" style="{overdue_style}">{overdue}</span>
                <span class="kpi-subtext" style="{overdue_style}">Requires dispatch intervention</span>
            </div>
            """,
            unsafe_allow_html=True,
        )
