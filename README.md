# Collection HUB

A web app for Destiny 2 collectors. Built with Next.js (App Router), TypeScript, and Tailwind CSS. Bungie.net OAuth is used for sign-in.

## Prerequisites

- Node.js 20+
- A [Bungie.net application](https://www.bungie.net/en/Application) with OAuth enabled

## Environment

Copy `.env.example` to `.env.local` and set:


| Variable               | Description                               |
| ---------------------- | ----------------------------------------- |
| `BUNGIE_API_KEY`       | API key from the Bungie portal            |
| `BUNGIE_CLIENT_ID`     | OAuth client ID                           |
| `BUNGIE_CLIENT_SECRET` | OAuth client secret                       |
| `BUNGIE_REDIRECT_URI`  | Must match the portal (see below)         |
| `SESSION_SECRET`       | Random string (`openssl rand -base64 32`) |


**Bungie portal (local dev):**

- Redirect URL: `https://127.0.0.1:3000/api/auth/callback`
- Origin header: `https://127.0.0.1:3000`

Use `127.0.0.1`, not `localhost`, so it matches the local HTTPS certificate.

## Development

```bash
npm install
npm run dev
```

Open **[https://127.0.0.1:3000](https://127.0.0.1:3000)** (accept the browser security warning for the self-signed certificate).

The dev server runs HTTPS on `127.0.0.1:3000` by default.

## Scripts


| Command                       | Description                                       |
| ----------------------------- | ------------------------------------------------- |
| `npm run dev`                 | Start dev server with HTTPS                       |
| `npm run setup:https`         | Generate local TLS certificates                   |
| `npm run generate:armor-sets` | Refresh armor set data from the Bungie manifest   |
| `npm run generate:exotics`    | Refresh exotic item data from the Bungie manifest |
| `npm run build`               | Production build                                  |
| `npm run start`               | Run production server                             |


## Armor sets catalog

Open `/sets` or `/exotics` after starting the dev server. Sets are grouped into tabs (Destinations, Raids, Dungeons, Expansions, Seasons) using Bungie collectible source strings.

Regenerate data when Bungie ships a new season:

```bash
npm run generate:armor-sets
```

## Deploying

See **[DEPLOY.md](./DEPLOY.md)** for step-by-step instructions (GitHub + Vercel + Bungie production URLs).

## Contributing

UI copy and code comments are in **English** to keep the project accessible for international contributors.