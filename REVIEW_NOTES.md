# Documentation + Code Review Notes

Date: 2026-05-04

## Scope reviewed

- `README.md`
- `ARCHITECTURE.md`
- `API_REFERENCE.md`
- Repository file/layout consistency via `rg --files`

## Findings

### 1) Path mismatch for Quality Risk data provider

Documentation references `lib/qualityRiskDataSource.js` in a few places, but the implementation exists at `src/lib/qualityRiskDataSource.js`.

**Impact:** New contributors may look in the wrong location for the Quality Risk data source switch point.

**Recommended action:** Standardize docs to the actual `src/lib/qualityRiskDataSource.js` path.

### 2) README project tree has stale top-level app path

README shows `WarrantyDashboard.jsx` at repo root as the main orchestrator, while the active file is `src/WarrantyDashboard.jsx`.

**Impact:** Slight confusion for onboarding and code navigation.

**Recommended action:** Update README tree to reflect `src/WarrantyDashboard.jsx`.

### 3) API reference aligns with current backend contract

`/api/warranty-orders` docs correctly describe server-side credential handling and pass-through response/error behavior.

**Impact:** None.

### 4) Architecture doc largely aligns with implemented module organization

Component contract sections and flow description are consistent with present folder structure and route layout.

**Impact:** None.

## Summary

Primary issues are documentation path drift (Quality Risk provider path and one dashboard orchestrator path). No critical API contract issues observed in the reviewed docs.
