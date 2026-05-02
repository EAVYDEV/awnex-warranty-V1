# Deploying Awnex QMS to GitHub + Vercel

---

## Step 1 — Create the GitHub repository

1. Go to https://github.com/new
2. Repository name: `awnex-warranty-V1` (or your preferred name)
3. Set visibility to **Private**
4. Do NOT check any "Initialize" options
5. Click **Create repository**

---

## Step 2 — Push the code

```bash
cd path/to/awnex-warranty-V1

git init
git add .
git commit -m "Initial commit - Awnex QMS"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/awnex-warranty-V1.git
git push -u origin main
```

If prompted for credentials, use your GitHub username and a Personal Access Token (scope: **repo**). Create one at https://github.com/settings/tokens.

---

## Step 3 — Connect to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click **Add New Project**
3. Find your repository and click **Import**
4. Vercel auto-detects Next.js — leave all build settings as-is
5. Click **Deploy** (first deploy will fail until env vars are set — that is expected)

---

## Step 4 — Create a Vercel KV store (optional — cross-device settings sync)

KV sync lets QMS layout and connection settings persist across devices. Without it, the app falls back silently to localStorage.

1. In your Vercel project, go to the **Storage** tab
2. Click **Create Database** → select **KV**
3. Name it (e.g. `awnex-qms-settings`) and click **Create**
4. Click **Connect to Project** and select your project

Vercel automatically adds `KV_REST_API_URL` and `KV_REST_API_TOKEN` to your project environment variables.

For local development, copy those two values from the KV store's **`.env.local`** tab into your local `.env.local` file.

---

## Step 5 — Add Quickbase environment variables

In your Vercel project go to **Settings → Environment Variables** and add:

### Required (all modules)

| Name | Value |
|---|---|
| `QB_REALM` | `awnexinc.quickbase.com` |
| `QB_TOKEN` | your Quickbase user token |

### Optional — per-module defaults

If you set these, the module uses them when no table/report ID has been saved in the browser yet. The settings modal always overrides them.

| Name | Module |
|---|---|
| `QB_TABLE_ID` / `QB_REPORT_ID` | Warranty |
| `QB_INSPECTIONS_TABLE_ID` / `QB_INSPECTIONS_REPORT_ID` | Inspections |
| `QB_NCRS_TABLE_ID` / `QB_NCRS_REPORT_ID` | Non-Conformances |
| `QB_CAPAS_TABLE_ID` / `QB_CAPAS_REPORT_ID` | Corrective Actions |
| `QB_PRODUCTION_TABLE_ID` / `QB_PRODUCTION_REPORT_ID` | Production |

Set all variables for **Production**, **Preview**, and **Development** environments, then click **Save**.

---

## Step 6 — Redeploy

1. Go to the **Deployments** tab
2. Click the three-dot menu on the most recent deployment
3. Click **Redeploy**
4. Your live QMS URL appears at the top when the build completes

---

## Step 7 — Configure module connections in the app

1. Open your live Vercel URL — the QMS Overview page loads immediately
2. Click a module in the sidebar (e.g. **Warranty**)
3. Click **Configure QB** in the module header
4. Enter the Table ID and Report ID for that module
5. Click **Save and Connect** — data loads immediately

Repeat for each module you want to wire up. Settings are saved in `localStorage` and synced to KV automatically.

---

## Ongoing deployments

Any push to `main` triggers an automatic Vercel redeploy:

```bash
git add .
git commit -m "describe your change"
git push
```

---

## Build troubleshooting

### JSX parse errors

If Vercel fails with `Unexpected token` or `Unexpected eof` in JSX files:

1. Check for unresolved Git conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`)
2. Resolve and keep only one valid JSX tree
3. Verify locally before pushing:

```bash
npm run build
```

### Missing credentials error on first load

Verify `QB_REALM` and `QB_TOKEN` are set for all three environments (Production, Preview, Development) in Vercel → Settings → Environment Variables. After adding variables, redeploy.

### KV sync not working locally

Copy `KV_REST_API_URL` and `KV_REST_API_TOKEN` from the Vercel KV store's `.env.local` tab and add them to your local `.env.local`. Without them the app uses localStorage only — this is not an error, just a feature that requires the KV credentials to activate.
