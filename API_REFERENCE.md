# API Reference

## Warranty Orders endpoint

### Overview

The `/api/warranty-orders` endpoint is a server-side proxy that calls the Quickbase Report Run API and forwards the response to the browser. Quickbase credentials (`QB_REALM` and `QB_TOKEN`) are stored as Vercel environment variables and never exposed to the client.

The raw QB payload is returned unchanged. Client-side transformation happens in `lib/qbUtils.js → mapQBResponse()`, which:

1. Builds a `labelToId` index from `fields[]` with both exact and lowercase-normalised lookups
2. Resolves field values using lists of accepted label variants per category (see below)
3. Falls back to the QB record ID (`qbRid`) as the record key when no order-number field is found
4. Keeps all records regardless of whether a date field is present
5. Stores unmapped QB fields in `order._qbFields` for use in configurable KPIs/charts

---

### Endpoint

```
GET /api/warranty-orders
```

---

### Query parameters

| Parameter | Required | Description |
|---|---|---|
| `tableId` | Yes (or `QB_TABLE_ID` env var) | Quickbase table ID, e.g. `bkvhg2rwk`. Found in the QB app URL after `/db/`. |
| `reportId` | Yes (or `QB_REPORT_ID` env var) | Quickbase report ID. Found in the report URL as `rid=` or on the report settings page. |

Query params always take precedence over environment variable fallbacks. The settings modal writes them to `localStorage` and appends them to every API call automatically.

---

### Request example

```
GET /api/warranty-orders?tableId=bkvhg2rwk&reportId=1
```

No request body. GET only.

---

### Successful response — HTTP 200

Returns the raw Quickbase report payload unchanged:

```json
{
  "data": [
    {
      "3":  { "value": 1042 },
      "6":  { "value": "<a href=\"https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=1042\">80886</a>" },
      "7":  { "value": "MCDS-McDonald's-80886-San Antonio Texas-123 Main St" }
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

The `fields` array maps field IDs to labels. The `data` array contains one object per record keyed by field ID. This is the standard Quickbase Report Run API v1 response shape.

---

### Field label matching

`mapQBResponse()` accepts any of the following label variants per category. Matching is **case-insensitive** and comparison is done after trimming whitespace. The first non-empty value found in the variant list wins.

| Category | Accepted labels |
|---|---|
| Order / record number | `Order Number w/Series`, `Order Number`, `Order #`, `Order No`, `Order No.`, `Order ID` |
| Order name / formula | `Order Name (Formula)`, `Order Name Formula`, `Order Name` |
| Project manager | `Project Manager`, `PM`, `Manager`, `Install By`, `Installer` |
| Install date | `Installation Complete Date`, `Install Complete Date`, `Install Complete`, `Install Date`, `Installation Date` |
| Ship date | `Shipping Complete Date`, `Ship Complete Date`, `Shipping Date`, `Ship Date` |
| Warranty claims | `# of Warranty Claims`, `Warranty Claims`, `Claims` |
| QC peeling | `# of QC Entries for Peeling Powder`, `QC Peeling`, `Peeling Powder` |
| QC powder failure | `# of QC Entries for Powder Failure`, `QC Powder Failure`, `Powder Failure` |
| Order value | `Order Posted $`, `Order Value`, `Contract Amount`, `Total` |
| Products | `Product Scope`, `Products`, `Product` |
| Color | `NEW Final Color Approval`, `Final Color Approval`, `Color` |

Fields with labels not matching any of the above are captured in `order._qbFields[label]` and made available to the configurable KPI, chart, and column system without any code changes.

---

### Error responses

#### 400 — Missing table or report ID

```json
{
  "error": "Table ID and Report ID are required. Enter them in the dashboard settings modal, or set QB_TABLE_ID and QB_REPORT_ID in Vercel."
}
```

#### 400 — Invalid ID format

Returned when `tableId` or `reportId` contains characters outside `[A-Za-z0-9_-]` (prevents path traversal / SSRF):

```json
{
  "error": "Invalid Table ID or Report ID format."
}
```

#### 405 — Method not allowed

```json
{
  "error": "Method not allowed"
}
```

#### 502 — Quickbase error

Returned when Quickbase itself returns a non-2xx status:

```json
{
  "error": "Failed to fetch data from Quickbase. Check your Table ID and Report ID."
}
```

#### 503 — Missing credentials

```json
{
  "error": "Quickbase credentials not configured. Set QB_REALM and QB_TOKEN in your Vercel environment variables."
}
```

#### 500 — Unexpected error

```json
{
  "error": "<error message string>"
}
```

---

### Environment variables

| Variable | Required | Where to set |
|---|---|---|
| `QB_REALM` | Yes | Vercel project settings → Environment Variables |
| `QB_TOKEN` | Yes | Vercel project settings → Environment Variables |
| `QB_TABLE_ID` | Optional | Vercel project settings (overridden by query param) |
| `QB_REPORT_ID` | Optional | Vercel project settings (overridden by query param) |

Set all four for Production, Preview, and Development in Vercel. For local dev, add them to `.env.local`:

```
QB_REALM=awnexinc.quickbase.com
QB_TOKEN=your_user_token
```

---

### Settings sync endpoint

```
GET  /api/settings   — returns saved dashboard config from Vercel KV
POST /api/settings   — writes dashboard config to Vercel KV
```

Requires `KV_REST_API_URL` and `KV_REST_API_TOKEN` environment variables (added automatically when you attach a Vercel KV store). When absent, the app runs on localStorage only with no cross-device sync.

The payload shape mirrors the localStorage keys documented in `ARCHITECTURE.md`.

---

### Multi-source usage

The dashboard accepts an optional `sources` prop for connecting multiple QB tables in parallel:

```jsx
sources={[
  { id: "orders", route: "/api/warranty-orders", role: "orders" },
  { id: "claims", route: "/api/warranty-claims", role: "claims",
    fieldMap: { orderNum: "Order #", status: "Status", cost: "Repair Cost" } },
]}
```

Roles: `"orders"` (required), `"claims"`, `"costs"`. Additional routes must follow the same server-side proxy pattern:

- Accept `tableId` and `reportId` as query params
- Keep credentials server-side only
- Return the raw QB Report Run payload unchanged

---

### Quickbase API reference

This endpoint wraps the Quickbase REST API v1 report run operation:

```
POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
```

Headers sent to Quickbase:
- `QB-Realm-Hostname: {QB_REALM}`
- `Authorization: QB-USER-TOKEN {QB_TOKEN}`
- `Content-Type: application/json`
