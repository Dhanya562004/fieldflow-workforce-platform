import pytest
from datetime import datetime, timedelta
import sys
import os

# Add dashboard folder to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from utils.metrics import (
    format_status_badge,
    format_priority_badge,
    format_datetime,
    is_overdue,
    build_trend_dataframe,
)

def test_format_status_badge():
    badge = format_status_badge("COMPLETED")
    assert "status-completed" in badge
    assert "Completed" in badge

    badge_prog = format_status_badge("IN_PROGRESS")
    assert "status-inprogress" in badge_prog
    assert "In Progress" in badge_prog

def test_format_priority_badge():
    badge_crit = format_priority_badge("CRITICAL")
    assert "status-critical" in badge_crit
    assert "Critical" in badge_crit

    badge_low = format_priority_badge("LOW")
    assert "status-low" in badge_low
    assert "Low" in badge_low

def test_format_datetime():
    assert format_datetime(None) == "Not specified"
    iso_str = "2026-10-11T14:30:00.000Z"
    formatted = format_datetime(iso_str)
    assert "Oct 11, 2026" in formatted

def test_is_overdue():
    # Past due date with active status
    past = (datetime.now() - timedelta(days=2)).isoformat()
    assert is_overdue(past, "IN_PROGRESS") is True
    assert is_overdue(past, "ASSIGNED") is True

    # Completed job is never overdue
    assert is_overdue(past, "COMPLETED") is False
    assert is_overdue(past, "CANCELLED") is False

    # Future date is not overdue
    future = (datetime.now() + timedelta(days=2)).isoformat()
    assert is_overdue(future, "IN_PROGRESS") is False

def test_build_trend_dataframe():
    data = [
        {"date": "2026-10-01", "created": 4, "completed": 2},
        {"date": "2026-10-02", "created": 3, "completed": 3},
    ]
    df = build_trend_dataframe(data)
    assert len(df) == 2
    assert "date" in df.columns
    assert df["created"].sum() == 7
