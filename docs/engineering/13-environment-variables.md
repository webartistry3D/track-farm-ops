# Environment Variables

Complete reference for all environment variables. Source of truth is `/.env.example`.

---

## Backend Variables

Set in `backend/.env` locally. Set in the **Render dashboard** for production.

### Core

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `development` or `production` |
| `PORT` | No | `3001` | HTTP port the Express server listens on |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | fallback (dev only) | Secret key for JWT signing. Min 32 chars. Use a randomly generated string in production. |
| `CORS_ORIGIN` | Yes | — | Allowed frontend origin. Production: `https://track-farm-ops.onrender.com` |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Base URL used in email links (reset, verification) |

### Superuser

| Variable | Required | Description |
|---|---|---|
| `SUPERUSER_ADMIN_KEY` | Yes | Secret key required in request body when creating a SUPERUSER account. Never expose this to the frontend. |

### Email (SMTP)

All SMTP variables are required for password reset and email verification emails to send. If not set, email calls will fail silently (logged to console, API response unaffected).

| Variable | Required | Example | Description |
|---|---|---|---|
| `SMTP_HOST` | Yes | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | Yes | `587` | SMTP port. 587 for TLS, 465 for SSL |
| `SMTP_SECURE` | Yes | `false` | `true` = SSL on connect. `false` = STARTTLS (port 587) |
| `SMTP_USER` | Yes | `you@gmail.com` | SMTP authentication username |
| `SMTP_PASS` | Yes | `xxxx xxxx xxxx xxxx` | SMTP password or Gmail App Password |
| `SMTP_FROM` | No | `TrackFarmOps <you@gmail.com>` | From address shown in emails. Falls back to `SMTP_USER` if not set. |

### File Storage (AWS S3)

Required for receipt image uploads and profile images. Optional if these features are not used.

| Variable | Required | Description |
|---|---|---|
| `AWS_S3_BUCKET` | For uploads | S3 bucket name |
| `AWS_REGION` | For uploads | AWS region (e.g. `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | For uploads | IAM access key ID |
| `AWS_SECRET_ACCESS_KEY` | For uploads | IAM secret access key |
| `AWS_ENDPOINT` | No | Custom endpoint for S3-compatible providers (Cloudflare R2, MinIO) |
| `AWS_FORCE_PATH_STYLE` | No | `true` for path-style access (required by some S3-compatible providers) |

### Rate Limiting

| Variable | Default | Description |
|---|---|---|
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | General rate limit window in milliseconds |
| `RATE_LIMIT_MAX_REQUESTS` | `100` | Max requests per window per IP |

### Logging

| Variable | Default | Description |
|---|---|---|
| `LOG_FILE` | `logs/app.log` | Path to log file (if file logging is enabled) |

---

## Frontend Variables

Set in `frontend/.env` locally. Set in the **Render dashboard** (or Vite build config) for production. All frontend variables must be prefixed with `VITE_` to be exposed to the browser.

| Variable | Required | Value | Description |
|---|---|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3001/api` (dev) | Backend API base URL. Production: `https://track-farm-ops-api.onrender.com` |

---

## Security Notes

1. **Never commit `.env` files** to git. `.env` is in `.gitignore`.
2. **`JWT_SECRET`** should be a minimum of 32 random characters. Generate with: `openssl rand -base64 32`
3. **`SUPERUSER_ADMIN_KEY`** should be a strong random string. Treat it like a root password.
4. **`SMTP_PASS`** for Gmail: use an **App Password**, never your Google account password.
5. **`AWS_SECRET_ACCESS_KEY`** — use a least-privilege IAM user with S3-only permissions.
6. The `.env.example` file contains only placeholder values — it is safe to commit.
