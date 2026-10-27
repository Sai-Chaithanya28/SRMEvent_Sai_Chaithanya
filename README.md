# FairShift – Decent Work Platform (UN SDG 8)

> **Closing the trust deficit between workers and management in frontline workplaces.**  
> Built for mobile-first low-end devices on 3G profiles, with full offline persistence, real anonymity, and transparent pay.

---

## 🌟 The 5 End-to-End Capabilities

1. **Shift Tracking & Automatic Overtime**:
   - High-contrast QR scanner, Geo-fenced GPS check-in, and Supervisor manual fallback so hardware failure never costs a worker wages.
   - Configurable daily shift thresholds with automatic 1.5x overtime calculation.
2. **Clear Payslips & Audio Read-Aloud**:
   - Transparent salary breakdown with line-by-line explanations for PF, ESI, TDS, and overtime premiums.
   - Built-in Web Speech API read-aloud in English, Hindi, Tamil, Telugu, Kannada, and Malayalam.
3. **Closed-Loop Safety Reporting**:
   - Voice note recording via MediaRecorder, site photo attachments, and severity presets.
   - Full closed-loop status timeline (`Submitted` → `Acknowledged` → `In Progress` → `Resolved`) with bidirectional employer remediation notes.
4. **Honest Anonymous Feedback (Cryptographic Real Anonymity)**:
   - Feedback threads keyed by a randomized client-device token hash (SHA-256).
   - **Zero `user_id`** or profile reference stored on feedback rows.
   - Two-way anonymous communication: employer can reply without ever identifying the worker.
   - **Privacy Shield**: Dashboard aggregates and sentiment graphs are strictly hidden until a team records at least **5 responses** (preventing de-anonymization).
5. **Calm & Dense Employer Dashboard**:
   - Real-time attendance roll, overtime logs, hazard triage, workforce directory, and one-click payslip generation.

---

## 🏗️ Two Production Sectors (Configuration, Not a Fork)

Sector is driven entirely by declarative schema and configuration in `src/config/sectors/index.ts`:

| Dimension | Construction Site Sector | College Campus Sector |
| :--- | :--- | :--- |
| **Primary Site** | Metro Station North Wing | SRM Tech Campus - Academic Block |
| **Worker Roles** | Mason, Carpenter, Rebar Tier, Laborer | Lab Assistant, Sanitation Lead, Campus Security |
| **Supervisors** | Site Foreman / Field Engineer | Facility Director / Department Head |
| **Hazard Presets** | Unstable scaffolding, fall risk, high voltage, trench cave-in | Chemical fume, unmarked spill, blocked fire exit, electrical fault |
| **Team Structures** | Trade Crews (Concrete, Steel, Finishing) | Department Units (Labs, Facilities, Security) |

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js 18+ (tested on Node.js v24.22.1)
- npm 9+

### Installation & Launch

```bash
# Clone the repository
git clone https://github.com/Sai-Chaithanya28/SRMEvent_Sai_Chaithanya.git
cd SRMEvent_Sai_Chaithanya

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

App will be available locally at `http://localhost:5173`.

---

## 🔑 Demo Logins

FairShift includes 4 pre-configured demo personas accessible via 1-click on `/login`:

| Sector | Role | Demo Person | Credentials | Default Landing |
| :--- | :--- | :--- | :--- | :--- |
| **Construction** | **Worker** | Ramesh Kumar (Mason) | 1-Click Demo Button | `/worker` |
| **Construction** | **Employer** | Vikram Singh (Foreman) | 1-Click Demo Button | `/employer` |
| **College Campus** | **Worker** | Ananya Sharma (Lab Assistant) | 1-Click Demo Button | `/worker` |
| **College Campus** | **Employer** | Dr. K. Narayanan (Facility Director) | 1-Click Demo Button | `/employer` |

---

## 🗄️ Database & Offline Architecture

- **Offline Outbox**: Client writes immediately to IndexedDB via **Dexie** (`db.checkins`, `db.hazardReports`, `db.outbox`), assigning client UUIDs.
- **Sync Engine** (`src/shared/lib/sync.ts`): Automatically flushes outbox to Supabase using idempotent upserts with exponential backoff on reconnect.
- **Supabase Schema & Security Definer**:
  - Migration file: `supabase/migrations/20261027000001_fairshift_schema.sql`
  - Function `submit_anonymous_feedback(p_token_hash, p_team_id, p_category, p_rating)` runs with `SECURITY DEFINER` and stores only the salted token hash.

---

## 🧪 Running the Playwright Test Suite

```bash
# Run all end-to-end tests across Chromium and Mobile 360px viewport
npx playwright test

# Run tests in interactive UI mode
npx playwright test --ui
```

### Verified Test Cases:
1. Role-based routing (`/worker` vs `/employer`)
2. Sector switching (Construction ↔ College Campus)
3. 6-Language dynamic i18n switching
4. QR Check-in and overtime calculation
5. Offline-first check-in with Dexie outbox queue
6. Closed-loop safety report with bidirectional employer notes
7. Cryptographic anonymity test proving database schema stores zero user IDs
8. K-anonymity threshold rule (aggregates hidden below 5 submissions)

---

## 🌍 Cross-Sector Adoption Note

Because FairShift uses a configuration-driven architecture rather than forked codebases, adding a new industry (such as **Garment Manufacturing**, **Hospitality**, or **Agriculture**) requires only defining an entry in `SECTOR_CONFIGS`:
- Custom shift thresholds & break intervals
- Sector-specific hazard presets & terminology
- Customized deduction profiles matching local statutory guidelines

---

## 📋 Assumptions & Known Limits

1. **Camera in Virtual Environments**: In browsers or headless test runners where camera hardware is absent, the QR module gracefully provides a simulated one-click scan trigger.
2. **Speech Synthesis Voices**: Voice availability depends on the operating system's installed TTS engines. If a specific regional language voice (e.g. Malayalam) is missing on the client OS, it safely falls back to standard Indian English (`en-IN`).
3. **K-Anonymity Threshold**: The 5-response cutoff was chosen per ILO and EcoVadis guidance to strike a balance between privacy protection and timely feedback utility in small crews.
