# manual-bank-transfer-payment-architecture.md

# TrackFarmOps
## Manual Bank Transfer Payment Architecture
Version: 2.0
Status: Corrected for Implementation
Priority: HIGH

---

# Objective

Implement Manual Bank Transfer as the PRIMARY subscription payment method.

The existing Paystack integration SHALL remain operational as a SECONDARY payment option.

The system must support:

- Manual bank transfers
- Superuser verification workflow
- Automatic subscription activation after approval
- Complete audit trail
- Fraud prevention
- Future migration to automated bank verification without requiring major architectural changes.

---

# Codebase Alignment Notes (v2.0)

The following corrections are required to align this architecture with the current project codebase before implementation.

## Plans and Pricing

Current frontend plan IDs and prices (from `frontend/src/components/Settings.tsx`):

- `starter` — Starter — ₦10,000/month
- `growth` — Growth — ₦39,000/month
- `pro` — Mega — ₦99,000/month

Current backend valid plan IDs (from `backend/src/controllers/subscriptionController.ts`):

- `starter`, `growth`, `pro`

Current backend prices are inconsistent with the frontend:

- Starter: ₦15,000 / ₦135,000 (backend) vs ₦10,000 / ₦96,000 (frontend implied 20% annual discount)
- Growth: ₦40,000 / ₦360,000 (backend) vs ₦39,000 / ₦374,400 (frontend)
- Pro: ₦100,000 / ₦900,000 (backend) vs ₦99,000 / ₦950,400 (frontend)

**Correction:** Backend prices must be updated to match the frontend before launch.

## Database

The `PaymentRequest` model described in this document does not exist in the current Prisma schema. The schema only contains `Subscription` (with no `paymentMethod` field). Implementing this architecture requires:

1. Adding a new `PaymentRequest` model.
2. Adding a `paymentMethod` field to `Subscription` (values: `BANK_TRANSFER`, `PAYSTACK`).
3. Creating a persisted `SubscriptionAuditLog` table (current logger stores logs in-memory only).

## API Routes

Existing subscription routes are mounted at `/api/subscription` (`backend/src/routes/subscription.ts`). The proposed `/api/payments/manual/...` routes should be implemented as new routes under `/api/payments` or integrated into the existing `/api/subscription` namespace to avoid duplication.

## Subscription Statuses

Current code uses: `active`, `trial`, `pending`, `cancelled`.
The document lists: `INACTIVE`, `PENDING_PAYMENT`, `ACTIVE`, `EXPIRED`, `SUSPENDED`, `CANCELLED`.

**Correction:** The implementation should reuse the existing status values and add `PENDING_PAYMENT` and `EXPIRED` where needed. The schema stores status as a plain `String`, so adding new values is possible without a migration beyond the data layer.

## Paystack Keys

Paystack public and secret keys are hardcoded in `frontend/src/components/Settings.tsx` and `backend/src/controllers/subscriptionController.ts`. These must be moved to environment variables before production.

## System Roles

The system only has the following roles (as defined in the codebase):

- `SUPERUSER` — System-wide administrator. The only role that can review and approve/reject manual bank transfer payments.
- `OWNER` — Organization owner. Can create subscriptions and initiate payments, but cannot approve their own payments.
- `MANAGER` — Can create subscriptions and initiate payments.
- `ACCOUNTANT` — Can view financial records, but payment initiation is restricted by role.
- `INVENTORY` — Inventory-focused role.
- `VETERINARIAN` — Livestock health-focused role.
- `WORKER` — General worker role.

**Correction:** All references to "Admin" in this document mean the `SUPERUSER` role. Payment review endpoints must be protected by `SUPERUSER` authorization, not a generic admin role.

---

# Payment Priority

Primary
--------
Manual Bank Transfer

Secondary
----------
Paystack

Future
------
Monnify
Flutterwave
Direct Bank API

The payment system SHALL use a provider abstraction layer.

Never hardcode payment providers into business logic.

---

# Subscription Flow

User

↓

Subscription Page

↓

Choose Plan

↓

Create Subscription (status = `pending_payment`)

↓

Payment Modal

↓

Display Bank Details

↓

User Transfers Money

↓

Click

"I've Sent the Money"

↓

Create PaymentRequest (status = `UNDER_REVIEW`)

↓

Link PaymentRequest to Subscription

↓

Superuser Notification

↓

Superuser Reviews Payment

↓

Approve
or
Reject

↓

If Approved

PaymentRequest status = `APPROVED`

Subscription status = `active`

Expiry date calculated

↓

Receipt Generated

↓

Notification Sent

---

# Payment Modal

Display

Account Name (from env: `BANK_ACCOUNT_NAME`)

Account Number (from env: `BANK_ACCOUNT_NUMBER`)

