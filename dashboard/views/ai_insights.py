import streamlit as st
from datetime import datetime, timedelta
from services.api_client import get_api_client
from utils.metrics import format_priority_badge, format_status_badge, format_datetime

def render_ai_insights_view():
    client = get_api_client()
    all_jobs = client.list_jobs(limit=100)
    workload_data = client.get_workload()
    summary_data = client.get_summary()

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <div style="display:flex; align-items:center; gap:8px;">
                <h1 class="page-title" style="margin:0;">AI Operational Intelligence & Dispatch Triage</h1>
                <span style="background:#e0e7ff; color:#3730a3; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:700;">GEMINI + ADAPTER READY</span>
            </div>
            <p class="page-subtitle">Assisted decision support for priority classification, field note synthesis, and workload balance auditing.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.info("ℹ️ **Human-in-the-Loop Safeguard:** All AI recommendations are advisory only. FieldFlow requires operations manager confirmation before altering any job assignments or record statuses.")

    tab_triage, tab_summary, tab_risks = st.tabs([
        "⚡ Automated Priority Triage",
        "📝 Field Notes & Job Synthesizer",
        "⚠️ Workload Imbalance & SLA Risk Audit",
    ])

    # --- TAB 1: Priority Triage ---
    with tab_triage:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Priority Classification Engine</h3>
                </div>
                <p style="font-size:0.85rem; color:#64748b; margin-top:-8px; margin-bottom:16px;">
                    Enter incoming symptom telemetry or dispatch request text to evaluate operational severity, safety risks, and recommended priority level.
                </p>
            """,
            unsafe_allow_html=True,
        )

        with st.form("triage_form"):
            tc1, tc2 = st.columns(2)
            with tc1:
                triage_title = st.text_input(
                    "Job Request Title *",
                    value="Chiller high-pressure head trip and secondary loop cavitation",
                    placeholder="e.g. Ammonia leak in storage room",
                )
                customer_tier = st.selectbox(
                    "Customer Contract SLA Tier",
                    ["STANDARD", "PREMIUM", "ENTERPRISE_MISSION_CRITICAL"],
                    index=2,
                )
            with tc2:
                due_target = st.date_input("Target Delivery Window", value=datetime.now().date())
                due_time = st.time_input("Target Time Window", value=datetime.now().time())

            triage_desc = st.text_area(
                "Symptom Description & Error Codes",
                value="Chiller Loop B shut down abruptly at 03:00. Server room temperature rising to 78F threshold. Backup chiller struggling with thermal load.",
                placeholder="Include symptoms, hardware alarms, and facility hazards...",
            )

            submit_triage = st.form_submit_button("⚡ Evaluate Priority with AI", use_container_width=True)

        if submit_triage:
            combined_dt = f"{due_target.isoformat()}T{due_time.strftime('%H:%M:%S')}.000Z"
            with st.spinner("Analyzing operational risk telemetry..."):
                res = client.suggest_priority({
                    "title": triage_title,
                    "description": triage_desc,
                    "customerTier": customer_tier,
                    "dueDate": combined_dt,
                })

            if res.get("success"):
                p_data = res["data"]
                prio = p_data.get("suggestedPriority", "MEDIUM")
                confidence = int(p_data.get("confidence", 0.8) * 100)
                reason = p_data.get("reasoning", "")
                risks = p_data.get("riskFactors", [])
                provider = p_data.get("provider", "deterministic-fallback")

                provider_label = "Gemini Flash Model" if provider == "gemini" else "Deterministic Fallback Rule Engine"

                st.markdown(
                    f"""
                    <div style="background:#ffffff; border:1px solid #e2e8f0; border-top:4px solid #2563eb; border-radius:8px; padding:18px 20px; margin-top:16px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <div>
                                <span style="font-size:0.8rem; color:#64748b; font-weight:600; text-transform:uppercase;">Recommendation Result</span>
                                <h3 style="margin:2px 0 0 0; font-size:1.3rem; color:#0f172a;">Suggested Level: {format_priority_badge(prio)}</h3>
                            </div>
                            <div style="text-align:right;">
                                <div style="font-weight:700; font-size:1.1rem; color:#2563eb;">{confidence}% Confidence</div>
                                <span style="font-size:0.75rem; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:4px;">{provider_label}</span>
                            </div>
                        </div>
                        <div style="background:#f8fafc; border-left:3px solid #3b82f6; padding:10px 14px; border-radius:4px; font-size:0.85rem; color:#1e293b; margin-bottom:14px;">
                            <strong>AI Reasoning:</strong> {reason}
                        </div>
                        <div style="font-size:0.825rem; font-weight:600; color:#475569; margin-bottom:6px;">Identified Risk Factors:</div>
                    """,
                    unsafe_allow_html=True,
                )
                for r in risks:
                    st.markdown(f"<div style='font-size:0.8rem; color:#b91c1c; padding:2px 0;'>⚠️ {r}</div>", unsafe_allow_html=True)
                st.markdown("</div>", unsafe_allow_html=True)
            else:
                st.error(f"Triage calculation failed: {res.get('error')}")

        st.markdown("</div>", unsafe_allow_html=True)

    # --- TAB 2: Job & Notes Synthesizer ---
    with tab_summary:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Work Order & Field Notes Executive Synthesizer</h3>
                </div>
                <p style="font-size:0.85rem; color:#64748b; margin-top:-8px; margin-bottom:16px;">
                    Select an active work order with field technician commentary to generate an automated executive briefing and recommended next steps.
                </p>
            """,
            unsafe_allow_html=True,
        )

        job_options = {j["id"]: f"{j.get('jobNumber')} - {j.get('title')} ({j.get('status')})" for j in all_jobs}
        if not job_options:
            st.info("No jobs available for synthesis.")
        else:
            selected_summary_job_id = st.selectbox(
                "Select Work Order to Synthesize",
                options=list(job_options.keys()),
                format_func=lambda x: job_options[x],
            )

            if st.button("Generate Executive Synthesis", use_container_width=True):
                with st.spinner("Synthesizing job logs and telemetry..."):
                    res_sum = client.summarize_job(selected_summary_job_id)

                if res_sum.get("success"):
                    s_data = res_sum["data"]
                    summary_text = s_data.get("summary", "")
                    findings = s_data.get("keyFindings", [])
                    next_step = s_data.get("recommendedNextStep", "")
                    provider = s_data.get("provider", "deterministic-fallback")

                    prov_badge = "Gemini Flash AI" if provider == "gemini" else "Deterministic Fallback Engine"

                    st.markdown(
                        f"""
                        <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:18px 20px; margin-top:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                                <h3 style="margin:0; font-size:1.15rem; color:#0f172a;">Executive Briefing</h3>
                                <span style="background:#f1f5f9; color:#475569; padding:2px 8px; border-radius:4px; font-size:0.75rem; font-weight:600;">{prov_badge}</span>
                            </div>
                            <p style="font-size:0.875rem; line-height:1.6; color:#1e293b; margin-bottom:16px;">
                                {summary_text}
                            </p>
                            <h4 style="font-size:0.9rem; font-weight:600; color:#1e293b; margin:12px 0 6px 0;">Key Technical Findings:</h4>
                        """,
                        unsafe_allow_html=True,
                    )
                    for f in findings:
                        st.markdown(f"<div style='font-size:0.825rem; color:#334155; margin-bottom:4px;'>• {f}</div>", unsafe_allow_html=True)

                    st.markdown(
                        f"""
                            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-left:4px solid #16a34a; border-radius:6px; padding:10px 14px; margin-top:14px; font-size:0.85rem; color:#15803d;">
                                <strong>Recommended Next Dispatch Step:</strong><br/>{next_step}
                            </div>
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )
                else:
                    st.error(f"Synthesis failed: {res_sum.get('error')}")

        st.markdown("</div>", unsafe_allow_html=True)

    # --- TAB 3: Risk & Workload Imbalance ---
    with tab_risks:
        st.markdown(
            """
            <div class="ff-card">
                <div class="ff-card-header">
                    <h3 class="ff-card-title">Operational Imbalance & SLA Risk Audit</h3>
                </div>
            """,
            unsafe_allow_html=True,
        )

        overdue_cnt = summary_data.get("overdue", 0)
        unassigned_cnt = summary_data.get("unassigned", 0)
        workload = workload_data.get("workload", [])

        # Rule 1: Capacity Imbalance
        overloaded_techs = [w for w in workload if w.get("status") in ["OVERLOADED", "HIGH_LOAD"]]
        under_techs = [w for w in workload if w.get("status") == "UNDER_UTILIZED"]

        c_risk1, c_risk2 = st.columns(2)
        with c_risk1:
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #fed7aa; border-left:4px solid #f97316; border-radius:8px; padding:14px 16px; margin-bottom:12px;">
                    <h4 style="font-size:0.95rem; font-weight:700; color:#c2410c; margin:0 0 6px 0;">Workload Imbalance Audit</h4>
                    <p style="font-size:0.825rem; color:#334155; margin:0 0 8px 0;">
                        Detected <strong>{len(overloaded_techs)}</strong> specialists near maximum concurrent capacity and <strong>{len(under_techs)}</strong> specialists with available dispatch capacity.
                    </p>
                    <div style="font-size:0.775rem; color:#64748b;">
                        <strong>Recommendation:</strong> Rebalance high-priority tickets to available technicians in adjacent geographic zones.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with c_risk2:
            st.markdown(
                f"""
                <div style="background:#ffffff; border:1px solid #fecaca; border-left:4px solid #ef4444; border-radius:8px; padding:14px 16px; margin-bottom:12px;">
                    <h4 style="font-size:0.95rem; font-weight:700; color:#b91c1c; margin:0 0 6px 0;">SLA Compliance & Unassigned Risk</h4>
                    <p style="font-size:0.825rem; color:#334155; margin:0 0 8px 0;">
                        <strong>{overdue_cnt}</strong> work orders currently overdue. <strong>{unassigned_cnt}</strong> tickets pending in unassigned queue.
                    </p>
                    <div style="font-size:0.775rem; color:#64748b;">
                        <strong>Recommendation:</strong> Prioritize unassigned CRITICAL tickets before dispatching routine preventative tasks.
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("</div>", unsafe_allow_html=True)
