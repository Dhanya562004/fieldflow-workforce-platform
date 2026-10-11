import streamlit as st
import time
from services.api_client import get_api_client

def render_settings_view():
    client = get_api_client()

    st.markdown(
        """
        <div style="margin-bottom: 20px;">
            <h1 class="page-title">Platform Configuration & System Health</h1>
            <p class="page-subtitle">Inspect API gateway connectivity, manage session credentials, and configure deployment settings.</p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 1. API Connectivity & Health Probe
    st.markdown(
        """
        <div class="ff-card">
            <div class="ff-card-header"><h3 class="ff-card-title">API Gateway Connectivity Probe</h3></div>
        """,
        unsafe_allow_html=True,
    )

    col_probe1, col_probe2 = st.columns([2, 1])
    with col_probe1:
        st.markdown(f"**Target Gateway Base URL:** `{client.base_url}`")
        if st.button("Probe Health Endpoint (GET /health)"):
            t0 = time.time()
            health = client.check_health()
            elapsed_ms = round((time.time() - t0) * 1000, 1)

            if health.get("connected"):
                h_data = health.get("data", {})
                st.success(
                    f"✅ Gateway Connected in **{elapsed_ms} ms** | Database: **{h_data.get('database')}** | Uptime: **{h_data.get('uptimeSeconds')}s**"
                )
            else:
                st.error(f"❌ Connection Failed: {health.get('error')}")

        if st.button("🚀 Initialize & Seed Database (/api/bootstrap)", key="btn_bootstrap"):
            import requests
            try:
                r = requests.get(f"{client.base_url}/bootstrap", timeout=20.0)
                res = r.json()
                if res.get("success"):
                    st.success("✅ Database schema initialized and operational seed records populated!")
                    client.ensure_authenticated(force=True)
                    st.rerun()
                else:
                    st.error(f"Bootstrap failed: {res.get('error', {}).get('message', 'Unknown error')}")
            except Exception as e:
                st.error(f"Bootstrap error: {str(e)}")

    with col_probe2:
        st.markdown(
            """
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:10px 12px; font-size:0.8rem;">
                <div><strong>Backend Port:</strong> 5000</div>
                <div><strong>Dashboard Port:</strong> 8501</div>
                <div><strong>Database:</strong> PostgreSQL 16 (Port 5433)</div>
            </div>
            """,
            unsafe_allow_html=True,
        )

    st.markdown("</div>", unsafe_allow_html=True)

    # 2. Demo User Credentials Switcher
    st.markdown(
        """
        <div class="ff-card">
            <div class="ff-card-header"><h3 class="ff-card-title">Session Authentication & Role Switcher</h3></div>
            <p style="font-size:0.85rem; color:#64748b; margin-top:-8px; margin-bottom:14px;">
                Switch between pre-configured operational roles to test RBAC and dispatch permissions.
            </p>
        """,
        unsafe_allow_html=True,
    )

    user = st.session_state.get("current_user", {})
    st.markdown(f"**Active Account:** `{user.get('email', 'manager@fieldflow.io')}` | Role: **{user.get('role', 'MANAGER')}**")

    c1, c2, c3 = st.columns(3)
    with c1:
        if st.button("Switch to Operations Manager (Alex Rivera)", use_container_width=True):
            res = client.login("manager@fieldflow.io", "Manager123!")
            if res.get("success"):
                st.success("Authenticated as Operations Manager")
                st.rerun()
    with c2:
        if st.button("Switch to VP Operations / Admin (Sarah Jenkins)", use_container_width=True):
            res = client.login("admin@fieldflow.io", "Admin123!")
            if res.get("success"):
                st.success("Authenticated as VP Operations (Admin)")
                st.rerun()
    with c3:
        if st.button("Sign Out / Clear Session", use_container_width=True, type="secondary"):
            st.session_state["auth_token"] = None
            st.session_state["current_user"] = None
            st.info("Signed out.")
            st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

    # 3. Environment Variables & Deployment Notes
    st.markdown(
        """
        <div class="ff-card">
            <div class="ff-card-header"><h3 class="ff-card-title">Cloud Deployment Reference</h3></div>
            <div style="font-size:0.85rem; color:#334155; line-height:1.6;">
                <p>When deploying this dashboard to <strong>Streamlit Community Cloud</strong>:</p>
                <ul>
                    <li>Add <code>API_BASE_URL="https://your-deployed-express-api.onrender.com/api"</code> in <strong>Streamlit Secrets</strong> (<code>.streamlit/secrets.toml</code>).</li>
                    <li>Ensure the Express API has CORS configured for the Streamlit domain (already enabled via <code>cors(origin: '*')</code> in Express).</li>
                    <li>Ensure PostgreSQL migrations are applied via <code>npx prisma db push</code> or <code>prisma migrate deploy</code> on the backend host.</li>
                </ul>
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )
