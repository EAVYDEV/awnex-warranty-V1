# Awntrak Platform — Quality & Warranty Dashboard

A Next.js application built for Awnex, Inc. It connects to Quickbase, presents warranty order data and quality risk cases as interactive configurable dashboards, and provides a guided workflow for managing quality events from intake through closure.

---

## Modules

### Warranty Management (`/`)

- Pulls live order data from any Quickbase report via a server-side proxy
- Calculates a composite risk score per order (claims, QC defect entries, warranty urgency, order value)
- **Configurable KPI cards** — edit title, source field, aggregation, filter, icon, color, and number format from the dashboard; no code changes needed
- **Configurable charts** — edit chart type, group-by field, metrics, filter, sort, and color palette from the dashboard
- Dashboard title and subtitle editable and persisted
- Dashboard edit mode with add / duplicate / hide / reset-to-defaults / drag-reorder controls
- Filter by PM, warranty status, brand, risk level, or free-text search
- Leaflet map view showing installation locations with status-color pins
- Multi-source connections (separate claims and costs QB tables merged by order number)
- Dashboard configuration persists in localStorage and syncs via `/api/settings` for shared layouts

### Quality Risk & RCA (`/quality-risk`)

- Case-based quality event tracking: intake → containment → RCA → CAPA → effectiveness check → closure
- Risk scoring per case (severity × scope × detection risk × field impact)
- Guided case detail panel with eight tab sections: Summary, Risk Assessment, Containment, RCA, CAPA, Field Impact, Evidence, Closure
- Status stepper with per-phase completion gating (next status only unlocks when required fields are complete)
- Case views: Overview, Active Cases, High Risk, Field Impact, CAPA Tracking, Trends
- Card and table views for the case list

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| UI | React 18, inline styles using design tokens (`lib/tokens.js`) |
| Charts | Recharts 2 |
| Map | Leaflet 1.9 (CDN-loaded at runtime) |
| Geocoding | Nominatim (OpenStreetMap), rate-limited with local coordinate cache |
| Data source | Quickbase REST API v1 — report run endpoint |
| Hosting | Vercel |
| Credentials | Server-side only via Vercel environment variables |

---

## Project structure