Bank Name (from env: `BANK_NAME`)

Subscription Plan

Subscription Amount

Billing Cycle

Unique Payment Reference

Transfer Instructions

"I've Sent the Money"

Cancel

---

# Example

Bank

Providus Bank

Account Name

WebArtistry Creations

Account Number

1234567890

Plan

Growth

Amount

₦39,000

Duration

Monthly

Reference

TFO-GR-20260702-X8D2Q

Plan ID (code)

growth

---

# Payment Reference

Generate automatically.

Format

TFO-{PLAN}-{DATE}-{RANDOM}

Examples

TFO-ST-20260702-93HDQ

TFO-GR-20260702-A7JKS

TFO-MG-20260702-Q71FD

Reference MUST be unique.

Database index required.

---

# Database

## Existing Model (Current Schema)

`Subscription` (from `backend/prisma/schema.prisma`)

- id
- userId
- organizationId
- plan (String)
- status (String)
- billingCycle (String)
- price (Decimal)
- paystackReference (String?)
- expiresAt (DateTime?)
- activatedAt (DateTime?)
- cancelledAt (DateTime?)
- createdAt
- updatedAt

## Required New Model

`PaymentRequest`

- id
- userId
- organizationId
- subscriptionId (nullable, links to Subscription once created)
- planId (String)
- billingCycle (String)
- paymentReference (String, unique)
- amount (Decimal)
- currency (default: NGN)
- paymentMethod (BANK_TRANSFER | PAYSTACK)
- status (PENDING | UNDER_REVIEW | APPROVED | REJECTED | EXPIRED)
- submittedAt (DateTime?)
- reviewedAt (DateTime?)
- reviewedBy (Int?)
- reviewerNote (String?)
- paymentRequestExpiresAt (DateTime?)
- createdAt
- updatedAt

## Required Schema Changes

1. Add `paymentMethod String?` to `Subscription` model.
2. Add `PaymentRequest` model as shown above.
3. Create a new `SubscriptionAuditLog` table for persisted audit history (replace in-memory logger).

---

# Subscription Status

Values currently used in the codebase:

- `active`
- `trial`
- `pending`
- `cancelled`

Values to add for this architecture:

- `pending_payment` — subscription created but no payment submitted yet
- `expired` — subscription past `expiresAt`

Recommended combined status set:

- `trial`
- `pending_payment`
- `active`
- `expired`
- `cancelled`

Note: `pending` currently exists in the code. Replace it with `pending_payment` to be explicit, or keep both and update the flow logic accordingly.

---

# User Flow

Select Plan

↓

Payment Modal

↓

Transfer Funds

↓

Click

I've Sent the Money

↓

Create PaymentRequest

↓

Subscription

PENDING_PAYMENT

↓

Show

Payment Awaiting Verification

Estimated Verification Time

---

# User Restrictions

While pending

User CANNOT

Access premium modules

Renew another subscription

Create duplicate payment request

Spam payment submissions

Maximum pending request

1

---

# Superuser Dashboard

New Section

Payments

Tabs

Pending

Approved

Rejected

Expired

Search

User

Reference

Plan

Amount

Date

Status

---

# Payment Details Page

User Information

Subscription

Reference

Amount

Date Submitted

Proof Upload (Future)

Transaction Notes

Approve Button

Reject Button

Superuser Note

---

# Approval Logic

IF

Approve

THEN

Payment Status

APPROVED

Subscription

`active`

Activation Date

Today

Expiry Date

Calculated automatically from billingCycle

paymentMethod set to `BANK_TRANSFER`

Invoice Generated

Notification Sent

Audit Log Created

---

# Rejection Logic

IF

Reject

THEN

Payment Status

REJECTED

Subscription

`cancelled`

Superuser Note Required

Notification Sent

---

# Notifications

User submits payment

↓

Superuser notified

Superuser approves

↓

User notified

Subscription activated

Superuser rejects

↓

User notified

Reason displayed

---

# Notification Channels

In-app

Email

Future

SMS

Push Notifications

WhatsApp

---

# Fraud Prevention

Only one pending payment request per user/organization (enforced via `PaymentRequest` table query)

Unique payment reference (database unique index on `paymentReference`)

Duplicate reference detection before insert

Superuser audit logs

Immutable approval history

Timestamp every action

Store reviewer ID

Never permanently delete payment records

Soft delete only

---

# Security

CSRF protection

Rate limiting

Authentication required

Authorization checks

Superuser role required

Parameterized SQL (Prisma handles this)

Server-side validation

Amount verification against plan price

Reference uniqueness

Audit trail persisted in database

Bank account details and Paystack keys stored in environment variables, never in code

Soft delete only for payment records

---

# Audit Log

