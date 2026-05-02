# Awnex Quality Management System

A Next.js application that provides a unified **Quality Management System (QMS)** for Awnex manufacturing operations. Five modules — Warranty, Inspections, Non-Conformances, Corrective Actions (CAPA), and Production & Batch Tracking — share a common sidebar shell and each connect independently to their own Quickbase report.

---

## Modules

| Module | Route / Activation | Data source |
|---|---|---|
| **Overview** | Default home view | Aggregate KPIs from all modules |
| **Warranty** | Sidebar → Warranty | `/api/warranty-orders` |
| **Inspections** | Sidebar → Inspections | `/api/inspections` |
| **Non-Conformances** | Sidebar → Non-Conformances | `/api/ncrs` |
| **Corrective Actions (CAPA)** | Sidebar → Corrective Actions | `/api/capas` |
| **Production** | Sidebar → Production | `/api/production` |

---

## What it does

### Platform-wide
- Collapsible dark sidebar navigation — switches between all QMS modules without a page reload
- Each module stores its own QB connection (table ID + report ID) independently in `localStorage`
- Cross-device settings sync via Vercel KV (`/api/settings`) — layout, connections, and configs persist across browsers when KV is configured
- Full enterprise design system: deep blue primary (`#1D4ED8`), cool slate grays, teal QC accent — all tokens in `lib/tokens.js`

### Warranty module
- Displays active, expiring, and expired warranty orders from Quickbase
- Composite risk score per order (claims, QC defect entries, urgency, order value)
- Configurable KPI cards and charts — edit title, field, aggregation, filter, color, icon, format without code changes
- Dashboard edit mode with add / duplicate / hide / reset-to-defaults and drag-and-drop reorder
- Filter by PM, status, brand, risk level, or free-text search
- Leaflet map showing installation locations with status-color pins

### Inspections module
- QC inspection records: pass/fail/rework per order and product line
- Visual breakdown bar (pass/rework/fail proportions)
- Inspector assignment, defect counts, and notes per record
- QB-ready: shows sample data until a QB table/report is connected

### Non-Conformances (NCR) module
- Leverages existing case management components (`CaseTable`, `CaseDetailPanel`, `CreateCaseModal`)
- Tabbed filter: All / Open / High Risk / Field Impact / Closed
- Risk score and level automatically derived per case
- KB-ready; loads sample data from `qualityRiskDataSource.js` until live QB is wired

### Corrective Actions (CAPA) module
- Pipeline view across all CAPA status stages (Open → Containment → RCA → CAPA → Verification → Closed)
- Action items table with overdue flagging (past due date highlighted)
- Case drill-in via `CaseDetailPanel` slide-out
- QB-ready with same sample data source as NCR module

### Production & Batch Tracking module
- Per-line yield statistics (Line A / B / C)
- Batch records with inline yield progress bars and defect counts
- Filterable by status (All / In Progress / Complete)
- QB-ready: shows sample batches until QB report is connected

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| UI | React 18, inline styles using design tokens (`lib/tokens.js`) |
| Charts | Recharts 2 |
| Map | Leaflet 1.9 (CDN-loaded at runtime) |
| Geocoding | Nominatim (OpenStreetMap), rate-limited with local coordinate cache |
| Data source | Quickbase REST API v1 — report run endpoint (one proxy route per module) |
| Hosting | Vercel |
| Credentials | Server-side only via Vercel environment variables |

---

## Project structure

