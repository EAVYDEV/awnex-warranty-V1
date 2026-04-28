# Awntrak Platform — Architecture

Full system design, component contracts, config schemas, and extension guide.

---

## Modules overview

The platform serves two independent pages from the same Next.js app:

| Route | Module | Orchestrator |
|---|---|---|
| `/` | Warranty Management | `src/WarrantyDashboard.jsx` |
| `/quality-risk` | Quality Risk & RCA | `src/pages/QualityRiskDashboard.jsx` |

Both share the `lib/` utilities, `components/ui/`, and design tokens. The Quality Risk module is self-contained (data lives in React state for now); the Warranty module fetches live data from Quickbase.

---

## Warranty module — data flow

```
pages/index.jsx
  └── <WarrantyDashboard apiRoute="/api/warranty-orders" />
        │
        ├── fetch()  →  pages/api/warranty-orders.js
        │                  └── QB Report Run API (server-side, credentials injected)
        │                        returns { fields[], data[], metadata }
        │
        ├── lib/qbUtils.js → mapQBResponse()
        │     • builds labelToId index (case-insensitive, common label variations)
        │     • extracts typed values; falls back to qbRid when no order-number label found
        │     • warrantyEnd is optional — records without install/ship dates are kept
        │     • extra columns stored in order._qbFields (raw, may include HTML)
        │     returns order[]
        │
        ├── useMemo (enriched)
        │     • daysFromToday (null-safe), warrantyStatus (null → "active")
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

## Quality Risk module — data flow

```
pages/quality-risk.jsx
  └── <QualityRiskDashboard />
        │
        ├── useState(cases)              Seeded with starter cases; no backend yet
        │
        ├── hydrateCase()
        │     • calculateRiskScore (severity + scope + detection + fieldImpact)
        │     • calculateRiskLevel
        │     • isContainmentRequired, isFieldImpactReviewRequired
        │
        ├── useMemo(filteredCases)       Filtered by active tab (Active, High Risk, etc.)
        │
        ├── <CaseTable> / <CaseCard>     Case list views
        │
        └── <CaseDetailPanel>           Full case editor, 8-tab navigation
              │
              ├── Status advancement gating — canAdvanceStatus()
              │     checks required fields per phase before allowing Next
              │
              └── Closure gating — canCloseCase()
                    all phases must be complete + evidence + approval
```

---

## QB field label matching

`mapQBResponse()` in `lib/qbUtils.js` resolves field values using a two-pass lookup:

1. **Exact label match** — `labelToId[label]`
2. **Lowercased label match** — `lowerLabelToId[label.toLowerCase()]`

Fields are resolved using a priority list of accepted variants per category. The first non-empty value found in the list wins. Matched labels are tracked in `consumedLabels` so they are not double-exposed in `_qbFields`.

| Category | Accepted label variants |
|---|---|
| Order number | `Order Number w/Series`, `Order Number`, `Order #`, `Order No`, `Order ID` |
| Order name | `Order Name (Formula)`, `Order Name Formula`, `Order Name` |
| Project manager / installer | `Project Manager`, `PM`, `Manager`, `Install By`, `Installer` |
| Install date | `Installation Complete Date`, `Install Complete Date`, `Install Complete`, `Install Date`, `Installation Date` |
| Ship date | `Shipping Complete Date`, `Ship Complete Date`, `Shipping Date`, `Ship Date` |
| Claims | `# of Warranty Claims`, `Warranty Claims`, `Claims` |
| QC peeling | `# of QC Entries for Peeling Powder`, `QC Peeling`, `Peeling Powder` |
| QC powder failure | `# of QC Entries for Powder Failure`, `QC Powder Failure`, `Powder Failure` |
| Order value | `Order Posted $`, `Order Value`, `Contract Amount`, `Total` |
| Products | `Product Scope`, `Products`, `Product` |

If no order-number field is found, the QB record ID (`qbRid`) is used as the order key. Records are filtered only when neither `qbRid` nor `orderNum` is present (effectively never). Records without a `warrantyEnd` date are kept and shown with status `"active"`.

`buildColumnSpecs()` uses the same lookup table so typed column rendering (Customer, Location, Expires, Warranty Status) activates whenever any recognised label variant is present in the report.

---

## Enriched order object

After `mapQBResponse()` + enrichment in `src/WarrantyDashboard.jsx`:

```ts
{
  // From mapQBResponse
  orderNum:    string;               // extracted from order-number field; falls back to qbRid
  qbRid:       string;               // QB record ID (always set)
  qbUrl:       string | null;        // extracted href from HTML order-number field, if present
  brand:       string;               // parsed from order name prefix
  location:    string;               // parsed from order name dash segment 4
  customer:    string;               // parsed from order name segment 1
  pm:          string;               // project manager / installer name
  warrantyEnd: string | null;        // "YYYY-MM-DD"; null when no install/ship date present
  products:    string[];             // semicolon-split product list
  colors:      string;               // color approval field, HTML stripped
  claims:      number;
  qcPeeling:   number;
  qcPowder:    number;
  orderValue:  number;
  _qbFields:   Record<string, any>;  // every unmapped QB field, keyed by label
                                     // values may be HTML strings from QB formula fields
                                     // "Latitude" / "Longitude" (numeric) used by MapView

  // Added during enrichment
  days:        number | null;        // days until/since warrantyEnd; null when warrantyEnd is null
  status:      "active" | "expiring" | "expired";  // "active" when warrantyEnd is null
  openClaims:  number;
  closedClaims:number;
  claimCost:   number;
  riskScore:   number;               // 0–100
  risk:        "critical" | "high" | "medium" | "low";
}
```

