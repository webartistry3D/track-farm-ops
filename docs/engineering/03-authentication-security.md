# Authentication & Security

## Authentication Flow

### Login
```
POST /api/auth/login
  │
  ├── authRateLimiter.middleware (5 attempts / 15 min per IP)
  ├── Validate email + password presence
  ├── prisma.user.findUnique({ email }) with organization
  ├── bcrypt.compare(password, user.password)
  ├── generateToken(user)  →  JWT (HS256, 7d expiry)
  └── Response: { user, token }
```

### Token Verification (protected routes)
```
Request with Authorization: Bearer <token>
  │
  └── authenticate middleware
        ├── Extract token from header
        ├── jwt.verify(token, JWT_SECRET)
        ├── prisma.user.findUnique({ id: payload.userId })
        └── req.user = user  →  next()
```

### JWT Structure
```json
{
  "userId": 1,
  "email": "user@farm.com",
  "role": "OWNER",
  "organizationId": 1,
  "iat": 1234567890,
  "exp": 1235172690
}
```

Token is signed with `JWT_SECRET` from env. Fallback: `'trackfarmops-superuser-2024'` (development only — always set a strong secret in production).

Token expiry: **7 days**. No refresh token mechanism — re-login required after expiry.

---

## Role Hierarchy

```
SUPERUSER
  └── Platform-level admin. Can create organizations, manage all data.
      No organizationId required.

OWNER
  └── Farm owner. Full access within their organization.
      Can create/delete users, manage all farm data.

MANAGER
  └── Operational manager. Read/write access to farm data.
      Cannot manage users.

ACCOUNTANT
  └── Finance access only. Income, expenses, invoices, VAT.

INVENTORY
  └── Inventory access only.

VETERINARIAN
  └── Livestock and health records access only.

WORKER
  └── Lowest privilege. Basic operational read/write.
```

### Role Enforcement
- **Route level**: `requireRole(['OWNER', 'MANAGER'])` middleware from `rowLevelSecurity.ts`
- **Data level**: All queries include `organizationId` filter via `SecureQueryBuilder`
- **Frontend level**: `ProtectedRoute` component checks role; wrong-role redirects enforced in `App.tsx`

---

## Password Security

### Hashing
- Algorithm: **bcrypt**, salt rounds: **12**
- All passwords stored as bcrypt hashes — plaintext never stored or logged

### Password Validation (`PasswordValidator`)
Requirements enforced on all new passwords:
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot be the same as the current password
- Strength scoring: Weak / Fair / Strong / Very Strong

### Password History
- Previous password hashes stored in `password_history` table
- Prevents immediate password reuse

### Password Change Tracking
- `last_password_change` timestamp updated on every change
- `password_change_count` incremented
- `requires_password_change` flag: forces change on next login if set by admin

---

## Password Reset Flow

```
1. POST /api/auth/forgot-password  { email }
   ├── Rate limited (authRateLimiter)
   ├── Look up user by email
   ├── Generate crypto.randomBytes(32).toString('hex') token
   ├── Store token + expiry (now + 1 hour) on user record
   ├── Send reset email via SMTP (non-blocking)
   └── Always return 200 (prevents user enumeration)

2. User clicks link: /reset-password?token=<token>

3. POST /api/auth/reset-password  { token, newPassword }
   ├── Find user where passwordResetToken = token AND passwordResetExpiry > now
   ├── Validate new password strength
   ├── bcrypt.hash(newPassword, 12)
   ├── Update user: password, clear token/expiry, set lastPasswordChange
   └── Response: success message
```

---

## Email Verification Flow

```
1. User signs up → emailVerificationToken generated (crypto.randomBytes(32))
2. Token stored on user record, emailVerified = false
3. Welcome email sent with link: /verify-email?token=<token>
4. GET /api/auth/verify-email?token=<token>
   ├── Find user by emailVerificationToken
   ├── Set emailVerified = true
   ├── Clear emailVerificationToken
   └── Response: success message
```

---

## Rate Limiting

Rate limiting is implemented in-process (in-memory Map) in `backend/src/middleware/rateLimiter.ts`.

| Limiter | Window | Max Requests | Applied To |
|---|---|---|---|
| `authRateLimiter` | 15 minutes | 5 | `/auth/login`, `/auth/forgot-password` |
| `passwordChangeRateLimiter` | 1 hour | 3 | `/auth/change-password` |
| General API limiter | 15 minutes | 100 | All `/api/` routes |

Key is generated from `IP address`. Rate limit state is reset on server restart (in-memory only).

---

## Security Middleware

Applied globally to all `/api/` routes via `securityMiddleware` array in `backend/src/index.ts`:

### `detectSQLInjection`
Scans all incoming request body, query, and params for patterns including:
- `SELECT`, `INSERT`, `UPDATE`, `DELETE`, `DROP`, `UNION`, `--`, `;`
- Returns `400` if detected

### `detectXSS`
Scans for XSS patterns including:
- `<script>`, `javascript:`, `onerror=`, `onload=`, HTML event handlers
- Returns `400` if detected

### Other Security Headers (helmet)
Applied via `helmet()` middleware:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Strict-Transport-Security`
- `Content-Security-Policy`

### CORS
Origin whitelist configured via `CORS_ORIGIN` env var. In production: `https://track-farm-ops.onrender.com`.

---

## Superuser Account Creation

Creating a SUPERUSER account requires the `SUPERUSER_ADMIN_KEY` env var to be passed as `adminKey` in the request body. This key is never exposed to the frontend and prevents unauthorized elevation to platform-admin level.

```
POST /api/auth/superuser-signup
Body: { name, email, password, adminKey }
```
