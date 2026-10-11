import streamlit as st
from services.api_client import get_api_client

NAV_OPTIONS = [
    ("overview", "Operations Overview", "📊"),
    ("jobs", "Job Dispatching", "📋"),
    ("schedule", "Field Schedule", "📅"),
    ("technicians", "Technician Roster", "👷"),
    ("customers", "Customer Directory", "🏢"),
    ("analytics", "Performance Analytics", "📈"),
    ("ai_insights", "AI Insights & Triage", "✨"),
    ("settings", "Platform Settings", "⚙️"),
]

def render_sidebar() -> str:
    client = get_api_client()
    health = client.check_health()
    is_connected = health.get("connected", False)

    with st.sidebar:
        # Brand logo
        st.markdown(
            """
            <div class="brand-header">
                <div class="brand-icon">FF</div>
                <div>
                    <h1 class="brand-title">FieldFlow</h1>
                    <p class="brand-subtitle">Workforce Operations Platform</p>
                </div>
            </div>
            """,
            unsafe_allow_html=True,
        )

        # Live connectivity badge
        if is_connected:
            target_label = "Vercel Cloud" if "vercel.app" in client.base_url else ("Port 5000" if "5000" in client.base_url else "Online")
            st.markdown(
                f"""
                <div class="api-status-banner">
                    <span class="api-status-dot"></span>
                    <span>REST API Live ({target_label})</span>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                """
                <div style="background:#fef2f2; border:1px solid #fecaca; color:#dc2626; padding:6px 10px; border-radius:6px; font-size:0.75rem; font-weight:600;">
                    ⚠️ API Offline - Check Backend
                </div>
                """,
                unsafe_allow_html=True,
            )

        st.markdown("<div style='height: 16px;'></div>", unsafe_allow_html=True)

        # Navigation menu
        current_nav = st.session_state.get("active_view", "overview")
        labels = [f"{icon}  {name}" for (_, name, icon) in NAV_OPTIONS]
        keys = [key for (key, _, _) in NAV_OPTIONS]
        
        default_idx = keys.index(current_nav) if current_nav in keys else 0
        selected_label = st.radio(
            "OPERATIONAL MODULES",
            options=labels,
            index=default_idx,
            label_visibility="visible",
        )
        selected_key = keys[labels.index(selected_label)]
        st.session_state["active_view"] = selected_key

        st.markdown("<div style='height: 24px;'></div>", unsafe_allow_html=True)

        # Authenticated user card
        user = st.session_state.get("current_user")
        if client.token and user:
            user_name = user.get("name", "Alex Rivera (Dispatcher)")
            user_role = user.get("role", "MANAGER")
            user_initials = "".join([part[0] for part in user_name.split()[:2]]).upper()

            st.markdown(
                f"""
                <div class="user-profile-badge">
                    <div class="user-avatar">{user_initials}</div>
                    <div style="overflow: hidden;">
                        <div style="font-weight: 600; font-size: 0.825rem; color: #0f172a; text-overflow: ellipsis; white-space: nowrap;">{user_name}</div>
                        <div style="font-size: 0.725rem; color: #64748b;">Role: <strong>{user_role}</strong></div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
        else:
            st.markdown(
                """
                <div style="background:#fffbeb; border:1px solid #fef3c7; border-radius:6px; padding:8px 10px; font-size:0.75rem; color:#b45309; margin-bottom:8px;">
                    <strong>⚠️ Session Disconnected</strong><br/>Authentication token required
                </div>
                """,
                unsafe_allow_html=True,
            )
            if st.button("🔑 Login as Manager", use_container_width=True, type="primary"):
                client.ensure_authenticated(force=True)
                st.rerun()

        col1, col2 = st.columns(2)
        with col1:
            if st.button("Switch User", use_container_width=True, type="secondary"):
                st.session_state["active_view"] = "settings"
                st.rerun()
        with col2:
            if st.button("Refresh", use_container_width=True):
                st.rerun()

    return st.session_state.get("active_view", "overview")
