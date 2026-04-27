# Awntrak Warranty Dashboard — Architecture

Full system design, component contracts, config schemas, and extension guide.

---

## Implementation status

### Completed

| File | Status | Description |
|---|---|---|
| `lib/tokens.js` | ✅ Done | Design tokens — all colors, shadows, STATUS_CFG, RISK_CFG, CHART_PALETTE |
| `lib/qbUtils.js` | ✅ Done | QB field parsing, mapQBResponse (with _qbFields capture), mapClaimsResponse, buildReportFields, risk scoring, date/format helpers |
| `lib/dashboardMetrics.js` | ✅ Done | BUILTIN_FIELDS, buildAvailableFields, applyFilter, aggregateField, computeKpiValue, formatKpiValue, computeChartData, genId, truncateLabel |
| `lib/dashboardDefaults.js` | ✅ Done | KPI_THEMES, COLOR_PALETTES, DEFAULT_KPI_CONFIGS (9 KPIs), DEFAULT_CHART_CONFIGS (4 charts), blankKpiConfig, blankChartConfig |
| `lib/dashboardStorage.js` | ✅ Done | localStorage helpers for connection settings, KPI configs, chart configs, resetAllConfigs |
| `components/ui/Icon.jsx` | ✅ Done | 35-icon SVG registry, Icon({ name, size, color, strokeWidth }), ICON_NAMES |
| `components/ui/Badge.jsx` | ✅ Done | StatusBadge, RiskBadge |
| `components/ui/Modal.jsx` | ✅ Done | Modal wrapper (scroll-lock, Escape key, backdrop click), Btn variants, formStyles |
| `components/ui/Tag.jsx` | ✅ Done | ProductTag |
| `components/ui/StateScreens.jsx` | ✅ Done | EmptyState, LoadingState (shimmer skeleton), ErrorState |
| `components/ui/SortIcon.jsx` | ✅ Done | Column sort direction indicator |
| `components/AwnexLogo.jsx` | ✅ Done | Awnex SVG branding mark |
| `components/SettingsModal.jsx` | ✅ Done | QB connection modal (URL auto-parse, table ID + report ID inputs) |
| `components/MapView.jsx` | ✅ Done | Leaflet CDN loader, geocoding with rate-limit, status-colored pins, popup detail |
| `components/dashboard/KpiCard.jsx` | ✅ Done | Display card, edit-mode overlay controls (edit/duplicate/hide) |
| `components/dashboard/KpiEditor.jsx` | ✅ Done | Full KPI editor: aggregation, field, filter, subtitle, icon picker, color themes, custom colors, format, decimals, live preview |
| `components/dashboard/ChartCard.jsx` | ✅ Done | Chart wrapper, edit-mode controls, CustomTooltip |
| `components/dashboard/ChartEditor.jsx` | ✅ Done | Full chart editor: type picker, group field, stack field, up to 3 metrics, filter, sort, palette, live preview (category count) |
| `components/dashboard/ConfigurableChart.jsx` | ✅ Done | Renders bar / hbar / donut / line / stacked from config; truncated tick labels, semantic colors for status/risk fields |
| `components/dashboard/DashboardEditToolbar.jsx` | ✅ Done | Add KPI, Add Chart, Reset to Defaults (with confirmation), Done Editing |

### In progress / remaining

| File | Status | Notes |
|---|---|---|
| `src/WarrantyDashboard.jsx` | ✅ Done | Lean orchestrator — data fetch, enrichment memos, filter/sort, table with QB formula HTML rendering, edit mode wiring |

---

## Data flow

