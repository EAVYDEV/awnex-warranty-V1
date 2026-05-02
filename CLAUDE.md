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

`QB_REALM` and `QB_TOKEN` are **server-side only** and never sent to the browser. Each dashboard tab has its own QB connection. Open any tab and click the gear icon (⚙) to enter that tab's Table ID and Report ID — these are stored in `localStorage` under per-module keys and appended as query params to every API call.

Optional env var fallbacks (override via the settings modal):
- `QB_TABLE_ID` — default table ID
- `QB_REPORT_ID` — default report ID

## Architecture overview

The app has been refactored from a single 1,500-line file into a modular structure. All logic is split across `lib/` (pure utilities) and `components/` (React components). `WarrantyDashboard.jsx` is the main orchestrator for the Warranty and Installation tabs; `QualityRiskDashboard.jsx` is the orchestrator for the Quality Risk & RCA tab.

### Dashboard tabs

| Tab | Route | Orchestrator | QB config key prefix |
|---|---|---|---|
| Warranty | `/` | `src/WarrantyDashboard.jsx` | `awntrak_warranty_` |
| Installation | `/?module=installation` | `src/WarrantyDashboard.jsx` | `awntrak_installation_` |
| Quality Risk & RCA | `/quality-risk` | `src/pages/QualityRiskDashboard.jsx` | `awntrak_quality_` |

Each tab stores and loads its own Quickbase table ID and report ID independently. Changing the connection on one tab has no effect on the others.

### Data flow

**Warranty tab:**
```
Browser (WarrantyDashboard.jsx — activeModule = "warranty")
  → GET /api/warranty-orders?tableId=…&reportId=…   (warrantySettings)
      → pages/api/warranty-orders.js  (server-side proxy)
          → POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
              (QB_REALM + QB_TOKEN auth headers injected server-side)
  ← raw QB payload { fields[], data[] }
  ← lib/qbUtils.js → mapQBResponse() → typed order objects (+ _qbFields for extra columns)
  ← enriched with status, riskScore, open/closed claims via useMemo
  ← lib/dashboardMetrics.js → computeKpiValue() / computeChartData() → KPI values + chart arrays
  ← components/dashboard/* renders KPI cards, charts, map, table
```

**Installation tab:**
```
Browser (WarrantyDashboard.jsx — activeModule = "installation")
  → GET /api/warranty-orders?tableId=…&reportId=…   (installationSettings — independent)
  ← raw QB payload
  ← lib/installationData.js → mapInstallationData() → installation job objects
  ← src/components/installation/InstallationDashboard renders kanban/table/map
```

**Quality Risk & RCA tab:**
```
Browser (QualityRiskDashboard.jsx)
  ← src/lib/qualityRiskDataSource.js → getQualityRiskDashboardData() (local data)
  ← qualitySettings stored in awntrak_quality_table_id / report_id (QB fetch not yet wired)
```

### File map — where to find things

| Need to change | File |
|---|---|
| Colors, shadows, status/risk color configs | `lib/tokens.js` |
| QB field parsing, order mapping, risk scoring, column spec builder | `lib/qbUtils.js` |
| Filter, aggregate, KPI/chart compute helpers | `lib/dashboardMetrics.js` |
| Default KPI/chart configs, palettes, themes | `lib/dashboardDefaults.js` |
| Per-module localStorage keys, load/save helpers | `lib/dashboardStorage.js` |
| SVG icon set | `components/ui/Icon.jsx` |
| StatusBadge, RiskBadge | `components/ui/Badge.jsx` |
| Generic modal wrapper, Btn, formStyles | `components/ui/Modal.jsx` |
| EmptyState, LoadingState, ErrorState | `src/components/StateScreens.jsx` |
| Awnex branding logo | `components/AwnexLogo.jsx` |
| QB connection settings modal (shared by all tabs) | `src/components/SettingsModal.jsx` |
| Tab navigation header | `src/components/AppHeader.jsx` |
| Leaflet map + geocoding | `components/MapView.jsx` |
| KPI display card | `components/dashboard/KpiCard.jsx` |
| KPI editor modal | `components/dashboard/KpiEditor.jsx` |
| Chart wrapper + CustomTooltip | `components/dashboard/ChartCard.jsx` |
| Chart editor modal | `components/dashboard/ChartEditor.jsx` |
| Recharts rendering for all chart types | `components/dashboard/ConfigurableChart.jsx` |
| Edit mode toolbar | `components/dashboard/DashboardEditToolbar.jsx` |
| Column title editor modal | `components/dashboard/ColumnEditor.jsx` |
| Warranty + Installation state, data fetch, layout | `src/WarrantyDashboard.jsx` |
| Installation kanban / table / map views | `src/components/installation/InstallationDashboard.jsx` |
| Quality Risk & RCA dashboard | `src/pages/QualityRiskDashboard.jsx` |
| QB API proxy | `pages/api/warranty-orders.js` |
| Cross-device settings sync (Vercel KV) | `pages/api/settings.js` |

### Per-module QB connection

`lib/dashboardStorage.js` exposes two generic helpers used throughout the app:

```js
loadModuleSettings(module)               // → { tableId, reportId }
saveModuleSettings(module, { tableId, reportId })
```

`module` is one of `"warranty"`, `"installation"`, or `"quality"`. The helpers read/write these localStorage keys:

