# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run start     # serve production build
npm run screenshot [url] [output.png]  # Playwright screenshot (devDependency)
```

No test runner is configured. Next.js type checking runs implicitly during `build`.

## Environment setup

Create `.env.local` in the project root:

```
QB_REALM=awnexinc.quickbase.com
QB_TOKEN=your_quickbase_user_token
```

`QB_REALM` and `QB_TOKEN` are **server-side only** and never sent to the browser. Each module has its own QB connection configured via its **Configure QB** button — table ID and report ID are stored in `localStorage` and appended as query params to every API call.

Optional env var fallbacks per module (all overrideable via the settings modal):

```
QB_TABLE_ID / QB_REPORT_ID                  # Warranty
QB_INSPECTIONS_TABLE_ID / _REPORT_ID        # Inspections
QB_NCRS_TABLE_ID / _REPORT_ID               # Non-Conformances
QB_CAPAS_TABLE_ID / _REPORT_ID              # Corrective Actions
QB_PRODUCTION_TABLE_ID / _REPORT_ID         # Production
```

## Architecture overview

The app is a **Quality Management System (QMS)** built on a persistent dark sidebar shell (`QMSShell`) that hosts five independent modules. Each module connects to its own Quickbase table/report.

### Top-level structure

```
pages/index.jsx
  └── <QMSShell>
        ├── <QMSSidebar>   collapsible nav (240px / 64px)
        └── <main>
              ├── QMSOverview          (default home)
              ├── WarrantyDashboard    standalone={false}
              ├── InspectionsModule
              ├── NcrModule
              ├── CapaModule
              └── ProductionModule
```

To add a new module: (1) create `components/modules/YourModule.jsx`, (2) add a nav item to `NAV_ITEMS` in `QMSSidebar.jsx`, (3) add a QB proxy at `pages/api/your-module.js`, (4) add a key to `MODULE_QB_KEYS` in `dashboardStorage.js`, (5) register it in `MODULE_COMPONENTS` in `QMSShell.jsx`.

### Data flow (per module)

```
Browser module component
  → GET /api/{module}?tableId=…&reportId=…
      → pages/api/{module}.js  (server-side proxy)
          → POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
              (QB_REALM + QB_TOKEN injected server-side)
  ← raw QB payload { fields[], data[] }
