# colab

**colab** is a keepalive control plane for Google Colab. It gives you a web dashboard to create and monitor Colab VM sessions, connect multiple Colab (Google) accounts, and run packaged "apps" on those VMs — each reachable through its own cloudflare tunnel URL.

It exists because Colab disconnects idle sessions. This app re-assigns your sessions every 2 minutes so they stay alive, tracks which ones are dead, and lets you install/launch tools on them from the browser.

## Tech stack

| Layer | Choice |
|---|---|
| Backend | Cloudflare Worker (vanilla JS, single file `src/index.js`), cron trigger every 2 min |
| Database | Cloudflare D1 (SQLite) — sessions, events, workspaces |
| KV | Cloudflare KV — marketplace list, shared state |
| Storage | Cloudflare R2 — app zips + manifests |
| Frontend | Solid.js + Vite + Tailwind CSS v4, built to static assets served by the same Worker |
| Auth | Dashboard password (cookie) **+ Clerk** (email/Google, for workspaces) |
| Tunnels | `cloudflared` (trycloudflare) — every running app gets a public URL |

## How it works

1. `GET /` — the Worker serves the SPA shell and injects `window.__BOOT__ = { authed, pk, host }` so the app knows immediately whether you're logged in.
2. The SPA loads and calls `GET /api/state` — sessions, recent events, installed apps, Colab profiles, workspace info in one request.
3. A **cron job runs every 2 minutes**: it refreshes OAuth tokens, re-assigns sessions that are about to drop, and marks vanished sessions as dead.
4. Creating a session (`POST /api/new`) asks the Colab API to assign a VM on one of your connected accounts; the response gives a Jupyter endpoint the app uses to run commands.
5. Apps are zip files in R2. **Install/launch/stop** are executed inside a Jupyter kernel on the VM; a launched app starts a `cloudflared` tunnel and surfaces a `*.trycloudflare.com` URL.

## Modules

### Backend — `src/index.js` (the Worker)

| Area | What it does |
|---|---|
| Routing & auth (`authContext`) | Accepts a dashboard-password cookie, an `x-api-key` header, or a verified Clerk session; every request is scoped to a workspace id (`wsid`) |
| Clerk verification | Verifies the `__session` JWT (RS256) against Clerk's JWKS — no dependencies |
| Keepalive tick (`runTick`, cron) | The heartbeat: refresh tokens, list/assign/unassign VMs, mark dead sessions, emit events |
| Colab API | OAuth device flow (`/api/connect-url`, `/api/connect-submit`) and VM assignment calls |
| Sessions | `/api/new`, `/api/stop`, `/api/rename` |
| Apps | `/api/apps/upload`, `/api/apps/action` (install/launch/stop/status), `/api/apps/delete`, `/api/apps/file` (signed downloads) |
| Marketplace | `/api/market` GET/POST/DELETE — the community list stored in KV |
| Workspaces | `/api/ws/invite`, `/ws/join`, `/ws/switch`, `/ws/me` — multi-user scoping |
| Raw views | `/sessions`, `/events` — plain-text dumps for debugging |
| SPA serving | Serves `web/dist/index.html` with the boot object injected |

### Frontend — `web/`

| Module | What it does |
|---|---|
| `index.jsx` | Mounts the Solid app |
| `App.jsx` | Branches on `boot.authed`: Login view or Dashboard view |
| `views/Login.jsx` | Password form (+ wrong-password hint) and the Clerk "continue with email/Google" button |
| `views/Dash.jsx` | The dashboard: restores cache instantly, then refreshes, runs the 30s pollers, handles invite links |
| `store.js` | Single source of truth — Solid store (`state`), UI signals (modals, tabs, selections), derived memos (`aliveSessions`, `isAdmin`, `pickEp`…), localStorage persistence |
| `api.js` | `fetch` wrapper (401 → back to `/`), button busy/spinner helpers, small formatters |
| `actions.js` | Every side effect: `refresh`, `pollApps`, create/stop/rename session, connect Colab, app install/launch/stop, marketplace ops, workspace share/switch/join |
| `clerk.js` | Loads Clerk JS, signs out, bootstraps workspace email |
| `promptText.js` | The copy-paste agent prompt shown when you "add app" to the marketplace |
| `styles.css` | Tailwind v4 theme (Inter/Consolas) + the shared component layer (`.btn`, `.card`, `.mono`…) |
| `components/Header.jsx` | Top bar: title, `+ new session`, logs toggle, workspace switcher, logout |
| `components/WsBar.jsx` | Workspace switcher popup (share link, switch, sign out) |
| `components/VmsGrid.jsx` | Live VM cards: open proxy, rename, stop, view log, pick for apps |
| `components/SessPills.jsx` | The pill row for quickly selecting which VM is "active" for app actions |
| `components/SessionPanel.jsx` | Session log / history tabs with event feed |
| `components/AccountsPanel.jsx` | Connected Colab accounts: connect (paste Google code), remove |
| `components/AppsPanel.jsx` | Apps installed on the selected VM with run/stop/more menu |
| `components/StateCell.jsx` | Small state chip for one app on one VM (checking/installed/running/url) |
| `components/NewSessModal.jsx` | Create-session form (accelerator, high-mem, name) with a live console |
| `components/MarketModal.jsx` | Marketplace: category filter, registry cards, upload zip, add-app form |
| `components/BootOverlay.jsx` | The "loading state…" overlay shown until the first refresh lands |

## What Clerk does

Clerk handles **email/Google sign-in for workspaces** — the multi-user side of the app. The dashboard password gives the owner full admin access; Clerk lets you share the dashboard with other people safely:

- The login view loads `clerk-js` from your Clerk frontend API (the publishable key and host are injected into `__BOOT__`).
- After sign-in, Clerk sets a `__session` cookie. The Worker verifies that JWT's RS256 signature against Clerk's JWKS endpoint (implemented in-worker, no libraries) and derives `{ kind: "clerk", userId, wsid }`.
- Each Clerk user gets their own **workspace (`wsid`)** — sessions, events, and app registrations are scoped to it, so a guest only sees their own VMs. Owners share via invite links (`?invite=...`) and can switch workspaces from the header.
- Sign-out clears the Clerk cookies and the local workspace email.

The password login and Clerk login are independent: password → admin workspace, Clerk → per-user workspaces.

## Local development

```bash
npm install        # installs web/ dependencies
npm run build      # vite build → web/dist
npm run watch      # vite build --watch
npm run dev        # wrangler dev (serves the built SPA locally)
npm run deploy     # build + wrangler deploy
```
