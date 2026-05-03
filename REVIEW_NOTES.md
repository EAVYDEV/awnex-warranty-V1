# Build vs Live Review (2026-05-03)

## Scope reviewed
- Local production build (`npm run build`)
- Live deployment at `https://awnex-warranty-v1.vercel.app`
- Entry route behavior and module shell wiring

## Findings

1. **Local build is healthy**
   - Next.js production build completes successfully with static generation for `/` and `/quality-risk` plus API routes.

2. **Live root route content matches current code intent**
   - The live homepage renders the QMS shell experience (Quality Management overview + modules), not a warranty-only landing page.
   - This aligns with `pages/index.jsx` rendering `QMSShell` and page metadata `Quality Management System — Awnex`.

3. **Documentation drift identified**
   - `README.md` project-structure section still says `pages/index.jsx` is an entry page that mounts `WarrantyDashboard`.
   - Current code does not do that; it mounts `QMSShell`.

## Recommendation
- Update README structure text to reflect current home route behavior (`QMSShell`) to avoid onboarding confusion.