Audit logs MUST be persisted in the database, not in memory. The current `SubscriptionAuditLogger` stores logs in an in-memory array; this must be replaced with a database table.

Store

Action

Actor

Timestamp

Old Value

New Value

IP Address

Device

User Agent

Endpoint

---

# API

## Existing Routes (Do not duplicate)

Mounted at `/api/subscription` (`backend/src/routes/subscription.ts`)

- `GET /api/subscription/current` — get current subscription
- `POST /api/subscription/create` — create subscription (currently sets status to `pending`)
- `POST /api/subscription/verify` — verify Paystack payment and activate subscription
- `POST /api/subscription/cancel` — cancel subscription
- `PUT /api/subscription/update` — update subscription plan

## New Routes Required

Recommended to mount at `/api/payments` via a new `backend/src/routes/payments.ts` file.

- `POST /api/payments/manual/initiate`
  - Creates a `PaymentRequest` in `PENDING` status.
  - Returns: reference, bank details, expiry.

- `POST /api/payments/manual/submit`
  - Triggered by user clicking "I've Sent the Money".
  - Updates `PaymentRequest` status to `UNDER_REVIEW`.
  - Updates linked `Subscription` status to `pending_payment`.

- `GET /api/payments/history`
  - Returns payment history for the authenticated user/organization.

- `GET /api/superuser/payments`
  - Returns pending payments for superuser review (SUPERUSER role required).

- `PATCH /api/superuser/payments/:id/approve`
  - Approves payment and activates subscription.

- `PATCH /api/superuser/payments/:id/reject`
  - Rejects payment and cancels subscription.

## Route Mounting

### User-facing payment routes

Create `backend/src/routes/payments.ts` and add to `backend/src/index.ts`:

```ts
import paymentRoutes from './routes/payments';
// ...
app.use('/api/payments', paymentRoutes);
```

### Superuser review routes

Add the review endpoints directly to the existing `backend/src/routes/superuser.ts` file, which already enforces `SUPERUSER` role middleware. This keeps the superuser namespace consistent and avoids duplicating authorization checks.

```ts
// In backend/src/routes/superuser.ts
router.get('/payments', getPendingPayments);
router.patch('/payments/:id/approve', approvePayment);
router.patch('/payments/:id/reject', rejectPayment);
```

---

# Existing Paystack

DO NOT REMOVE.

Rename UI

Instead of

Pay with Paystack

Display

Instant Payment (Paystack)

Bank Transfer

Display

Recommended

Users may choose either option.

---

# UI

## Subscription Cards (Frontend)

Plan IDs used in code:

- `starter` — Starter — ₦10,000/month
- `growth` — Growth — ₦39,000/month
- `pro` — Mega — ₦99,000/month

## Buttons

- Primary: **Pay via Bank Transfer (Recommended)**
- Secondary: **Instant Payment (Paystack)**

## Required Frontend Changes

1. Update `frontend/src/components/Settings.tsx` to show both payment options on subscription cards.
2. Add a bank transfer modal component that displays account details and the generated reference.
3. Add a "Payment Pending" state view after the user submits "I've Sent the Money".
4. Add a superuser payment review UI to `frontend/src/components/SuperUserDashboard.tsx` (or a new `PaymentsSuperuser.tsx` component).

---

# Future Ready

Architecture MUST support

Monnify

Flutterwave

Bank APIs

Virtual Accounts

Automatic Verification

Webhook Processing

Without database redesign.

---

# Engineering Implementation Notes

## Transaction Safety

Approve and reject operations MUST update both the `PaymentRequest` and the linked `Subscription` in a single Prisma transaction (`prisma.$transaction`). If either update fails, the entire operation must roll back to prevent inconsistent state (e.g. payment approved but subscription not activated).

## Self-Approval Prevention

A `SUPERUSER` must NOT be able to approve or reject their own organization's payment request. Enforce this in the controller:

```ts
if (paymentRequest.userId === req.user.id) {
  return res.status(403).json({ error: 'Cannot review your own payment request' });
}
```

## Billing Cycle Naming

Use the existing codebase convention:

- `monthly` for monthly billing
- `annual` for yearly billing (do NOT use `yearly` — the backend uses `annual`)

The `SuperUserDashboard.tsx` currently references `yearly` in some places; align all code to `annual`.

## Enum vs String

`PaymentRequest.status` and `Subscription.paymentMethod` should be implemented as Prisma enums for type safety, not plain strings. Example:

```prisma
enum PaymentStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  EXPIRED
}

enum PaymentMethod {
  BANK_TRANSFER
  PAYSTACK
}
```

If plain strings are used, document the allowed values and enforce them in server-side validation.

## Expiry Calculation

### Subscription expiry