```
awnex-warranty-V1/
│
├── pages/                              Next.js page routes
│   ├── _app.jsx                        App wrapper (viewport meta, CSS reset)
│   ├── index.jsx                       Warranty module entry — mounts WarrantyDashboard
│   ├── quality-risk.jsx                Quality Risk & RCA entry — mounts QualityRiskDashboard
│   └── api/
│       ├── warranty-orders.js          Server-side Quickbase proxy
│       └── settings.js                 Dashboard config sync endpoint (Vercel KV)
│
├── src/                                Application source (React components + logic)
│   ├── WarrantyDashboard.jsx           Warranty orchestrator — data fetch, state, layout
│   │
│   ├── pages/
│   │   └── QualityRiskDashboard.jsx    Quality Risk orchestrator — case state, views, routing
│   │
│   ├── lib/                            Shared utilities (src-scoped)
│   │   ├── qualityRiskUtils.js         Risk scoring, status flow, gate checks for quality cases
│   │   ├── dashboardMetrics.js         QB helpers used by src/components/MapView
│   │   ├── dashboardDefaults.js        Default KPI/chart configs (src-scoped copy)
│   │   └── dashboardStorage.js         localStorage helpers (title/subtitle)
│   │
│   └── components/
│       ├── quality/                    Quality Risk & RCA UI components
│       │   ├── CaseTable.jsx           Tabular case list with sortable columns
│       │   ├── CaseCard.jsx            Card view for a single quality case
│       │   ├── CaseDetailPanel.jsx     Full case editor — tab navigation + save/advance
│       │   ├── CaseHeader.jsx          Case title, ID, severity badge, owner display
│       │   ├── CaseStatusStepper.jsx   Visual status progress bar
│       │   ├── CaseSummaryTab.jsx      Read-only case overview
│       │   ├── CaseFooterActions.jsx   Advance / close / save action bar
│       │   ├── CreateCaseModal.jsx     New case intake form
│       │   ├── RiskAssessmentTab.jsx   Severity / scope / detection risk inputs
│       │   ├── ContainmentTab.jsx      Containment action inputs and summary
│       │   ├── RootCauseTab.jsx        Problem statement, fishbone / 5-why inputs
│       │   ├── CapaTab.jsx             Corrective / preventive action list
│       │   ├── FieldImpactTab.jsx      Affected orders and field impact assessment
│       │   ├── EvidenceTab.jsx         Evidence attachments list
│       │   ├── ClosureTab.jsx          Effectiveness check, closure summary, approval
│       │   ├── StatusBadge.jsx         Quality-case status badge
│       │   └── RiskBadge.jsx           Quality-case risk level badge
│       │
│       ├── ChartCard.jsx               Chart wrapper (src-scoped)
│       ├── DashboardEditToolbar.jsx    Edit mode toolbar (src-scoped)
│       ├── KpiCard.jsx                 KPI card (src-scoped)
│       ├── MapView.jsx                 Leaflet map (src-scoped)
│       └── SettingsModal.jsx           QB connection modal (src-scoped)
│
├── lib/                                Platform-wide pure utilities (canonical, no React)
│   ├── tokens.js                       Design tokens — all colors, shadows, STATUS_CFG, RISK_CFG
│   ├── qbUtils.js                      QB field parsing (flexible label matching), risk scoring, formatters
│   ├── dashboardMetrics.js             Filter, aggregate, KPI/chart compute helpers
│   ├── dashboardDefaults.js            Default KPI/chart configs, KPI_THEMES, COLOR_PALETTES
│   └── dashboardStorage.js             localStorage load/save for all config keys + Vercel KV sync
│
├── components/                         Platform-wide React components (canonical)
│   ├── ui/
│   │   ├── Icon.jsx                    35-icon SVG registry
│   │   ├── Badge.jsx                   StatusBadge, RiskBadge (warranty)
│   │   ├── Modal.jsx                   Generic modal wrapper + Btn + formStyles
│   │   ├── Tag.jsx                     ProductTag chip
│   │   ├── StateScreens.jsx            EmptyState, LoadingState, ErrorState
│   │   └── SortIcon.jsx               Column sort direction indicator
│   ├── AwnexLogo.jsx                   Awnex SVG branding mark
│   ├── SettingsModal.jsx               QB connection configuration modal
│   ├── MapView.jsx                     Leaflet map with geocoding and status pins
│   └── dashboard/
│       ├── KpiCard.jsx                 KPI display card with edit-mode controls
│       ├── KpiEditor.jsx               KPI editor modal with live preview
│       ├── ChartCard.jsx               Chart wrapper with edit-mode controls + CustomTooltip
│       ├── ChartEditor.jsx             Chart editor modal with live preview
│       ├── ConfigurableChart.jsx       Renders bar / hbar / donut / line / stacked from config
│       ├── DashboardEditToolbar.jsx    Edit mode toolbar (add, reset, exit)
│       └── ColumnEditor.jsx            Column title editor modal
│
├── ARCHITECTURE.md                     Full system design, component contracts, extension guide
├── API_REFERENCE.md                    /api/warranty-orders endpoint documentation
├── DEPLOY.md                           GitHub + Vercel deployment guide
└── CLAUDE.md                           Claude Code guidance for AI-assisted development
```

---

## Local development

### Prerequisites

- Node.js 18 or later
- A Quickbase user token with read access to the target table
- The Quickbase table ID and a saved report ID

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Create environment file
echo "QB_REALM=awnexinc.quickbase.com" > .env.local
echo "QB_TOKEN=your_quickbase_user_token" >> .env.local

