# Multi-Tenancy

## Design

TrackFarmOps is a **shared-database, shared-schema** multi-tenant application. All tenants (organizations) share the same PostgreSQL database and tables. Tenant isolation is enforced entirely in the application layer via `organization_id` scoping on every query.

This approach is chosen for simplicity and cost efficiency at MVP scale. Upgrading to row-level security at the PostgreSQL level is a viable future improvement.

---

## Tenant Boundary

The `Organization` model is the tenant root. Every resource belongs to an organization:

```
Organization (tenant)
├── Users
├── IncomeEntries
├── ExpenseEntries
├── InventoryItems + Categories
├── Assets + EquipmentStatus
├── Invoices (via User → Organization)
├── Subscriptions
├── Crops, FieldActivities, SoilAnalyses
├── IrrigationSchedules, PestControl
├── Livestock + HealthRecords + Vaccinations
├── CctvCameras
├── VatRecords
└── Notifications (via User)
```

All tables have `organization_id` as a foreign key with `onDelete: Cascade`.

---

## Middleware Enforcement

### `requireOrganization` (`backend/src/middleware/rowLevelSecurity.ts`)

Applied to all protected routes that access organizational data:
```typescript
export const requireOrganization = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { organizationId: true }
  });

  if (!user?.organizationId) {
    return res.status(403).json({
      error: 'Access denied. User must be assigned to an organization.',
      code: 'NO_ORGANIZATION'
    });
  }

  req.organizationId = user.organizationId;
  next();
};
```

### `requireRole` (`backend/src/middleware/rowLevelSecurity.ts`)

Applied to routes that require specific roles:
```typescript
export const requireRole = (roles: UserRole[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user!.role as UserRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
```

---

## Query-Level Isolation (`SecureQueryBuilder`)

All data queries must include `organizationId` in the `where` clause. The `SecureQueryBuilder` utility in `rowLevelSecurity.ts` constructs organization-scoped Prisma queries:

```typescript
const builder = new SecureQueryBuilder(organizationId);

// Returns { where: { organizationId } }
const baseQuery = builder.buildBaseQuery();

// Returns { where: { organizationId, ...additionalWhere } }
const filteredQuery = builder.buildQuery({ status: 'active' });
```

This prevents a user from accessing or modifying data belonging to another organization by ensuring `organizationId` is always part of the database query.

---

## SUPERUSER Exception

Users with role `SUPERUSER` are not bound to an organization. They have platform-wide access and can view data across all organizations. SUPERUSER routes are isolated under `/super-user/*` and protected by role check middleware.

---

## Organization Creation

An organization is created automatically when a new OWNER signs up:
```typescript
// authController.ts
const organization = await prisma.organization.create({
  data: { name: farmName, description: `Organization for ${name}` }
});

const user = await prisma.user.create({
  data: { ..., organizationId: organization.id }
});
```

Auto-seeding of Nigerian Mixed Farm preset inventory runs immediately after organization creation (if the organization has no existing inventory).

---

## Cross-Organization Attack Prevention

1. **Authentication**: JWT must be valid before any data is accessed
2. **Organization check**: `requireOrganization` ensures the user belongs to an org
3. **Query scoping**: All Prisma queries include `organizationId` in `where`
4. **ID validation**: Routes that take resource IDs (e.g. `/inventory/:id`) verify the resource belongs to the user's organization before operating on it — a user cannot delete another organization's record by guessing an ID
5. **Role check**: `requireRole` prevents privilege escalation within an organization