```
pages/index.jsx
  └── <WarrantyDashboard apiRoute="/api/warranty-orders" />
        │
        ├── fetch()  →  pages/api/warranty-orders.js
        │                  └── QB Report Run API (server-side, credentials injected)
        │                        returns { fields[], data[], metadata }
        │
        ├── lib/qbUtils.js → mapQBResponse()
        │     • builds labelToId index from fields[]
        │     • extracts typed values by QB field label
        │     • extra columns stored in order._qbFields (raw, may include HTML)
        │     returns order[]
        │
        ├── useMemo (enriched)
        │     • daysFromToday, warrantyStatus
        │     • computeRiskScore, riskLevel
        │     • infer openClaims / closedClaims if no claims source
        │     returns enrichedOrder[]
        │
        ├── lib/dashboardMetrics.js → computeKpiValue(enriched, kpiConfig)
        │     → per-card: applyFilter → aggregateField → formatKpiValue
        │     renders via components/dashboard/KpiCard.jsx
        │
        └── lib/dashboardMetrics.js → computeChartData(enriched, chartConfig)
              → applyFilter → groupBy → aggregate per metric
              renders via components/dashboard/ConfigurableChart.jsx
```

---

## Component contracts

### `KpiCard`

```jsx
<KpiCard
  label={string}       // displayed above the value
  value={string}       // pre-formatted string (from formatKpiValue)
  sub={string}         // optional subtitle below value
  color={string}       // hex — value text color
  bg={string}          // hex — icon background
  iconName={string}    // key in Icon PATHS map
  editMode={boolean}
  hidden={boolean}
  onEdit={fn}
  onDuplicate={fn}
  onToggleHide={fn}
/>
```

### `KpiEditor`

```jsx
<KpiEditor
  config={kpiConfigObject}          // full draft config (copied before opening)
  enrichedOrders={enrichedOrder[]}  // for live preview
  availableFields={fieldDef[]}      // from buildAvailableFields()
  onSave={fn(updatedConfig)}
  onClose={fn}
  onDelete={fn}
  onDuplicate={fn}
/>
```

### `ChartCard`

```jsx
<ChartCard
  title={string}
  editMode={boolean}
  hidden={boolean}
  onEdit={fn}
  onDuplicate={fn}
  onToggleHide={fn}
>
  <ConfigurableChart config={chartConfig} records={enrichedOrders} />
</ChartCard>
```

### `ChartEditor`

```jsx
<ChartEditor
  config={chartConfigObject}
  enrichedOrders={enrichedOrder[]}
  availableFields={fieldDef[]}
  onSave={fn(updatedConfig)}
  onClose={fn}
  onDelete={fn}
  onDuplicate={fn}
/>
```

### `ConfigurableChart`

```jsx
<ConfigurableChart
  config={chartConfigObject}   // full chart config
  records={enrichedOrder[]}    // enriched orders array
/>
```

Renders one of: `BarChart`, `BarChart layout="vertical"`, `PieChart` (donut), `LineChart`, stacked `BarChart`. Handles empty state, label truncation, and semantic colors for `status` and `risk` group fields.

### `DashboardEditToolbar`

```jsx
<DashboardEditToolbar
  onAddKpi={fn}
  onAddChart={fn}
  onResetAll={fn}
  onExit={fn}
/>
```

---

## Config schemas

### KPI config

```ts
{
  id:          string;                                         // unique, e.g. "kpi-open-claims"
  title:       string;
  aggregation: "count" | "sum" | "avg" | "min" | "max";
  field:       string | null;                                  // enriched order field key; null = count records
  filter:      { field: string; op: FilterOp; value: any } | null;
  subtitle:    string;
  icon:        string;                                         // key in Icon.jsx PATHS
  color:       string;                                         // hex
  bg:          string;                                         // hex
  format:      "number" | "currency" | "percent" | "text";
  decimals:    number;                                         // 0–4
  hidden:      boolean;
}
```

**Filter operators (`FilterOp`):** `eq | neq | gt | gte | lt | lte | in | notin | contains | isempty | isnotempty`

For `in` / `notin`, `value` may be a comma-separated string or an array of strings.

### Chart config

