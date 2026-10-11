# ⚡ FieldFlow — AI-Powered Field Operations & Workforce Management Platform

<p align="center">
  <img src="https://img.shields.io/badge/Streamlit%20Cloud-Live%20Console-FF4B4B?style=for-the-badge&logo=streamlit&logoColor=white" alt="Streamlit Cloud" />
  <img src="https://img.shields.io/badge/Vercel-Backend%20Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/Neon-Serverless%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=black" alt="Neon Postgres" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React%20Native-Expo%2051-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Native" />
</p>

<p align="center">
  <strong>An enterprise-grade field operations, dispatching, and mobile workforce execution platform built for high-reliability technical service teams (HVAC, Electrical, Facilities, Hydronics, Life Safety).</strong>
</p>

<p align="center">
  <a href="https://fieldflow-workforce-platform-h6ijvnrlrz9pvztt2vvhd9.streamlit.app/"><strong>🌐 Open Live Operations Console »</strong></a> •
  <a href="https://fieldflow-backend.vercel.app/health"><strong>📊 Live API Health Check »</strong></a> •
  <a href="https://fieldflow-backend.vercel.app/api/docs"><strong>📑 Swagger API Explorer »</strong></a> •
  <a href="https://github.com/Dhanya562004/fieldflow-workforce-platform"><strong>💻 GitHub Repository »</strong></a>
</p>

---

## 🌟 Live Cloud Deployments