---

## Quality case object

Managed in `QualityRiskDashboard` state. Hydrated fields added by `hydrateCase()`:

```ts
{
  // User-entered fields
  id:                               string;      // e.g. "QRC-001"
  title:                            string;
  description:                      string;
  severity:                         "Low" | "Medium" | "High" | "Critical";
  scope:                            "Single Item" | "Batch" | "Multiple Orders" | "Unknown";
  detectionRisk:                    "Known Extent" | "Partially Known" | "Unknown Extent";
  status:                           "Open" | "Containment" | "RCA" | "CAPA" | "Effectiveness Check" | "Closed";
  department:                       string;
  reportedBy:                       string;
  dateReported:                     string;      // "YYYY-MM-DD"
  owner:                            string;
  fieldImpact:                      boolean;
  customerImpact:                   boolean;
  safetyImpact:                     boolean;
  containmentSummary:               string;
  capaActions:                      CapaAction[];
  affectedOrders:                   AffectedOrder[];
  evidenceItems:                    EvidenceItem[];
  rca:                              RcaRecord;
  containment:                      ContainmentRecord;
  closure:                          ClosureRecord;
  fieldImpactReviewStatus:          "Not Started" | "In Progress" | "Complete";
  fieldImpactLeadershipAcceptedUncertainty: boolean;

  // Added by hydrateCase()
  riskScore:                        number;      // severity + scope + detection + fieldImpact bonus
  riskLevel:                        "Low" | "Medium" | "High" | "Critical";
  containmentRequired:              boolean;
  fieldImpactReviewRequired:        boolean;
}
```

---

## Quality Risk scoring (`src/lib/qualityRiskUtils.js`)

```
riskScore = severity + scope + detection + fieldImpact
```

| Signal | Values | Points |
|---|---|---|
| Severity | Low / Medium / High / Critical | 1 / 2 / 3 / 4 |
| Scope | Single Item / Batch / Multiple Orders / Unknown | 1 / 2 / 3 / 4 |
| Detection risk | Known Extent / Partially Known / Unknown Extent | 1 / 2 / 3 |
| Field impact | false / true | 0 / 3 |

Thresholds: **≥11** = Critical · **≥8** = High · **≥5** = Medium · **<5** = Low

---

## Quality case status flow and gating

Status flow: `Open → Containment → RCA → CAPA → Effectiveness Check → Closed`

`canAdvanceStatus(caseRecord)` — required fields per phase:

| Phase | Required to advance |
|---|---|
| Open | `title` and `description` |
| Containment | `containmentSummary` (if containment is required) |
| RCA | `problemStatement`, at least one `suspectedRootCause`, `rootCauseVerificationStatus` selected |
| CAPA | All verification-required actions have status `Complete` or `Verified` |
| Effectiveness Check | `closure.effectivenessResult` |

`canCloseCase(caseRecord)` requires all of the above plus: at least one evidence item, `closure.closureSummary`, `closure.approvedBy`, and `closure.approvalDate`.

---

## Warranty risk scoring (`lib/qbUtils.js → computeRiskScore`)

| Signal | Points |
|---|---|
| Claims × 25 | up to 50 |
| (qcPeeling + qcPowder) × 7 | up to 30 |
| Warranty status = expiring | +15 |
| QC flags with no claim filed (silent risk) | +12 |
| Order value ≥ $50,000 | +5 |

Thresholds: **≥60** = critical · **≥35** = high · **≥15** = medium · **<15** = low

---

## Component contracts

### Warranty module

#### `KpiCard`

```jsx
<KpiCard
  label={string}        // displayed above the value
  value={string}        // pre-formatted string (from formatKpiValue)
  sub={string}          // optional subtitle
  color={string}        // hex — value text color
  bg={string}           // hex — icon background
  iconName={string}     // key in Icon PATHS map
  editMode={boolean}
  hidden={boolean}
  onEdit={fn}
  onDuplicate={fn}
  onToggleHide={fn}
/>
```

#### `KpiEditor`

```jsx
<KpiEditor
  config={kpiConfigObject}
  enrichedOrders={enrichedOrder[]}
  availableFields={fieldDef[]}
  onSave={fn(updatedConfig)}
  onClose={fn}
  onDelete={fn}
  onDuplicate={fn}
/>
```

#### `ChartCard`

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

#### `ConfigurableChart`

```jsx
<ConfigurableChart
  config={chartConfigObject}
  records={enrichedOrder[]}
/>
```

