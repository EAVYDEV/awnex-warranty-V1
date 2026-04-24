# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install       # install dependencies
npm run dev       # start dev server at http://localhost:3000
npm run build     # production build
npm run start     # serve production build
npm run screenshot [url] [output.png]  # capture a Playwright screenshot (devDependency)
```

No test runner is configured. There is no lint script; Next.js type checking runs implicitly during `build`.

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

## Architecture

### Data flow

```
Browser (WarrantyDashboard.jsx)
  → GET /api/warranty-orders?tableId=…&reportId=…
      → pages/api/warranty-orders.js  (server-side proxy)
          → POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
              (QB_REALM + QB_TOKEN auth headers injected here)
  ← raw QB Report Run payload (fields[] + data[])
  ← mapQBResponse() transforms field-ID-keyed records into typed order objects
  ← enriched with status, risk score, chart data via useMemo
```

### Single-file component architecture

Almost all logic lives in `WarrantyDashboard.jsx` at the project root. This is intentional — the app is a single dashboard with no routing needs. The file is organized top-to-bottom:

1. **Design tokens** — `const T = { ... }` at the top; all colors/shadows reference this object.
2. **QB field parsing** — `mapQBResponse()` builds a `labelToId` index from the fields array returned by QB, then extracts typed values by field label (not field ID). If QB field labels change, update the string literals inside `mapQBResponse()`.
3. **Claims/costs merging** — `mapClaimsResponse()` handles an optional secondary QB table (claims or costs) and returns a lookup keyed by order number, merged into the main orders array.
4. **Risk scoring** — `computeRiskScore()` produces a 0–100 composite score: claims × 25 (cap 50 pts), QC defect entries × 7 (cap 30 pts), expiring status +15, silent risk (QC flags with no claim) +12, high-value order ($50k+) +5. Thresholds: ≥60 = critical, ≥35 = high, ≥15 = medium.
5. **Sub-components** — `KpiCard`, `StatusBadge`, `RiskBadge`, `SettingsModal`, `MapView`, `ChartCard` are small presentational components defined before the main export.
6. **`WarrantyDashboard` export** — the single exported component manages all state (fetch, filters, sort, UI).

### Quickbase field mapping

`mapQBResponse()` matches field labels exactly. Required QB report fields (see `README.md` for the full list):

| Label | Purpose |
|---|---|
| `Order Number w/Series` | Returns an HTML anchor; URL and numeric order number are extracted via regex |
| `Order Name (Formula)` | `BRAND-CustomerName-ID-City State-Address` format; brand/location parsed from dash-split |
| `Project Manager` | Display-name format; `extractPMName()` strips the `<userid>` suffix |
| `# of Warranty Claims` | Primary risk signal |
| `# of QC Entries for Peeling Powder` / `# of QC Entries for Powder Failure` | Leading-indicator risk signals |

### Map view

Leaflet is loaded from CDN at runtime (not bundled). `CITY_COORDS` in `WarrantyDashboard.jsx` is a hardcoded cache of known city coordinates. Unknown locations fall back to Nominatim (OpenStreetMap geocoding API) with a 300 ms delay between requests to respect rate limits. Geocoded results are cached in a `useRef` for the session.

### Multi-source connections

`WarrantyDashboard` accepts an optional `sources` prop:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims",  role: "claims", fieldMap: { orderNum: "Order #", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Sources are fetched in parallel and merged by order number. Additional API routes should follow the same server-side proxy pattern as `pages/api/warranty-orders.js`.

### LocalStorage keys

`awntrak_warranty_table_id` and `awntrak_warranty_report_id` — set by the Settings modal, read on mount.
