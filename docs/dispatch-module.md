# Dispatch Planning Module — Technical Documentation

## Overview
The Dispatch Planning module combines two Quickbase reports into a unified planning view.
It follows the platform-wide visual design system: dark gradient hero banner, standardized KpiCards (`borderRadius: 6`, colored value text, no accent border stripe), and container cards at `borderRadius: 8`.

1. **Installations report** (current/upcoming installs)
2. **Services report** (repair/service/inspection sites)

The module is designed to help dispatchers maximize field trips by identifying where crews are already assigned or heading.

---

## Architecture

### Frontend
- **Component:** `components/modules/DispatchModule.jsx`
- **Responsibilities:**
  - Load and persist separate Quickbase connection settings for installation and service datasets.
  - Fetch both report payloads via the backend proxy (`/api/dispatch`).
  - Normalize record shapes from different Quickbase schemas into one dispatch row model.
  - Merge and sort all stops by due date.
  - Render load states (`unconfigured`, `loading`, `error`, `loaded`), summary KPI cards, and combined table.

### Backend
- **API route:** `pages/api/dispatch.js`
- **Responsibilities:**
  - Validate request method (`GET`).
  - Validate required query params (`tableId`, `reportId`) and ID format.
  - Use `QB_REALM` and `QB_TOKEN` server env vars to execute a Quickbase report run.
  - Return raw Quickbase payload to the client.

---

## Module Registration
Dispatch is registered in the QMS shell and sidebar:

- `components/QMSShell.jsx`
  - `DispatchModule` import
  - `dispatch` entry in `MODULE_COMPONENTS`
- `components/QMSSidebar.jsx`
  - `dispatch` entry in `NAV_ITEMS`

---

## Data Flow
1. User opens **Dispatch Planning** module.
2. Module reads settings from `dashboardStorage` keys:
   - `dispatch-installations`
   - `dispatch-services`
3. If both settings are configured, module requests:
   - `/api/dispatch?kind=installations&tableId=...&reportId=...`
   - `/api/dispatch?kind=services&tableId=...&reportId=...`
4. API route calls Quickbase `reports/{reportId}/run` for each request.
5. Module normalizes both payloads and merges them into one stop list.
6. UI sorts by due date and renders KPIs + combined table.

---

## Normalized Dispatch Row Model
Each row in the combined table follows this shape:

- `id: string`
- `type: string` (title-cased)
- `site: string`
- `region: string` (`City, State` when available)
- `dueDate: string | null`
- `tech: string` (`Unassigned` fallback)
- `status: string`

Field extraction is schema-flexible and checks multiple candidate labels (e.g., `Site Name`, `Customer`, `Location`, `Order Name (Formula)`).

---

## Settings & Persistence
The module uses existing storage helpers:
- `loadModuleSettings("dispatch-installations")`
- `saveModuleSettings("dispatch-installations", settings)`
- `loadModuleSettings("dispatch-services")`
- `saveModuleSettings("dispatch-services", settings)`

Settings are edited through existing `SettingsModal` instances.

---

## Environment Variables
Required on the server:

- `QB_REALM`
- `QB_TOKEN`

Optional module defaults are not currently used in this route; `tableId` and `reportId` are expected from query parameters (module settings).

---

## Error Handling
### Frontend
- `unconfigured`: one or both reports are not configured.
- `loading`: fetch in progress.
- `error`: API request or payload issues surfaced to user.
- `loaded`: merged view available.

### Backend
- `405`: non-GET request.
- `400`: missing or invalid IDs.
- `503`: missing Quickbase credentials.
- `502`: Quickbase request failed.
- `500`: unexpected exception.

---

## Build/CI Guard
To reduce deployment risk from unresolved merges, a repo script checks for conflict markers:

- `scripts/check-merge-conflicts.sh`
- Script is wired into `npm run build` through `package.json` (`check:conflicts` runs before `next build`).

---

## Operational Checklist
Before using Dispatch Planning in production:
1. Confirm `QB_REALM` and `QB_TOKEN` are set in deployment environment.
2. Configure both report connections in module settings.
3. Verify Quickbase report field labels map to expected aliases.
4. Run `npm run build` to ensure conflict check and build pass.

---

## Future Enhancements
- Add geospatial clustering and route optimization scoring.
- Add report freshness timestamp and last sync indicator.
- Add field mapping UI (admin-configurable label aliases).
- Add unit/integration tests for `mapDispatchData` and API route validation.
