# Push Notification Specification & Implementation

## 1. Executive Summary

TrackFarmOps already persists in-app notifications in PostgreSQL and renders them inside the React UI. This document specifies how to extend that capability with **Push Notifications** for the PWA, so users are notified on their device lock screen / notification tray even when the app is closed or in the background, exactly like a native mobile app.

The implementation follows the **W3C Push API** and **Web Push Protocol** (RFC 8030), uses **VAPID** for authentication, and integrates with the existing `vite-plugin-pwa` service worker.

---

## 2. Goals & Non-Goals

### Goals
- Users receive a push notification when an in-app notification is created for them.
- Notifications appear on mobile lock screens and desktop notification trays.
- Clicking a notification opens the relevant in-app page.
- Subscription state is tied to the authenticated user and device.
- Graceful degradation: if permission is denied or push is unsupported, in-app notifications continue to work.

### Non-Goals
- This is **not** a real-time chat or websocket replacement.
- We do **not** support SMS, email, or native mobile push (APNs/FCM) in this phase; we use the browser's push service.
- We do **not** send marketing/promotional push notifications without an explicit opt-in.

---

## 3. Architecture Principles

| Principle | Rationale |
|---|---|
| **Event-Driven** | The existing notification creation path is the single source of truth. A push is emitted as a side-effect of `prisma.notification.create`. |
| **User-Owned Subscription** | Each device subscription belongs to one user. Multiple devices per user are supported. |
| **Privacy-First** | No tracking pixels or third-party analytics. Payload contains only title, body, and a deep-link. |
| **Progressive Enhancement** | Push is optional. Core app functionality remains intact if disabled. |
| **Idempotency** | The push dispatcher deduplicates by user and notification id to avoid double delivery. |

---

## 4. High-Level Flow

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────────┐
│  Backend event  │         │  Push Dispatcher │         │  Browser Push Service│
│  (notification  │────────▶│  (VAPID signed)  │────────▶│  (FCM, APNS, etc.)  │
│   created)      │         │                  │         │                     │
└─────────────────┘         └──────────────────┘         └─────────────────────┘
                                                                      │
                                                                      ▼
                                                           ┌─────────────────────┐
                                                           │   Service Worker    │
                                                           │  (showNotification) │
                                                           └─────────────────────┘
                                                                      │
                                                                      ▼
                                                           ┌─────────────────────┐
                                                           │  User clicks banner │
                                                           │  → focus / open app │
                                                           └─────────────────────┘
