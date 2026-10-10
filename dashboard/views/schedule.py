import streamlit as st
from datetime import datetime, date, timedelta
from services.api_client import get_api_client
from utils.metrics import (
    format_status_badge,
    format_priority_badge,
    format_datetime,
    is_overdue,
)

def render_schedule_view():
    client = get_api_client()
    technicians = client.list_technicians()
    all_jobs = client.list_jobs(limit=100)

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 class="page-title">Operations Dispatch Schedule</h1>
            <p class="page-subtitle">Timeline view of scheduled work orders grouped by operational urgency and calendar window.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # Technician filter
    col_filter, _ = st.columns([2, 2])
    with col_filter:
        tech_opts = {"ALL": "All Technicians"}
        for t in technicians:
            tech_opts[t["id"]] = t["name"]
        selected_tech = st.selectbox("Filter Schedule by Specialist", options=list(tech_opts.keys()), format_func=lambda x: tech_opts[x])

    filtered_jobs = all_jobs
    if selected_tech != "ALL":
        filtered_jobs = [j for j in filtered_jobs if (j.get("assignedTechnician") or {}).get("id") == selected_tech]

    today = date.today()
    tomorrow = today + timedelta(days=1)

    overdue_jobs = []
    today_jobs = []
    tomorrow_jobs = []
    upcoming_jobs = []
    completed_jobs = []

    for j in filtered_jobs:
        status = j.get("status", "OPEN")
        if status in ["COMPLETED", "CANCELLED"]:
            completed_jobs.append(j)
            continue

        if is_overdue(j.get("dueDate"), status):
            overdue_jobs.append(j)
            continue

        due_date_raw = j.get("dueDate")
        if due_date_raw:
            try:
                j_date = datetime.fromisoformat(due_date_raw.replace("Z", "+00:00")).date()
                if j_date <= today:
                    today_jobs.append(j)
                elif j_date == tomorrow:
                    tomorrow_jobs.append(j)
                else:
                    upcoming_jobs.append(j)
            except Exception:
                upcoming_jobs.append(j)
        else:
            upcoming_jobs.append(j)

    # Render Groups in Tabs or Stacked Accordion
    t1, t2, t3, t4, t5 = st.tabs([
        f"🚨 Overdue ({len(overdue_jobs)})",
        f"📅 Today ({len(today_jobs)})",
        f"⏳ Tomorrow ({len(tomorrow_jobs)})",
        f"📆 Upcoming ({len(upcoming_jobs)})",
        f"✅ Archive ({len(completed_jobs)})",
    ])

    def render_job_schedule_card(job, border_color="#e2e8f0"):
        cust_name = (job.get("customer") or {}).get("name", "N/A")
        tech_name = (job.get("assignedTechnician") or {}).get("name", "Unassigned")
        addr = job.get("serviceAddress", "")

        st.markdown(
            f"""
            <div style="background:#ffffff; border:1px solid {border_color}; border-left:4px solid {border_color}; border-radius:8px; padding:14px 18px; margin-bottom:12px; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <div>
                        <span style="font-weight:700; font-size:0.85rem; color:#1e293b;">{job.get("jobNumber")}</span>
                        <span style="font-weight:600; font-size:0.875rem; color:#0f172a; margin-left:8px;">{job.get("title")}</span>
                    </div>
                    <div>
                        {format_priority_badge(job.get("priority"))}
                        {format_status_badge(job.get("status"))}
                    </div>
                </div>
                <div style="font-size:0.8rem; color:#475569; display:flex; flex-wrap:wrap; gap:16px;">
                    <span>🏢 <strong>{cust_name}</strong></span>
                    <span>📍 {addr}</span>
                    <span>👷 <strong>{tech_name}</strong></span>
                    <span>⏰ Due: {format_datetime(job.get("dueDate"))}</span>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with t1:
        if not overdue_jobs:
            st.success("🎉 Excellent! No work orders currently breaching SLA.")
        else:
            st.markdown("<p style='font-size:0.85rem; color:#dc2626; font-weight:600;'>The following work orders have breached their target completion window and require immediate dispatcher intervention:</p>", unsafe_allow_html=True)
            for j in overdue_jobs:
                render_job_schedule_card(j, "#ef4444")

    with t2:
        if not today_jobs:
            st.info("No active work orders scheduled for delivery today.")
        else:
            for j in today_jobs:
                render_job_schedule_card(j, "#2563eb")

    with t3:
        if not tomorrow_jobs:
            st.info("No work orders scheduled for delivery tomorrow.")
        else:
            for j in tomorrow_jobs:
                render_job_schedule_card(j, "#0d9488")

    with t4:
        if not upcoming_jobs:
            st.info("No future work orders in queue.")
        else:
            for j in upcoming_jobs:
                render_job_schedule_card(j, "#94a3b8")

    with t5:
        if not completed_jobs:
            st.info("No completed jobs in history.")
        else:
            for j in completed_jobs[:10]:
                render_job_schedule_card(j, "#10b981")
