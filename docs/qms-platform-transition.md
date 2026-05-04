# QMS Platform Transition (Option 2)

This document defines Phase 1 of evolving the current application from a warranty-first dashboard into a Quality Management System (QMS) platform while preserving existing routes and API behavior.

## Phase 1 goals

1. Keep existing modules operational.
2. Reframe information architecture around a QMS platform shell.
3. Normalize naming so modules can expand without breaking existing workflows.

## Module naming map

| Current | Phase 1 platform label | Purpose |
|---|---|---|
| Warranty | Warranty Operations | Claims/warranty performance and risk tracking |
| Installation | Field Execution | Deployment and installation execution tracking |
| Quality Risk & RCA | Quality Intelligence | Case management, root-cause analysis, trends |

## Immediate implementation checklist

- [ ] Update product naming in README and architecture docs to QMS-first language.
- [ ] Add a shared platform shell title/subtitle in `src/components/AppHeader.jsx` props usage.
- [ ] Keep existing module routes and query params to avoid breaking bookmarks.
- [ ] Add a cross-module landing card section in the main dashboard page.

## Non-breaking constraints

- Do not remove or rename current page routes in Phase 1.
- Do not change API endpoint contracts in Phase 1.
- Prefer label and composition updates over data-model rewrites.

## Suggested Phase 1 acceptance criteria

1. The app presents itself as a QMS platform in primary documentation.
2. Existing module navigation still works without URL changes.
3. Existing API calls continue to function with no parameter changes.
4. Teams can identify where to extend CAPA/NCR/Audit modules next.
