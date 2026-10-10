# FieldFlow — AI-Powered Field Operations & Workforce Management Platform

[![CI Pipeline](https://github.com/Dhanya562004/fieldflow-workforce-platform/actions/workflows/ci.yml/badge.svg)](https://github.com/Dhanya562004/fieldflow-workforce-platform/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.38-FF4B4B.svg)](https://streamlit.io/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB.svg)](https://reactnative.dev/)

FieldFlow is an enterprise-grade field operations and workforce dispatching platform engineered for technical service organizations (commercial HVAC, high-voltage electrical, hydronics, life safety, facilities maintenance).

It provides an end-to-end operational loop between **Operations Managers / Dispatchers** (using a bespoke Streamlit Web Console) and **Field Technicians** (using an Expo React Native mobile application), backed by a unified **Node.js Express + TypeScript REST API** and **PostgreSQL with Prisma ORM**.

---

## 1. The Operational Problem Solved

Field service organizations suffer from three critical bottlenecks:
1. **SLA Blind Spots**: Dispatchers manually balance incoming work orders across disparate spreadsheets, resulting in overdue tickets and missed enterprise contractual response times.
2. **Technician Tenant Leakage & Double Dispatch**: Lack of strict role-based access control and state machine validations leads to inconsistent job statuses, overlapping assignments, and unauthorized data access.
3. **Information Bottlenecks**: Important on-site diagnostic commentary, error codes, and parts data stay trapped in text messages rather than being synthesized into structured job histories and actionable priorities.

FieldFlow solves this with strict relational modeling, tenant isolation, live SLA tracking, automated load balancing, and AI-assisted priority recommendation and field note synthesis.

---

## 2. Architecture Diagram

```text
                  Streamlit Operations Console (Python)
                  - Polished Enterprise SaaS UI (Inter typography)
                  - Real-time Plotly Analytics (14-day velocity, load balance)
                  - Dispatching, Technicians, Customers, SLA Alerts
                  - AI Triage & Note Synthesizer Interface
                                    |
                                    | HTTPS REST API (JWT RBAC)
                                    v
React Native Expo Mobile -----------+-- Express REST API (TypeScript)
- Field Technicians                 |   - Zod Request Schema Validation
- Assigned Job Filter               |   - Role-Based Access Control (ADMIN, MANAGER, TECHNICIAN)
- Start / Complete Job Dispatch     |   - Strict State Machine Transitions
- Photo & Diagnostic Notes Log      |   - Centralized Error Handling & Structured Audit Logs
- Hardware Token Storage (SecureStore)  - Multer Photo Attachments
                                    |   - OpenAPI 3.0 / Swagger Interactive Explorer
                                    |
                                    +-- AI Provider Adapter
                                    |   - Google Gemini 1.5 Flash
                                    |   - Deterministic Fallback Rule Engine
                                    |
                                    v
                           PostgreSQL 16 + Prisma ORM
                           - Relational Data Integrity
                           - Composite Indexes & Audit Logs
```

Both the Web Dashboard and the Mobile App interact with the **exact same backend API and database**.

---

## 3. Technology Stack

### Backend API
- **Runtime**: Node.js (v20+ / v22+)
- **Framework**: Express with TypeScript 5.6
- **ORM & Database**: Prisma ORM with PostgreSQL 16
- **Validation**: Zod schema validation for all endpoints
- **Security**: JWT authentication (HMAC-SHA256), bcryptjs password hashing, Helmet headers, CORS
- **Documentation**: OpenAPI 3.0 specification & Swagger UI explorer at `/api/docs`
- **Testing**: Jest, Supertest, ts-jest (27 automated integration & unit tests)

### Web Dashboard
- **Language**: Python 3.11+ / 3.13
- **Framework**: Streamlit
- **Data & Charts**: Pandas, Plotly Express & Graph Objects
- **Styling**: Injected custom CSS implementing an 8-point enterprise design system (slate, navy, teal, white surfaces, subtle shadows, status pills)
- **Testing**: Pytest (7 unit and integration tests)

### Mobile Application
- **Framework**: React Native with Expo SDK 51 & TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Token Security**: Expo SecureStore (hardware-backed encrypted storage)
- **State & Client**: Custom typed REST client with retry and error normalization
- **Testing**: Jest, TypeScript typecheck (`tsc --noEmit`)

---

## 4. Implemented Features

### Operations Web Console (Streamlit)
- **Operations Overview**:
  - Compact KPI row: Total jobs, In Progress, Completed, Overdue risks.
  - 14-day cumulative delivery trend chart (Plotly).
  - Status breakdown donut chart.
  - Technician workload capacity bar chart.
  - Live filterable operational work order table (search, status, priority).
  - Priority alerts drawer for imminent SLA breaches.
- **Job Dispatching**:
  - Full create work order form with customer selection, technician assignment, priority, address, and target due date.
  - Interactive job inspector with complete dossier, customer phone, service history, and notes timeline.
  - Live status transitions (`ASSIGNED` -> `IN_PROGRESS` -> `COMPLETED` -> `CANCELLED`).
  - Technician reassignment and note logger.
- **Field Schedule**:
  - Date-grouped calendar view: Overdue, Today, Tomorrow, Upcoming (7 Days), and Completed Archive.
  - Filter schedule by specialist.
- **Technician Roster**:
  - Complete specialist directory with contact info, skills, service zone, and assigned vehicle.
  - Workload capacity bars and live availability toggle.
  - Onboard new technician form.
- **Customer Directory**:
  - Facility profiles with emergency phone, SLA tiers, site access instructions, and active job counters.
  - Register new customer site form.
- **Performance Analytics**:
  - SLA completion rate, overdue rate, average time to resolution.
  - Technician load balancing and backlog matrix.
- **AI Operational Intelligence**:
  - Automated Priority Triage: Evaluates incoming symptom telemetry, SLA windows, and customer contract tiers using Gemini Flash or the deterministic fallback engine.
  - Work Order & Field Note Synthesizer: Synthesizes complex technical notes into an executive briefing, key findings, and recommended next action.
  - SLA & Workload Risk Auditor: Highlights capacity imbalances and unassigned emergency jobs.
- **Platform Settings**:
  - Real-time API gateway connectivity probe with latency benchmark.
  - Demo role switcher (Operations Manager vs VP Operations).

### Field Technician Mobile App (React Native + Expo)
- **Authentication**: Secure login against Express API with token persistence in Expo SecureStore. Quick-fill demo button.
- **My Jobs Screen**: Filterable work order list (`All Jobs`, `Assigned`, `In Progress`, `Completed`) with pull-to-refresh.
- **Job Details**: Facility address, contact phone, target due date, site access notes, and field notes history.
- **Lifecycle Actions**: "Arrived On Site — Start Job", "Mark Work Completed", and status dispatcher.
- **Field Note Composer**: Logs technical readings, parts replaced, and customer sign-offs with double-submission protection.
- **Technician Profile**: Active assignments, capacity, vehicle ID, network gateway switcher, and sign-out.

---

## 5. Seed Data & Demo Accounts

The database comes pre-populated with realistic commercial service accounts, 4 specialists, and 16 operational work orders:

| Role | Name | Email | Password | Details |
| :--- | :--- | :--- | :--- | :--- |
| **Manager** | Alex Rivera | `manager@fieldflow.io` | `Manager123!` | Operations Dispatcher (Web Console) |
| **Admin** | Sarah Jenkins | `admin@fieldflow.io` | `Admin123!` | VP Operations (Full Admin Access) |
| **Technician 1** | Marcus Vance | `marcus.vance@fieldflow.io` | `Tech123!` | Commercial HVAC & Chiller Specialist (VAN-101) |
| **Technician 2** | Elena Rodriguez | `elena.rodriguez@fieldflow.io` | `Tech123!` | High Voltage Electrical & VFD Specialist (VAN-104) |
| **Technician 3** | David Chen | `david.chen@fieldflow.io` | `Tech123!` | Commercial Hydronics & Backflow Certified (TRUCK-202) |
| **Technician 4** | Sam Okafor | `sam.okafor@fieldflow.io` | `Tech123!` | Fire Protection & Life Safety Sprinklers (VAN-108) |

---

## 6. Local Setup & Execution Guide

### Prerequisites
- Node.js v20 or v22
- Python 3.10+
- PostgreSQL 16 (or local instance)

### 1. Backend Setup
```bash
cd backend
cp .env.example .env
npm install

# Push database schema to PostgreSQL
npx prisma db push

# Generate Prisma Client & seed realistic demo data
npm run prisma:generate
npm run prisma:seed

# Run tests
npm test

# Build TypeScript and start backend server (Port 5000)
npm run build
npm start
```
Verify the API is running at:
- Health check: `http://localhost:5000/health`
- Swagger Docs: `http://localhost:5000/api/docs`

### 2. Streamlit Web Dashboard Setup
```bash
cd dashboard
pip install -r requirements.txt

# Run dashboard test suite
pytest tests -v

# Launch Operations Console (Port 8501)
streamlit run app.py
```
Open `http://localhost:8501` in your browser.

### 3. React Native Mobile App Setup
```bash
cd mobile
npm install --legacy-peer-deps

# Run typecheck and tests
npm run typecheck
npm test

# Launch Expo development server
npx expo start
```
- Press `w` to run in web browser.
- Press `a` for Android emulator (automatically maps `http://10.0.2.2:5000/api`).
- Scan the QR code with the **Expo Go** app on your physical iOS or Android phone connected to the same Wi-Fi network (configure your computer's LAN IP in the mobile login screen).

---

## 7. Automated Test Results (40 Tests Total)

### Backend Test Suite (Jest + Supertest): 27 Passed
- `tests/health.test.ts`: Health probe, OpenAPI JSON spec, 404 envelope.
- `tests/auth.test.ts`: Registration, duplicate email 409 conflict, login success, invalid credentials 401, `/api/auth/me`, unauthorized route protection.
- `tests/jobs.test.ts`: Manager job creation, technician creation restriction (403), technician assignment, technician viewing assigned job, non-assigned technician tenant isolation (403), status update to `IN_PROGRESS`, note logging, completion, invalid status transition rejection (400).
- `tests/dashboard.test.ts`: Aggregate KPI calculation from DB, 14-day trends, technician workload metrics, technician RBAC restriction.
- `tests/ai.test.ts`: AI provider health check, critical keyword triage, low priority triage, job summarization, validation rejection.

### Dashboard Test Suite (Pytest): 7 Passed
- `tests/test_api_client.py`: Initialization, offline resilience, zero-crash error handling.
- `tests/test_metrics.py`: Status badge styling, priority badge styling, ISO timestamp formatting, overdue calculation logic, trend dataframe constructor.

### Mobile Test Suite (Jest + TypeScript): 6 Passed
- `tests/ApiClient.test.ts`: Base URL normalization, SecureStore token storage/retrieval/deletion, network failure handling.
- `tests/StatusTransitions.test.ts`: Forward lifecycle state machine transitions, priority and status theme tokens, overdue timestamp evaluation.

---

## 8. Deployment Guide

### Deploying the Express REST API (Render / Fly.io / Railway)
1. Create a managed PostgreSQL database (Neon, Supabase, or Render Postgres).
2. Set environment variables on your host:
   - `DATABASE_URL`: Your production PostgreSQL connection string.
   - `JWT_SECRET`: A secure random 64-character secret.
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or host assigned)
   - `GEMINI_API_KEY`: (Optional) Your Google Gemini API key.
3. Build and launch:
   ```bash
   npx prisma migrate deploy  # or npx prisma db push
   npm run build
   npm start
   ```
4. Verify `GET https://your-api.onrender.com/health` returns HTTP 200.

### Deploying the Streamlit Web Console (Streamlit Community Cloud)
1. Fork or push this repository to GitHub.
2. Link the repository in **Streamlit Community Cloud** with entry point `dashboard/app.py`.
3. In **App Settings -> Secrets**, configure:
   ```toml
   API_BASE_URL = "https://your-api.onrender.com/api"
   ```
4. Deploy the application.

---

## 9. Feature Status Matrix

| Component | Feature | Status | Verification |
| :--- | :--- | :--- | :--- |
| **Backend** | PostgreSQL Relational Schema & Prisma ORM | ✅ Implemented | Verified on PostgreSQL 16 |
| **Backend** | JWT Auth & Role-Based Access Control (RBAC) | ✅ Implemented | Tested (Admin, Manager, Tech) |
| **Backend** | Technician Tenant Isolation & Permissions | ✅ Implemented | Tested (403 on cross-tenant access) |
| **Backend** | Zod Schema Validation & Centralized Error Handler | ✅ Implemented | Tested (400 Bad Request envelopes) |
| **Backend** | AI Provider Adapter (Gemini + Rule-Based Fallback) | ✅ Implemented | Tested (Deterministic fallback active) |
| **Backend** | OpenAPI / Swagger Documentation (`/api/docs`) | ✅ Implemented | Tested (Interactive Explorer live) |
| **Dashboard** | Modern Enterprise B2B SaaS Styling (Inter) | ✅ Implemented | Inspected & verified via browser subagent |
| **Dashboard** | Live KPI Cards & Plotly Analytics | ✅ Implemented | Tested against live PostgreSQL records |
| **Dashboard** | Work Order Dispatching & Filtering | ✅ Implemented | Tested (Create, inspect, transition, note) |
| **Dashboard** | Date-Grouped Field Schedule | ✅ Implemented | Tested (Overdue, Today, Tomorrow, Archive) |
| **Dashboard** | Technician Roster & Capacity Balancing | ✅ Implemented | Tested (Capacity bars, availability toggle) |
| **Dashboard** | AI Priority Triage & Notes Synthesizer | ✅ Implemented | Tested with live fallback response |
| **Mobile** | Expo React Native Architecture & Navigation | ✅ Implemented | Tested with TypeScript & Jest |
| **Mobile** | SecureStore Token Storage | ✅ Implemented | Tested with encrypted storage mock |
| **Mobile** | Assigned Job Filtering & Status Dispatch | ✅ Implemented | Tested (Assigned -> In Progress -> Complete) |
| **CI** | GitHub Actions Workflow for Backend, Web, Mobile | ✅ Implemented | Configured in `.github/workflows/ci.yml` |

---

## 10. Known Limitations & Next Steps

1. **Object Storage**: Photo attachments are currently stored on the local disk filesystem via Multer (`/uploads`). In production, this can be swapped with AWS S3 or Cloudflare R2 presigned URLs.
2. **Push Notifications**: Real-time technician assignment alerts are currently fetched via pull-to-refresh. Integrating Expo Push Notifications with Firebase Cloud Messaging (FCM) is the next highest-value improvement.
3. **Offline Sync Queue**: The mobile client handles network dropouts gracefully with informative error messages. Adding a local WatermelonDB / SQLite offline mutation queue would enable full offline capability in remote basements.
