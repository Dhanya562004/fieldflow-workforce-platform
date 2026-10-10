# FieldFlow Architecture Documentation
## AI-Powered Field Operations & Workforce Management Platform

## 1. System Overview
FieldFlow is an enterprise-grade field operations management platform designed for service organizations (hvac, electrical, plumbing, inspections, facilities maintenance).

The platform coordinates two primary user archetypes:
1. **Operations Managers / Dispatchers (Web Dashboard)**: Monitor real-time KPIs, assign and reassign work orders, balance technician loads, track SLAs and overdue risks, and leverage AI to synthesize customer notes and recommend job priorities.
2. **Field Technicians (Mobile Application)**: Receive assigned jobs, view customer location and service history, update job status (`ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED`), record field notes, and upload photo proof of completion.

```
+-------------------------------------------------------------+
|                     FieldFlow Ecosystem                     |
+-------------------------------------------------------------+
               |                               |
       Streamlit Web App               React Native Expo
    (Operations Dispatcher)             (Field Technician)
               |                               |
               +---------------+---------------+
                               | HTTPS REST API (JWT RBAC)
                               v
                     Express API (TypeScript)
                     - Zod Request Validation
                     - Centralized Error Handler
                     - Role-Based Access Control
                     - AI Provider Adapter (Gemini + Deterministic Fallback)
                               |
               +---------------+---------------+
               |                               |
               v                               v
       Prisma ORM (PostgreSQL)         Local / Cloud Object Store
       - Relational Integrity          - Photo Attachments
       - Indexes & Auditing
```

---

## 2. Component Architecture

### A. Backend API (`/backend`)
- **Runtime**: Node.js v20+ / v22+ with TypeScript.
- **Framework**: Express with strict routing modules.
- **ORM & Database**: Prisma ORM with PostgreSQL.
- **Security**:
  - Bcrypt password hashing (cost factor 10).
  - JWT tokens with HMAC-SHA256 signature and configurable expiration.
  - Role-based authorization middleware (`ADMIN`, `MANAGER`, `TECHNICIAN`).
  - Technician tenant isolation: Technicians can query and modify only jobs assigned to their user ID.
  - Helmet security headers and CORS configuration.
  - Rate limiting on authentication and sensitive write endpoints.
- **AI Integration**:
  - Adapter pattern (`AiService`): Interfaces with Google Gemini Flash / Pro API via official SDK or REST when `GEMINI_API_KEY` is present.
  - Zero-failure fallback: Deterministic rule-based priority engine and keyword-extracted summarization when the API key is missing or the external service experiences rate limits.

### B. Operations Web Dashboard (`/dashboard`)
- **Technology**: Python 3.10+, Streamlit, Plotly Express/Graph Objects, Pandas.
- **Visual Design**:
  - Bespoke enterprise SaaS styling via injected CSS tokens (Inter typography, slate/indigo/teal palette, 8px grid system, subtle border radius and surface shadows).
  - Multi-view navigation (Overview, Jobs, Schedule, Technicians, Customers, Analytics, AI Insights, Settings).
  - State management via `st.session_state` with token persistence and session isolation.
  - Offline-resilient and live API health status banner.

### C. Mobile Application (`/mobile`)
- **Framework**: React Native with Expo SDK 51/52 and TypeScript.
- **Navigation**: React Navigation stack and bottom tab navigation.
- **Security**: Expo SecureStore for encrypted hardware-backed storage of JWT authentication tokens.
- **State & Networking**: Custom typed API client with token interceptor, exponential retry, and loading/empty/error states.
- **Screens**:
  1. `LoginScreen`: Secure technician credentials authentication.
  2. `MyJobsScreen`: Filterable work order list (`ALL`, `ASSIGNED`, `IN_PROGRESS`, `COMPLETED`) with pull-to-refresh.
  3. `JobDetailsScreen`: Customer address, scheduled window, description, notes history, contact actions.
  4. `UpdateJobScreen`: Status change dispatcher, note composer, photo attachment.
  5. `ProfileScreen`: Technician credentials, active assignment summary, API connection indicator, logout.

---

## 3. Relational Data Model (Prisma)
- **User**: Authentication record (`id`, `email`, `passwordHash`, `name`, `role`, `phone`, `isActive`, `createdAt`, `updatedAt`).
- **TechnicianProfile**: Worker operational metadata (`id`, `userId`, `skills`, `vehicleNumber`, `serviceZone`, `maxConcurrentJobs`, `isAvailable`).
- **Customer**: Service recipient (`id`, `name`, `company`, `email`, `phone`, `address`, `city`, `state`, `postalCode`, `latitude`, `longitude`, `notes`).
- **Job**: Work order entity (`id`, `jobNumber`, `title`, `description`, `customerId`, `assignedTechnicianId`, `serviceAddress`, `latitude`, `longitude`, `priority`, `status`, `scheduledStart`, `dueDate`, `startedAt`, `completedAt`, `createdById`).
- **JobNote**: Operational commentary and field updates (`id`, `jobId`, `authorId`, `content`, `isInternal`, `createdAt`).
- **JobAttachment**: Photographic and document evidence (`id`, `jobId`, `uploaderId`, `fileName`, `fileUrl`, `fileType`, `fileSize`, `createdAt`).
- **ActivityLog**: Audit trail for state changes and assignment mutations (`id`, `jobId`, `actorId`, `action`, `metadata`, `createdAt`).

---

## 4. Operational State Machine
```
   [CREATED / OPEN]
          |
          | (Assign Technician)
          v
     [ASSIGNED]
          |
          | (Technician: Start Work)
          v
    [IN_PROGRESS]
          |
          +-----------------------+
          |                       |
   (Complete Work)          (Cancel Job)
          v                       v
     [COMPLETED]             [CANCELLED]
```
Transitions are validated at the domain service layer:
- A job cannot move directly from `OPEN` to `COMPLETED`.
- Only assigned technicians or managers can transition `ASSIGNED` -> `IN_PROGRESS`.
- Technicians cannot mutate jobs assigned to other technicians.
