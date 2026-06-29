# Subscription Model

## Overview

TrackFarmOps uses a subscription-based access model. Each organization has a subscription plan that controls access to premium features. Subscriptions are stored in the `subscriptions` table and linked to both a user (owner) and an organization.

---

## Database Schema

```
subscriptions
├── id                  Int  PK
├── user_id             Int  FK → users.id  CASCADE
├── organization_id     Int  FK → organizations.id  CASCADE
├── plan                String        (free | basic | professional | enterprise)
├── status              String        (active | inactive | cancelled | expired)
├── billing_cycle       String        (monthly | annual)
├── price               Decimal(10,2)
├── paystack_reference  String?       (payment provider reference)
├── expires_at          DateTime?
├── activated_at        DateTime?
└── cancelled_at        DateTime?
```

---

## Plans

| Plan | Description |
|---|---|
| `free` | Default plan. Core features only. Limited records. |
| `basic` | Expanded limits. Suitable for small farms. |
| `professional` | Full feature access. Suitable for growing operations. |
| `enterprise` | Unlimited access. Custom pricing. |

Plan-specific feature gating is enforced at the API level by checking the organization's active subscription plan before allowing access to premium routes.

---

## Subscription Lifecycle

```
1. Organization created (signup)
   └── Default subscription: plan=free, status=active

2. User upgrades plan
   └── POST /api/subscriptions/initialize
         ├── Create subscription record
         └── Return payment reference

3. Payment confirmed
   └── POST /api/subscriptions/verify
         ├── Verify payment with Paystack
         ├── Update subscription: status=active, activated_at=now
         └── Set expires_at based on billing_cycle

4. Subscription expires
   └── status=expired → access reverts to free tier behaviour

5. Subscription cancelled
   └── status=cancelled, cancelled_at=now
       Access remains until expires_at, then reverts
```

---

## Access Control

Subscription gating is implemented server-side in route middleware. The middleware:
1. Retrieves the organization's active subscription
2. Checks if the requested feature is available on that plan
3. Returns `403` with a descriptive upgrade message if not

```typescript
if (subscription.plan === 'free' && isPremiumFeature) {
  return res.status(403).json({
    error: 'This feature requires a paid subscription.',
    code: 'SUBSCRIPTION_REQUIRED'
  });
}
```

---

## Payment Provider

**Paystack** is the configured payment provider (Nigerian market). Integration points:
- `POST /api/subscriptions/initialize` — creates a Paystack transaction
- `POST /api/subscriptions/verify` — verifies Paystack payment reference

Paystack keys are stored in env vars (not yet implemented in this MVP — marked as future work).

---

## VAT Records

Nigerian VAT (7.5%) is supported on income entries:
- `enable_vat` flag on income entries
- `vat_rate` defaults to 7.5%
- `vat_amount` calculated: `(amount * vat_rate) / 100`
- VAT records aggregated per period in the `vat_records` table
- `VatStatus`: PENDING → REMITTED / OVERDUE