Renders one of: `BarChart`, `BarChart layout="vertical"`, `PieChart` (donut), `LineChart`, stacked `BarChart`. Handles empty state, label truncation, and semantic colors for `status` and `risk` group fields.

### Quality Risk module

#### `CaseDetailPanel`

```jsx
<CaseDetailPanel
  caseRecord={hydratedCase}
  onClose={fn}
  onSave={fn(updatedCase)}
/>
```

Renders the 8-tab case editor. Maintains internal `draft` state; `onSave` is called with the full updated case when the user saves.

#### `CaseStatusStepper`

```jsx
<CaseStatusStepper
  status={string}        // current status in STATUS_FLOW
  canAdvance={boolean}
  onAdvance={fn}
/>
```

#### `CreateCaseModal`

```jsx
<CreateCaseModal
  onSave={fn(newCase)}
  onClose={fn}
/>
```

---

## Config schemas

### KPI config

```ts
{
  id:          string;
  title:       string;
  aggregation: "count" | "sum" | "avg" | "min" | "max";
  field:       string | null;    // enriched order field key; null = count records
  filter:      { field: string; op: FilterOp; value: any } | null;
  subtitle:    string;
  icon:        string;           // key in Icon.jsx PATHS
  color:       string;           // hex
  bg:          string;           // hex
  format:      "number" | "currency" | "percent" | "text";
  decimals:    number;
  hidden:      boolean;
}
```

**Filter operators:** `eq | neq | gt | gte | lt | lte | in | notin | contains | isempty | isnotempty`

For `in` / `notin`, `value` may be a comma-separated string or an array.

### Chart config

```ts
{
  id:             string;
  title:          string;
  type:           "bar" | "hbar" | "donut" | "line" | "stacked";
  groupField:     string;
  stackField:     string | null;
  metrics: Array<{
    field:        string | null;
    aggregation:  "count" | "sum" | "avg" | "min" | "max";
    label:        string;
    color:        string | null;
  }>;
  filter:         { field: string; op: FilterOp; value: any } | null;
  sortDir:        "asc" | "desc";
  maxCategories:  number | null;
  showLegend:     boolean;
  showAxisLabels: boolean;
  palette:        "default" | "warm" | "cool" | "earth" | "mono";
  hidden:         boolean;
}
```

### Available field definition

```ts
{
  key:    string;   // record property key (e.g. "claims", "orderValue", "qb_12")
  label:  string;   // displayed in dropdowns
  type:   "text" | "text_array" | "number" | "currency" | "date";
  source: "builtin" | "qb";
  qbId?:  number;
}
```

---

## localStorage keys

| Key | Purpose |
|---|---|
| `awntrak_warranty_table_id` | QB table ID |
| `awntrak_warranty_report_id` | QB report ID |
| `awntrak_kpi_configs` | JSON array of KPI configs |
| `awntrak_chart_configs` | JSON array of chart configs |
| `awntrak_column_titles` | `{ [colId]: string }` title overrides |
| `awntrak_column_order` | `string[]` column ID order |
| `awntrak_geocache` | `{ [locationKey]: [lat, lng] }` geocoding cache |
| `awntrak_dashboard_title` | Editable dashboard title |
| `awntrak_dashboard_subtitle` | Editable dashboard subtitle |

All keys except `awntrak_geocache` are synced to Vercel KV under the key `awntrak_settings` when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are configured. Reads happen on mount; writes are debounced 800 ms after any change.

---

## Extending the platform

### Add a new QB-connected API route

Copy `pages/api/warranty-orders.js` and update the QB endpoint call. Keep `QB_REALM` / `QB_TOKEN` server-side. Accept `tableId` and `reportId` as query params. Pass the raw QB payload to the client unchanged.

### Add a new recognised field label variant

Add the variant string to the appropriate label list in `lib/qbUtils.js` (`ORDER_NUM_LABELS`, `PM_LABELS`, `INSTALL_DATE_LABELS`, etc.). The same list drives both `mapQBResponse` and `buildColumnSpecs`.

### Add a new icon

Add an entry to the `PATHS` object in `components/ui/Icon.jsx`. The key is immediately available everywhere icons are used.

### Add a new color palette

Add a key + hex array to `COLOR_PALETTES` in `lib/dashboardDefaults.js`. It appears in the chart editor palette picker automatically.

### Add a second data source to the warranty dashboard

Pass the `sources` prop to `WarrantyDashboard`:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims", role: "claims",
    fieldMap: { orderNum: "Order #", status: "Status", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Sources are fetched in parallel and merged by order number.

### Persist Quality Risk cases to a backend

Replace the `useState(starterCases)` in `QualityRiskDashboard.jsx` with a `useEffect` fetch. The case data shape is fully defined in this document; no component changes needed.

---

## Future improvements

- Quality Risk case persistence to Quickbase or external API
- Date range filter for warranty time-series charts
- Trend line overlay on bar charts
- Export / import dashboard config as JSON
- Role-based edit-mode access (read-only for shop floor / leadership displays)
- Per-row KPI grouping (currently single auto-fit grid)
