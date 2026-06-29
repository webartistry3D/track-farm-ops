# Frontend Architecture

## Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool + dev server |
| React Router | v6 | Client-side routing |
| TailwindCSS | 3 | Utility-first styling |
| Axios | - | HTTP client |
| TanStack Query | v5 | Server state management + caching |
| vite-plugin-pwa | - | PWA / service worker |

---

## Directory Structure

```
frontend/src/
├── App.tsx                    # Root component, router, all route definitions
├── main.tsx                   # React entry point
├── components/                # All page and UI components
│   ├── LoginClean.tsx
│   ├── Signup.tsx
│   ├── Dashboard.tsx
│   ├── Layout.tsx             # App shell (sidebar, topbar)
│   ├── ErrorBoundary.tsx      # React error boundary
│   ├── NotFound.tsx           # 404 page
│   ├── ForgotPassword.tsx     # Password reset request
│   ├── ResetPassword.tsx      # Password reset form
│   ├── VerifyEmail.tsx        # Email verification handler
│   ├── SuperUserRoutes.tsx    # SUPERUSER-scoped routes
│   └── ...
├── contexts/
│   ├── AuthContext.tsx         # User auth state, login/logout
│   ├── ThemeContext.tsx        # Dark/light mode
│   └── ToastContext.tsx        # Global toast notifications
├── lib/
│   └── api.ts                 # Axios instance + interceptors
├── types/
│   └── index.ts               # All shared TypeScript types
└── config/
    └── navigationConfig.ts    # Role-based nav item definitions
```

---

## Context Providers

Providers are nested in `App.tsx` in this order:
```tsx
<ErrorBoundary>
  <QueryClientProvider>
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
</ErrorBoundary>
```

### AuthContext
- Stores `user` (or `null`) and `token` in React state + `localStorage`
- `login(credentials)` → calls `POST /auth/login`, stores token, returns `User`
- `logout()` → clears state and localStorage
- `loading` state prevents flash of wrong UI during initial hydration

### ThemeContext
- Persists `dark` or `light` preference in `localStorage`
- Applies `dark` class to `<html>` element

### ToastContext
- Global notification queue
- `showToast(message, type)` callable from anywhere via `useToast()`

---

## Routing Architecture

All routes defined in `AppRoutes` component in `App.tsx`.

### Public Routes (no auth required)
| Path | Component |
|---|---|
| `/` | Landing page |
| `/login` | LoginClean |
| `/signup` | Signup |
| `/super-user-signup` | SuperUserSignup |
| `/forgot-password` | ForgotPassword |
| `/reset-password` | ResetPassword |
| `/verify-email` | VerifyEmail |
| `/about`, `/contact`, `/pricing`, `/privacy`, `/terms` | Marketing pages |
| `*` | NotFound |

### Auth Redirect (logged-in users hitting public routes)
Authenticated users visiting `/login` or `/signup` are redirected based on role:
- `SUPERUSER` → `/super-user/dashboard`
- `VETERINARIAN` → `/livestock-health`
- All others → `/dashboard`

### Protected Routes (`ProtectedRoute` wrapper)
All require a valid JWT. Redirects to `/login` if unauthenticated.

| Path | Component | Notes |
|---|---|---|
| `/dashboard` | Dashboard | |
| `/income` | IncomePage | |
| `/expenses` | ExpensesPage | |
| `/inventory` | InventoryPage | |
| `/assets` | AssetsPage | |
| `/reports` | Reports | |
| `/analytics` | Analytics | |
| `/invoices` | InvoicesPage | |
| `/farm-operations` | FarmOperations | |
| `/livestock-health` | LivestockHealth | |
| `/settings` | Settings | |
| `/profile` | UserProfile | |
| `/admin` | AdminSetup | |
| `/super-user/*` | SuperUserRoutes | SUPERUSER only |

---

## API Client (`lib/api.ts`)

Axios instance with base URL from `VITE_API_URL`:

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});
```

**Request interceptor:** Attaches `Authorization: Bearer <token>` from localStorage to every request.

**Response interceptor:** On `401` errors, clears auth state and redirects to `/login` — **except** for the `/auth/login` endpoint itself (to allow proper wrong-password error display).

---

## Error Handling

### ErrorBoundary
Class component wrapping the entire app. Catches any unhandled React render errors:
- Shows a friendly error screen with a "Return to Home" button
- In development: displays the error message
- Logs error to `console.error` with component stack

### 404 Page
`NotFound` component rendered on `path="*"`. Uses `useAuth()` to determine the correct "go back" destination based on the user's role.

---

## TypeScript Configuration

`verbatimModuleSyntax` is enabled — all type-only imports must use `import type { ... }`:
```typescript
import type { ReactNode, ErrorInfo } from 'react';
```

Vite env vars accessed via `import.meta.env.*`, not `process.env.*`.
