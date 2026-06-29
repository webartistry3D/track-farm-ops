# Deployment Guide

## Platform

Both services are deployed on **Render.com** using `render.yaml` as the blueprint.

---

## Services

### Frontend (Static Site)
| Setting | Value |
|---|---|
| Type | Static Site |
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Publish Directory | `dist` |
| URL | `https://track-farm-ops.onrender.com` |

**SPA routing:** All routes rewrite to `index.html`. API calls are proxied to the backend via the `routes` rewrite rule in `render.yaml`.

### Backend (Web Service)
| Setting | Value |
|---|---|
| Type | Web Service |
| Root Directory | `backend` |
| Build Command | `npm run build:deploy` |
| Start Command | `npm start` |
| URL | `https://track-farm-ops-api.onrender.com` |
| Health Check | `GET /api/health` |

`build:deploy` and `build:render` both point to `node scripts/build-production.js`.

---

## Build Script (`scripts/build-production.js`)

Executed on every Render deploy:
1. `npm install` — install all backend dependencies
2. `npx prisma generate` — regenerate Prisma client from schema
3. `npx prisma migrate deploy` — apply any pending migrations (idempotent)
4. `tsc` — TypeScript compilation check

---

## Environment Variables

All secrets are set in the **Render dashboard** (not in `render.yaml`). Variables marked `sync: false` in `render.yaml` must be set manually.

Required variables for the backend service:

| Variable | Source | Notes |
|---|---|---|
| `DATABASE_URL` | Render DB → Internal URL | Set automatically if using Render PostgreSQL |
| `JWT_SECRET` | Render auto-generated | Min 32 chars |
| `CORS_ORIGIN` | Manual | `https://track-farm-ops.onrender.com` |
| `FRONTEND_URL` | Manual | `https://track-farm-ops.onrender.com` |
| `SUPERUSER_ADMIN_KEY` | Manual | Secret key for SUPERUSER account creation |
| `SMTP_HOST` | Manual | e.g. `smtp.gmail.com` |
| `SMTP_PORT` | Manual | `587` |
| `SMTP_SECURE` | Manual | `false` |
| `SMTP_USER` | Manual | Your email address |
| `SMTP_PASS` | Manual | App password |
| `SMTP_FROM` | Manual | Display name + address |
| `NODE_ENV` | `render.yaml` | `production` |

Required for the frontend service:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://track-farm-ops-api.onrender.com` |

---

## Deploy Process

### Automatic Deploy
Every push to `main` triggers an auto-deploy on both services (`autoDeploy: true`).

### Manual Deploy
From the Render dashboard: select the service → **Manual Deploy** → **Deploy latest commit**.

### Clear Cache Deploy
If the build is using stale dependencies or a cached build command:
1. Select service → **Manual Deploy** → dropdown arrow → **Clear build cache & deploy**

---

## Database Migrations on Deploy

Migrations run automatically inside `build-production.js` via `npx prisma migrate deploy`. This command:
- Applies all pending migrations in `backend/prisma/migrations/`
- Is idempotent — safe to run on every deploy
- Never drops data or resets the schema
- Fails the build if a migration cannot be applied (preventing broken deploys)

---

## Rolling Back

To roll back to a previous deploy:
1. Render dashboard → service → **Deploys** tab
2. Find the last known-good deploy → **Redeploy**

For database rollbacks, there is no automatic mechanism. Before any risky migration, take a manual backup via the Render PostgreSQL dashboard.

---

## Health Check

The backend exposes `GET /api/health` which returns:
```json
{ "status": "ok", "timestamp": "2026-06-29T10:00:00.000Z" }
```

Render uses this to determine service health and will restart the service if it returns a non-200 response.

---

## Local Development

```bash
# Install all dependencies
npm install           # root (installs both workspaces)

# Start backend
cd backend && npm run dev       # ts-node with nodemon on port 3001

# Start frontend
cd frontend && npm run dev      # Vite dev server on port 5173
```

Frontend dev server proxies `/api/*` to `http://localhost:3001/api` via the `VITE_API_URL` env var in `frontend/.env`.
