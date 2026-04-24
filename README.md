# Awntrak Warranty Management Dashboard

A Next.js application that pulls live warranty order data from Quickbase and presents it as an interactive dashboard. Part of the Awntrak Platform suite built for Awnex, Inc.

---

## What it does

- Displays all active, expiring, and expired warranty orders from a Quickbase report
- Calculates a composite risk score for each order based on warranty claims, QC defect entries, expiration urgency, and order value
- Shows KPI summary cards, bar/pie charts by brand, PM, and product line, and a Leaflet map of installation locations
- Lets users filter by PM, warranty status, brand, risk level, or free-text search
- Supports multi-source connections (separate claims and costs tables) that merge by order number
- Stores connection settings (Table ID, Report ID) in the browser - no credentials ever leave the server

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (Pages Router) |
| UI | React 18, inline styles using Awnex design tokens |
| Charts | Recharts 2 |
| Map | Leaflet 1.9 (loaded from CDN at runtime) |
| Geocoding | Nominatim (OpenStreetMap) - rate-limited, with local coordinate cache |
| Data source | Quickbase REST API v1 - report run endpoint |
| Hosting | Vercel |
| Credentials | Server-side only via Vercel environment variables |

---

## Project structure

```
awnex-warranty-V1/
  WarrantyDashboard.jsx       Main component - all UI, data fetching, and logic
  next.config.js              Next.js config (strict mode on)
  package.json                Dependencies
  pages/
    _app.jsx                  App wrapper
    index.jsx                 Entry page - mounts WarrantyDashboard
    api/
      warranty-orders.js      Server-side proxy to Quickbase API
  DEPLOY.md                   Step-by-step deployment guide
  API_REFERENCE.md            API endpoint documentation
  TECHNICAL_SPEC.md           Full system architecture and component reference
```

---

## Local development

### Prerequisites

- Node.js 18 or later
- A Quickbase user token with access to the Orders table
- The Quickbase table ID and a saved report ID

### Setup

1. Clone or copy the `awnex-warranty-V1` folder to your machine.

2. Install dependencies:

```bash
cd awnex-warranty-V1
npm install
```

3. Create a `.env.local` file in the project root:

```
QB_REALM=awnexinc.quickbase.com
QB_TOKEN=your_quickbase_user_token
```

4. Start the dev server:

```bash
npm run dev
```

5. Open `http://localhost:3000` in your browser. You will see the "Connect to Quickbase" screen. Click **Configure Connection** and enter:
   - **Table ID**: `bkvhg2rwk` (or your target table)
   - **Report ID**: the numeric ID of the saved QB report

The dashboard loads data immediately after saving. Settings persist in `localStorage`.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `QB_REALM` | Yes | Quickbase realm hostname, e.g. `awnexinc.quickbase.com` |
| `QB_TOKEN` | Yes | Quickbase user token |
| `QB_TABLE_ID` | Optional | Default table ID if not set via the settings modal |
| `QB_REPORT_ID` | Optional | Default report ID if not set via the settings modal |

`QB_REALM` and `QB_TOKEN` are server-side only and never sent to the browser.

---

## Quickbase report requirements

The report must include these fields from the Orders table. Field labels must match exactly.

| QB Field Label | Used for |
|---|---|
| Order Number w/Series | Order number and direct QB record link |
| Order Name (Formula) | Brand, location, and customer name extraction |
| Project Manager | PM name (display name format) |
| Product Scope | Semicolon-separated product list |
| NEW Final Color Approval | Color specification |
| # of Warranty Claims | Claim count |
| # of QC Entries for Peeling Powder | QC defect signal |
| # of QC Entries for Powder Failure | QC defect signal |
| Order Posted $ | Order value for KPI totals and risk weighting |
| Installation Complete Date | Warranty end date calculation (preferred) |
| Shipping Complete Date | Warranty end date fallback |

Records are filtered to those with a valid order number and a calculable warranty end date. Warranty end = install or ship date + 1 year.

---

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full step-by-step guide to push to GitHub and deploy on Vercel.

---

## Related docs

- [DEPLOY.md](DEPLOY.md) - GitHub and Vercel deployment
- [API_REFERENCE.md](API_REFERENCE.md) - `/api/warranty-orders` endpoint reference
- [TECHNICAL_SPEC.md](TECHNICAL_SPEC.md) - Architecture, components, risk scoring, and extension guide
