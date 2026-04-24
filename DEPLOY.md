# Deploying awntrak-warranty to GitHub + Vercel

## Step 1 - Create the GitHub repository

1. Go to https://github.com/new
2. Repository name: `awntrak-warranty`
3. Set visibility to **Private**
4. Do NOT check any of the "Initialize" options (no README, no .gitignore, no license)
5. Click **Create repository**
6. Copy the repository URL shown on the next page - it will look like:
   `https://github.com/nicklaborde/awntrak-warranty.git`

---

## Step 2 - Push the code from Terminal

Open Terminal and run these commands one at a time.
Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

```bash
# Navigate to the project folder
cd "/Users/nicklaborde/Documents/Claude/Projects/Awntrak Platform - Cowork"

# Initialize git
git init

# Stage all files (.gitignore will automatically exclude node_modules, .env, etc.)
git add .

# Make the first commit
git commit -m "Initial commit - Awntrak Warranty Dashboard"

# Set the branch name to main
git branch -M main

# Connect to your GitHub repo (replace YOUR_GITHUB_USERNAME)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/awntrak-warranty.git

# Push to GitHub
git push -u origin main
```

If prompted for credentials, use your GitHub username and a Personal Access Token
(not your password). Create one at: https://github.com/settings/tokens
Select scope: **repo** (full control of private repositories).

---

## Step 3 - Connect to Vercel

1. Go to https://vercel.com and sign in (use "Continue with GitHub")
2. Click **Add New Project**
3. Find `awntrak-warranty` in the list and click **Import**
4. Vercel will auto-detect Next.js - leave all build settings as-is
5. Click **Deploy** (the first deploy will fail - that is expected because env vars are not set yet)

---

## Step 4 - Add environment variables in Vercel

1. In your Vercel project, go to **Settings > Environment Variables**
2. Add these two variables:

| Name | Value |
|------|-------|
| `QB_REALM` | `awnexinc.quickbase.com` |
| `QB_TOKEN` | your Quickbase user token |

3. Set both to apply to **Production**, **Preview**, and **Development**
4. Click **Save**

---

## Step 5 - Redeploy

1. Go to the **Deployments** tab in Vercel
2. Click the three-dot menu on the most recent deployment
3. Click **Redeploy**
4. Wait for it to finish - your live URL will appear at the top of the page

---

## Step 6 - Configure the connection in the dashboard

1. Open your live Vercel URL
2. You will see the "Connect to Quickbase" screen
3. Click **Configure Connection**
4. Enter:
   - **Table ID**: `bkvhg2rwk`
   - **Report ID**: the ID of the saved report you want to load
5. Click **Save and Connect** - data will load immediately

The Table ID and Report ID are saved in your browser. You can change them anytime
using the gear icon in the top-right corner of the dashboard.

---

## Future updates

Any time you make changes to the code, push them with:

```bash
cd "/Users/nicklaborde/Documents/Claude/Projects/Awntrak Platform - Cowork"
git add .
git commit -m "describe your change here"
git push
```

Vercel automatically redeploys on every push to `main`.
