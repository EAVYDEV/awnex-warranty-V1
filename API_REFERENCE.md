# API Reference - Warranty Orders

## Overview

The `/api/warranty-orders` endpoint is a server-side proxy that calls the Quickbase Report Run API and forwards the response to the browser. Quickbase credentials (`QB_REALM` and `QB_TOKEN`) are stored as Vercel environment variables and never exposed to the client.

The raw QB payload is returned unchanged. Client-side transformation happens in `lib/qbUtils.js → mapQBResponse()`, which builds a `labelToId` index from the `fields[]` array and extracts typed values by field label. Extra report columns not in the core field mapping are captured in `order._qbFields` and made available to the configurable KPI and chart system.

---

## Endpoint

```
GET /api/warranty-orders
```

---

## Query parameters

| Parameter | Required | Description |
|---|---|---|
| `tableId` | Yes (if `QB_TABLE_ID` env var is not set) | Quickbase table ID, e.g. `bkvhg2rwk`. Found in the QB app URL after `/db/`. |
| `reportId` | Yes (if `QB_REPORT_ID` env var is not set) | Quickbase report ID. Found in the report URL as `rid=` or on the report settings page. |

If `QB_TABLE_ID` and `QB_REPORT_ID` are set as environment variables, those are used as fallbacks when the query params are absent. Parameters passed in the query string always take precedence.

The settings modal in the dashboard writes `tableId` and `reportId` to `localStorage` and appends them to every API call automatically.

---

## Request example

```
GET /api/warranty-orders?tableId=bkvhg2rwk&reportId=1
```

No request body is required. The endpoint only accepts `GET` requests.

---

## Successful response

Returns the raw Quickbase report payload as JSON, forwarded unchanged. The client-side `mapQBResponse()` in `lib/qbUtils.js` transforms this into the internal order shape. Extra report columns beyond the core field mapping are stored in `order._qbFields` and exposed to the configurable KPI and chart system.

**HTTP 200**

```json
{
  "data": [
    {
      "3":  { "value": 1042 },
      "6":  { "value": "<a href=\"https://awnexinc.quickbase.com/db/bkvhg2rwk?a=dr&rid=1042\">80886</a>" },
      "7":  { "value": "MCDS-McDonald's-80886-San Antonio Texas-123 Main St" },
      ...
    }
  ],
  "fields": [
    { "id": 3,  "label": "Record ID#",            "type": "recordid" },
    { "id": 6,  "label": "Order Number w/Series", "type": "text" },
    { "id": 7,  "label": "Order Name (Formula)",  "type": "formula" },
    ...
  ],
  "metadata": {
    "numFields": 10,
    "numRecords": 47,
    "skip": 0,
    "totalRecords": 47
  }
}
```

The `fields` array maps field IDs to labels. The `data` array contains one object per record, keyed by field ID. This structure is standard for Quickbase Report Run API v1 responses.

---

## Error responses

### 400 - Missing table or report ID

Returned when neither the query params nor environment variable fallbacks supply a table ID or report ID.

```json
{
  "error": "Table ID and Report ID are required. Enter them in the dashboard settings modal, or set QB_TABLE_ID and QB_REPORT_ID in Vercel."
}
```

### 405 - Method not allowed

Returned for any non-GET request.

```json
{
  "error": "Method not allowed"
}
```

### 503 - Missing credentials

Returned when `QB_REALM` or `QB_TOKEN` are not set in the Vercel environment.

```json
{
  "error": "Quickbase credentials not configured. Set QB_REALM and QB_TOKEN in your Vercel environment variables."
}
```

### Quickbase error passthrough

If Quickbase itself returns a non-2xx status, the endpoint passes the status and QB error body back to the client:

```json
{
  "error": "Quickbase returned 401: Unauthorized",
  "detail": { ... }
}
```

### 500 - Network or unexpected error

```json
{
  "error": "<error message string>"
}
```

---

## Environment variables

| Variable | Required | Where to set |
|---|---|---|
| `QB_REALM` | Yes | Vercel project settings - Environment Variables |
| `QB_TOKEN` | Yes | Vercel project settings - Environment Variables |
| `QB_TABLE_ID` | Optional | Vercel project settings - Environment Variables |
| `QB_REPORT_ID` | Optional | Vercel project settings - Environment Variables |

All four should be set for Production, Preview, and Development environments in Vercel.

For local development, create a `.env.local` file in the project root:

```
QB_REALM=awnexinc.quickbase.com
QB_TOKEN=your_user_token
```

---

## App Router alternative

The file includes a commented-out App Router equivalent (`app/api/warranty-orders/route.js`) for if the project is migrated from Pages Router to App Router in a future Next.js upgrade. The logic is identical; only the handler signature changes.

---

## Multi-source usage

The dashboard supports optional `sources` prop for connecting multiple QB tables (e.g., a separate claims table or costs table). Each source calls its own API route. Additional routes should follow the same server-side proxy pattern as `warranty-orders.js`:

- Accept `tableId` and `reportId` as query params
- Keep credentials server-side only
- Return the raw QB Report Run payload

See `ARCHITECTURE.md` for the full multi-source configuration reference and component contracts.

---

## Quickbase API reference

This endpoint wraps the Quickbase REST API v1 Report Run operation:

```
POST https://api.quickbase.com/v1/reports/{reportId}/run?tableId={tableId}
```

Headers sent to Quickbase:
- `QB-Realm-Hostname: {QB_REALM}`
- `Authorization: QB-USER-TOKEN {QB_TOKEN}`
- `Content-Type: application/json`
