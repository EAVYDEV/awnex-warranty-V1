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

`QB_REALM` and `QB_TOKEN` are **server-side only** and never sent to the browser. After starting the dev server, open the dashboard and click **Configure Connection** to enter a Table ID and Report ID — these are stored in `localStorage` and appended as query params to every API call.

Optional env var fallbacks (override via the settings modal):
- `QB_TABLE_ID` — default table ID
- `QB_REPORT_ID` — default report ID

## Platform overview

Two modules share the same Next.js app and `lib/` utilities:

| Route | Module | Orchestrator |
|---|---|---|
| `/` | Warranty Management | `src/WarrantyDashboard.jsx` |
| `/quality-risk` | Quality Risk & RCA | `src/pages/QualityRiskDashboard.jsx` |

### Data flow (Warranty)

```
Browser (src/WarrantyDashboard.jsx)
  → GET /api/warranty-orders?tableId=…&reportId=…
      → pages/api/warranty-orders.js  (server-side proxy)
          → POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
  ← raw QB payload { fields[], data[] }
  ← lib/qbUtils.js → mapQBResponse() → typed order objects (+ _qbFields for extra columns)
  ← enriched with status, riskScore, open/closed claims via useMemo
  ← lib/dashboardMetrics.js → computeKpiValue() / computeChartData()
  ← components/dashboard/* renders KPI cards, charts, map, table
```

## File map — where to find things

| Need to change | File |
|---|---|
| Colors, shadows, status/risk color configs | `lib/tokens.js` |
| QB field parsing, flexible label matching, risk scoring, column spec builder | `lib/qbUtils.js` |
| Filter, aggregate, KPI/chart compute helpers | `lib/dashboardMetrics.js` |
| Default KPI/chart configs, palettes, themes | `lib/dashboardDefaults.js` |
| localStorage keys and load/save helpers | `lib/dashboardStorage.js` |
| SVG icon set | `components/ui/Icon.jsx` |
| StatusBadge, RiskBadge (warranty) | `components/ui/Badge.jsx` |
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
| Warranty state, data fetch, layout orchestration | `src/WarrantyDashboard.jsx` |
| Quality Risk case state, views, routing | `src/pages/QualityRiskDashboard.jsx` |
| Quality Risk scoring, status gating logic | `src/lib/qualityRiskUtils.js` |
| Quality Risk UI components (case table, card, detail panel, tabs) | `src/components/quality/` |
| QB API proxy | `pages/api/warranty-orders.js` |

## Quickbase field mapping

`mapQBResponse()` in `lib/qbUtils.js` matches field labels **case-insensitively** and accepts common variations. No QB report needs to use specific labels for data to load.

Recognised label groups (first match wins):

| Category | Accepted labels |
|---|---|
| Order number | `Order Number w/Series`, `Order Number`, `Order #`, `Order No`, `Order ID` |
| Order name | `Order Name (Formula)`, `Order Name Formula`, `Order Name` |
| Project manager | `Project Manager`, `PM`, `Manager`, `Install By`, `Installer` |
| Install date | `Installation Complete Date`, `Install Complete Date`, `Install Complete`, `Install Date` |
| Ship date | `Shipping Complete Date`, `Ship Complete Date`, `Shipping Date`, `Ship Date` |
| Claims | `# of Warranty Claims`, `Warranty Claims`, `Claims` |
| QC peeling | `# of QC Entries for Peeling Powder`, `QC Peeling`, `Peeling Powder` |
| QC powder failure | `# of QC Entries for Powder Failure`, `QC Powder Failure`, `Powder Failure` |
| Order value | `Order Posted $`, `Order Value`, `Contract Amount`, `Total` |
| Products | `Product Scope`, `Products`, `Product` |

- Records are filtered out only when both `qbRid` and `orderNum` are empty (which cannot happen with a valid QB response).
- `warrantyEnd` is **optional** — records without an install/ship date are kept and shown with status `"active"` and `"No date"` in the Warranty column.
- Any label not in the table above is captured in `order._qbFields[label]` for use in KPI/chart/column configs.

Two optional fields enable instant map rendering with no Nominatim calls:

| Label | Purpose |
|---|---|
| `Latitude` | Decimal latitude — read from `order._qbFields["Latitude"]` by `MapView` |
| `Longitude` | Decimal longitude — read from `order._qbFields["Longitude"]` by `MapView` |