```
awnex-warranty-V1/
│
├── pages/
│   ├── _app.jsx                  App wrapper (viewport meta, Google Fonts, CSS reset)
│   ├── index.jsx                 Entry — mounts QMSShell
│   ├── quality-risk.jsx          Legacy Quality Risk & RCA standalone route
│   └── api/
│       ├── warranty-orders.js    QB proxy — Warranty module
│       ├── inspections.js        QB proxy — Inspections module
│       ├── ncrs.js               QB proxy — Non-Conformances module
│       ├── capas.js              QB proxy — Corrective Actions module
│       ├── production.js         QB proxy — Production & Batch module
│       └── settings.js           Cross-device KV settings sync
│
├── components/
│   ├── QMSShell.jsx              Root layout — sidebar + scrollable content pane
│   ├── QMSSidebar.jsx            Collapsible dark sidebar with module nav
│   ├── AwnexLogo.jsx             Awnex branding logo
│   ├── SettingsModal.jsx         QB connection configuration modal (URL auto-parse)
│   ├── MapView.jsx               Leaflet map with geocoding and status pins
│   │
│   ├── modules/                  One file per QMS module
│   │   ├── QMSOverview.jsx       Home dashboard — cross-module KPI strip + module cards
│   │   ├── InspectionsModule.jsx Inspections pass/fail dashboard
│   │   ├── NcrModule.jsx         Non-Conformances (integrates quality case components)
│   │   ├── CapaModule.jsx        Corrective Actions pipeline and action items
│   │   └── ProductionModule.jsx  Batch tracking with yield metrics
│   │
│   ├── dashboard/                Configurable dashboard building blocks (used by Warranty)
│   │   ├── KpiCard.jsx
│   │   ├── KpiEditor.jsx
│   │   ├── ChartCard.jsx
│   │   ├── ChartEditor.jsx
│   │   ├── ConfigurableChart.jsx
│   │   ├── DashboardEditToolbar.jsx
│   │   └── ColumnEditor.jsx
│   │
│   └── ui/                       Shared presentational components
│       ├── Icon.jsx              SVG icon registry
│       ├── Badge.jsx             StatusBadge, RiskBadge
│       ├── Modal.jsx             Modal wrapper + Btn + formStyles
│       ├── Tag.jsx               ProductTag
│       ├── StateScreens.jsx      EmptyState, LoadingState, ErrorState
│       └── SortIcon.jsx          Column sort indicator
│
├── src/
│   ├── WarrantyDashboard.jsx     Warranty module orchestrator (data fetch, KPIs, charts, table)
│   ├── components/
│   │   ├── AppHeader.jsx         Legacy top-bar header (used by quality-risk page)
│   │   ├── ContentViewer.jsx     Inline document/URL viewer
│   │   ├── quality/              Quality case management components
│   │   │   ├── CaseTable.jsx
│   │   │   ├── CaseCard.jsx
│   │   │   ├── CaseDetailPanel.jsx
│   │   │   ├── CreateCaseModal.jsx
│   │   │   ├── CapaTab.jsx
│   │   │   ├── RootCauseTab.jsx
│   │   │   └── ... (10 more tab/panel components)
│   │   └── installation/         Installation module components
│   │       ├── InstallationDashboard.jsx
│   │       ├── InstallationKanban.jsx
│   │       ├── InstallationMap.jsx
│   │       ├── JobCard.jsx
│   │       └── JobDetailPanel.jsx
│   ├── lib/
│   │   ├── qualityRiskDataSource.js  Case/trend data provider (mock/live switch)
│   │   └── qualityRiskUtils.js       Risk scoring, status advancement rules
│   └── pages/
│       └── QualityRiskDashboard.jsx  Legacy Quality Risk & RCA page component
│
├── lib/                          Platform-wide pure utilities
│   ├── tokens.js                 Enterprise design tokens (blues/grays palette)
│   ├── qbUtils.js                QB field parsing, mapQBResponse, risk scoring
│   ├── dashboardMetrics.js       Filter, aggregate, KPI/chart compute helpers
│   ├── dashboardDefaults.js      Default KPI/chart configs, palettes, themes
│   ├── dashboardStorage.js       localStorage helpers — all module connection keys
│   ├── installationData.js       Installation Quickbase field normalization
│   └── installationHelpers.js    Installation KPI/filter helpers
│
├── ARCHITECTURE.md
├── API_REFERENCE.md
├── DEPLOY.md
└── CLAUDE.md
```

---

## Local development

### Prerequisites

- Node.js 18 or later
- A Quickbase user token with read access to the relevant tables
- Table ID and report ID for each module you want to connect

### Setup

```bash
npm install

# Create environment file
echo "QB_REALM=awnexinc.quickbase.com" > .env.local
echo "QB_TOKEN=your_quickbase_user_token" >> .env.local

npm run dev
```

Open `http://localhost:3000`. The QMS Overview page loads immediately. Click any module in the sidebar, then click **Configure QB** to enter the table ID and report ID for that module.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `QB_REALM` | Yes | Quickbase realm hostname, e.g. `awnexinc.quickbase.com` |
| `QB_TOKEN` | Yes | Quickbase user token |
| `QB_TABLE_ID` | Optional | Default Warranty table ID (overridden by settings modal) |
| `QB_REPORT_ID` | Optional | Default Warranty report ID (overridden by settings modal) |
| `QB_INSPECTIONS_TABLE_ID` | Optional | Default Inspections table ID |
| `QB_INSPECTIONS_REPORT_ID` | Optional | Default Inspections report ID |
| `QB_NCRS_TABLE_ID` | Optional | Default NCR table ID |
| `QB_NCRS_REPORT_ID` | Optional | Default NCR report ID |
| `QB_CAPAS_TABLE_ID` | Optional | Default CAPA table ID |
| `QB_CAPAS_REPORT_ID` | Optional | Default CAPA report ID |
| `QB_PRODUCTION_TABLE_ID` | Optional | Default Production table ID |
| `QB_PRODUCTION_REPORT_ID` | Optional | Default Production report ID |
| `KV_REST_API_URL` | Optional | Vercel KV URL for cross-device settings sync |
| `KV_REST_API_TOKEN` | Optional | Vercel KV token |

`QB_REALM` and `QB_TOKEN` are server-side only — never exposed to the browser.

---

## localStorage keys

| Key | Module | Stores |
|---|---|---|
| `awntrak_warranty_table_id` | Warranty | QB table ID |
| `awntrak_warranty_report_id` | Warranty | QB report ID |
| `awntrak_inspections_table_id` | Inspections | QB table ID |
| `awntrak_inspections_report_id` | Inspections | QB report ID |
| `awntrak_ncrs_table_id` | Non-Conformances | QB table ID |
| `awntrak_ncrs_report_id` | Non-Conformances | QB report ID |
| `awntrak_capas_table_id` | Corrective Actions | QB table ID |
| `awntrak_capas_report_id` | Corrective Actions | QB report ID |
| `awntrak_production_table_id` | Production | QB table ID |
| `awntrak_production_report_id` | Production | QB report ID |
| `awntrak_kpi_configs` | Warranty | JSON array of KPI configs |
| `awntrak_chart_configs` | Warranty | JSON array of chart configs |
| `awntrak_column_titles` | Warranty | Custom column display titles |
| `awntrak_column_order` | Warranty | Column display order |
| `awntrak_geocache` | Map | Nominatim geocoding cache |

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full GitHub + Vercel deployment guide.

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — System design, component contracts, data flow, extension guide
- [API_REFERENCE.md](API_REFERENCE.md) — All API proxy endpoints
- [DEPLOY.md](DEPLOY.md) — GitHub and Vercel deployment
- [CLAUDE.md](CLAUDE.md) — Claude Code guidance for AI-assisted development
