# TODO — QMS Platform Transition

This TODO tracks next implementation steps after the code-vs-documentation review on 2026-05-05.

## Immediate follow-up (from review findings)

- [ ] Resolve `/api/warranty-orders` error contract mismatch:
  - Option A: update `API_REFERENCE.md` to document the current normalized `502` behavior.
  - Option B: update `pages/api/warranty-orders.js` to passthrough Quickbase status + detail as currently documented.
  - Decide one approach and keep docs + implementation aligned.
- [ ] Update all docs to consistently reference `src/lib/qualityRiskDataSource.js` (not `lib/qualityRiskDataSource.js`).
- [ ] Update any stale project-tree references to the orchestrator path (`src/WarrantyDashboard.jsx`).
- [ ] Clarify local API setup in `API_REFERENCE.md`:
  - `QB_REALM` + `QB_TOKEN` are not sufficient by themselves.
  - Also require `tableId`/`reportId` (via settings/localStorage) or `QB_TABLE_ID` + `QB_REPORT_ID` env vars.
- [ ] Add a docs consistency check step to release checklist/CI (at minimum: path accuracy + API contract consistency).

## Phase 1 (non-breaking)

- [ ] Update `ARCHITECTURE.md` terminology to match README module labels:
  - Warranty Operations
  - Field Execution
  - Quality Intelligence
- [ ] Audit all docs for old `Warranty Dashboard` phrasing and standardize to `QMS Platform` where appropriate.
- [ ] Confirm all documentation paths reference `src/WarrantyDashboard.jsx` and `src/lib/qualityRiskDataSource.js`.
- [ ] Add a small “Platform Overview” section to `pages/index.jsx` / shell UI (no route changes).
- [ ] Validate existing module links and query params continue working (`?module=installation`, quality-risk route).

## Phase 2 (incremental product UX)

- [ ] Add cross-module KPI strip on the landing view.
- [ ] Add platform-level filters shared across modules where safe.
- [ ] Define CAPA/NCR/Audit extension placeholders in navigation model.

## Guardrails

- [ ] Do not rename or remove current routes during Phase 1.
- [ ] Do not change API request/response contracts during Phase 1 unless docs are updated in the same PR.
- [ ] Keep changes additive and backward compatible.
