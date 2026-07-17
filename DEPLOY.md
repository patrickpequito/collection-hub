# Deploying Collection HUB (Vercel)

This guide walks through publishing the app with [Vercel](https://vercel.com) (free tier works for an MVP).

## Before you deploy

1. **Commit your catalog data** (already in the repo):
   - `data/armor-sets.json`
   - `data/exotics.json`
2. **Never commit** `.env.local` (secrets stay out of Git).
3. **Bungie allows one Redirect URL per application.** Use **two Bungie apps**:
   - **Production** → Vercel URL (env vars in Vercel)
   - **Development** → `https://127.0.0.1:3000` (credentials in `.env.local` only)

See [Local OAuth (dev app)](#local-oauth-dev-app) below.

---

## Local OAuth (dev app)

If login works on Vercel but not on your Mac, your Bungie app probably points at production only.

### 1 — Create a second Bungie application

1. Go to [bungie.net/en/Application](https://www.bungie.net/en/Application)
2. **Create New App** (e.g. name: `Collection HUB Dev`)
3. Set:
   - **OAuth Client Type:** Confidential
   - **Redirect URL:** `https://127.0.0.1:3000/api/auth/callback`
   - **Origin header:** `https://127.0.0.1:3000`
4. Save and copy **API Key**, **Client ID**, and **Client Secret** for this **dev** app.

### 2 — Update `.env.local` (local only)

Open `.env.local` on your Mac. Use the **dev** app credentials:

```bash
BUNGIE_API_KEY=dev_api_key
BUNGIE_CLIENT_ID=dev_client_id
BUNGIE_CLIENT_SECRET=dev_client_secret
BUNGIE_REDIRECT_URI=https://127.0.0.1:3000/api/auth/callback
SESSION_SECRET=any_local_secret
```

Do **not** change Vercel env vars — those stay on the **production** app.

### 3 — Restart and test locally

```bash
cd ~/Projects/d2-collector
npm run dev
```

Open **https://127.0.0.1:3000** (not localhost), sign in, then check `/exotics` and `/sets`.

### Summary

| | Production (Vercel) | Development (your Mac) |
|--|---------------------|-------------------------|
| Bungie app | App 1 (live site) | App 2 (dev) |
| Redirect URL | `https://yoursite.vercel.app/api/auth/callback` | `https://127.0.0.1:3000/api/auth/callback` |
| Secrets stored in | Vercel dashboard | `.env.local` only |

---

## Step 1 — Push code to GitHub

If the project is not on GitHub yet:

```bash
cd ~/Projects/d2-collector
git add .
git commit -m "MVP: Collection HUB with exotics and armor sets"
```

Create a new repository on [github.com/new](https://github.com/new) (e.g. `collection-hub`), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/collection-hub.git
git branch -M main
git push -u origin main
```

---

## Step 2 — Import into Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub login is easiest).
2. Click **Add New… → Project**.
3. Import your GitHub repository.
4. Vercel detects Next.js automatically. Leave defaults:
   - **Build Command:** `npm run build`
   - **Output:** Next.js default
5. **Do not deploy yet** — add environment variables first (Step 3).

---

## Step 3 — Environment variables on Vercel

In **Project → Settings → Environment Variables**, add:

| Name | Value |
|------|--------|
| `BUNGIE_API_KEY` | From Bungie portal |
| `BUNGIE_CLIENT_ID` | OAuth client ID (prod app) |
| `BUNGIE_CLIENT_SECRET` | OAuth client secret |
| `BUNGIE_REDIRECT_URI` | `https://YOUR-DOMAIN.vercel.app/api/auth/callback` |
| `SESSION_SECRET` | New random string (`openssl rand -base64 32`) |

Use a **new** `SESSION_SECRET` for production (not the same as local).

Replace `YOUR-DOMAIN` with your actual Vercel URL (e.g. `collection-hub.vercel.app`).

Apply to **Production** (and Preview if you want OAuth on preview deployments).

Click **Deploy**.

---

## Step 4 — Bungie application (production)

In [bungie.net/en/Application](https://www.bungie.net/en/Application), open your **production** app:

| Field | Example |
|-------|---------|
| **Redirect URL** | `https://collection-hub.vercel.app/api/auth/callback` |
| **Origin header** | `https://collection-hub.vercel.app` |
| **Website** | Same as origin |

Must match `BUNGIE_REDIRECT_URI` **exactly** (https, no trailing slash on origin).

Save, then **redeploy** on Vercel if you already deployed (Settings → Redeploy) so env vars are picked up.

---

## Step 5 — Verify

1. Open `https://your-project.vercel.app`
2. Browse `/exotics` and `/sets` without signing in.
3. **Sign in with Bungie** — should return to your site with your username.
4. Owned items should show borders (green on exotics, gold on armor sets).

---

## Custom domain (optional)

1. Vercel → **Project → Settings → Domains**
2. Add your domain (e.g. `collectionhub.example.com`)
3. Update DNS as Vercel instructs.
4. Update **Bungie Redirect URL**, **Origin**, and **`BUNGIE_REDIRECT_URI`** to the new domain.
5. Redeploy.

---

## Updating the live site

After code changes:

```bash
git add .
git commit -m "Describe your change"
git push
```

Vercel rebuilds automatically on every push to `main`.

After a Destiny patch, refresh catalogs locally and push:

```bash
npm run generate:armor-sets
npm run generate:exotics
git add data/
git commit -m "Refresh manifest catalogs"
git push
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| OAuth redirect error | Redirect URL in Bungie must match `BUNGIE_REDIRECT_URI` exactly |
| Sign-in works locally but not online | Prod needs its own Bungie app or updated Redirect URL |
| Empty catalogs | Ensure `data/*.json` is committed and pushed |
| 500 on sign-in | Check Vercel **Logs**; usually a missing env variable |

---

## Alternatives to Vercel

Any host that runs Node.js 20+ and supports Next.js works (Railway, Render, Fly.io, a VPS). Vercel is the path of least friction for this stack.
