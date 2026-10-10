import streamlit as st

def inject_custom_styles():
    st.markdown(
        """
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        html, body, [class*="css"] {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            color: #0f172a;
        }

        /* Top header padding cleanup */
        .block-container {
            padding-top: 1.8rem;
            padding-bottom: 3rem;
            padding-left: 2rem;
            padding-right: 2rem;
            max-width: 1400px;
        }

        /* Background adjustments */
        .stApp {
            background-color: #f8fafc;
        }

        /* Sidebar Styling */
        [data-testid="stSidebar"] {
            background-color: #ffffff;
            border-right: 1px solid #e2e8f0;
            padding-top: 1rem;
        }
        [data-testid="stSidebar"] .block-container {
            padding-top: 1rem;
            padding-left: 1.25rem;
            padding-right: 1.25rem;
        }

        /* Logo Brand Container */
        .brand-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 4px 20px 4px;
            margin-bottom: 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .brand-icon {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #2563eb, #1e40af);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 1.1rem;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
        }
        .brand-title {
            font-size: 1.2rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin: 0;
            line-height: 1.2;
        }
        .brand-subtitle {
            font-size: 0.75rem;
            color: #64748b;
            font-weight: 500;
            margin: 0;
        }

        /* User Profile Badge in Sidebar */
        .user-profile-badge {
            display: flex;
            align-items: center;
            gap: 10px;
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 12px;
            margin-top: 24px;
            margin-bottom: 12px;
        }
        .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            background: #e2e8f0;
            color: #1e293b;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: 0.85rem;
        }

        /* Top Header Component */
        .top-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 1px solid #e2e8f0;
            flex-wrap: wrap;
            gap: 16px;
        }
        .page-title {
            font-size: 1.65rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.025em;
            margin: 0 0 4px 0;
        }
        .page-subtitle {
            font-size: 0.875rem;
            color: #64748b;
            margin: 0;
            font-weight: 400;
        }

        /* Enterprise Card Container */
        .ff-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 20px 24px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02);
            margin-bottom: 18px;
        }
        .ff-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
        }
        .ff-card-title {
            font-size: 1rem;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
        }

        /* Metric KPI Row Cards */
        .kpi-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 18px 20px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            display: flex;
            flex-direction: column;
            gap: 6px;
            position: relative;
            overflow: hidden;
        }
        .kpi-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
        }
        .kpi-total::before { background-color: #3b82f6; }
        .kpi-inprogress::before { background-color: #0d9488; }
        .kpi-completed::before { background-color: #10b981; }
        .kpi-overdue::before { background-color: #ef4444; }

        .kpi-label {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: #64748b;
            margin: 0;
        }
        .kpi-value {
            font-size: 2rem;
            font-weight: 700;
            color: #0f172a;
            line-height: 1.1;
            margin: 0;
        }
        .kpi-subtext {
            font-size: 0.775rem;
            color: #64748b;
            display: flex;
            align-items: center;
            gap: 4px;
            margin: 0;
        }

        /* Status & Priority Pills */
        .status-pill {
            display: inline-flex;
            align-items: center;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .status-completed {
            background-color: #ecfdf5;
            color: #059669;
            border: 1px solid #a7f3d0;
        }
        .status-inprogress {
            background-color: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
        }
        .status-assigned {
            background-color: #fffbeb;
            color: #d97706;
            border: 1px solid #fde68a;
        }
        .status-open {
            background-color: #f1f5f9;
            color: #475569;
            border: 1px solid #cbd5e1;
        }
        .status-critical {
            background-color: #fef2f2;
            color: #dc2626;
            border: 1px solid #fecaca;
        }
        .status-high {
            background-color: #fff7ed;
            color: #ea580c;
            border: 1px solid #fed7aa;
        }
        .status-medium {
            background-color: #eff6ff;
            color: #2563eb;
            border: 1px solid #bfdbfe;
        }
        .status-low {
            background-color: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
        }

        /* Operational Job Item Card */
        .job-item-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 14px 18px;
            margin-bottom: 12px;
            transition: all 0.15s ease-in-out;
        }
        .job-item-card:hover {
            border-color: #cbd5e1;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }

        /* Buttons Styling */
        div.stButton > button {
            background-color: #2563eb;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 6px 16px;
            font-weight: 500;
            font-size: 0.875rem;
            transition: all 0.15s ease;
            box-shadow: 0 1px 2px rgba(37, 99, 235, 0.15);
        }
        div.stButton > button:hover {
            background-color: #1d4ed8;
            color: white;
            border: none;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.25);
        }

        /* Secondary Button */
        div[data-testid="stHorizontalBlock"] div.stButton > button[kind="secondary"] {
            background-color: #ffffff;
            color: #334155;
            border: 1px solid #cbd5e1;
        }

        /* System Connectivity Banner */
        .api-status-banner {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.775rem;
            font-weight: 500;
            padding: 4px 10px;
            border-radius: 6px;
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            color: #15803d;
        }
        .api-status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #22c55e;
            box-shadow: 0 0 6px #22c55e;
        }

        /* Streamlit Element Overrides */
        div[data-baseweb="select"] > div {
            background-color: #ffffff;
            border-color: #cbd5e1;
            border-radius: 6px;
        }
        input[type="text"], input[type="password"] {
            background-color: #ffffff;
            border-color: #cbd5e1 !important;
            border-radius: 6px !important;
        }
        </style>
        """,
        unsafe_allow_html=True,
    )