# 3. Start the dev server
npm run dev
```

Open `http://localhost:3000`. On first load you'll see the **Connect to Quickbase** screen. Click **Configure Connection** and enter your Table ID and Report ID. Settings persist in `localStorage`; data loads immediately after saving.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `QB_REALM` | Yes | Quickbase realm hostname, e.g. `awnexinc.quickbase.com` |
| `QB_TOKEN` | Yes | Quickbase user token |
| `QB_TABLE_ID` | Optional | Default table ID (overridden by the settings modal) |
| `QB_REPORT_ID` | Optional | Default report ID (overridden by the settings modal) |
| `KV_REST_API_URL` | Optional | Vercel KV endpoint for cross-device settings sync |
| `KV_REST_API_TOKEN` | Optional | Vercel KV token |

`QB_REALM` and `QB_TOKEN` are server-side only — never exposed to the browser.

---

## Quickbase report compatibility

The dashboard reads **any** Quickbase report. Field labels are matched case-insensitively and common label variations are all accepted. No report restructuring is required when you point the dashboard at a new table.

### Recognised label groups (any variation in a group triggers the typed column/value)

| Category | Accepted labels |
|---|---|
| Order / record number | `Order Number w/Series`, `Order Number`, `Order #`, `Order No`, `Order ID` |
| Order name / formula | `Order Name (Formula)`, `Order Name Formula`, `Order Name` |
| Project manager | `Project Manager`, `PM`, `Manager`, `Install By`, `Installer` |
| Install date | `Installation Complete Date`, `Install Complete Date`, `Install Complete`, `Install Date`, `Installation Date` |
| Shipping date | `Shipping Complete Date`, `Ship Complete Date`, `Shipping Date`, `Ship Date` |
| Warranty claims | `# of Warranty Claims`, `Warranty Claims`, `Claims` |
| QC peeling | `# of QC Entries for Peeling Powder`, `QC Peeling`, `Peeling Powder` |
| QC powder failure | `# of QC Entries for Powder Failure`, `QC Powder Failure`, `Powder Failure` |
| Order value | `Order Posted $`, `Order Value`, `Contract Amount`, `Total` |
| Product scope | `Product Scope`, `Products`, `Product` |

Fields not in the table above are still captured in `order._qbFields[label]` and immediately available in the configurable KPI, chart, and column pickers — no code changes needed.

### Optional high-performance map fields

| Label | Purpose |
|---|---|
| `Latitude` | Decimal latitude — skips Nominatim geocoding |
| `Longitude` | Decimal longitude — skips Nominatim geocoding |

When present the map places pins instantly. Records without them fall back to Nominatim + localStorage geocache.

---

## localStorage keys

| Key | Stores |
|---|---|
| `awntrak_warranty_table_id` | QB table ID from Settings modal |
| `awntrak_warranty_report_id` | QB report ID from Settings modal |
| `awntrak_kpi_configs` | JSON array of KPI configuration objects |
| `awntrak_chart_configs` | JSON array of chart configuration objects |
| `awntrak_column_titles` | `{ [colId]: string }` — user column title overrides |
| `awntrak_column_order` | `string[]` — ordered column ID list |
| `awntrak_geocache` | `{ [locationKey]: [lat, lng] }` — Nominatim geocoding cache |
| `awntrak_dashboard_title` | Dashboard title (editable in-place) |
| `awntrak_dashboard_subtitle` | Dashboard subtitle (editable in-place) |

All keys (excluding geocache) are synced to Vercel KV under `awntrak_settings` when KV env vars are configured.

---

## Dashboard edit mode

Click **Edit** in the top-right header to enter edit mode. While active:

- A dark toolbar appears at the top with **Add KPI**, **Add Chart**, and **Reset to Defaults** actions
- KPI and chart cards display a **Drag** badge and can be reordered via click-drag-drop
- Every card shows inline **Edit**, **Duplicate**, and **Hide/Show** buttons
- Clicking **Edit** opens the respective editor modal with a live preview
- Clicking **Done Editing** exits edit mode; all changes are persisted and synced

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full GitHub + Vercel deployment guide.

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — Component contracts, config schemas, data flow, extension guide
- [API_REFERENCE.md](API_REFERENCE.md) — `/api/warranty-orders` endpoint reference
- [DEPLOY.md](DEPLOY.md) — GitHub and Vercel deployment
- [CLAUDE.md](CLAUDE.md) — Claude Code guidance for AI-assisted development
