# Awnex QMS — Architecture

Full system design, component contracts, config schemas, data flow, and extension guide.

---

## System overview

The Awnex QMS is a Next.js 14 (Pages Router) application. A single collapsible sidebar shell (`QMSShell`) hosts five independently-connected QMS modules. Each module has its own Quickbase table/report connection stored in `localStorage` (per-module keys) and synced to Vercel KV for cross-device persistence.

```
pages/index.jsx
  └── <QMSShell>
        ├── <QMSSidebar>   (collapsible dark nav — 240px expanded / 64px collapsed)
        └── <main>          (scrollable content pane)
              ├── QMSOverview      (activeModule === "overview")
              ├── WarrantyDashboard standalone={false}  (activeModule === "warranty")
              ├── InspectionsModule  (activeModule === "inspections")
              ├── NcrModule          (activeModule === "ncrs")
              ├── CapaModule         (activeModule === "capas")
              └── ProductionModule   (activeModule === "production")
```

---

## File map

| Need to change | File |
|---|---|
| Colors, shadows, status/risk configs | `lib/tokens.js` |
| QMS shell layout (sidebar + content) | `components/QMSShell.jsx` |
| Sidebar nav items, icons, collapse | `components/QMSSidebar.jsx` |
| QMS home overview dashboard | `components/modules/QMSOverview.jsx` |
| Inspections module | `components/modules/InspectionsModule.jsx` |
| NCR module | `components/modules/NcrModule.jsx` |
| CAPA module | `components/modules/CapaModule.jsx` |
| Production module | `components/modules/ProductionModule.jsx` |
| QB field parsing, risk scoring, column spec builder | `lib/qbUtils.js` |
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
| Warranty orchestrator (state, fetch, layout) | `src/WarrantyDashboard.jsx` |
| Quality case components (NCR / CAPA reuse) | `src/components/quality/` |
| Case/trend data provider (mock/live switch) | `src/lib/qualityRiskDataSource.js` |
| QB API proxies | `pages/api/{warranty-orders,inspections,ncrs,capas,production}.js` |

---

## Data flow

### QMS shell navigation

```
QMSShell
  activeModule (useState, default "overview")
  ├── QMSSidebar → onModuleChange(id) → setActiveModule(id)
  └── renders MODULE_COMPONENTS[activeModule]
```

### Per-module QB fetch (Warranty pattern — others follow same shape)

```
WarrantyDashboard  (standalone={false} when inside QMSShell)
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

### NCR / CAPA module data flow

```
NcrModule / CapaModule
  → getQualityRiskDashboardData()   (src/lib/qualityRiskDataSource.js)
      • returns { cases[], trends{} } — mock today, toggle USE_MOCK_QUALITY_RISK_DATA to go live
  → hydrateCase()
      • calculateRiskScore, calculateRiskLevel (src/lib/qualityRiskUtils.js)
  ← src/components/quality/CaseTable      (tabular case list)
  ← src/components/quality/CaseDetailPanel (slide-out detail / CAPA workflow)
  ← src/components/quality/CreateCaseModal (new NCR form)
```

---

## Module component contracts

### QMSShell

```jsx
<QMSShell />
// No props. Manages activeModule state internally.
// Each module component receives: onNavigate(moduleId: string)
```

### QMSSidebar

```jsx
<QMSSidebar
  activeModule={string}           // current active module ID
  onModuleChange={fn(id)}         // called when user clicks a nav item
  collapsed={boolean}             // 64px icon-only vs 240px full
  onToggleCollapse={fn}
/>
```

### Module components (all follow same interface)

```jsx
<InspectionsModule onNavigate={fn} />
<NcrModule         onNavigate={fn} />
<CapaModule        onNavigate={fn} />
<ProductionModule  onNavigate={fn} />
<QMSOverview       onNavigate={fn} />
```

### WarrantyDashboard (embedded)

```jsx
<WarrantyDashboard
  apiRoute="/api/warranty-orders"
  standalone={false}    // suppresses AppHeader and full-viewport min-height
/>
```

When `standalone={false}`, WarrantyDashboard renders an inline module header (title + subtitle bar with brand accent) instead of the `AppHeader` tab-bar component.

---

## QB API proxy contracts

All five proxy routes follow an identical pattern. New modules should copy the same structure.

```
GET /api/{module}?tableId={id}&reportId={id}

Request:  GET only, no body
Response: Raw Quickbase Report Run v1 payload — { fields[], data[], metadata }

Error responses:
  400  Missing or invalid tableId / reportId
  405  Non-GET method
  503  QB_REALM or QB_TOKEN not set
  502  Quickbase returned non-2xx
  500  Unexpected network error