```

The Warranty module further processes the payload through:
```
lib/qbUtils.js → mapQBResponse() → typed order objects (+ _qbFields)
useMemo enrichment → status, riskScore, claims
lib/dashboardMetrics.js → computeKpiValue() / computeChartData()
components/dashboard/* → KPI cards, charts, map, table
```

NCR and CAPA modules source case data from `src/lib/qualityRiskDataSource.js` (mock today, toggle `USE_MOCK_QUALITY_RISK_DATA` to go live).

### File map — where to find things

| Need to change | File |
|---|---|
| Colors, shadows, status/risk color configs | `lib/tokens.js` |
| QMS shell layout (sidebar + content) | `components/QMSShell.jsx` |
| Sidebar nav items, icons, collapse toggle | `components/QMSSidebar.jsx` |
| QMS home overview page | `components/modules/QMSOverview.jsx` |
| Inspections module | `components/modules/InspectionsModule.jsx` |
| NCR module | `components/modules/NcrModule.jsx` |
| CAPA module | `components/modules/CapaModule.jsx` |
| Production module | `components/modules/ProductionModule.jsx` |
| QB field parsing, order mapping, risk scoring, column spec builder | `lib/qbUtils.js` |
| Filter, aggregate, KPI/chart compute helpers | `lib/dashboardMetrics.js` |
| Default KPI/chart configs, palettes, themes | `lib/dashboardDefaults.js` |
| localStorage keys and load/save helpers | `lib/dashboardStorage.js` |
| SVG icon set | `components/ui/Icon.jsx` |
| StatusBadge, RiskBadge | `components/ui/Badge.jsx` |
| Generic modal wrapper, Btn, formStyles | `components/ui/Modal.jsx` |
| EmptyState, LoadingState, ErrorState | `components/ui/StateScreens.jsx` |
| Awnex branding logo | `components/AwnexLogo.jsx` |
| QB connection settings modal | `components/SettingsModal.jsx` |
| Leaflet map + geocoding | `components/MapView.jsx` |
| KPI display card | `components/dashboard/KpiCard.jsx` |
| KPI editor modal | `components/dashboard/KpiEditor.jsx` |
| Chart wrapper + CustomTooltip | `components/dashboard/ChartCard.jsx` |
| Chart editor modal | `components/dashboard/ChartEditor.jsx` |
| Recharts rendering for all chart types | `components/dashboard/ConfigurableChart.jsx` |
| Edit mode toolbar | `components/dashboard/DashboardEditToolbar.jsx` |
| Column title editor modal | `components/dashboard/ColumnEditor.jsx` |
| Warranty module orchestrator | `src/WarrantyDashboard.jsx` |
| Quality case components (NCR / CAPA reuse) | `src/components/quality/` |
| Case data provider (mock/live switch) | `src/lib/qualityRiskDataSource.js` |
| Warranty QB proxy | `pages/api/warranty-orders.js` |
| Inspections QB proxy | `pages/api/inspections.js` |
| NCR QB proxy | `pages/api/ncrs.js` |
| CAPA QB proxy | `pages/api/capas.js` |
| Production QB proxy | `pages/api/production.js` |

### Design system (`lib/tokens.js`)

Enterprise blue-gray palette. Key values:

| Token | Value | Usage |
|---|---|---|
| `T.brand` | `#1D4ED8` | Primary — buttons, active states, links |
| `T.accent` | `#0891B2` | Teal — Inspections accent |
| `T.danger` | `#DC2626` | NCR red, fail states |
| `T.text1` | `#0F172A` | Primary body text |
| `T.text2` | `#475569` | Secondary text |
| `T.bg` | `#F1F5F9` | Page background |
| `T.sidebar` | `#0F172A` | Dark sidebar background |
| `T.sidebarActive` | `#1D4ED8` | Active nav item |

The `T` alias object provides all tokens as flat keys for inline styles. All components use `T.xxx` — never raw hex literals.

### Quickbase field mapping (Warranty module)

`mapQBResponse()` in `lib/qbUtils.js` matches field labels exactly. Required QB report fields:

| Label | Purpose |
|---|---|
| `Order Number w/Series` | HTML anchor; URL and numeric order number extracted via regex |
| `Order Name (Formula)` | `BRAND-CustomerName-ID-City State-Address` format; brand/location parsed from dash-split |
| `Project Manager` | Display-name format; `extractPMName()` strips the `<userid>` suffix. Also handles QB user-field objects `{id, name}`. |
| `# of Warranty Claims` | Primary risk signal |
| `# of QC Entries for Peeling Powder` / `# of QC Entries for Powder Failure` | Leading-indicator risk signals |
| `Installation Complete Date` / `Shipping Complete Date` | Used to compute `warrantyEnd` (install preferred; shipping as fallback) |
| `Product Scope` | Semicolon-separated product list |
| `NEW Final Color Approval` | Shown in expanded row only |

Two optional fields enable instant map rendering with no Nominatim calls:

| Label | Purpose |
|---|---|
| `Latitude` | Decimal latitude — read from `order._qbFields["Latitude"]` by `MapView` |
| `Longitude` | Decimal longitude — read from `order._qbFields["Longitude"]` by `MapView` |

Any QB field not in this list is captured in `order._qbFields[label]` and exposed in the configurable KPI/chart field picker.

#### Formula field HTML rendering

QB formula fields often return HTML strings. `renderCell` in `WarrantyDashboard.jsx` detects HTML via `/<[a-z]/i` and renders it with `dangerouslySetInnerHTML` (sanitized by `isomorphic-dompurify`). Plain-text values render with standard design-system styles.

### WarrantyDashboard `standalone` prop

When `standalone={false}` (set by `QMSShell`), `WarrantyDashboard`:
- Renders an inline module header (title + accent bar) instead of `AppHeader`
- Sets `minHeight: "auto"` instead of `"100vh"`

When `standalone={true}` (default, used by `pages/index.jsx` directly or legacy routes), the full `AppHeader` and full-viewport layout apply.

### Configurable dashboard system (Warranty module)

Each KPI card and chart is driven by a config object stored in `localStorage`:

**KPI config shape:**
```js
{
  id: string,
  title: string,
  aggregation: "count" | "sum" | "avg" | "min" | "max",
  field: string | null,        // enriched order field key; null for pure count
  filter: { field, op, value } | null,
  subtitle: string,
  icon: string,                // key in components/ui/Icon.jsx PATHS map
  color: string,               // hex
  bg: string,                  // hex
  format: "number" | "currency" | "percent" | "text",
  decimals: number,
  hidden: boolean,
}
```

**Chart config shape:**
```js
{
  id: string,
  title: string,
  type: "bar" | "hbar" | "donut" | "line" | "stacked",
  groupField: string,          // category / X-axis field key
  stackField: string | null,   // for stacked type only
  metrics: [{ field, aggregation, label, color }],
  filter: { field, op, value } | null,
  sortDir: "asc" | "desc",
  maxCategories: number | null,
  showLegend: boolean,
  showAxisLabels: boolean,
  palette: string,             // key in COLOR_PALETTES (lib/dashboardDefaults.js)
  hidden: boolean,
}
```

Default configs are in `lib/dashboardDefaults.js`. Table column title overrides stored as `{ [colId]: string }` in `awntrak_column_titles`.

### Available fields for KPI / chart configuration

`lib/dashboardMetrics.js` exports `BUILTIN_FIELDS` — always available in the Warranty module:

- Text: `status`, `brand`, `pm`, `location`, `customer`, `risk`, `products` (array)
- Numeric: `claims`, `openClaims`, `closedClaims`, `claimCost`, `orderValue`, `qcPeeling`, `qcPowder`, `riskScore`, `days`
- Date: `warrantyEnd`

When a QB report is loaded, `buildAvailableFields(qbReportFields)` merges in extra QB columns.

### Map view

Leaflet loads from CDN at runtime (not bundled — avoids SSR issues). Unknown locations fall back to Nominatim with a 300 ms delay. Geocoded results cached in a `useRef` for the session.

### Multi-source connections (Warranty)

`WarrantyDashboard` accepts an optional `sources` prop:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims", role: "claims", fieldMap: { orderNum: "Order #", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Sources fetched in parallel, merged by order number.

### Table column order and title customization

Column order follows QB report field order. `buildColumnSpecs(qbReportFields, customTitles)` maps QB `fields[]` into column specs. Computed columns (Risk, Status, Location) are inserted directly after their source QB field. User renames are saved to `awntrak_column_titles` and merged at runtime.

`renderAs` strategies in `renderCell()`:

| renderAs | Output |
|---|---|
| `orderNum` | Bold order number in brand color |
| `customer` | Semi-bold customer name |
| `location` | Small gray city/state text |
| `pm` | Project manager name |
| `risk` | `RiskBadge` |
| `status` | `StatusBadge` |
| `expires` | Formatted warranty end date |
| `claims` | Count; red + bold when > 1 |
| `qcPeeling` | QC peeling entry count |
| `qcPowder` | QC powder-failure count; amber when > 1 |
| `orderValue` | `fmtCurrency()` |
| `products` | `ProductTag` chips |
| `qbLink` | "Open ↗" link to QB record |
| `qbField` | Plain text from `order._qbFields[spec.key]` |

### LocalStorage keys

All keys synced to Vercel KV via `GET /api/settings` (on mount) and `POST /api/settings` (debounced 800 ms).

| Key | Module | Purpose |
|---|---|---|
| `awntrak_warranty_table_id` | Warranty | QB table ID |
| `awntrak_warranty_report_id` | Warranty | QB report ID |
| `awntrak_inspections_table_id` | Inspections | QB table ID |
| `awntrak_inspections_report_id` | Inspections | QB report ID |
| `awntrak_ncrs_table_id` | NCRs | QB table ID |
| `awntrak_ncrs_report_id` | NCRs | QB report ID |
| `awntrak_capas_table_id` | CAPAs | QB table ID |
| `awntrak_capas_report_id` | CAPAs | QB report ID |
| `awntrak_production_table_id` | Production | QB table ID |
| `awntrak_production_report_id` | Production | QB report ID |
| `awntrak_kpi_configs` | Warranty | JSON array of KPI configs |
| `awntrak_chart_configs` | Warranty | JSON array of chart configs |
| `awntrak_column_titles` | Warranty | `{ [colId]: string }` title overrides |
| `awntrak_column_order` | Warranty | `string[]` column order |
| `awntrak_geocache` | Map | `{ [locationKey]: [lat, lng] }` geocoding cache |

The Vercel KV key is `awntrak_settings` and holds all of the above as a single JSON object. Requires `KV_REST_API_URL` and `KV_REST_API_TOKEN`; absent = localStorage only.
