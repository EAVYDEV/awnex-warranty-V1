# Documentation + Code Review Notes

Date: 2026-05-05

## Scope reviewed

- `README.md`
- `ARCHITECTURE.md`
- `API_REFERENCE.md`
- `pages/api/warranty-orders.js`
- `pages/api/settings.js`
- Repository layout consistency via `rg --files`
- Build validation via `npm run build`

## Findings

### 1) API error contract mismatch in `API_REFERENCE.md`

`API_REFERENCE.md` says Quickbase non-2xx responses are passed through with the original Quickbase status and payload detail. Current implementation instead normalizes Quickbase failures to HTTP `502` with a generic message:

- Docs claim passthrough (`Quickbase error passthrough` section)
- Code returns: `res.status(502).json({ error: "Failed to fetch data from Quickbase..." })`

**Impact:** API consumers and frontend debugging workflows may expect status fidelity/detail that is not actually available.

**Recommendation:** Either (A) update docs to describe the current normalized `502` behavior, or (B) update the handler to passthrough status + detail as documented.

---

### 2) Quality Risk provider path drift in docs

`README.md` and `ARCHITECTURE.md` include references to `lib/qualityRiskDataSource.js`, while the implemented file is `src/lib/qualityRiskDataSource.js`.

**Impact:** Slower onboarding/navigation for contributors looking for the live/mock switch point.

**Recommendation:** Standardize all references to `src/lib/qualityRiskDataSource.js`.

---

### 3) README project tree has stale orchestrator path

README project tree still includes a root-level `WarrantyDashboard.jsx` entry as the main orchestrator. Active implementation exists at `src/WarrantyDashboard.jsx`.

**Impact:** Minor navigation confusion for new contributors.

**Recommendation:** Update README tree and related narrative to only reference `src/WarrantyDashboard.jsx` as canonical.

---

### 4) `API_REFERENCE.md` includes an environment setup implication that is incomplete

`API_REFERENCE.md` local development example only shows `QB_REALM` and `QB_TOKEN`; runtime still requires `tableId` and `reportId` supplied either via query params/localStorage or optional env fallbacks.

**Impact:** New developers may expect API calls to succeed immediately with just two env vars.

**Recommendation:** Add a short note that local usage also needs either:
- dashboard settings modal values (`tableId`, `reportId`) persisted in localStorage, or
- `QB_TABLE_ID` + `QB_REPORT_ID` env vars.

---

### 5) Build/runtime posture check

`npm run build` completed successfully on current codebase, including static generation and route compilation.

**Impact:** No immediate compile-time regressions detected.

**Recommendation:** Keep this as a baseline CI gate if not already enforced.

## Summary

The biggest documentation-contract issue is the `/api/warranty-orders` error behavior mismatch: docs promise Quickbase status/detail passthrough, but code intentionally normalizes to `502` + generic message. Remaining issues are path/documentation drift and a small local setup clarity gap. No build-breaking issues were found.
