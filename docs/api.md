# FieldFlow REST API Specification
## Shared Contract Documentation

All endpoints follow standard REST conventions and JSON payloads.
Base URL: `http://localhost:5000/api` (Production: configurable via `API_BASE_URL`).

---

## 1. Authentication & Authorization

All protected routes require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

Role Hierarchy:
- `ADMIN`: Full system access, technician/customer management, job lifecycle.
- `MANAGER`: Operations dispatching, job creation, assignment, reporting.
- `TECHNICIAN`: Access to assigned work orders, personal profile, status updates, notes.

### Standard Response Envelope
Success responses return raw object or array with standard HTTP 200/201.
Error responses follow:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR | UNAUTHORIZED | FORBIDDEN | NOT_FOUND | CONFLICT | INTERNAL_SERVER_ERROR",
    "message": "Human-readable description",
    "details": []
  }
}
```

---

## 2. Endpoints Reference

### Health Check
- **`GET /health`**
  - **Auth**: None
  - **Response 200**:
    ```json
    {
      "status": "ok",
      "timestamp": "2026-10-10T14:00:00.000Z",
      "database": "connected",
      "uptime": 124.5
    }
    ```

---

### Authentication (`/api/auth`)

- **`POST /api/auth/register`**
  - **Auth**: None (or Admin for staff creation)
  - **Body**:
    ```json
    {
      "email": "tech1@fieldflow.io",
      "password": "Password123!",
      "name": "Marcus Vance",
      "role": "TECHNICIAN",
      "phone": "+1-555-0199"
    }
    ```
  - **Response 201**: `{ "token": "...", "user": { "id": "...", "email": "...", "role": "..." } }`

- **`POST /api/auth/login`**
  - **Auth**: None
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Response 200**: `{ "token": "...", "user": { ... } }`

- **`GET /api/auth/me`**
  - **Auth**: Bearer Token
  - **Response 200**: Current authenticated user profile with role & technician metadata.

---

### Jobs (`/api/jobs`)

- **`GET /api/jobs`**
  - **Auth**: Bearer Token
  - **Query Params**:
    - `status`: Filter by `OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED`
    - `priority`: Filter by `LOW | MEDIUM | HIGH | CRITICAL`
    - `technicianId`: Filter by assigned technician
    - `customerId`: Filter by customer
    - `search`: Search query across title, job number, customer name, address
    - `page`: Page index (default `1`)
    - `limit`: Items per page (default `20`, max `100`)
  - **Behavior**: Technicians automatically only receive jobs assigned to them.
  - **Response 200**:
    ```json
    {
      "jobs": [...],
      "pagination": { "total": 45, "page": 1, "limit": 20, "totalPages": 3 }
    }
    ```

- **`POST /api/jobs`**
  - **Auth**: Admin or Manager
  - **Body**:
    ```json
    {
      "title": "HVAC Compressor Overheat Diagnostic",
      "description": "Commercial chiller unit shut down with high pressure alarm.",
      "customerId": "uuid-...",
      "assignedTechnicianId": "uuid-...",
      "serviceAddress": "742 Evergreen Terrace, Springfield",
      "priority": "HIGH",
      "scheduledStart": "2026-10-11T09:00:00.000Z",
      "dueDate": "2026-10-11T17:00:00.000Z"
    }
    ```
  - **Response 201**: Created Job record with generated `jobNumber` (e.g. `JOB-2026-0042`).

- **`GET /api/jobs/:id`**
  - **Auth**: Bearer Token (Technicians can only view assigned jobs).
  - **Response 200**: Job with relations (Customer, AssignedTechnician, Notes, Attachments, ActivityLog).

- **`PATCH /api/jobs/:id`**
  - **Auth**: Admin or Manager (Job details update).
  - **Body**: Partial job fields.
  - **Response 200**: Updated Job.

- **`PATCH /api/jobs/:id/status`**
  - **Auth**: Bearer Token (Manager, Admin, or Assigned Technician).
  - **Body**: `{ "status": "IN_PROGRESS | COMPLETED | CANCELLED", "note": "Technician arrived on site" }`
  - **Response 200**: Updated Job with timestamp updates (`startedAt`, `completedAt`).

- **`POST /api/jobs/:id/assign`**
  - **Auth**: Admin or Manager.
  - **Body**: `{ "technicianId": "uuid-..." }`
  - **Response 200**: Updated Job with status transitioned to `ASSIGNED`.

- **`POST /api/jobs/:id/notes`**
  - **Auth**: Bearer Token (Manager, Admin, or Assigned Technician).
  - **Body**: `{ "content": "Replaced run capacitor and refilled R-410A.", "isInternal": false }`
  - **Response 201**: Created `JobNote`.

- **`POST /api/jobs/:id/attachments`**
  - **Auth**: Bearer Token (Multipart form data).
  - **File**: `file` (Image/PDF, max 10MB).
  - **Response 201**: Created `JobAttachment`.

---

### Technicians (`/api/technicians`)

- **`GET /api/technicians`**
  - **Auth**: Bearer Token (Manager/Admin).
  - **Response 200**: List of technicians with profile, active job count, completed count, and availability.

- **`POST /api/technicians`**
  - **Auth**: Admin/Manager.
  - **Body**: User creation + Technician profile payload.
  - **Response 201**: Created technician.

- **`GET /api/technicians/:id`**
  - **Auth**: Bearer Token.
  - **Response 200**: Technician details and active schedule.

- **`PATCH /api/technicians/:id`**
  - **Auth**: Admin/Manager or Self.
  - **Body**: Availability, skills, contact info.

---

### Customers (`/api/customers`)

- **`GET /api/customers`**
  - **Auth**: Bearer Token.
  - **Query Params**: `search`, `limit`, `page`.
  - **Response 200**: Customer records with job counts.

- **`POST /api/customers`**
  - **Auth**: Manager/Admin.
  - **Body**: Customer details.
  - **Response 201**: Created Customer.

- **`GET /api/customers/:id`**
  - **Auth**: Bearer Token.
  - **Response 200**: Customer details with service history.

---

### Operations Dashboard Metrics (`/api/dashboard`)

- **`GET /api/dashboard/summary`**
  - **Auth**: Manager/Admin.
  - **Response 200**:
    ```json
    {
      "totalJobs": 48,
      "inProgress": 12,
      "completed": 28,
      "overdue": 4,
      "unassigned": 4,
      "activeTechnicians": 8,
      "completionRate": 87.5
    }
    ```

- **`GET /api/dashboard/job-trends`**
  - **Auth**: Manager/Admin.
  - **Response 200**: Daily volume and completion trends for the last 14 days.

- **`GET /api/dashboard/workload`**
  - **Auth**: Manager/Admin.
  - **Response 200**: Breakdown of assignments per technician, capacity utilization, and backlog.

---

### AI Insights (`/api/ai`)

- **`POST /api/ai/summarize-job`**
  - **Auth**: Bearer Token.
  - **Body**: `{ "jobId": "uuid-..." }`
  - **Response 200**:
    ```json
    {
      "jobId": "uuid-...",
      "summary": "Commercial chiller shutdown resolved with capacitor replacement. Follow-up inspection recommended in 30 days.",
      "keyFindings": ["Run capacitor blown", "Refrigerant pressure stabilized"],
      "recommendedNextStep": "Schedule 30-day preventative maintenance check",
      "provider": "gemini | rule-based-fallback"
    }
    ```

- **`POST /api/ai/suggest-priority`**
  - **Auth**: Bearer Token.
  - **Body**: `{ "title": "...", "description": "...", "customerTier": "PREMIUM", "dueDate": "..." }`
  - **Response 200**:
    ```json
    {
      "suggestedPriority": "CRITICAL",
      "confidence": 0.92,
      "reasoning": "Keywords indicate complete system outage for enterprise account with 4-hour SLA.",
      "riskFactors": ["System outage", "Enterprise SLA breach imminent"],
      "provider": "gemini | rule-based-fallback"
    }
    ```

- **`GET /api/ai/health`**
  - **Auth**: Bearer Token.
  - **Response 200**: AI provider status, model name, and fallback readiness.
