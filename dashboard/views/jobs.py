import streamlit as st
from datetime import datetime, timedelta
from services.api_client import get_api_client
from utils.metrics import (
    format_status_badge,
    format_priority_badge,
    format_datetime,
    is_overdue,
)

def render_jobs_view():
    client = get_api_client()

    customers = client.list_customers()
    technicians = client.list_technicians()

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 class="page-title">Work Order Dispatching</h1>
            <p class="page-subtitle">Create, assign, inspect, and track field jobs across customer sites.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 1. Create Job Expander
    show_form_default = st.session_state.pop("show_create_job", False)
    with st.expander("➕ Dispatch New Work Order", expanded=show_form_default):
        if not customers:
            st.warning("No customers registered yet. Please create a customer before dispatching jobs.")
        else:
            with st.form("create_job_form", clear_on_submit=True):
                col_c1, col_c2 = st.columns(2)
                with col_c1:
                    customer_options = {c["id"]: f"{c['name']} ({c.get('company') or 'Individual'})" for c in customers}
                    cust_id = st.selectbox("Customer Site *", options=list(customer_options.keys()), format_func=lambda x: customer_options[x])
                    title = st.text_input("Work Order Title *", placeholder="e.g. Commercial Chiller Condenser Diagnostic")
                    priority = st.selectbox("Priority Level", ["LOW", "MEDIUM", "HIGH", "CRITICAL"], index=1)
                with col_c2:
                    tech_options = {"": "Unassigned (Open Dispatch Pool)"}
                    for t in technicians:
                        zone = (t.get("profile") or {}).get("serviceZone", "Metro")
                        tech_options[t["id"]] = f"{t['name']} ({zone}) - {t.get('activeJobsCount', 0)} active"
                    tech_id = st.selectbox("Assign Specialist", options=list(tech_options.keys()), format_func=lambda x: tech_options[x])
                    default_address = next((c.get("address", "") for c in customers if c["id"] == cust_id), "")
                    service_address = st.text_input("Service Location Address *", value=default_address)
                    due_date = st.date_input("Target Due Date", value=datetime.now().date() + timedelta(days=1))

                description = st.text_area("Operational Scope & Symptoms", placeholder="Describe system alarms, error codes, and site access requirements...")

                submitted = st.form_submit_button("Dispatch Work Order", use_container_width=True)
                if submitted:
                    if not title or len(title.strip()) < 3:
                        st.error("Please provide a descriptive work order title (minimum 3 characters).")
                    elif not service_address or len(service_address.strip()) < 5:
                        st.error("Please provide a valid service address.")
                    else:
                        payload = {
                            "title": title.strip(),
                            "description": description.strip() if description else "",
                            "customerId": cust_id,
                            "serviceAddress": service_address.strip(),
                            "priority": priority,
                            "assignedTechnicianId": tech_id if tech_id else None,
                            "dueDate": f"{due_date.isoformat()}T18:00:00.000Z",
                        }
                        res = client.create_job(payload)
                        if res.get("success"):
                            st.success(f"Work order created successfully: **{res['job']['jobNumber']}**")
                            st.rerun()
                        else:
                            st.error(f"Failed to create job: {res.get('error')}")

    # 2. Filters & Search Bar
    f1, f2, f3, f4 = st.columns([1.5, 1, 1, 1.2])
    with f1:
        search_query = st.text_input("Search", placeholder="Search title, job #, address...", key="jobs_search")
    with f2:
        status_filter = st.selectbox("Status", ["ALL", "OPEN", "ASSIGNED", "IN_PROGRESS", "COMPLETED", "CANCELLED"], key="jobs_status")
    with f3:
        priority_filter = st.selectbox("Priority", ["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"], key="jobs_priority")
    with f4:
        tech_filter_opts = {"ALL": "All Technicians"}
        for t in technicians:
            tech_filter_opts[t["id"]] = t["name"]
        selected_tech_filter = st.selectbox("Technician", options=list(tech_filter_opts.keys()), format_func=lambda x: tech_filter_opts[x])

    jobs = client.list_jobs(
        status=status_filter if status_filter != "ALL" else None,
        priority=priority_filter if priority_filter != "ALL" else None,
        technician_id=selected_tech_filter if selected_tech_filter != "ALL" else None,
        search=search_query if search_query.strip() else None,
        limit=100,
    )

    st.markdown(f"<div style='font-size:0.875rem; color:#64748b; margin-bottom:12px;'>Showing <strong>{len(jobs)}</strong> work orders</div>", unsafe_allow_html=True)

    if not jobs:
        st.info("No work orders match the filter criteria.")
        return

    # 3. Two-Column Workspace: Jobs List & Job Details Inspector
    col_list, col_inspector = st.columns([1.6, 2.2])

    # Store selected job ID
    if "selected_job_id" not in st.session_state or not any(j["id"] == st.session_state["selected_job_id"] for j in jobs):
        st.session_state["selected_job_id"] = jobs[0]["id"]

    with col_list:
        st.markdown("<div style='max-height: 680px; overflow-y: auto; padding-right: 6px;'>", unsafe_allow_html=True)
        for job in jobs:
            is_active = job["id"] == st.session_state["selected_job_id"]
            card_border = "#2563eb" if is_active else "#e2e8f0"
            card_bg = "#f0f7ff" if is_active else "#ffffff"
            overdue_tag = "<span style='color:#ef4444; font-weight:700;'> • OVERDUE</span>" if is_overdue(job.get("dueDate"), job.get("status")) else ""

            st.markdown(
                f"""
                <div style="background:{card_bg}; border:1px solid {card_border}; border-radius:8px; padding:12px 14px; margin-bottom:10px; cursor:pointer;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                        <span style="font-weight:700; font-size:0.825rem; color:#1e293b;">{job.get("jobNumber")}</span>
                        <div>{format_priority_badge(job.get("priority"))} {format_status_badge(job.get("status"))}</div>
                    </div>
                    <div style="font-weight:600; font-size:0.875rem; color:#0f172a; margin-bottom:4px;">{job.get("title")}</div>
                    <div style="font-size:0.775rem; color:#64748b; display:flex; justify-content:space-between;">
                        <span>👤 {(job.get("assignedTechnician") or {}).get("name", "Unassigned")}</span>
                        <span>{format_datetime(job.get("dueDate"))}{overdue_tag}</span>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button(f"Inspect {job.get('jobNumber')}", key=f"sel_{job['id']}", use_container_width=True):
                st.session_state["selected_job_id"] = job["id"]
                st.rerun()

        st.markdown("</div>", unsafe_allow_html=True)

    with col_inspector:
        active_job = client.get_job(st.session_state["selected_job_id"])
        if not active_job:
            st.info("Select a work order from the list to view its complete operational dossier.")
            return

        st.markdown(
            f"""
            <div class="ff-card">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #f1f5f9; padding-bottom:12px; margin-bottom:16px;">
                    <div>
                        <div style="font-size:0.8rem; font-weight:700; color:#2563eb;">{active_job.get("jobNumber")}</div>
                        <h2 style="font-size:1.25rem; font-weight:700; margin:2px 0 0 0; color:#0f172a;">{active_job.get("title")}</h2>
                    </div>
                    <div>
                        {format_priority_badge(active_job.get("priority"))}
                        {format_status_badge(active_job.get("status"))}
                    </div>
                </div>
            """,
            unsafe_allow_html=True,
        )

        # Operational Meta Grid
        m1, m2 = st.columns(2)
        with m1:
            st.markdown(
                f"""
                <div style="font-size:0.825rem; line-height:1.6; margin-bottom:12px;">
                    <div><strong>Customer:</strong> {(active_job.get("customer") or {}).get("name")}</div>
                    <div><strong>Phone:</strong> {(active_job.get("customer") or {}).get("phone")}</div>
                    <div><strong>Service Address:</strong> {active_job.get("serviceAddress")}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        with m2:
            st.markdown(
                f"""
                <div style="font-size:0.825rem; line-height:1.6; margin-bottom:12px;">
                    <div><strong>Assigned Specialist:</strong> {(active_job.get("assignedTechnician") or {}).get("name", "None")}</div>
                    <div><strong>Scheduled Start:</strong> {format_datetime(active_job.get("scheduledStart"))}</div>
                    <div><strong>Target Due Date:</strong> {format_datetime(active_job.get("dueDate"))}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Description
        if active_job.get("description"):
            st.markdown(
                f"""
                <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 14px; font-size:0.825rem; color:#334155; margin-bottom:16px;">
                    <strong>Scope & Symptoms:</strong><br/>{active_job.get("description")}
                </div>
                """,
                unsafe_allow_html=True,
            )

        # Status Transition & Assignment Action Bar
        st.markdown("<h4 style='font-size:0.9rem; font-weight:600; margin:16px 0 8px 0;'>Lifecycle Actions</h4>", unsafe_allow_html=True)
        act1, act2, act3 = st.columns(3)

        current_st = active_job.get("status")
        with act1:
            if current_st in ["OPEN", "ASSIGNED"]:
                if st.button("▶ Start Work (In Progress)", use_container_width=True):
                    client.update_job_status(active_job["id"], "IN_PROGRESS", "Dispatcher initiated job on site")
                    st.rerun()
            elif current_st == "IN_PROGRESS":
                if st.button("✅ Mark Completed", use_container_width=True):
                    client.update_job_status(active_job["id"], "COMPLETED", "Work verified and closed out by dispatcher")
                    st.rerun()

        with act2:
            if current_st != "CANCELLED" and current_st != "COMPLETED":
                if st.button("Cancel Job", use_container_width=True, type="secondary"):
                    client.update_job_status(active_job["id"], "CANCELLED", "Work order cancelled by operations")
                    st.rerun()

        with act3:
            # Reassign technician
            tech_dict = {"": "Unassign"}
            for t in technicians:
                tech_dict[t["id"]] = t["name"]
            curr_tech_id = (active_job.get("assignedTechnician") or {}).get("id", "")
            new_tech_id = st.selectbox(
                "Reassign Specialist",
                options=list(tech_dict.keys()),
                format_func=lambda x: tech_dict[x],
                index=list(tech_dict.keys()).index(curr_tech_id) if curr_tech_id in tech_dict else 0,
                key=f"reassign_{active_job['id']}",
            )
            if new_tech_id != curr_tech_id:
                if st.button("Confirm Reassignment", key=f"btn_reassign_{active_job['id']}"):
                    client.assign_job(active_job["id"], new_tech_id if new_tech_id else None)
                    st.rerun()

        # Operational Notes Log
        st.markdown("<h4 style='font-size:0.9rem; font-weight:600; margin:20px 0 8px 0;'>Operational Field Notes</h4>", unsafe_allow_html=True)
        notes = active_job.get("notes", [])
        if not notes:
            st.caption("No field notes logged for this work order yet.")
        else:
            for note in notes[:6]:
                author_name = (note.get("author") or {}).get("name", "Staff")
                created_str = format_datetime(note.get("createdAt"))
                internal_badge = "<span style='background:#fef3c7; color:#b45309; padding:2px 6px; border-radius:4px; font-size:0.65rem; font-weight:700;'>INTERNAL</span>" if note.get("isInternal") else ""

                st.markdown(
                    f"""
                    <div style="background:#ffffff; border-left:3px solid #2563eb; padding:8px 12px; margin-bottom:8px; border-bottom:1px solid #f1f5f9; font-size:0.8rem;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="font-weight:600; color:#1e293b;">{author_name} {internal_badge}</span>
                            <span style="color:#94a3b8; font-size:0.725rem;">{created_str}</span>
                        </div>
                        <div style="color:#334155;">{note.get("content")}</div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        # Log note form
        with st.form(f"note_form_{active_job['id']}", clear_on_submit=True):
            note_content = st.text_input("Add Operational Note", placeholder="Log field observation, parts used, or client signoff...")
            c_int, c_sub = st.columns([1, 2])
            with c_int:
                is_internal = st.checkbox("Internal Only", value=False)
            with c_sub:
                sub_note = st.form_submit_button("Log Note", use_container_width=True)
            if sub_note and note_content.strip():
                client.add_job_note(active_job["id"], note_content.strip(), is_internal)
                st.rerun()

        st.markdown("</div>", unsafe_allow_html=True)
