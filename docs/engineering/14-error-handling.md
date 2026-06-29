# Error Handling

## Overview

Error handling is implemented at three layers:
1. **Backend** — Express error middleware + per-route try/catch
2. **Frontend** — React `ErrorBoundary` + Axios response interceptor
3. **Routing** — 404 `NotFound` component for unknown routes

---

## Backend Error Handling

### Per-Route Try/Catch

Every async route handler wraps its logic in a `try/catch`:

```typescript
router.post('/login', async (req, res) => {
  try {
    // ... handler logic
  } catch (error) {
    console.error('Login error:', (error as Error).message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

Only `error.message` is logged — never the full stack trace in production responses. This prevents leaking internal implementation details to clients.

### Global Error Middleware

Express catches any unhandled errors thrown by middleware or route handlers:

```typescript
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});
```

### Error Response Shape

All API errors follow a consistent structure:

```json
{
  "error": "Human-readable message",
  "feedback": ["optional array of validation messages"],
  "code": "OPTIONAL_ERROR_CODE"
}
```

### HTTP Status Code Convention

| Code | Meaning | When Used |
|---|---|---|
| `400` | Bad Request | Missing fields, validation failure, same password reuse |
| `401` | Unauthorized | No/invalid/expired JWT token |
| `403` | Forbidden | Valid token but insufficient role or no organization |
| `404` | Not Found | Resource doesn't exist or doesn't belong to organization |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unhandled exceptions |

### Logging Strategy

- **Production**: `console.error` for errors only — no verbose request/response logging
- **Development**: `morgan` HTTP logger active (`NODE_ENV !== 'production'`)
- Sensitive data (passwords, tokens, user emails) is **never** logged
- Email failures are logged at `console.error` level but do not propagate to HTTP responses

---

## Frontend Error Handling

### ErrorBoundary Component

`frontend/src/components/ErrorBoundary.tsx` — React class component wrapping the entire application tree.

**Catches:** Any JavaScript error thrown during rendering, in lifecycle methods, or in constructors of child components.

**Does not catch:** Errors in event handlers, async code, server-side rendering.

```
Error occurs in React tree
  │
  └── ErrorBoundary.getDerivedStateFromError(error)
        ├── Sets hasError = true
        └── Renders fallback UI:
              ├── "Something went wrong" heading
              ├── "Return to Home" button → window.location.href = '/'
              └── Error message (development mode only)
```

**Development mode** (`import.meta.env.DEV`): shows the raw error message in a `<pre>` block to aid debugging.

**Production mode**: shows only the generic message — no internal details exposed.

### Axios Response Interceptor

`frontend/src/lib/api.ts` handles API-level errors globally:

```typescript
api.interceptors.response.use(
  response => response,
  error => {
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');

    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Clear auth state + redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);
```

The `/auth/login` endpoint is excluded from the auto-redirect so wrong-password errors surface correctly to the login form.

### Component-Level Error Handling

Individual components handle expected API errors inline:

```typescript
try {
  await api.post('/auth/forgot-password', { email });
} catch {
  setError('Something went wrong. Please try again.');
}
```

Error messages from the API (`err?.response?.data?.error`) are displayed directly in the UI when safe and informative.

---

## 404 Handling

### Backend

Unknown API routes return:
```json
HTTP 404
{ "error": "Not found" }
```

### Frontend

React Router's catch-all route:
```tsx
<Route path="*" element={<NotFound />} />
```

`NotFound` component (`frontend/src/components/NotFound.tsx`):
- Displays a large `404` with "Page not found" message
- Button routes the user to their appropriate home:
  - `SUPERUSER` → `/super-user/dashboard`
  - `VETERINARIAN` → `/livestock-health`
  - Authenticated (other roles) → `/dashboard`
  - Unauthenticated → `/`

---

## Offline Handling

When the device has no network connection:
- The PWA service worker intercepts navigation requests
- Serves `frontend/public/offline.html` (standalone, no JS dependencies)
- Displays: "You're offline" + "Try again" button
- API calls (`/api/*`) are excluded from the offline fallback via `navigateFallbackDenylist`

See `docs/engineering/08-pwa-configuration.md` for the full PWA/Workbox setup.