| Component | Cloud Host | Live URL | Status |
| :--- | :--- | :--- | :--- |
| **Operations Web Console** | Streamlit Community Cloud | [fieldflow-workforce-platform.streamlit.app](https://fieldflow-workforce-platform-h6ijvnrlrz9pvztt2vvhd9.streamlit.app/) | ![Streamlit](https://img.shields.io/badge/Status-Online-brightgreen) |
| **REST API Gateway** | Vercel Serverless | [fieldflow-backend.vercel.app](https://fieldflow-backend.vercel.app) | ![Vercel](https://img.shields.io/badge/Status-Online-brightgreen) |
| **System Health Probe** | Vercel Serverless | [fieldflow-backend.vercel.app/health](https://fieldflow-backend.vercel.app/health) | ![Health](https://img.shields.io/badge/Status-200%20OK-brightgreen) |
| **Interactive API Explorer** | OpenAPI 3.0 / Swagger UI | [fieldflow-backend.vercel.app/api/docs](https://fieldflow-backend.vercel.app/api/docs) | ![Swagger](https://img.shields.io/badge/Specs-OpenAPI%203.0-orange) |
| **Relational Database** | Neon PostgreSQL | Cloud Serverless PostgreSQL 16 (AWS US-East) | ![Postgres](https://img.shields.io/badge/Database-Connected-blue) |

---

## 🔑 Demo Access & Pre-Seeded Roles

The production database is pre-seeded with realistic commercial facilities accounts, 4 licensed technicians, and 16 operational work orders across all lifecycle stages. You can log into the web dashboard or mobile app using these credentials:

| Role | User Name | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Operations Manager (Default)** | Alex Rivera | `manager@fieldflow.io` | `Manager123!` | Work Order Dispatching, Assignment, Calendar, Customer Registry, AI Triage |
| **VP Operations (Admin)** | Sarah Jenkins | `admin@fieldflow.io` | `Admin123!` | Full Platform Administration, Analytics, System Configuration |
| **Lead HVAC Technician** | Marcus Vance | `marcus.vance@fieldflow.io` | `Tech123!` | Mobile Work Orders, On-Site Start/Complete, Diagnostic Notes (VAN-101) |
| **High Voltage Electrician** | Elena Rodriguez | `elena.rodriguez@fieldflow.io` | `Tech123!` | Assigned Field Work Orders, Status Transitions (VAN-104) |
| **Commercial Plumber / Hydronics** | David Chen | `david.chen@fieldflow.io` | `Tech123!` | Backflow Inspections, Photo Logs, Job Sign-offs (TRUCK-202) |
| **Life Safety Specialist** | Sam Okafor | `sam.okafor@fieldflow.io` | `Tech123!` | Sprinkler & Fire Safety Work Orders (VAN-108) |

---

## 🚀 Key Platform Highlights

```text
 ┌───────────────────────────────────────────────────────────────────────────────────┐
 │                                 FieldFlow Platform                                │
 ├────────────────────────┬─────────────────────────┬────────────────────────────────┤
 │   Streamlit Console    │   React Native Mobile   │    Express + Prisma Engine     │
 │  • Real-Time Plotly    │  • Expo SDK 51          │  • Strict State Machine        │
 │  • SLA Risk Auditor    │  • SecureStore Hardware │  • Zod Contract Validation     │
 │  • Interactive Triage  │  • Fast Photo Logging   │  • Tenant Isolation RBAC       │
 │  • Capacity Heatmaps   │  • One-Tap Dispatches   │  • Gemini Flash / Fallback AI  │
 └────────────────────────┴─────────────────────────┴────────────────────────────────┘
```

1. **Closed-Loop Dispatching & Lifecycle State Machine**:
   - Strict forward-only job lifecycle: `OPEN` ➔ `ASSIGNED` ➔ `IN_PROGRESS` ➔ `COMPLETED` (or `CANCELLED`).
   - Prevents tenant leakage: Technicians can only access work orders explicitly assigned to them.
2. **Real-Time Operational Analytics (Streamlit)**:
   - 14-day cumulative velocity charts, status breakdown donuts, and technician workload capacity bars.
   - Live search, filtering by priority, technician, and SLA breach proximity.
3. **Field Technician Mobile Experience (React Native + Expo)**:
   - Hardware-encrypted JWT token persistence via `Expo SecureStore`.
   - On-site arrival timestamping, diagnostic notes timeline, and customer contact quick-dial.
4. **AI-Assisted Operational Intelligence**:
   - **Priority Triage**: Evaluates symptom telemetry and contractual SLA tiers using Google Gemini Flash (with automated deterministic fallback).
   - **Executive Field Note Synthesizer**: Condenses dense diagnostic commentary into actionable customer summaries.

---

## 🏛️ System Architecture

```text
                           ┌────────────────────────────────────────┐
                           │      Streamlit Operations Console      │
                           │       (Python 3.11+ / Streamlit)       │
                           │   - Plotly Analytics & KPI Badges      │
                           │   - Dispatching, Calendar, Customers   │
                           │   - AI Triage & Note Summarization     │
                           └──────────────────┬─────────────────────┘
                                              │
                                              │ HTTPS / JSON (JWT RBAC)
                                              ▼
┌───────────────────────────┐      ┌────────────────────────────────────────┐
│  React Native Mobile App  │      │       Node.js Express REST API         │
│  (Expo SDK 51 / TS)       │─────▶│       (TypeScript / Vercel Serverless) │
│  - Offline Token Storage  │      │   - Zod Schema Validation Middleware   │
│  - Assigned Jobs Filter   │      │   - Role-Based Access Control (RBAC)   │
│  - One-Tap Status Update  │      │   - OpenAPI 3.0 / Swagger Interactive  │
│  - Field Notes & Photos   │      │   - Google Gemini AI Adapter           │
└───────────────────────────┘      └──────────────────┬─────────────────────┘
                                                      │
                                                      │ Prisma ORM 5.22
                                                      ▼
                                   ┌────────────────────────────────────────┐
                                   │      Neon Serverless PostgreSQL        │
                                   │   - Relational Data Integrity          │
                                   │   - Strict Foreign Key Cascades        │
                                   │   - Audit Logs & Composite Indexes     │
                                   └────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Backend API
- **Runtime**: Node.js 22.x
- **Framework**: Express with TypeScript 5.6
- **Database & ORM**: PostgreSQL 16 (Neon Serverless) with Prisma ORM 5.22
- **Validation**: Zod schema validation for all incoming payloads
- **Security**: JWT authentication (HMAC-SHA256), bcryptjs password hashing, Helmet headers, CORS
- **Documentation**: OpenAPI 3.0 specification & Swagger UI explorer at `/api/docs`
- **Testing**: Jest, Supertest, ts-jest (27 automated integration & unit tests)

### Operations Web Console
- **Framework**: Streamlit 1.38+ (Python 3.11+)
- **Data Visualization**: Pandas, Plotly Express & Graph Objects
- **Design System**: Tailored enterprise B2B SaaS theme with Inter typography, slate surfaces, and live status badges
- **Testing**: Pytest (7 unit and integration tests)

### Field Mobile App
- **Framework**: React Native with Expo SDK 51 & TypeScript
- **Navigation**: React Navigation (Bottom Tabs + Native Stack)
- **Token Security**: Expo SecureStore (hardware-backed encrypted keychain storage)
- **Testing**: Jest, TypeScript typecheck (`tsc --noEmit`)

---

## 📦 Project Structure

```text
fieldflow-workforce-platform/
├── backend/                  # Node.js + Express + TypeScript REST API
│   ├── api/                  # Vercel serverless function entrypoint (index.ts)
│   ├── prisma/               # Database schema (schema.prisma) & seed script (seed.ts)
│   ├── src/
│   │   ├── controllers/      # Auth, Job, Technician, Customer, Dashboard, AI controllers
│   │   ├── middleware/       # JWT Auth, Zod validation, Multer uploads, Error handling
│   │   ├── routes/           # Express route definitions
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── services/         # Business logic layer & Gemini AI adapter
│   │   ├── app.ts            # Express application factory & middleware setup
│   │   └── server.ts         # Local HTTP listener entrypoint
│   ├── tests/                # Automated Jest integration tests
│   └── vercel.json           # Vercel serverless deployment rewrites
├── dashboard/                # Python Streamlit Operations Web Console
│   ├── components/           # Sidebar, KPI cards, custom styles
│   ├── services/             # Typed API client with auto-reconnect & token management
│   ├── views/                # Overview, Jobs, Schedule, Technicians, Customers, Analytics, AI
│   ├── app.py                # Main Streamlit dashboard application
│   └── requirements.txt      # Python dependencies
├── mobile/                   # React Native Expo Mobile Application
│   ├── src/
│   │   ├── screens/          # Login, My Jobs, Job Detail, Profile screens
│   │   ├── services/         # Mobile REST client & SecureStore auth
│   │   └── theme/            # Design system tokens (colors, typography, spacing)
│   ├── App.tsx               # Root mobile application & navigation container
│   └── package.json          # React Native dependencies
└── .github/workflows/        # Automated CI/CD pipelines (ci.yml)
```

---

## 💻 Local Quickstart

### 1. Prerequisites
- Node.js v20+ or v22+
- Python 3.10+
- PostgreSQL 16 (or local Docker container)

### 2. Run Backend API
```bash
cd backend
cp .env.example .env
npm install

# Push Prisma schema and seed database
npm run prisma:push
npm run prisma:seed

# Run tests & start local server (Port 5000)
npm test
npm run dev
```
API endpoints will be active:
- Health probe: `http://localhost:5000/health`
- Swagger UI docs: `http://localhost:5000/api/docs`

### 3. Run Streamlit Operations Console
```bash
cd dashboard
pip install -r requirements.txt

# Launch Streamlit (Port 8501)
streamlit run app.py
```
Open `http://localhost:8501` in your browser. The dashboard automatically connects to your local backend on port 5000 (or the Vercel cloud backend if local is stopped).

### 4. Run React Native Mobile App
```bash
cd mobile
npm install --legacy-peer-deps

# Start Expo dev server
npx expo start
```
- Press `w` to preview in your web browser.
- Press `a` for Android Emulator.
- Scan the QR code with **Expo Go** on your physical iOS or Android device.

---

## 🧪 Test Suite Results (40 Automated Tests)

```text
Backend Integration Suite (Jest + Supertest)
  ✔ Health & Status Probes (3 tests passed)
  ✔ Authentication & RBAC Authorization (6 tests passed)
  ✔ Work Order Lifecycle & Status Transitions (9 tests passed)
  ✔ Operational Dashboard KPIs & Aggregations (4 tests passed)
  ✔ AI Provider Adapter & Fallback Engine (5 tests passed)
  Total: 27 / 27 Passed (100%)

Dashboard Suite (Pytest)
  ✔ API Client Resilience & Offline Handling (3 tests passed)
  ✔ Metrics Calculation & SLA Overdue Logic (4 tests passed)
  Total: 7 / 7 Passed (100%)

Mobile Suite (Jest)
  ✔ SecureStore Token Management (3 tests passed)
  ✔ Forward State Machine Transitions (3 tests passed)
  Total: 6 / 6 Passed (100%)
```

---

## 📄 License & Attribution

Developed as an enterprise-grade fullstack & mobile operations showcase project by **Dhanya S**. Released under the **MIT License**.
