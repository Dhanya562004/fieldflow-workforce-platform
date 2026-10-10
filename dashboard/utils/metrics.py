from datetime import datetime
import pandas as pd
from typing import Dict, Any, Optional

def format_status_badge(status: str) -> str:
    status_clean = str(status).upper()
    css_class = {
        "COMPLETED": "status-completed",
        "IN_PROGRESS": "status-inprogress",
        "ASSIGNED": "status-assigned",
        "OPEN": "status-open",
        "CANCELLED": "status-open",
    }.get(status_clean, "status-open")
    
    label = status_clean.replace("_", " ").title()
    return f'<span class="status-pill {css_class}">{label}</span>'

def format_priority_badge(priority: str) -> str:
    p_clean = str(priority).upper()
    css_class = {
        "CRITICAL": "status-critical",
        "HIGH": "status-high",
        "MEDIUM": "status-medium",
        "LOW": "status-low",
    }.get(p_clean, "status-medium")

    label = p_clean.title()
    return f'<span class="status-pill {css_class}">{label}</span>'

def format_datetime(iso_str: Optional[str]) -> str:
    if not iso_str:
        return "Not specified"
    try:
        # Support python datetime parsing of ISO format
        cleaned = iso_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        return dt.strftime("%b %d, %Y • %I:%M %p")
    except Exception:
        return str(iso_str)

def format_date_short(iso_str: Optional[str]) -> str:
    if not iso_str:
        return "-"
    try:
        cleaned = iso_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        return dt.strftime("%b %d, %Y")
    except Exception:
        return str(iso_str)[:10]

def is_overdue(due_date_str: Optional[str], status: str) -> bool:
    if not due_date_str:
        return False
    if status in ["COMPLETED", "CANCELLED"]:
        return False
    try:
        cleaned = due_date_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        return dt.timestamp() < datetime.now().astimezone().timestamp()
    except Exception:
        return False

def build_trend_dataframe(trends_data: list) -> pd.DataFrame:
    if not trends_data:
        return pd.DataFrame(columns=["date", "created", "completed"])
    df = pd.DataFrame(trends_data)
    df["date"] = pd.to_datetime(df["date"])
    return df.sort_values("date")
