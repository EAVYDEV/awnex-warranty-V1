# TODO — QMS Platform Transition

This TODO tracks the next implementation steps after the README rebrand and Phase 1 transition plan.

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
- [ ] Do not change API request/response contracts during Phase 1.
- [ ] Keep changes additive and backward compatible.
