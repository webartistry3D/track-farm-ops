# System Architecture

## Overview

TrackFarmOps is a full-stack, multi-tenant SaaS farm management platform. It is structured as a monorepo containing a React single-page application (frontend) and a Node.js/Express REST API (backend), both deployed on Render.com.

---

## Monorepo Structure

```
track-farm-ops/
├── frontend/               # React + Vite SPA (static site on Render)
├── backend/                # Express + TypeScript API (web service on Render)
├── docs/                   # Project documentation
├── render.yaml             # Render deployment blueprint
├── deploy-production.sh    # Production deployment shell script
└── package.json            # Root workspace definition (npm workspaces)
```

npm workspaces are declared in the root `package.json`:
```json
"workspaces": ["frontend", "backend"]
```

---

## Deployment Topology

```
                        ┌─────────────────────────────┐
                        │         Render.com           │
                        │                             │
  Browser ─────HTTPS──► │  Static Site (frontend)     │
                        │  track-farm-ops.onrender.com│
                        │           │                 │
                        │           │ /api/* rewrite  │
                        │           ▼                 │
                        │  Web Service (backend API)  │
                        │  track-farm-ops-api.onrender│
                        │           │                 │
                        │           ▼                 │
                        │  PostgreSQL (Render DB)      │
                        │  trackfarmops               │
                        └─────────────────────────────┘
```

| Service | Type | URL |
|---|---|---|
| Frontend | Static Site | `https://track-farm-ops.onrender.com` |
| Backend API | Web Service | `https://track-farm-ops-api.onrender.com` |
| Database | PostgreSQL | Render managed DB (`trackfarmops`) |

---

## Request Lifecycle

```
Browser
  │
  ├── Static assets (JS/CSS/HTML)
  │     └── Served directly from Render CDN (cached by service worker)
  │
  └── API calls (/api/*)
        │
        ├── CORS check (origin whitelist)
        ├── Security middleware (SQL injection + XSS detection)
        ├── Rate limiter (IP-based, in-memory)
        ├── JWT authentication (Bearer token)
        ├── Route handler
        │     └── Prisma ORM → PostgreSQL
        └── JSON response
```

---

## Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | TailwindCSS |
| Routing | React Router v6 |
| Data fetching | Axios + TanStack Query |
| State management | React Context (Auth, Theme, Toast) |
| PWA | vite-plugin-pwa (Workbox) |

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | Express 4 + TypeScript |
| ORM | Prisma 5 |
| Database | PostgreSQL 15 |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcryptjs (salt rounds: 12) |
| Email | nodemailer (SMTP) |
| File uploads | Multer |
| OCR | tesseract.js |
| Logging | morgan |
| Security headers | helmet |

---

## Environment Configuration

All environment variables are documented in `/.env.example`. Production values are set in the Render dashboard. See `docs/engineering/13-environment-variables.md` for the complete reference.
