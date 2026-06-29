# API Reference

Base URL: `https://track-farm-ops-api.onrender.com/api`

All protected endpoints require `Authorization: Bearer <token>` header.

---

## Auth Routes — `/api/auth`

| Method | Path | Auth | Rate Limited | Description |
|---|---|---|---|---|
| POST | `/auth/login` | No | Yes (5/15min) | Login with email + password |
| POST | `/auth/signup` | No | No | Create new OWNER account |
| POST | `/auth/superuser-signup` | No | No | Create SUPERUSER (requires adminKey) |
| POST | `/auth/forgot-password` | No | Yes (5/15min) | Request password reset email |
| POST | `/auth/reset-password` | No | No | Reset password with token |
| GET | `/auth/verify-email` | No | No | Verify email with token |
| GET | `/auth/profile` | Yes | No | Get current user profile |
| POST | `/auth/change-password` | Yes | Yes (3/1hr) | Change password |
| GET | `/auth/users` | Yes (OWNER) | No | List all users in organization |
| POST | `/auth/create-user` | Yes (OWNER) | No | Create user in organization |
| DELETE | `/auth/users/:id` | Yes (OWNER) | No | Delete user from organization |

### POST /auth/login
```json
Request:  { "email": "string", "password": "string" }
Response: {
  "user": { "id", "name", "email", "role", "organizationId", "organizationName", "createdAt" },
  "token": "JWT string"
}
```

### POST /auth/signup
```json
Request:  { "name": "string", "email": "string", "password": "string", "farmName": "string", "farmType": "string?" }
Response: { "message": "Account created successfully", "user": { ...userWithoutPassword } }
```

### POST /auth/forgot-password
```json
Request:  { "email": "string" }
Response: { "message": "If that email exists, a reset link has been sent." }
```
Always returns 200 regardless of whether the email exists.

### POST /auth/reset-password
```json
Request:  { "token": "string", "newPassword": "string" }
Response: { "message": "Password reset successfully. You can now log in." }
Errors:   400 Invalid or expired reset token | 400 Password requirements not met
```

### GET /auth/verify-email
```
Query: ?token=<verification_token>
Response: { "message": "Email verified successfully. You can now log in." }
```

### POST /auth/change-password
```json
Request:  { "currentPassword": "string", "newPassword": "string" }
Response: { "message": "Password changed successfully", "strength": "string", "changedAt": "ISO date" }
```

---

## Income Routes — `/api/income`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/income` | Yes | List all income entries for organization |
| POST | `/income` | Yes | Create income entry |
| PUT | `/income/:id` | Yes | Update income entry |
| DELETE | `/income/:id` | Yes | Delete income entry |

### Income Entry Shape
```json
{
  "amount": "number",
  "category": "string",
  "paymentMethod": "CASH | TRANSFER",
  "date": "ISO date string",
  "description": "string?",
  "enableVAT": "boolean?",
  "quantity": "number?",
  "unitPrice": "number?",
  "vatRate": "number? (default 7.5)"
}
```

---

## Expense Routes — `/api/expenses`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/expenses` | Yes | List all expenses for organization |
| POST | `/expenses` | Yes | Create expense entry |
| POST | `/expenses/ocr` | Yes | Create expense from OCR receipt scan |
| PUT | `/expenses/:id` | Yes | Update expense |
| DELETE | `/expenses/:id` | Yes | Delete expense |

---

## Inventory Routes — `/api/inventory`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/inventory` | Yes | List all inventory items |
| POST | `/inventory` | Yes | Create inventory item |
| PUT | `/inventory/:id` | Yes | Update inventory item |
| DELETE | `/inventory/:id` | Yes | Delete inventory item |
| GET | `/inventory/categories` | Yes | List categories |
| POST | `/inventory/categories` | Yes | Create category |
| GET | `/inventory/:id/transactions` | Yes | Get item transaction history |
| POST | `/inventory/:id/transactions` | Yes | Record stock transaction |

---

## Invoice Routes — `/api/invoices`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/invoices` | Yes | List invoices for user |
| POST | `/invoices` | Yes | Create invoice |
| PUT | `/invoices/:id` | Yes | Update invoice |
| DELETE | `/invoices/:id` | Yes | Delete invoice |
| POST | `/invoices/:id/mark-paid` | Yes | Mark invoice as paid |

---

## Assets Routes — `/api/assets`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/assets` | Yes | List all assets for organization |
| POST | `/assets` | Yes | Create asset |
| PUT | `/assets/:id` | Yes | Update asset |
| DELETE | `/assets/:id` | Yes | Delete asset |

---

## Farm Operations Routes — `/api/farm-operations`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/farm-operations/crops` | Yes | List crops |
| POST | `/farm-operations/crops` | Yes | Create crop record |
| PUT | `/farm-operations/crops/:id` | Yes | Update crop |
| DELETE | `/farm-operations/crops/:id` | Yes | Delete crop |
| GET | `/farm-operations/field-activities` | Yes | List field activities |
| POST | `/farm-operations/field-activities` | Yes | Create field activity |
| GET | `/farm-operations/soil-analyses` | Yes | List soil analyses |
| POST | `/farm-operations/soil-analyses` | Yes | Create soil analysis |
| GET | `/farm-operations/irrigation` | Yes | List irrigation schedules |
| POST | `/farm-operations/irrigation` | Yes | Create irrigation schedule |
| GET | `/farm-operations/pest-control` | Yes | List pest control records |
| POST | `/farm-operations/pest-control` | Yes | Create pest control record |
| GET | `/farm-operations/equipment-status` | Yes | List equipment statuses |
| POST | `/farm-operations/equipment-status` | Yes | Create equipment status |

---

## Livestock Routes — `/api/livestock`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/livestock` | Yes | List all livestock |
| POST | `/livestock` | Yes | Add livestock |
| PUT | `/livestock/:id` | Yes | Update livestock record |
| DELETE | `/livestock/:id` | Yes | Remove livestock |
| GET | `/livestock/:id/health-records` | Yes | Get health records |
| POST | `/livestock/:id/health-records` | Yes | Add health record |
| GET | `/livestock/:id/vaccinations` | Yes | Get vaccination records |
| POST | `/livestock/:id/vaccinations` | Yes | Add vaccination |

---

## Notification Routes — `/api/notifications`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/notifications` | Yes | List notifications for user |
| PUT | `/notifications/:id/read` | Yes | Mark notification as read |
| PUT | `/notifications/read-all` | Yes | Mark all as read |
| DELETE | `/notifications/:id` | Yes | Delete notification |

---

## Subscription Routes — `/api/subscriptions`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/subscriptions/current` | Yes | Get current subscription |
| POST | `/subscriptions/initialize` | Yes | Initialize subscription |
| POST | `/subscriptions/verify` | Yes | Verify payment |

---

## Health Check

```
GET /api/health
Response: { "status": "ok", "timestamp": "ISO date" }
```

No authentication required. Used by Render health checks.

---

## Error Response Format

All errors follow this shape:
```json
{
  "error": "Human-readable error message",
  "feedback": ["array of validation messages"],  // optional
  "code": "ERROR_CODE"                           // optional
}
```

Standard HTTP status codes:
- `400` — Bad request / validation failure
- `401` — Unauthenticated
- `403` — Forbidden (wrong role or organization)
- `404` — Resource not found
- `429` — Rate limit exceeded
- `500` — Internal server error