```ts
{
  id:             string;
  title:          string;
  type:           "bar" | "hbar" | "donut" | "line" | "stacked";
  groupField:     string;                                       // category / X-axis field key
  stackField:     string | null;                                // "stacked" type only
  metrics: Array<{
    field:        string | null;                                // null = count records
    aggregation:  "count" | "sum" | "avg" | "min" | "max";
    label:        string;                                       // series display name
    color:        string | null;                                // hex or null (use palette)
  }>;
  filter:         { field: string; op: FilterOp; value: any } | null;
  sortDir:        "asc" | "desc";
  maxCategories:  number | null;                                // null = show all
  showLegend:     boolean;
  showAxisLabels: boolean;
  palette:        "default" | "warm" | "cool" | "earth" | "mono";
  hidden:         boolean;
}
```

### Available field definition

```ts
{
  key:    string;   // used as record property key (e.g. "claims", "orderValue", "qb_12")
  label:  string;   // displayed in dropdowns (e.g. "# Warranty Claims")
  type:   "text" | "text_array" | "number" | "currency" | "date";
  source: "builtin" | "qb";   // "qb" = from QB report fields not in core mapping
  qbId?:  number;             // QB field ID, present when source === "qb"
}
```

---

## Enriched order object

After `mapQBResponse()` + enrichment in `WarrantyDashboard.jsx`:

```ts
{
  // From mapQBResponse
  orderNum:    string;
  qbRid:       string;
  qbUrl:       string | null;
  brand:       string;
  location:    string;
  customer:    string;
  pm:          string;
  warrantyEnd: string;            // "YYYY-MM-DD"
  products:    string[];
  colors:      string;
  claims:      number;
  qcPeeling:   number;
  qcPowder:    number;
  orderValue:  number;
  _qbFields:   Record<string, any>;  // extra QB columns keyed by field label; values may be HTML strings from QB formula fields
                                     // special keys read by MapView: "Latitude", "Longitude" (numeric) — skips Nominatim when present

  // Added during enrichment
  days:        number;            // days until/since warrantyEnd (negative = expired)
  status:      "active" | "expiring" | "expired";
  openClaims:  number;
  closedClaims:number;
  claimCost:   number;
  riskScore:   number;            // 0–100
  risk:        "critical" | "high" | "medium" | "low";
}
```

---

## Risk scoring

Defined in `lib/qbUtils.js → computeRiskScore(order)`:

| Signal | Points |
|---|---|
| Claims × 25 | up to 50 |
| (qcPeeling + qcPowder) × 7 | up to 30 |
| Warranty status = expiring | +15 |
| QC flags with no claim filed (silent risk) | +12 |
| Order value ≥ $50,000 | +5 |

Thresholds: **≥60** = critical · **≥35** = high · **≥15** = medium · **<15** = low

---

## Extending the platform

### Add a new QB-connected API route

Copy `pages/api/warranty-orders.js` and update the QB endpoint call. Keep `QB_REALM` / `QB_TOKEN` server-side. Accept `tableId` and `reportId` as query params.

### Add a new icon

Add an entry to the `PATHS` object in `components/ui/Icon.jsx`. The key becomes available immediately everywhere icons are used.

### Add a new color palette

Add a key + hex array to `COLOR_PALETTES` in `lib/dashboardDefaults.js`. It will appear in the chart editor palette picker automatically.

### Persist configs to Quickbase instead of localStorage

Replace the read/write calls in `lib/dashboardStorage.js` with QB API calls. The config JSON schema is portable — no changes needed to the dashboard components.

### Add a second dashboard module (e.g. QC Module)

All `lib/` utilities and `components/` are framework-agnostic and importable from any Next.js page. Create a new page, import the shared components, define new default configs, and you have a second configurable dashboard with no code duplication.

---

## Future improvements

- Drag-and-drop reordering of KPI cards and charts in edit mode
- Per-row KPI grouping (currently all KPIs render in a single auto-fit grid)
- Trend line overlay on bar charts
- Date range filter for time-series line charts
- Export dashboard config to JSON / import from JSON
- Save configs to Quickbase or SharePoint instead of localStorage
- Role-based edit-mode access (read-only view for shop floor / leadership displays)
