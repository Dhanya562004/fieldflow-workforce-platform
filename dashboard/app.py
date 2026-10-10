import streamlit as st

# Configure page metadata
st.set_page_config(
    page_title="FieldFlow — Operations Platform",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Injected enterprise styling
from components.styles import inject_custom_styles
inject_custom_styles()

# Services and views
from services.api_client import get_api_client
from components.sidebar import render_sidebar

from views.overview import render_overview_view
from views.jobs import render_jobs_view
from views.schedule import render_schedule_view
from views.technicians import render_technicians_view
from views.customers import render_customers_view
from views.analytics import render_analytics_view
from views.ai_insights import render_ai_insights_view
from views.settings import render_settings_view

def main():
    client = get_api_client()
    # Initialize authentication session
    client.ensure_authenticated()

    # Render fixed sidebar navigation
    active_view = render_sidebar()

    # Route view
    if active_view == "overview":
        render_overview_view()
    elif active_view == "jobs":
        render_jobs_view()
    elif active_view == "schedule":
        render_schedule_view()
    elif active_view == "technicians":
        render_technicians_view()
    elif active_view == "customers":
        render_customers_view()
    elif active_view == "analytics":
        render_analytics_view()
    elif active_view == "ai_insights":
        render_ai_insights_view()
    elif active_view == "settings":
        render_settings_view()
    else:
        render_overview_view()

if __name__ == "__main__":
    main()
