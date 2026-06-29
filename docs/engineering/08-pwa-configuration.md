# PWA Configuration

## Overview

TrackFarmOps is a Progressive Web App (PWA). Users can install it on mobile and desktop, and the app serves cached content during poor network conditions. PWA support is provided by `vite-plugin-pwa` which generates a Workbox-powered service worker at build time.

---

## Configuration File

`frontend/vite.config.ts` — `VitePWA()` plugin options.

---

## Web App Manifest

| Property | Value |
|---|---|
| `name` | TrackFarmOps |
| `short_name` | TrackFarmOps |
| `display` | standalone |
| `orientation` | portrait-primary |
| `theme_color` | #000 |
| `background_color` | #ffffff |
| `start_url` | / |
| `scope` | / |
| `icons` | 192×192, 512×512 (both `any maskable`) |

Icon files live in `frontend/public/`:
- `icon-192x192.png`
- `icon-512x512.png`

---

## Service Worker Strategy

`registerType: 'autoUpdate'` — the service worker updates automatically without prompting the user.

### Precache (build-time)
All static assets matching these patterns are precached:
```
**/*.{js,css,html,ico,svg,woff,woff2}
icon-*.png
```
Maximum file size for caching: **5 MB**.

### Runtime Caching

| Pattern | Strategy | Cache Name | TTL / Limit |
|---|---|---|---|
| `/api/.*` | NetworkFirst | `api-cache` | 5 min, 50 entries |
| `*.{png,jpg,jpeg,svg,gif,webp}` | CacheFirst | `image-cache` | 30 days, 60 entries |
| `*.{js,css}` | StaleWhileRevalidate | `static-cache` | 7 days, 100 entries |

**NetworkFirst** for API calls: always tries the network first; falls back to cache if offline. Ensures data freshness while providing offline resilience.

---

## Offline Fallback

When the user is completely offline and requests a page not in cache:
- `navigateFallback: '/offline.html'` serves `frontend/public/offline.html`
- `navigateFallbackDenylist: [/^\/api\//]` ensures API routes are not intercepted

`offline.html` is a standalone HTML page (no React, no dependencies) that displays:
- "You're offline" message
- A "Try again" button that calls `window.location.reload()`

---

## Installation

The app is installable via the browser's native "Add to Home Screen" / "Install" prompt. No custom install prompt UI is implemented — the browser handles it natively.

---

## Development Notes

- Service workers are **disabled in development** by Vite (`mode: 'development'`)
- To test PWA behaviour locally: `npm run build && npm run preview`
- After a new deploy, users with the app installed will auto-update on next visit (background sync via `autoUpdate` strategy)
- Clear service worker cache in Chrome: DevTools → Application → Service Workers → Unregister
