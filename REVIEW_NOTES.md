# Documentation + Code Review Notes

Date: 2026-05-05
Resolution update: 2026-05-07

## Scope reviewed

- `README.md`
- `ARCHITECTURE.md`
- `API_REFERENCE.md`
- `pages/api/warranty-orders.js`
- `pages/api/settings.js`
- Repository layout consistency via `rg --files`
- Build validation via `npm run build`

## Findings

### 1) API error contract mismatch in `API_REFERENCE.md` — RESOLVED

`API_REFERENCE.md` said Quickbase non-2xx responses were passed through with the original Quickbase status and payload detail. The actual implementation normalizes Quickbase failures to HTTP `502` with a generic message:

- Docs claimed passthrough (`Quickbase error passthrough` section)
- Code returns: `res.status(502).json({ error: "Failed to fetch data from Quickbase..." })`

**Resolution (2026-05-07):** `API_REFERENCE.md` updated to accurately document the normalized `502` behavior. The "Quickbase error passthrough" framing was removed; the `502` section now correctly states that the original Quickbase status and body are not passed through.

---

### 2) Quality Risk provider path drift in docs — RESOLVED

`README.md` and `ARCHITECTURE.md` referenced `lib/qualityRiskDataSource.js`, while the implemented file is `src/lib/qualityRiskDataSource.js`.

**Resolution (2026-05-07):** Both `README.md` and `ARCHITECTURE.md` corrected to `src/lib/qualityRiskDataSource.js`. `CLAUDE.md` file map table also references the correct path.

---

### 3) README project tree has stale orchestrator path — RESOLVED

README project tree included a root-level `WarrantyDashboard.jsx` entry as the main orchestrator. Active implementation is at `src/WarrantyDashboard.jsx`; the root file is a 1-line re-export shim.

**Resolution (2026-05-07):** `README.md` project tree completely rewritten. Root `WarrantyDashboard.jsx` is correctly described as a re-export shim; `src/WarrantyDashboard.jsx` is listed as the canonical orchestrator.

---

### 4) `API_REFERENCE.md` includes an environment setup implication that is incomplete — RESOLVED

`API_REFERENCE.md` local development example only showed `QB_REALM` and `QB_TOKEN`; runtime still requires `tableId` and `reportId` supplied either via query params/localStorage or optional env fallbacks.

**Resolution (2026-05-07):** A note was added to the Environment Variables section of `API_REFERENCE.md` clarifying that `QB_REALM` and `QB_TOKEN` alone are not sufficient. The note explains that `tableId`/`reportId` must also be provided via the settings modal (localStorage) or `QB_TABLE_ID`/`QB_REPORT_ID` env vars.

---

### 5) Build/runtime posture check — NO ACTION REQUIRED

`npm run build` completed successfully on current codebase, including static generation and route compilation.

**Status:** No regressions found. Build continues to pass after all design system and documentation changes made on 2026-05-07.

## Summary

All four documentation-contract findings have been resolved. The platform has been further updated with:
- Full visual design system standardization across all six module pages (Overview, Inspections, Quality Intelligence, Field Execution, Production Analytics, Dispatch Planning).
- Comprehensive documentation updates to `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `API_REFERENCE.md`, `TODO.md`, `docs/qms-platform-transition.md`, and `docs/dispatch-module.md`.
