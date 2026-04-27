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

## Architecture overview

The app has been refactored from a single 1,500-line file into a modular structure. All logic is split across `lib/` (pure utilities) and `components/` (React components). `WarrantyDashboard.jsx` is the main orchestrator.

### Data flow

```
Browser (WarrantyDashboard.jsx)
  → GET /api/warranty-orders?tableId=…&reportId=…
      → pages/api/warranty-orders.js  (server-side proxy)
          → POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
              (QB_REALM + QB_TOKEN auth headers injected server-side)
  ← raw QB payload { fields[], data[] }
  ← lib/qbUtils.js → mapQBResponse() → typed order objects (+ _qbFields for extra columns)
  ← enriched with status, riskScore, open/closed claims via useMemo
  ← lib/dashboardMetrics.js → computeKpiValue() / computeChartData() → KPI values + chart arrays
  ← components/dashboard/* renders KPI cards, charts, map, table
```

### File map — where to find things

| Need to change | File |
|---|---|
| Colors, shadows, status/risk color configs | `lib/tokens.js` |
| QB field parsing, order mapping, risk scoring | `lib/qbUtils.js` |
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
| All state, data fetch, layout orchestration | `WarrantyDashboard.jsx` |
| QB API proxy | `pages/api/warranty-orders.js` |

### Quickbase field mapping

`mapQBResponse()` in `lib/qbUtils.js` matches field labels exactly. Required QB report fields:

| Label | Purpose |
|---|---|
| `Order Number w/Series` | HTML anchor; URL and numeric order number extracted via regex |
| `Order Name (Formula)` | `BRAND-CustomerName-ID-City State-Address` format; brand/location parsed from dash-split |
| `Project Manager` | Display-name format; `extractPMName()` strips the `<userid>` suffix |
| `# of Warranty Claims` | Primary risk signal |
| `# of QC Entries for Peeling Powder` / `# of QC Entries for Powder Failure` | Leading-indicator risk signals |

Any QB field not in this list is captured in `order._qbFields[label]` so it can be used in configurable KPI and chart configs without changing code.

#### Formula field HTML rendering

QB formula fields often return HTML strings (e.g. styled `<div>` blocks with inline CSS). The `qbField` cell renderer in `WarrantyDashboard.jsx` (`renderCell`) detects HTML content via `/<[a-z]/i` and renders it with `dangerouslySetInnerHTML`, so the formula's own inline styles display as intended. Plain-text values from non-HTML formula fields continue to render as text with the standard design-system styles (`T.text2`, `fontSize: 12`).

### Configurable dashboard system

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

Default configs are in `lib/dashboardDefaults.js` (`DEFAULT_KPI_CONFIGS`, `DEFAULT_CHART_CONFIGS`). They exactly replicate the original hard-coded dashboard so no visual information is lost.

### Available fields for KPI / chart configuration

`lib/dashboardMetrics.js` exports `BUILTIN_FIELDS` — the enriched order fields always available:

- Text: `status`, `brand`, `pm`, `location`, `customer`, `risk`, `products` (array)
- Numeric: `claims`, `openClaims`, `closedClaims`, `claimCost`, `orderValue`, `qcPeeling`, `qcPowder`, `riskScore`, `days`
- Date: `warrantyEnd`

When a QB report is loaded, `buildAvailableFields(qbReportFields)` in `dashboardMetrics.js` merges in any extra QB columns not already mapped.

### Map view

Leaflet loads from CDN at runtime (not bundled — avoids SSR issues). `CITY_COORDS` in `components/MapView.jsx` caches known city coordinates. Unknown locations fall back to Nominatim (OpenStreetMap) with a 300 ms delay between requests. Geocoded results cache in a `useRef` for the session.

### Multi-source connections

`WarrantyDashboard` accepts an optional `sources` prop:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims", role: "claims", fieldMap: { orderNum: "Order #", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Sources are fetched in parallel and merged by order number. Additional routes must follow the same server-side proxy pattern as `pages/api/warranty-orders.js`.

### LocalStorage keys

| Key | Purpose |
|---|---|
| `awntrak_warranty_table_id` | QB table ID |
| `awntrak_warranty_report_id` | QB report ID |
| `awntrak_kpi_configs` | JSON array of KPI configuration objects |
| `awntrak_chart_configs` | JSON array of chart configuration objects |

All keys are managed through `lib/dashboardStorage.js`.
