import os
import requests
import streamlit as st
from typing import Dict, Any, Optional, List

def resolve_api_base_url() -> str:
    """Determine the active REST API URL from session, environment, secrets, or default."""
    if "custom_api_base_url" in st.session_state and st.session_state["custom_api_base_url"]:
        return st.session_state["custom_api_base_url"].rstrip("/")

    env_url = os.getenv("API_BASE_URL")
    if env_url:
        return env_url.rstrip("/")

    try:
        if hasattr(st, "secrets") and "API_BASE_URL" in st.secrets:
            return st.secrets["API_BASE_URL"].rstrip("/")
    except Exception:
        pass

    # Quick probe if local port 5000 is running
    try:
        r = requests.get("http://localhost:5000/health", timeout=0.4)
        if r.status_code == 200:
            return "http://localhost:5000/api"
    except Exception:
        pass

    # Default to production Vercel backend
    return "https://fieldflow-backend.vercel.app/api"

class FieldFlowApiClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or resolve_api_base_url()).rstrip("/")
        self.timeout = 8.0

    @property
    def token(self) -> Optional[str]:
        return st.session_state.get("auth_token", None)

    @token.setter
    def token(self, val: Optional[str]):
        st.session_state["auth_token"] = val

    def _headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def check_health(self) -> Dict[str, Any]:
        root_url = self.base_url.replace("/api", "")
        # Probe root /health and /api/health
        for url in [f"{root_url}/health", f"{self.base_url}/health"]:
            try:
                r = requests.get(url, timeout=4.0)
                if r.status_code == 200:
                    return {"connected": True, "data": r.json(), "url": url}
            except Exception:
                continue
        return {"connected": False, "error": "Backend health probe unreachable"}

    def login(self, email: str, password: str) -> Dict[str, Any]:
        try:
            r = requests.post(
                f"{self.base_url}/auth/login",
                json={"email": email, "password": password},
                timeout=self.timeout,
            )
            data = r.json()
            if r.status_code == 200 and data.get("success"):
                token = data["data"]["token"]
                user = data["data"]["user"]
                self.token = token
                st.session_state["current_user"] = user
                return {"success": True, "user": user, "token": token}
            return {
                "success": False,
                "error": data.get("error", {}).get("message", "Login failed"),
            }
        except Exception as e:
            return {"success": False, "error": f"API Connection Error: {str(e)}"}

    def ensure_authenticated(self) -> bool:
        """Automatically authenticate using demo manager credentials if token missing."""
        if self.token and st.session_state.get("current_user"):
            return True
        # Attempt auto-login with standard dispatcher credentials
        res = self.login("manager@fieldflow.io", "Manager123!")
        return res.get("success", False)

    # --- Dashboard Metrics ---
    def get_summary(self) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.get(
                f"{self.base_url}/dashboard/summary",
                headers=self._headers(),
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", {})
            return {}
        except Exception:
            return {}

    def get_job_trends(self) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.get(
                f"{self.base_url}/dashboard/job-trends",
                headers=self._headers(),
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", {})
            return {}
        except Exception:
            return {}

    def get_workload(self) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.get(
                f"{self.base_url}/dashboard/workload",
                headers=self._headers(),
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", {})
            return {}
        except Exception:
            return {}

    # --- Jobs Operations ---
    def list_jobs(
        self,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        technician_id: Optional[str] = None,
        customer_id: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        self.ensure_authenticated()
        params: Dict[str, Any] = {"limit": limit}
        if status and status != "ALL":
            params["status"] = status
        if priority and priority != "ALL":
            params["priority"] = priority
        if technician_id and technician_id != "ALL":
            params["technicianId"] = technician_id
        if customer_id and customer_id != "ALL":
            params["customerId"] = customer_id
        if search:
            params["search"] = search

        try:
            r = requests.get(
                f"{self.base_url}/jobs",
                headers=self._headers(),
                params=params,
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", [])
            return []
        except Exception:
            return []

    def get_job(self, job_id: str) -> Optional[Dict[str, Any]]:
        self.ensure_authenticated()
        try:
            r = requests.get(
                f"{self.base_url}/jobs/{job_id}",
                headers=self._headers(),
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", None)
            return None
        except Exception:
            return None

    def create_job(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/jobs",
                headers=self._headers(),
                json=data,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 201:
                return {"success": True, "job": res.get("data")}
            return {
                "success": False,
                "error": res.get("error", {}).get("message", "Job creation failed"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_job(self, job_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.patch(
                f"{self.base_url}/jobs/{job_id}",
                headers=self._headers(),
                json=data,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "job": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Update failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_job_status(self, job_id: str, status: str, note: Optional[str] = None) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            payload: Dict[str, Any] = {"status": status}
            if note:
                payload["note"] = note
            r = requests.patch(
                f"{self.base_url}/jobs/{job_id}/status",
                headers=self._headers(),
                json=payload,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "job": res.get("data")}
            return {
                "success": False,
                "error": res.get("error", {}).get("message", "Status transition failed"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def assign_job(self, job_id: str, technician_id: Optional[str]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/jobs/{job_id}/assign",
                headers=self._headers(),
                json={"technicianId": technician_id},
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "job": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Assignment failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def add_job_note(self, job_id: str, content: str, is_internal: bool = False) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/jobs/{job_id}/notes",
                headers=self._headers(),
                json={"content": content, "isInternal": is_internal},
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 201:
                return {"success": True, "note": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Failed to add note")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # --- Technicians ---
    def list_technicians(self) -> List[Dict[str, Any]]:
        self.ensure_authenticated()
        try:
            r = requests.get(
                f"{self.base_url}/technicians",
                headers=self._headers(),
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", [])
            return []
        except Exception:
            return []

    def create_technician(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/technicians",
                headers=self._headers(),
                json=data,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 201:
                return {"success": True, "technician": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Failed to create technician")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def update_technician(self, tech_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.patch(
                f"{self.base_url}/technicians/{tech_id}",
                headers=self._headers(),
                json=data,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "technician": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Update failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # --- Customers ---
    def list_customers(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        self.ensure_authenticated()
        params = {"limit": 100}
        if search:
            params["search"] = search
        try:
            r = requests.get(
                f"{self.base_url}/customers",
                headers=self._headers(),
                params=params,
                timeout=self.timeout,
            )
            if r.status_code == 200:
                return r.json().get("data", [])
            return []
        except Exception:
            return []

    def create_customer(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/customers",
                headers=self._headers(),
                json=data,
                timeout=self.timeout,
            )
            res = r.json()
            if r.status_code == 201:
                return {"success": True, "customer": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "Failed to create customer")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    # --- AI Insights ---
    def summarize_job(self, job_id: str) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/ai/summarize-job",
                headers=self._headers(),
                json={"jobId": job_id},
                timeout=10.0,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "data": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "AI summarization failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def suggest_priority(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self.ensure_authenticated()
        try:
            r = requests.post(
                f"{self.base_url}/ai/suggest-priority",
                headers=self._headers(),
                json=data,
                timeout=10.0,
            )
            res = r.json()
            if r.status_code == 200:
                return {"success": True, "data": res.get("data")}
            return {"success": False, "error": res.get("error", {}).get("message", "AI recommendation failed")}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Global Singleton Helper
@st.cache_resource
def get_api_client() -> FieldFlowApiClient:
    return FieldFlowApiClient()
