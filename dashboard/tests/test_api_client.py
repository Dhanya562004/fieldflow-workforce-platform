import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.api_client import FieldFlowApiClient

def test_api_client_initialization():
    client = FieldFlowApiClient("http://localhost:5000/api")
    assert client.base_url == "http://localhost:5000/api"
    assert client.timeout == 8.0

def test_api_client_error_handling_when_offline():
    # Points to an unreachable port to verify zero-crash graceful error handling
    client = FieldFlowApiClient("http://127.0.0.1:59999/api")
    health = client.check_health()
    assert health["connected"] is False
    assert "error" in health

    login_res = client.login("nonexistent@fieldflow.io", "wrong")
    assert login_res["success"] is False
    assert "API Connection Error" in login_res["error"]

    jobs = client.list_jobs()
    assert jobs == []

    summary = client.get_summary()
    assert summary == {}