- `monthly`: `expiresAt = activatedAt + 1 month`
- `annual`: `expiresAt = activatedAt + 1 year`

Use a helper function to avoid off-by-one errors with month boundaries.

### Payment request expiry

A `PaymentRequest` in `PENDING` status (user has not yet clicked "I've Sent the Money") should expire after a configurable window (e.g. 48 hours). After expiry, the linked `Subscription` should remain `cancelled` or `expired`, and the user must start a new payment request. Add a `paymentRequestExpiresAt` field to the `PaymentRequest` model.

## Environment Variables

Add these to `.env.example`:

```env
# Bank transfer details
BANK_NAME=Providus Bank
BANK_ACCOUNT_NAME=WebArtistry Creations
BANK_ACCOUNT_NUMBER=1234567890

# Payment provider keys (move from hardcoded)
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
```

## Frontend Scope

Both payment entry points must support the bank transfer + Paystack options:

- `frontend/src/components/Settings.tsx` (subscription tab)
- `frontend/src/components/Pricing.tsx` (public pricing page CTA)

## Notifications

Reuse the existing notification system (`backend/src/utils/notificationHelper.ts` or equivalent). Notify:

- The superuser when a payment is submitted
- The user (and organization owners) when payment is approved or rejected

## Proof Upload

"Proof Upload" is marked as future. If implemented, store uploads via the existing `StorageService` (`backend/src/services/storageService.ts`) and link by `paymentRequestId`.

## Receipts and Invoices

Receipts and invoices for subscriptions are not currently modeled. For the first iteration, generate a simple receipt view from the `PaymentRequest` + `Subscription` data. A dedicated `Invoice` or `Receipt` table can be added later without breaking the core flow.

## Testing Requirements

Before production deployment, verify:

1. Bank transfer flow: initiate → submit → superuser approve → subscription active.
2. Paystack flow still works end-to-end.
3. Duplicate pending payment request is blocked.
4. Superuser cannot approve their own payment.
5. Frontend and backend pricing match for all plans and billing cycles.
6. Subscription expiry dates are correct.
7. Rate limiting is active on payment endpoints.
8. Notifications are sent at each state change.
9. Audit logs are persisted in the database.

## Migration Steps

1. Update `backend/prisma/schema.prisma`.
2. Run `npx prisma migrate dev --name add_payment_request`.
3. Verify generated migration SQL.
4. Update backend controllers and routes.
5. Update frontend components.
6. Run frontend and backend tests.
7. Deploy backend first (so database is ready).
8. Deploy frontend.

---

# Implementation Checklist

- [ ] Update backend plan prices in `backend/src/controllers/subscriptionController.ts` to match frontend.
- [ ] Move Paystack keys from hardcoded strings to environment variables (`PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`).
- [ ] Add bank account details to environment variables (`BANK_NAME`, `BANK_ACCOUNT_NAME`, `BANK_ACCOUNT_NUMBER`).
- [ ] Add `PaymentRequest` model and `paymentMethod` field to `Subscription` in `backend/prisma/schema.prisma`.
- [ ] Create persisted `SubscriptionAuditLog` table (or extend `PaymentRequest` audit fields).
- [ ] Generate and run Prisma migration.
- [ ] Create `backend/src/routes/payments.ts` with manual bank transfer endpoints.
- [ ] Mount `/api/payments` in `backend/src/index.ts`.
- [ ] Create `backend/src/controllers/paymentController.ts` for initiate, submit, approve, reject, history.
- [ ] Add superuser review endpoints to `backend/src/routes/superuser.ts` (protected by existing SUPERUSER middleware).
- [ ] Update `frontend/src/components/Settings.tsx` subscription cards with bank transfer + Paystack buttons.
- [ ] Add bank transfer modal component.
- [ ] Add "Payment Pending" status view in `Settings.tsx` or dashboard.
- [ ] Add superuser payment review UI in `SuperUserDashboard.tsx` (or `PaymentsSuperuser.tsx`).
- [ ] Add notifications for payment submission, approval, and rejection.
- [ ] Add rate limiting to payment endpoints (re-enable `SubscriptionRateLimiter` or add new limits).
- [ ] Test both payment flows end-to-end.
- [ ] Deploy to production.

# Acceptance Criteria

✓ Manual Bank Transfer is the default payment method.
✓ Paystack remains available as an option.
✓ Payment reference is generated automatically and unique.
✓ Pending verification workflow is functional.
✓ Superuser approval activates the subscription.
✓ Superuser rejection cancels the request/subscription.
✓ Notifications are sent to users and the superuser.
✓ Audit history is persisted in the database.
✓ Duplicate pending payment requests are prevented.
✓ APIs are documented and implemented.
✓ Frontend and backend pricing are consistent.
✓ Production ready.

---

END OF SPECIFICATION