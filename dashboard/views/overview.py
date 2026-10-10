import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
from services.api_client import get_api_client
from components.kpi_cards import render_kpi_cards
from utils.metrics import (
    format_status_badge,
    format_priority_badge,
    format_datetime,
    format_date_short,
    is_overdue,
)

def render_overview_view():
    client = get_api_client()

    # Load data from backend API
    summary = client.get_summary()
    trends_raw = client.get_job_trends()
    workload_raw = client.get_workload()
    technicians = client.list_technicians()
    customers = client.list_customers()
    all_jobs = client.list_jobs(limit=100)

    # 1. KPI Row
    render_kpi_cards(summary)
    st.markdown("<div style='height: 20px;'></div>", unsafe_allow_html=True)

    # 2. Main Analytics Row (Plotly)
    col_chart1, col_chart2 = st.columns([1.6, 1])

    with col_chart1:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Job Volume & Completion Velocity (14 Days)</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )
        trends = trends_raw.get("trends", [])
        if trends:
            df_trends = pd.DataFrame(trends)
            fig = go.Figure()
            fig.add_trace(
                go.Scatter(
                    x=df_trends["date"],
                    y=df_trends["created"],
                    name="Created",
                    line=dict(color="#3b82f6", width=2.5),
                    mode="lines+markers",
                )
            )
            fig.add_trace(
                go.Scatter(
                    x=df_trends["date"],
                    y=df_trends["completed"],
                    name="Completed",
                    line=dict(color="#10b981", width=2.5),
                    mode="lines+markers",
                )
            )
            fig.update_layout(
                margin=dict(l=20, r=20, t=10, b=20),
                height=260,
                paper_bgcolor="rgba(0,0,0,0)",
                plot_bgcolor="rgba(0,0,0,0)",
                xaxis=dict(showgrid=False, linecolor="#cbd5e1"),
                yaxis=dict(showgrid=True, gridcolor="#f1f5f9", linecolor="#cbd5e1"),
                legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
                font=dict(family="Inter, sans-serif", size=11, color="#64748b"),
            )
            st.plotly_chart(fig, use_container_width=True)
        else:
            st.info("Insufficient historical trend data available.")
        st.markdown("</div>", unsafe_allow_html=True)

    with col_chart2:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Status Breakdown</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )
        by_status = trends_raw.get("byStatus", [])
        if by_status:
            df_status = pd.DataFrame(by_status)
            colors = {
                "COMPLETED": "#10b981",
                "IN_PROGRESS": "#3b82f6",
                "ASSIGNED": "#f59e0b",
                "OPEN": "#94a3b8",
                "CANCELLED": "#64748b",
            }
            color_map = [colors.get(s, "#cbd5e1") for s in df_status["status"]]
            fig_pie = go.Figure(
                data=[
                    go.Pie(
                        labels=df_status["status"].str.replace("_", " "),
                        values=df_status["count"],
                        hole=0.6,
                        marker=dict(colors=color_map),
                        textinfo="percent+label",
                        textfont=dict(size=11),
                    )
                ]
            )
            fig_pie.update_layout(
                margin=dict(l=10, r=10, t=10, b=10),
                height=260,
                showlegend=False,
                paper_bgcolor="rgba(0,0,0,0)",
            )
            st.plotly_chart(fig_pie, use_container_width=True)
        else:
            st.info("No status data available.")
        st.markdown("</div>", unsafe_allow_html=True)

    # 3. Technician Workload Bar Chart
    st.markdown(
        """
        <div class="ff-card">
            <div class="ff-card-header">
                <h3 class="ff-card-title">Technician Active Workload & Capacity Utilization</h3>
            </div>
        """,
        unsafe_allow_html=True,
    )
    workload = workload_raw.get("workload", [])
    if workload:
        df_workload = pd.DataFrame(workload)
        fig_bar = go.Figure()
        fig_bar.add_trace(
            go.Bar(
                x=df_workload["name"],
                y=df_workload["activeJobs"],
                name="Active Jobs",
                marker_color="#2563eb",
            )
        )
        fig_bar.add_trace(
            go.Bar(
                x=df_workload["name"],
                y=df_workload["maxCapacity"],
                name="Max Capacity",
                marker_color="#e2e8f0",
            )
        )
        fig_bar.update_layout(
            barmode="group",
            margin=dict(l=20, r=20, t=10, b=20),
            height=220,
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(showgrid=False),
            yaxis=dict(showgrid=True, gridcolor="#f1f5f9"),
            legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
            font=dict(family="Inter, sans-serif", size=11, color="#64748b"),
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    st.markdown("</div>", unsafe_allow_html=True)

    # 4. Operational Job Table & Side Alerts
    col_table, col_alerts = st.columns([2.2, 1])

    with col_table:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Live Operational Work Orders</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )

        # Filters Row
        f_c1, f_c2, f_c3 = st.columns(3)
        with f_c1:
            status_filter = st.selectbox(
                "Filter Status",
                ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED"],
                key="ov_status_filter",
            )
        with f_c2:
            priority_filter = st.selectbox(
                "Filter Priority",
                ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"],
                key="ov_prio_filter",
            )
        with f_c3:
            search_query = st.text_input("Search Jobs", placeholder="Job #, Customer, Title...", key="ov_search")

        # Filter jobs in memory for instantaneous UX
        filtered = all_jobs
        if status_filter != "ALL":
            filtered = [j for j in filtered if j.get("status") == status_filter]
        if priority_filter != "ALL":
            filtered = [j for j in filtered if j.get("priority") == priority_filter]
        if search_query.strip():
            sq = search_query.strip().lower()
            filtered = [
                j
                for j in filtered
                if sq in j.get("title", "").lower()
                or sq in j.get("jobNumber", "").lower()
                or sq in j.get("serviceAddress", "").lower()
                or sq in (j.get("customer", {}) or {}).get("name", "").lower()
            ]

        if not filtered:
            st.info("No work orders match the active filter criteria.")
        else:
            # Render Clean Operational Table
            table_rows = []
            for j in filtered[:15]:
                cust_name = (j.get("customer") or {}).get("name", "N/A")
                tech_name = (j.get("assignedTechnician") or {}).get("name", "Unassigned")
                status_html = format_status_badge(j.get("status", "OPEN"))
                prio_html = format_priority_badge(j.get("priority", "MEDIUM"))
                due_str = format_date_short(j.get("dueDate"))
                overdue_marker = " ⚠️" if is_overdue(j.get("dueDate"), j.get("status")) else ""

                table_rows.append(
                    {
                        "Job ID": j.get("jobNumber"),
                        "Customer": cust_name,
                        "Title": j.get("title")[:38] + ("..." if len(j.get("title", "")) > 38 else ""),
                        "Technician": tech_name,
                        "Priority": prio_html,
                        "Status": status_html,
                        "Due Date": f"{due_str}{overdue_marker}",
                    }
                )

            # Display as styled markdown HTML table
            html_table = "<div style='overflow-x:auto;'><table style='width:100%; border-collapse:collapse; font-size:0.825rem;'>"
            html_table += "<thead><tr style='border-bottom: 2px solid #e2e8f0; text-align:left; color:#64748b; font-weight:600;'>"
            for col in ["Job ID", "Customer", "Title", "Technician", "Priority", "Status", "Due Date"]:
                html_table += f"<th style='padding:10px 8px;'>{col}</th>"
            html_table += "</tr></thead><tbody>"

            for r in table_rows:
                html_table += "<tr style='border-bottom: 1px solid #f1f5f9; transition: background 0.15s;'>"
                html_table += f"<td style='padding:10px 8px; font-weight:600; color:#1e293b;'>{r['Job ID']}</td>"
                html_table += f"<td style='padding:10px 8px; color:#334155;'>{r['Customer']}</td>"
                html_table += f"<td style='padding:10px 8px; color:#0f172a;'>{r['Title']}</td>"
                html_table += f"<td style='padding:10px 8px; color:#475569;'>{r['Technician']}</td>"
                html_table += f"<td style='padding:10px 8px;'>{r['Priority']}</td>"
                html_table += f"<td style='padding:10px 8px;'>{r['Status']}</td>"
                html_table += f"<td style='padding:10px 8px; color:#64748b;'>{r['Due Date']}</td>"
                html_table += "</tr>"

            html_table += "</tbody></table></div>"
            st.markdown(html_table, unsafe_allow_html=True)

        st.markdown("</div>", unsafe_allow_html=True)

    with col_alerts:
        # Alerts & Escalations Panel
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Priority Alerts</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )

        critical_or_overdue = [
            j for j in all_jobs if j.get("priority") == "CRITICAL" or is_overdue(j.get("dueDate"), j.get("status"))
        ]

        if not critical_or_overdue:
            st.success("No active critical escalations or overdue jobs.")
        else:
            for alert_job in critical_or_overdue[:4]:
                is_ov = is_overdue(alert_job.get("dueDate"), alert_job.get("status"))
                prio = alert_job.get("priority")
                card_border = "#fecaca" if is_ov or prio == "CRITICAL" else "#fed7aa"

                st.markdown(
                    f"""
                    <div style="background:#fff; border:1px solid {card_border}; border-left:4px solid #ef4444; border-radius:6px; padding:10px 12px; margin-bottom:10px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <span style="font-weight:700; font-size:0.75rem; color:#dc2626;">{alert_job.get("jobNumber")}</span>
                            {format_priority_badge(prio)}
                        </div>
                        <div style="font-weight:600; font-size:0.8rem; color:#0f172a; margin-bottom:4px;">{alert_job.get("title")[:42]}...</div>
                        <div style="font-size:0.725rem; color:#64748b;">
                            Due: {format_datetime(alert_job.get("dueDate"))}
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        st.markdown("</div>", unsafe_allow_html=True)

        # Quick Dispatch Action
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Quick Action</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )
        if st.button("➕ Create New Work Order", use_container_width=True):
            st.session_state["active_view"] = "jobs"
            st.session_state["show_create_job"] = True
            st.rerun()
        if st.button("✨ Run AI Priority Triage", use_container_width=True, type="secondary"):
            st.session_state["active_view"] = "ai_insights"
            st.rerun()
        st.markdown("</div>", unsafe_allow_html=True)
