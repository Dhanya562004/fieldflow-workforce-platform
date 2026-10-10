import streamlit as st
from services.api_client import get_api_client

def render_technicians_view():
    client = get_api_client()
    technicians = client.list_technicians()

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 class="page-title">Technician Roster & Capacity</h1>
            <p class="page-subtitle">Manage field workforce specialists, track live capacity utilization, and dispatch assignments.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 1. Add Technician Form
    with st.expander("➕ Onboard New Field Specialist", expanded=False):
        with st.form("add_tech_form", clear_on_submit=True):
            tc1, tc2 = st.columns(2)
            with tc1:
                name = st.text_input("Full Name *", placeholder="e.g. Jordan Miller")
                email = st.text_input("Email Address *", placeholder="jordan.miller@fieldflow.io")
                phone = st.text_input("Contact Phone", placeholder="+1-415-555-0199")
            with tc2:
                skills = st.text_input("Specialized Skills", placeholder="HVAC Controls, VFDs, Boiler Systems")
                zone = st.text_input("Primary Service Zone", placeholder="San Francisco Peninsula")
                vehicle = st.text_input("Vehicle Identifier", placeholder="VAN-105")

            sub_tech = st.form_submit_button("Create Specialist Record", use_container_width=True)
            if sub_tech:
                if not name or not email:
                    st.error("Name and email are mandatory fields.")
                else:
                    res = client.create_technician({
                        "name": name.strip(),
                        "email": email.strip().lower(),
                        "password": "Password123!",
                        "phone": phone.strip() if phone else None,
                        "skills": skills.strip() if skills else "General Maintenance",
                        "serviceZone": zone.strip() if zone else "Metro Area",
                        "vehicleNumber": vehicle.strip() if vehicle else None,
                        "maxConcurrentJobs": 4,
                        "isAvailable": True,
                    })
                    if res.get("success"):
                        st.success(f"Technician {name} onboarded successfully! Temporary password: Password123!")
                        st.rerun()
                    else:
                        st.error(f"Failed to onboard technician: {res.get('error')}")

    if not technicians:
        st.info("No field technicians found in directory.")
        return

    # 2. Technician Cards Grid
    cols = st.columns(2)
    for idx, tech in enumerate(technicians):
        col = cols[idx % 2]
        profile = tech.get("profile") or {}
        active_count = tech.get("activeJobsCount", 0)
        completed_count = tech.get("completedJobsCount", 0)
        max_cap = profile.get("maxConcurrentJobs", 4)
        is_avail = tech.get("isAvailable", True)
        util_pct = tech.get("workloadUtilization", 0)

        badge_avail = "<span style='background:#ecfdf5; color:#059669; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;'>AVAILABLE</span>" if is_avail else "<span style='background:#fef2f2; color:#dc2626; padding:3px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;'>UNAVAILABLE</span>"

        with col:
            st.markdown(
                f"""
                <div class="ff-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
                        <div>
                            <h3 style="font-size:1.1rem; font-weight:700; margin:0; color:#0f172a;">{tech.get("name")}</h3>
                            <div style="font-size:0.8rem; color:#64748b;">{tech.get("email")} • {tech.get("phone") or "No phone"}</div>
                        </div>
                        <div>{badge_avail}</div>
                    </div>
                    <div style="background:#f8fafc; border:1px solid #f1f5f9; border-radius:6px; padding:10px 12px; font-size:0.8rem; margin-bottom:14px; line-height:1.5;">
                        <div>📍 <strong>Zone:</strong> {profile.get("serviceZone") or "Unassigned"}</div>
                        <div>🚐 <strong>Vehicle:</strong> {profile.get("vehicleNumber") or "None"}</div>
                        <div>🔧 <strong>Skills:</strong> {profile.get("skills") or "General"}</div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-size:0.825rem; font-weight:600; margin-bottom:6px;">
                        <span>Active Load: {active_count} / {max_cap} jobs</span>
                        <span>{completed_count} completed</span>
                    </div>
                    <div style="background:#e2e8f0; border-radius:9999px; height:8px; overflow:hidden; margin-bottom:14px;">
                        <div style="background:#2563eb; width:{min(100, util_pct)}%; height:100%;"></div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

            # Quick availability toggle
            t_col1, t_col2 = st.columns(2)
            with t_col1:
                new_state = not is_avail
                toggle_label = "Mark Available" if not is_avail else "Mark Busy / Off-Duty"
                if st.button(toggle_label, key=f"avail_btn_{tech['id']}", use_container_width=True, type="secondary"):
                    client.update_technician(tech["id"], {"isAvailable": new_state})
                    st.rerun()
            with t_col2:
                if st.button(f"View Assigned ({active_count})", key=f"view_tech_{tech['id']}", use_container_width=True):
                    st.session_state["active_view"] = "jobs"
                    st.session_state["jobs_tech_filter"] = tech["id"]
                    st.rerun()
