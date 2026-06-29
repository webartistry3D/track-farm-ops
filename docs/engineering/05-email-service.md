# Email Service

## Overview

Email is sent via SMTP using `nodemailer`. The service is implemented in `backend/src/utils/emailService.ts`. All email operations are **non-blocking** — a failed email never causes an API request to fail.

---

## Configuration

The transporter is created fresh per call using env vars:

```typescript
nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
})
```

| Env Var | Description | Example |
|---|---|---|
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` (TLS) or `465` (SSL) |
| `SMTP_SECURE` | Use SSL (`true`) or TLS (`false`) | `false` |
| `SMTP_USER` | SMTP login username | `you@gmail.com` |
| `SMTP_PASS` | SMTP password or app password | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Display name + address | `TrackFarmOps <you@gmail.com>` |
| `FRONTEND_URL` | Base URL for links in emails | `https://track-farm-ops.onrender.com` |

---

## Transactional Emails

### 1. Password Reset Email
**Trigger:** `POST /api/auth/forgot-password`  
**Function:** `sendPasswordResetEmail(toEmail, toName, resetToken)`

- Subject: `Reset your TrackFarmOps password`
- Contains a reset link: `{FRONTEND_URL}/reset-password?token={resetToken}`
- Token expires in **1 hour**
- After use, token is cleared from the database

### 2. Welcome / Email Verification Email
**Trigger:** Successful account signup (OWNER)  
**Function:** `sendWelcomeEmail(toEmail, toName, verificationToken?)`

- Subject: `Welcome to TrackFarmOps — verify your email`
- When `verificationToken` is provided: contains a verification link
- Verification link: `{FRONTEND_URL}/verify-email?token={verificationToken}`
- After verification: `emailVerified = true`, token cleared

---

## Error Handling

Email failures are caught and logged but do not propagate to the HTTP response:

```typescript
sendWelcomeEmail(email, name, emailToken).catch(err =>
  console.error('Welcome email failed:', (err as Error).message)
);
```

This ensures signup never fails due to a misconfigured SMTP server.

---

## Gmail Setup (Recommended for Production)

1. Enable 2-Factor Authentication on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail"
4. Use the 16-character app password as `SMTP_PASS` (not your account password)
5. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`, `SMTP_SECURE=false`

**Daily send limit:** 500 emails/day on free Gmail. For higher volume, use SendGrid, Mailgun, or AWS SES.

---

## Testing Email Locally

Use [Mailtrap](https://mailtrap.io) for local development:
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=<mailtrap_user>
SMTP_PASS=<mailtrap_pass>
```

All emails sent during development will appear in the Mailtrap inbox without reaching real recipients.
