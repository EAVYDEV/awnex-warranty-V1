# TODO — QMS Platform Transition

This TODO tracks next implementation steps after the code-vs-documentation review on 2026-05-05.
Last updated: 2026-05-07.

## Immediate follow-up (from review findings) — RESOLVED

- [x] Resolve `/api/warranty-orders` error contract mismatch → **Done (Option A):** `API_REFERENCE.md` updated to document the current normalized `502` behavior. Implementation unchanged.
- [x] Update all docs to consistently reference `src/lib/qualityRiskDataSource.js` → **Done:** `README.md` and `ARCHITECTURE.md` both corrected.
- [x] Update stale project-tree references to the orchestrator path (`src/WarrantyDashboard.jsx`) → **Done:** `README.md` project tree rewritten; root shim noted as a 1-line re-export.
- [x] Clarify local API setup in `API_REFERENCE.md` → **Done:** Note added that `QB_REALM`/`QB_TOKEN` alone are not sufficient; `tableId`/`reportId` also required.
- [ ] Add a docs consistency check step to release checklist/CI (path accuracy + API contract consistency). *(Still open — low priority process item.)*

## Phase 1 (non-breaking) — RESOLVED

- [x] Update `ARCHITECTURE.md` terminology to match README module labels (Warranty Operations, Field Execution, Quality Intelligence) → **Done.**
- [x] Audit all docs for old `Warranty Dashboard` phrasing and standardize to `QMS Platform` → **Done:** `ARCHITECTURE.md` title updated; README updated.
- [x] Confirm all documentation paths reference `src/WarrantyDashboard.jsx` and `src/lib/qualityRiskDataSource.js` → **Done.**
- [x] Add a cross-module landing card section in the main dashboard (QMS Overview) → **Done:** `QMSOverview.jsx` serves as the landing page with module cards + cross-module KPI strip.
- [x] Validate existing module links and query params continue working (`?module=installation`, quality-risk route) → **Done:** No routing changes were made; all existing links continue to work.

## Phase 2 (incremental product UX)

- [x] Add cross-module KPI strip on the landing view → **Done:** Implemented in `QMSOverview.jsx`.
- [ ] Add platform-level filters shared across modules where safe.
- [ ] Define CAPA/NCR/Audit extension placeholders in navigation model.

## Visual design standardization — RESOLVED (2026-05-07)

- [x] Standardize all module page hero banners to dark gradient (`linear-gradient(115deg, var(--t-brand-deep) 0%, var(--t-brand) 60%, var(--t-brand-light) 100%)`).
- [x] Standardize all module KpiCards: `borderRadius: 6`, `padding: 14px 16px`, colored value text (module accent), no border accent stripe.
- [x] Standardize all container cards: `borderRadius: 8`, `border: 1px solid borderLight`, `boxShadow: shadows.card`.
- [x] Document module accent color assignments in `CLAUDE.md`.
- [x] Update `CLAUDE.md`, `README.md`, `ARCHITECTURE.md`, `API_REFERENCE.md` to reflect current platform state.

## Guardrails

- [x] Do not rename or remove current routes during Phase 1. *(Honored — no route changes.)*
- [x] Do not change API request/response contracts during Phase 1 unless docs are updated in the same PR. *(Honored — API unchanged; docs corrected.)*
- [x] Keep changes additive and backward compatible. *(Honored.)*