```

---

## 5. Data Model

Add a new model to `backend/prisma/schema.prisma`:

```prisma
model PushSubscription {
  id        Int      @id @default(autoincrement())
  endpoint  String   @unique
  p256dh    String
  auth      String
  userId    Int
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

Also add the relation field on `User`:

```prisma
model User {
  // ... existing fields
  pushSubscriptions PushSubscription[]
}
```

> **Migration note:** create a new migration after updating the schema.

---

## 6. API Specification

### 6.1 Backend Endpoints

All endpoints require `authenticate` middleware.

#### `POST /api/notifications/push/subscribe`
Register or update a push subscription for the current user.

**Request body:**
```json
{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "BNc...",
    "auth": "abc..."
  }
}
```

**Response:**
```json
{ "message": "Subscription saved" }
```

**Logic:**
- Upsert by `endpoint`.
- Associate with `req.user.id`.
- If an existing subscription for the same endpoint belongs to another user, reassign it (device changed hands).

#### `POST /api/notifications/push/unsubscribe`
Remove the subscription for the current device.

> **Why POST?** Some proxies and HTTP clients strip or reject request bodies on `DELETE`. Using `POST` for this state-changing operation is more reliable.

**Request body:**
```json
{ "endpoint": "https://fcm.googleapis.com/fcm/send/..." }
```

**Response:**
```json
{ "message": "Subscription removed" }
```

#### `GET /api/notifications/push/vapid-public-key`
Return the VAPID public key so the frontend can subscribe.

**Response:**
```json
{ "publicKey": "B..." }
```

---

### 6.2 Internal Push Dispatcher

Add a new utility module: `backend/src/utils/pushNotification.ts`.

Responsibilities:
1. Sign the payload with VAPID.
2. Send the push message to each endpoint registered for the target user(s).
3. Remove stale endpoints (e.g., 410 Gone / 404 Not Found).

```typescript
import webPush from 'web-push';

webPush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:trackfarmops@gmail.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export const sendPushToUser = async (userId: number, payload: object) => {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const data = JSON.stringify(payload);

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data
        );
      } catch (err: any) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          await prisma.pushSubscription.delete({ where: { endpoint: sub.endpoint } });
        } else {
          console.error('Push delivery failed:', err);
        }
      }
    })
  );
};
```

---

## 7. Trigger Points

The push dispatcher is invoked immediately after an in-app notification is created. Update the existing helper `createPaymentNotifications` and any other notification creation sites to call the dispatcher.

Because the current code uses `prisma.notification.createMany` in several places (e.g., `backend/src/utils/notificationHelper.ts` and `createPaymentNotifications`), **create a single notification at a time** when a push is required, or use `createMany` followed by per-user dispatch if you do not need the exact notification id in the payload.

Recommended helper in `backend/src/utils/pushNotification.ts`:

```typescript
export const createAndDispatchNotification = async (data: {
  userId: number;
  organizationId?: number | null;
  title: string;
  message: string;
  type?: NotificationType;
  relatedEntity?: string;
  relatedEntityId?: number;
  metadata?: any;
}) => {
  const notification = await prisma.notification.create({ data });

  // Fire-and-forget push dispatch
  if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    sendPushToUser(notification.userId, {
      title: notification.title,
      body: notification.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: `notification-${notification.id}`,
      data: {
        notificationId: notification.id,
        relatedEntity: notification.relatedEntity,
        relatedEntityId: notification.relatedEntityId,
        url: `/notifications` // or map relatedEntity to a deep-link
      }
    }).catch(err => console.error('Push dispatch failed:', err));
  }

  return notification;
};
```

Then replace direct `prisma.notification.create` calls in `notificationController.ts` and single-notification creation paths with `createAndDispatchNotification`. For bulk creation paths (e.g., `createPaymentNotifications`), either iterate with `createAndDispatchNotification` or dispatch after `createMany` using the title/message without individual ids.

---

## 8. Dependencies to Install

### Backend
```bash
npm install web-push
npm install -D @types/web-push
```

### Frontend
The existing `vite-plugin-pwa` uses Workbox under the hood. For a custom service worker with `injectManifest`, add the matching Workbox packages:

```bash
npm install workbox-precaching workbox-core workbox-window
npm install -D workbox-build
```

> **Note:** `workbox-window` is already present. The project currently uses Workbox v7 via `vite-plugin-pwa@^1.3.0`.

---

## 9. Frontend Implementation

### 9.1 Service Worker

`vite-plugin-pwa` can use a custom service worker by setting `srcDir: 'src', filename: 'sw.ts'`. Create `frontend/src/sw.ts`:

```typescript
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();
clientsClaim();

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const payload = event.data.json();
  const options: NotificationOptions = {
    body: payload.body,
    icon: payload.icon || '/icon-192x192.png',
    badge: payload.badge || '/icon-192x192.png', // 96x96 badge recommended; create /icon-96x96.png if available
    tag: payload.tag || 'trackfarmops-push',
    requireInteraction: false,
    data: payload.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('navigate' in client && 'focus' in client) {
          return client.navigate(url).then(() => client.focus());
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
```

Update `frontend/vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  srcDir: 'src',
  filename: 'sw.ts',
  strategies: 'injectManifest',
  // ... keep existing manifest and workbox settings
})
```

> **Important:** When switching from the default `generateSW` to `injectManifest`, the custom `sw.ts` is responsible for precaching and runtime caching. Keep the existing `manifest`, `workbox` (precache patterns, runtime caching), and `includeAssets` settings from `frontend/vite.config.ts` unchanged.

> **Platform support:** Web Push works on Chrome (desktop/Android), Edge, Firefox, and Safari on macOS. iOS Safari added support in **16.4** with significant limitations; users on older iOS versions will not receive push notifications.

### 9.2 Subscription Manager

Create `frontend/src/lib/pushNotifications.ts`:

```typescript
import api from './api';

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
};

export const requestPushPermission = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return false;

  const registration = await navigator.serviceWorker.ready;
  const { data: { publicKey } } = await api.get('/notifications/push/vapid-public-key');

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey)
  });

  await api.post('/notifications/push/subscribe', subscription.toJSON());
  return true;
};

export const unsubscribePush = async (): Promise<void> => {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;

  await api.post('/notifications/push/unsubscribe', {
    endpoint: subscription.endpoint
  });
  await subscription.unsubscribe();
};
```

### 9.3 Permission UI

Add a toggle in `Settings.tsx` or a banner on first login:

```tsx
import { requestPushPermission, unsubscribePush } from '../lib/pushNotifications';

const [pushEnabled, setPushEnabled] = useState(false);
const [pushError, setPushError] = useState('');

const togglePush = async () => {
  setPushError('');
  if (pushEnabled) {
    await unsubscribePush();
    setPushEnabled(false);
  } else {
    const enabled = await requestPushPermission();
    setPushEnabled(enabled);
    if (!enabled) {
      setPushError('Push notifications were blocked. Enable them in your browser settings to receive alerts.');
    }
  }
};
```

> **Do not block the notification creation flow on push delivery.** Push dispatch should be fire-and-forget so that in-app notifications are saved immediately even if a push endpoint is slow or down.

---

## 10. Environment Variables

Add to `.env` and `.env.example`:

```bash
# VAPID keys for Web Push (generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=BC...your_public_key...
VAPID_PRIVATE_KEY=...your_private_key...
VAPID_SUBJECT=mailto:admin@trackfarmops.com
```

> **Security:** The private key must never be exposed to the frontend. Generate once and store securely (e.g., Render environment variables, GitHub secrets).

---

## 11. Security & Privacy

- **VAPID private key** is server-side only.
- **Push subscriptions** are tied to authenticated users; never accept an anonymous subscription.
- **Payloads** are minimal (no PII beyond the notification title/message already shown in-app).
- **Rate limiting** applies to push endpoints using the existing `auth` or `general` rate limiters.
- **Permission** must be explicitly requested after a user action (e.g., clicking a toggle), never on page load.

---

## 12. Testing Strategy

| Test | How |
|---|---|
| Subscription creation | Use DevTools → Application → Service Workers → Push to trigger a test message. |
| Permission denied | Verify in-app notifications still work and UI shows "Notifications disabled". |
| Stale endpoint | Mock a 410 response from the push service and confirm the subscription row is deleted. |
| Multi-device | Subscribe from Chrome desktop + Android; confirm both receive the same push. |
| Click behavior | Click a notification on a closed PWA and confirm the correct route opens. |

For local testing, generate VAPID keys with:

```bash
npx web-push generate-vapid-keys
```

---

## 13. Deployment & Operations

1. Add `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` to Render environment variables.
2. Create and apply the Prisma migration for `PushSubscription`.
3. Deploy the backend and frontend.
4. Verify the generated service worker contains the `push` and `notificationclick` listeners.

---

## 14. Implementation Checklist

- [ ] Update Prisma schema with `PushSubscription` model.
- [ ] Create and apply migration.
- [ ] Install backend dependencies (`web-push`, `@types/web-push`).
- [ ] Install frontend Workbox dependencies (`workbox-precaching`, `workbox-core`, `workbox-build`).
- [ ] Add push subscription endpoints (`/subscribe`, `/unsubscribe`, `/vapid-public-key`).
- [ ] Create `backend/src/utils/pushNotification.ts` dispatcher.
- [ ] Hook dispatcher into existing notification creation flows.
- [ ] Create custom service worker `frontend/src/sw.ts`.
- [ ] Switch `vite-plugin-pwa` to `injectManifest` strategy.
- [ ] Create `frontend/src/lib/pushNotifications.ts` manager.
- [ ] Add push notification toggle/permission UI.
- [ ] Add VAPID env vars to `.env.example` and production hosts.
- [ ] Test on desktop Chrome, Android Chrome, and iOS Safari (where supported).

---

## 15. Open Questions

1. Do we want a user-level setting to disable push notifications without revoking the browser permission?
2. Should push notifications be sent for **all** notification types or only a subset (e.g., payment, alerts)?
3. Should we support action buttons on the notification banner (e.g., "Mark as read")?