### Formula field HTML rendering

QB formula fields often return HTML strings (e.g. styled `<div>` blocks). The `qbField` cell renderer in `src/WarrantyDashboard.jsx` (`renderCell`) detects HTML content via `/<[a-z]/i` and renders it via `DOMPurify.sanitize` + `dangerouslySetInnerHTML`. Plain-text values render with standard design-system styles.

## Configurable dashboard system

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

Default configs are in `lib/dashboardDefaults.js` (`DEFAULT_KPI_CONFIGS`, `DEFAULT_CHART_CONFIGS`).

**Table column config shape** (stored as `awntrak_column_titles` — title overrides only):
```js
{ [colId]: string }   // e.g. { "col_orderNum": "Order #", "col_qb_42": "Contract Amt" }
```

`renderAs` strategies used by `renderCell()`:

| renderAs | Output |
|---|---|
| `orderNum` | Bold order number in brand color |
| `customer` | Semi-bold customer name |
| `location` | Small gray city/state text |
| `pm` | Project manager name |
| `risk` | `RiskBadge` (score/100 + level label) |
| `status` | `StatusBadge` (Active / Expiring / Expired / No date) |
| `expires` | Formatted warranty end date, or `-` when null |
| `claims` | Claim count; red + bold when > 1 |
| `qcPeeling` | QC peeling entry count |
| `qcPowder` | QC powder-failure count; amber when > 1 |
| `orderValue` | `fmtCurrency()` formatted value |
| `products` | `ProductTag` chips list |
| `qbLink` | "Open ↗" link button to Quickbase record |
| `qbField` | Raw value from `order._qbFields[spec.key]`; HTML values sanitized and rendered inline |

## Quality Risk module

Quality cases live in React state in `QualityRiskDashboard`. Key utilities:

**`src/lib/qualityRiskUtils.js` exports:**
- `STATUS_FLOW` — ordered array of status strings
- `calculateRiskScore(caseRecord)` — severity + scope + detection + fieldImpact bonus
- `calculateRiskLevel(score)` — "Low" / "Medium" / "High" / "Critical"
- `isContainmentRequired(caseRecord)` — true for High/Critical severity, field impact, or broad scope
- `canAdvanceStatus(caseRecord)` — returns true when required fields for the current phase are complete
- `canCloseCase(caseRecord)` — full closure gate check

**Case status flow:** `Open → Containment → RCA → CAPA → Effectiveness Check → Closed`

## Available fields for KPI / chart configuration

`lib/dashboardMetrics.js` exports `BUILTIN_FIELDS` — enriched order fields always available:

- Text: `status`, `brand`, `pm`, `location`, `customer`, `risk`, `products` (array)
- Numeric: `claims`, `openClaims`, `closedClaims`, `claimCost`, `orderValue`, `qcPeeling`, `qcPowder`, `riskScore`, `days`
- Date: `warrantyEnd` (may be null)

When a QB report is loaded, `buildAvailableFields(qbReportFields)` in `dashboardMetrics.js` merges in any extra QB columns not already mapped.

## Map view

Leaflet loads from CDN at runtime (not bundled — avoids SSR issues). Unknown locations fall back to Nominatim (OpenStreetMap) with a 300 ms delay between requests. Geocoded results cache in `awntrak_geocache` in localStorage.

## Multi-source connections

`WarrantyDashboard` accepts an optional `sources` prop:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims", role: "claims", fieldMap: { orderNum: "Order #", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Sources are fetched in parallel and merged by order number.

## LocalStorage keys

| Key | Purpose |
|---|---|
| `awntrak_warranty_table_id` | QB table ID |
| `awntrak_warranty_report_id` | QB report ID |
| `awntrak_kpi_configs` | JSON array of KPI configuration objects |
| `awntrak_chart_configs` | JSON array of chart configuration objects |
| `awntrak_column_titles` | `{ [colId]: string }` map of custom column display titles |
| `awntrak_column_order` | `string[]` ordered array of column IDs |
| `awntrak_geocache` | `{ [locationKey]: [lat, lng] }` Nominatim geocoding cache |
| `awntrak_dashboard_title` | Editable dashboard title |
| `awntrak_dashboard_subtitle` | Editable dashboard subtitle |

All keys (excluding geocache) are synced to Vercel KV via `GET /api/settings` (on mount) and `POST /api/settings` (debounced, 800 ms) so settings persist across devices.
