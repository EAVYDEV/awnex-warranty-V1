# QMS Platform Transition (Option 2)

This document defines Phase 1 of evolving the current application from a warranty-first dashboard into a Quality Management System (QMS) platform while preserving existing routes and API behavior.

**Status: Phase 1 complete as of 2026-05-07.**

## Phase 1 goals

1. Keep existing modules operational.
2. Reframe information architecture around a QMS platform shell.
3. Normalize naming so modules can expand without breaking existing workflows.

## Module naming map

| Current | Phase 1 platform label | Purpose |
|---|---|---|
| Warranty | Warranty Operations | Claims/warranty performance and risk tracking |
| Installation | Field Execution (Installation sub-module) | Deployment and installation execution tracking |
| Quality Risk & RCA | Quality Intelligence | Case management, root-cause analysis, trends |
| Inspections | Inspections | QC inspection records, pass/fail tracking |
| NCRs | Quality Intelligence (NCRs) | Non-conforming product event management |
| CAPAs | Field Execution (CAPAs) | Corrective action lifecycle management |
| Production | Production Analytics | Batch yield rates and line-level defect counts |
| Dispatch | Dispatch Planning | Combined installation + service field-trip planning |

## Immediate implementation checklist

- [x] Update product naming in README and architecture docs to QMS-first language.
- [x] Add a shared platform shell — `QMSShell.jsx` and `QMSSidebar.jsx` provide the module-switching chrome.
- [x] Keep existing module routes and query params to avoid breaking bookmarks.
- [x] Add a cross-module landing card section in the main dashboard page → implemented as `QMSOverview.jsx`.
- [x] Standardize visual design language across all module pages (dark gradient hero banners, consistent KpiCard and container card styling).

## Non-breaking constraints

- Do not remove or rename current page routes in Phase 1. *(Honored.)*
- Do not change API endpoint contracts in Phase 1. *(Honored — API contracts unchanged; documentation corrected where it diverged from implementation.)*
- Prefer label and composition updates over data-model rewrites. *(Honored.)*

## Suggested Phase 1 acceptance criteria

1. ✅ The app presents itself as a QMS platform in primary documentation.
2. ✅ Existing module navigation still works without URL changes.
3. ✅ Existing API calls continue to function with no parameter changes.
4. ✅ Teams can identify where to extend CAPA/NCR/Audit modules next — all six module containers exist in `components/modules/`.

## Phase 2 candidates

- Platform-level filters shared across modules.
- Cross-module aggregate KPIs (e.g., total open NCRs + CAPAs in hero strip).
- Geospatial clustering and route optimization in Dispatch Planning.
- Live Quickbase data for Inspections, NCRs, CAPAs, and Production modules (currently using mock data).
- Admin-configurable field mapping UI for Dispatch report label aliases.