| Module | localStorage table key | localStorage report key |
|---|---|---|
| `warranty` | `awntrak_warranty_table_id` | `awntrak_warranty_report_id` |
| `installation` | `awntrak_installation_table_id` | `awntrak_installation_report_id` |
| `quality` | `awntrak_quality_table_id` | `awntrak_quality_report_id` |

`loadConnectionSettings()` / `saveConnectionSettings()` remain as aliases for `"warranty"` for backward compatibility.

The `SettingsModal` component accepts a `dashboardLabel` prop (e.g. `"Warranty"`, `"Installation"`, `"Quality Risk & RCA"`) that is displayed in the modal title. Storage is handled entirely by the parent — `SettingsModal` calls `onSave({ tableId, reportId })` and the parent writes to the correct module key.

### Quickbase field mapping

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

Any QB field not in this list is captured in `order._qbFields[label]` so it can be used in configurable KPI, chart, and table column configs without changing code.

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

**Table column config shape** (stored as `awntrak_column_titles` — only the title overrides, not the full spec):
```js
// localStorage stores only the user-edited title overrides:
{ [colId]: string }   // e.g. { "col_orderNum": "Order #", "col_qb_42": "Contract Amt" }
```

The full column spec is rebuilt at runtime by `buildColumnSpecs(qbReportFields, customTitles)` in `lib/qbUtils.js`:
```js
{
  id: string,          // "col_orderNum" | "col_qb_{qbId}" for extra QB fields
  qbId: number | null, // QB field ID; null for computed columns (risk, status, location)
  renderAs: string,    // render strategy — see table below
  key: string,         // enriched order field key, or QB label for _qbFields lookup
  defaultTitle: string,// original QB field label (or hardcoded default when no QB report)
  title: string,       // display title (customTitles[id] ?? defaultTitle)
  sortable: boolean,
}
```

`renderAs` strategies used by `renderCell()` in `WarrantyDashboard.jsx`:

| renderAs | Output |
|---|---|
| `orderNum` | Bold order number in brand color |
| `customer` | Semi-bold customer name |
| `location` | Small gray city/state text |
| `pm` | Project manager name |
| `risk` | `RiskBadge` (score/100 + level label) |
| `status` | `StatusBadge` (Active / Expiring / Expired) |
| `expires` | Formatted warranty end date |
| `claims` | Claim count; red + bold when > 1 |
| `qcPeeling` | QC peeling entry count |
| `qcPowder` | QC powder-failure count; amber when > 1 |
| `orderValue` | `fmtCurrency()` formatted value |
| `products` | `ProductTag` chips list |
| `qbLink` | "Open ↗" link button to Quickbase record |
| `qbField` | Plain text from `order._qbFields[spec.key]` |

`DEFAULT_COLUMN_SPECS` in `lib/qbUtils.js` is used when no QB report is loaded (sample data), preserving the original hardcoded column layout.

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

### Table column order and title customization

The Order Detail table column order follows the **QB report field order** exactly. When a report is loaded, `buildColumnSpecs(qbReportFields, customTitles)` converts the QB `fields` array into column specs in the same sequence. Known QB labels map to typed renderers (badges, currency, etc.); any unknown extra QB fields become plain-text columns appended in report order.

Column titles default to the QB field label. Users can rename any column via the **Columns** button in the table header, which opens `ColumnEditor`. Changes are saved to `awntrak_column_titles` in `localStorage` and merged in on the next `buildColumnSpecs` call. Resetting all configs (Edit toolbar → Reset) also clears column title overrides.

Computed columns derived from QB fields (Risk, Warranty Status, Location) are inserted directly after their source QB field in the column order:

| QB field | Derived columns inserted after it |
|---|---|
| `Order Name (Formula)` | Customer, Location |
| `# of Warranty Claims` | Claims, Risk |
| `Installation Complete Date` | Expires, Warranty Status |

### LocalStorage keys

localStorage is used as an immediate read/write cache. Warranty and Installation keys are also synced to Vercel KV via `GET /api/settings` (on mount) and `POST /api/settings` (debounced, 800 ms after any change) so settings persist across devices. Quality Risk settings are synced to KV immediately on save.

**QB connection (per module):**

| Key | Purpose |
|---|---|
| `awntrak_warranty_table_id` | Warranty tab QB table ID |
| `awntrak_warranty_report_id` | Warranty tab QB report ID |
| `awntrak_installation_table_id` | Installation tab QB table ID |
| `awntrak_installation_report_id` | Installation tab QB report ID |
| `awntrak_quality_table_id` | Quality Risk tab QB table ID |
| `awntrak_quality_report_id` | Quality Risk tab QB report ID |

**Dashboard configuration (Warranty tab):**

| Key | Purpose |
|---|---|
| `awntrak_kpi_configs` | JSON array of KPI configuration objects |
| `awntrak_chart_configs` | JSON array of chart configuration objects |
| `awntrak_column_titles` | `{ [colId]: string }` map of custom column display titles |
| `awntrak_column_order` | `string[]` ordered array of column IDs |
| `awntrak_geocache` | `{ [locationKey]: [lat, lng] }` Nominatim geocoding cache |

All dashboard keys (excluding geocache) are managed through `lib/dashboardStorage.js`. The Vercel KV key is `awntrak_settings` and holds all of the above as a single merged JSON object. `POST /api/settings` merges incoming fields into the existing stored object rather than replacing it, so each dashboard can write only its own keys. Requires `KV_REST_API_URL` and `KV_REST_API_TOKEN` env vars; when absent the app runs on localStorage only.
