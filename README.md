# Awntrak Warranty Management Dashboard

A Next.js application that pulls live warranty order data from Quickbase and presents it as an interactive, fully configurable dashboard. Part of the **Awntrak Platform** suite built for Awnex, Inc.

---

## What it does

- Displays active, expiring, and expired warranty orders pulled from a Quickbase report
- Calculates a composite risk score per order (claims, QC defect entries, urgency, order value)
- **Configurable KPI cards** — users can edit title, source field, aggregation type, filter condition, icon, color, and number format from the dashboard; no code changes needed
- **Configurable charts** — users can edit chart type, group-by field, metrics, filter, sort, and color palette from the dashboard
- Dashboard edit mode with add / duplicate / hide / reset-to-defaults controls
- KPI and chart configurations persist in `localStorage` (ready to be moved to Quickbase or SharePoint later)
- Filter by PM, warranty status, brand, risk level, or free-text search
- Leaflet map view showing installation locations with status-color pins
- Multi-source connections (separate claims and costs QB tables merged by order number)
- Connection settings stored in the browser — credentials never leave the server

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
├── WarrantyDashboard.jsx         Main orchestrator — data fetch, state, layout
│
├── lib/                          Platform-wide pure utilities (no React)
│   ├── tokens.js                 Design tokens: all colors, shadows, STATUS_CFG, RISK_CFG
│   ├── qbUtils.js                QB field parsing, mapQBResponse, mapClaimsResponse, risk scoring
│   ├── dashboardMetrics.js       Filter, aggregate, computeKpiValue, computeChartData helpers
│   ├── dashboardDefaults.js      Default KPI/chart configs, KPI_THEMES, COLOR_PALETTES
│   └── dashboardStorage.js       localStorage load/save helpers for all config keys
│
├── components/
│   ├── ui/                       Platform-wide presentational components
│   │   ├── Icon.jsx              SVG icon registry — Icon({ name, size, color })
│   │   ├── Badge.jsx             StatusBadge, RiskBadge
│   │   ├── Modal.jsx             Generic modal wrapper + Btn + formStyles
│   │   ├── Tag.jsx               ProductTag
│   │   ├── StateScreens.jsx      EmptyState, LoadingState, ErrorState
│   │   └── SortIcon.jsx          Column sort direction indicator
│   ├── AwnexLogo.jsx             Awnex SVG branding mark
│   ├── SettingsModal.jsx         Quickbase connection configuration modal
│   ├── MapView.jsx               Leaflet map with geocoding and status pins
│   └── dashboard/                Configurable dashboard components
│       ├── KpiCard.jsx           KPI display card with edit-mode controls
│       ├── KpiEditor.jsx         KPI editor modal with live preview
│       ├── ChartCard.jsx         Chart wrapper with edit-mode controls + CustomTooltip
│       ├── ChartEditor.jsx       Chart editor modal with live preview
│       ├── ConfigurableChart.jsx Renders bar / hbar / donut / line / stacked from config
│       └── DashboardEditToolbar.jsx  Edit mode toolbar (add, reset, exit)
│
├── pages/
│   ├── _app.jsx                  App wrapper (viewport meta, CSS reset)
│   ├── index.jsx                 Entry page — mounts WarrantyDashboard
│   └── api/
│       └── warranty-orders.js    Server-side proxy to Quickbase API
│
├── ARCHITECTURE.md               Full system design, component contracts, extension guide
├── API_REFERENCE.md              /api/warranty-orders endpoint documentation
├── DEPLOY.md                     GitHub + Vercel deployment guide
└── CLAUDE.md                     Claude Code guidance for AI-assisted development
```

---

## Local development

### Prerequisites

- Node.js 18 or later
- A Quickbase user token with read access to the Orders table
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

Open `http://localhost:3000`. On first load you'll see the **Connect to Quickbase** screen. Click **Configure Connection** and enter your Table ID and Report ID.

Settings persist in `localStorage`. Data loads immediately after saving.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `QB_REALM` | Yes | Quickbase realm hostname, e.g. `awnexinc.quickbase.com` |
| `QB_TOKEN` | Yes | Quickbase user token |
| `QB_TABLE_ID` | Optional | Default table ID (overridden by the settings modal) |
| `QB_REPORT_ID` | Optional | Default report ID (overridden by the settings modal) |

`QB_REALM` and `QB_TOKEN` are server-side only — never exposed to the browser.

---

## Quickbase report requirements

The report must include these fields. Labels must match exactly (case-sensitive).

| QB Field Label | Used for |
|---|---|
| `Order Number w/Series` | Order number and direct QB record link |
| `Order Name (Formula)` | Brand, location, and customer name extraction |
| `Project Manager` | PM name |
| `Product Scope` | Semicolon-separated product list |
| `NEW Final Color Approval` | Color specification |
| `# of Warranty Claims` | Claim count — primary risk signal |
| `# of QC Entries for Peeling Powder` | QC defect leading indicator |
| `# of QC Entries for Powder Failure` | QC defect leading indicator |
| `Order Posted $` | Order value for KPI totals and risk weighting |
| `Installation Complete Date` | Warranty end calculation (preferred) |
| `Shipping Complete Date` | Warranty end fallback |

Two optional fields improve map performance significantly — add them to your QB report and they will be used automatically:

| QB Field Label | Purpose |
|---|---|
| `Latitude` | Decimal latitude of the installation site |
| `Longitude` | Decimal longitude of the installation site |

When these fields are present, the map places pins instantly without any Nominatim geocoding calls. Records missing them fall back to the existing Nominatim + localStorage-cache flow.

Extra QB fields not listed above are captured in `_qbFields` on each order and exposed in the configurable field picker, so they can be used in custom KPI and chart configurations without any code changes. QB formula fields that return HTML strings (e.g. styled status badges) are detected automatically and rendered as HTML in the order table.

---

## localStorage keys

| Key | Stores |
|---|---|
| `awntrak_warranty_table_id` | QB table ID from Settings modal |
| `awntrak_warranty_report_id` | QB report ID from Settings modal |
| `awntrak_kpi_configs` | JSON array of KPI configuration objects |
| `awntrak_chart_configs` | JSON array of chart configuration objects |

---

## Dashboard edit mode

Click the **Edit Layout** button in the top-right header to enter edit mode. While active:

- A dark toolbar appears at the top with **Add KPI**, **Add Chart**, and **Reset to Defaults** actions
- Every KPI card and chart card shows inline **Edit**, **Duplicate**, and **Hide/Show** buttons
- Clicking **Edit** opens the respective editor modal with a live preview
- Clicking **Done Editing** exits edit mode and saves all changes to `localStorage`

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full GitHub + Vercel deployment guide.

---

## Related docs

- [ARCHITECTURE.md](ARCHITECTURE.md) — Component contracts, config schemas, data flow, extension guide
- [API_REFERENCE.md](API_REFERENCE.md) — `/api/warranty-orders` endpoint reference
- [DEPLOY.md](DEPLOY.md) — GitHub and Vercel deployment
- [CLAUDE.md](CLAUDE.md) — Claude Code guidance for AI-assisted development
