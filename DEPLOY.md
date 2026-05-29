# Deploying Collection HUB (Vercel)

This guide walks through publishing the app with [Vercel](https://vercel.com) (free tier works for an MVP).

## Before you deploy

1. **Commit your catalog data** (already in the repo):
   - `public/data/armor-sets.json`
   - `public/data/exotics.json`
2. **Never commit** `.env.local` (secrets stay out of Git).
3. **Bungie allows one Redirect URL per application.** For local dev + production, either:
   - Create **two Bungie apps** (recommended: one for dev, one for prod), or
   - Change the Redirect URL in the portal when switching environments.

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
git add public/data/
git commit -m "Refresh manifest catalogs"
git push
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| OAuth redirect error | Redirect URL in Bungie must match `BUNGIE_REDIRECT_URI` exactly |
| Sign-in works locally but not online | Prod needs its own Bungie app or updated Redirect URL |
| Empty catalogs | Ensure `public/data/*.json` is committed and pushed |
| 500 on sign-in | Check Vercel **Logs**; usually a missing env variable |

---

## Alternatives to Vercel

Any host that runs Node.js 20+ and supports Next.js works (Railway, Render, Fly.io, a VPS). Vercel is the path of least friction for this stack.