```

Security: tableId and reportId are validated against `/^[A-Za-z0-9_-]+$/` before use in the QB URL to prevent SSRF/path traversal.

Optional env var fallbacks per module:

| Module | Table env var | Report env var |
|---|---|---|
| Warranty | `QB_TABLE_ID` | `QB_REPORT_ID` |
| Inspections | `QB_INSPECTIONS_TABLE_ID` | `QB_INSPECTIONS_REPORT_ID` |
| NCRs | `QB_NCRS_TABLE_ID` | `QB_NCRS_REPORT_ID` |
| CAPAs | `QB_CAPAS_TABLE_ID` | `QB_CAPAS_REPORT_ID` |
| Production | `QB_PRODUCTION_TABLE_ID` | `QB_PRODUCTION_REPORT_ID` |

---

## Design system tokens (`lib/tokens.js`)

### Enterprise color palette

| Token | Value | Usage |
|---|---|---|
| `brand` | `#1D4ED8` | Primary blue — nav active state, buttons, links |
| `brandDark` | `#1E40AF` | Button hover |
| `brandDeep` | `#1E3A8A` | Heavy headings |
| `accent` | `#0891B2` | Teal — Inspections module accent |
| `success` | `#14532D` | Text on success backgrounds |
| `successFill` | `#16A34A` | Badge dot, progress fill |
| `danger` | `#DC2626` | NCR accent, fail states |
| `text1` | `#0F172A` | Primary body text (slate-900) |
| `text2` | `#475569` | Secondary text (slate-600) |
| `text3` | `#94A3B8` | Muted / label text (slate-400) |
| `bg` | `#F1F5F9` | Page background (slate-100) |
| `card` | `#FFFFFF` | Card / panel background |
| `borderLight` | `#E2E8F0` | Default border (slate-200) |
| `sidebar` | `#0F172A` | Sidebar background (slate-900) |
| `sidebarActive` | `#1D4ED8` | Active nav item |
| `sidebarText` | `#CBD5E1` | Sidebar text (slate-300) |
| `sidebarMuted` | `#64748B` | Sidebar group labels (slate-500) |

Radius scale: cards `16px`, widgets `14px`, inputs `8px`, buttons `6px` — more enterprise-compact than the previous warm/rounded scale.

---

## Storage schema

### Per-module QB connection (`lib/dashboardStorage.js`)

```js
loadModuleSettings("warranty")     // → { tableId, reportId }
saveModuleSettings("inspections", { tableId, reportId })
// module keys: "warranty" | "installation" | "quality" | "inspections" | "ncrs" | "capas" | "production"
```

localStorage key pattern: `awntrak_{module}_table_id` / `awntrak_{module}_report_id`

### Vercel KV sync

All module connection settings plus KPI/chart configs are synced as a single JSON blob under key `awntrak_settings` via `GET /api/settings` (read on mount) and `POST /api/settings` (debounced 800ms after any change). When `KV_REST_API_URL` / `KV_REST_API_TOKEN` are absent, the app runs on localStorage only with no error.

---

## Configurable dashboard system (Warranty module)

### KPI config shape

```ts
{
  id:          string;
  title:       string;
  aggregation: "count" | "sum" | "avg" | "min" | "max";
  field:       string | null;        // enriched order field key; null = count records
  filter:      { field, op, value } | null;
  subtitle:    string;
  icon:        string;               // key in components/ui/Icon.jsx PATHS
  color:       string;               // hex
  bg:          string;               // hex
  format:      "number" | "currency" | "percent" | "text";
  decimals:    number;
  hidden:      boolean;
}
```

### Chart config shape

```ts
{
  id:             string;
  title:          string;
  type:           "bar" | "hbar" | "donut" | "line" | "stacked";
  groupField:     string;
  stackField:     string | null;
  metrics: Array<{ field, aggregation, label, color }>;
  filter:         { field, op, value } | null;
  sortDir:        "asc" | "desc";
  maxCategories:  number | null;
  showLegend:     boolean;
  showAxisLabels: boolean;
  palette:        string;
  hidden:         boolean;
}
```

---

## Enriched order object (Warranty module)

```ts
{
  // From mapQBResponse()
  orderNum, qbRid, qbUrl, brand, location, customer, pm,
  warrantyEnd, products, colors, claims, qcPeeling, qcPowder,
  orderValue, _qbFields   // extra QB columns keyed by label; may contain HTML

  // Enrichment in WarrantyDashboard
  days, status,           // "active" | "expiring" | "expired"
  openClaims, closedClaims, claimCost,
  riskScore,              // 0–100
  risk,                   // "critical" | "high" | "medium" | "low"
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

### Add a new QMS module

1. Create `components/modules/YourModule.jsx` — accept `{ onNavigate }` prop
2. Add a nav entry to `NAV_ITEMS` in `components/QMSSidebar.jsx`
3. Add a QB proxy at `pages/api/your-module.js` (copy any existing proxy — keep the security pattern)
4. Add a module key to `MODULE_QB_KEYS` in `lib/dashboardStorage.js`
5. Import and register the component in `components/QMSShell.jsx` `MODULE_COMPONENTS`

### Add a new QB-connected API route

Copy any file from `pages/api/` and update the endpoint call. Keep `QB_REALM` / `QB_TOKEN` server-side. Accept `tableId` and `reportId` as query params. Validate both with the `/^[A-Za-z0-9_-]+$/` regex before using in URLs.

### Add a new icon

Add an entry to the `PATHS` object in `components/ui/Icon.jsx`. The key becomes available everywhere icons are used.

### Add a new chart color palette

Add a key + hex array to `COLOR_PALETTES` in `lib/dashboardDefaults.js`. It appears in the chart editor automatically.

### Switch NCR / CAPA modules from mock to live QB data

1. Edit `src/lib/qualityRiskDataSource.js`
2. Set `USE_MOCK_QUALITY_RISK_DATA = false`
3. Implement `fetchLiveQualityRiskData()` to call your QB proxy and return `{ cases[], trends{} }`

### Persist configs to Quickbase instead of localStorage

Replace read/write calls in `lib/dashboardStorage.js` with QB API calls. The config JSON schema is portable — no changes needed to dashboard components.

---

## Future improvements

- Overview module: pull live aggregate KPIs from connected modules instead of placeholder dashes
- Inspections module: wire QB response through a mapper (analogous to `mapQBResponse`) to populate live records
- NCR / CAPA modules: map QB report fields to the `CaseRecord` shape in `qualityRiskDataSource.js`
- Production module: map QB batch fields and replace sample data
- Role-based edit-mode access (read-only for shop floor / leadership displays)
- Date range filter for time-series line charts
- Export / import dashboard config as JSON
