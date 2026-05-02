# API Reference — Awnex QMS Proxy Routes

All API routes are server-side Quickbase proxies. Credentials (`QB_REALM`, `QB_TOKEN`) live in Vercel environment variables and are never sent to the browser.

---

## Common pattern

Every module proxy follows the same structure:

```
GET /api/{module}?tableId={tableId}&reportId={reportId}
```

- `tableId` — Quickbase table ID (e.g. `bkvhg2rwk`). Found in QB app URL after `/db/` or `/table/`.
- `reportId` — Quickbase report ID. Found in the report URL as `rid=`, `qid=`, or `/report/{id}`.

Both params can be omitted if the corresponding environment variable fallback is set (see table below). The query param always takes precedence over the env var.

The settings modal in each module writes `tableId` and `reportId` to `localStorage` and appends them to every API call automatically.

---

## Endpoints

### `GET /api/warranty-orders`

Warranty module data source. Returns a Quickbase Report Run v1 payload.

**Env var fallbacks:** `QB_TABLE_ID`, `QB_REPORT_ID`

### `GET /api/inspections`

Inspections module data source.

**Env var fallbacks:** `QB_INSPECTIONS_TABLE_ID`, `QB_INSPECTIONS_REPORT_ID`

### `GET /api/ncrs`

Non-Conformances module data source.

**Env var fallbacks:** `QB_NCRS_TABLE_ID`, `QB_NCRS_REPORT_ID`

### `GET /api/capas`

Corrective Actions (CAPA) module data source.

**Env var fallbacks:** `QB_CAPAS_TABLE_ID`, `QB_CAPAS_REPORT_ID`

### `GET /api/production`

Production & Batch Tracking module data source.

**Env var fallbacks:** `QB_PRODUCTION_TABLE_ID`, `QB_PRODUCTION_REPORT_ID`

### `GET /api/settings`

Reads persisted dashboard settings from Vercel KV. Returns a JSON object with all stored keys (`warrantyTableId`, `warrantyReportId`, `inspectionsTableId`, etc. plus KPI/chart configs).

Returns `{}` when KV is not configured — the app silently falls back to localStorage.

### `POST /api/settings`

Writes dashboard settings to Vercel KV. Accepts a partial JSON body; keys are merged into the stored object.

---

## Successful response (all module proxies)

Raw Quickbase Report Run v1 payload forwarded unchanged. Client-side mappers transform this into typed records.

**HTTP 200**

```json
{
  "data": [
    {
      "3":  { "value": 1042 },
      "6":  { "value": "<a href=\"...\">80886</a>" },
      "7":  { "value": "BRAND-Customer-ID-City State-Address" }
    }
  ],
  "fields": [
    { "id": 3,  "label": "Record ID#",            "type": "recordid" },
    { "id": 6,  "label": "Order Number w/Series", "type": "text" },
    { "id": 7,  "label": "Order Name (Formula)",  "type": "formula" }
  ],
  "metadata": {
    "numFields": 10,
    "numRecords": 47,
    "skip": 0,
    "totalRecords": 47
  }
}
```

The `fields` array maps field IDs to labels. The `data` array contains one record per object, keyed by field ID. This is the standard Quickbase Report Run API v1 shape.

---

## Error responses

All module proxies return the same error shapes:

### 400 — Missing or invalid IDs

```json
{ "error": "Table ID and Report ID are required. Configure them in the <Module> module settings." }
```

Also returned when `tableId` or `reportId` contain characters outside `[A-Za-z0-9_-]` (SSRF prevention).

```json
{ "error": "Invalid Table ID or Report ID format." }
```

### 405 — Method not allowed

```json
{ "error": "Method not allowed" }
```

### 503 — Missing credentials

```json
{ "error": "Quickbase credentials not configured. Set QB_REALM and QB_TOKEN in your environment." }
```

### 502 — Quickbase error

Returned when Quickbase itself responds with a non-2xx status.

```json
{ "error": "Failed to fetch <module> data from Quickbase." }
```

### 500 — Unexpected error

```json
{ "error": "An unexpected error occurred." }
```

---

## Security

- `QB_REALM` and `QB_TOKEN` are server-side only — validated in the handler before use and never returned to the client.
- `tableId` and `reportId` are validated with `/^[A-Za-z0-9_-]+$/` before being interpolated into the Quickbase URL, preventing path traversal and SSRF via crafted IDs.
- All routes reject non-GET methods.

---

## Environment variables

| Variable | Required | Module |
|---|---|---|
| `QB_REALM` | Yes (all) | Quickbase realm hostname |
| `QB_TOKEN` | Yes (all) | Quickbase user token |
| `QB_TABLE_ID` | Optional | Warranty — default table |
| `QB_REPORT_ID` | Optional | Warranty — default report |
| `QB_INSPECTIONS_TABLE_ID` | Optional | Inspections — default table |
| `QB_INSPECTIONS_REPORT_ID` | Optional | Inspections — default report |
| `QB_NCRS_TABLE_ID` | Optional | NCRs — default table |
| `QB_NCRS_REPORT_ID` | Optional | NCRs — default report |
| `QB_CAPAS_TABLE_ID` | Optional | CAPAs — default table |
| `QB_CAPAS_REPORT_ID` | Optional | CAPAs — default report |
| `QB_PRODUCTION_TABLE_ID` | Optional | Production — default table |
| `QB_PRODUCTION_REPORT_ID` | Optional | Production — default report |
| `KV_REST_API_URL` | Optional | Vercel KV URL for `/api/settings` |
| `KV_REST_API_TOKEN` | Optional | Vercel KV token for `/api/settings` |

For local development, set the required vars in `.env.local`:

```
QB_REALM=awnexinc.quickbase.com
QB_TOKEN=your_user_token
```

---

## Quickbase API reference

Each module proxy wraps this Quickbase REST API v1 operation:

```
POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
```

Headers sent to Quickbase:

```
QB-Realm-Hostname: {QB_REALM}
Authorization: QB-USER-TOKEN {QB_TOKEN}
Content-Type: application/json
```

Body: `{}`

---

## Adding a new module proxy

Copy any existing proxy file (e.g. `pages/api/inspections.js`) and:

1. Update the env var names (`QB_YOURMODULE_TABLE_ID`, `QB_YOURMODULE_REPORT_ID`)
2. Update the error message strings to name your module
3. The Quickbase call itself is identical — no other changes needed

Register the new route in `lib/dashboardStorage.js` (add a key to `MODULE_QB_KEYS`) and in `components/QMSShell.jsx` (add an entry to `MODULE_COMPONENTS`).
