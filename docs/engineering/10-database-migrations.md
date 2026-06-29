# Database Migrations

## Migration Tool

Prisma Migrate. All migration files live in:
```
backend/prisma/migrations/
  <timestamp>_<name>/
    migration.sql
  migration_lock.toml
```

`migration_lock.toml` records the current database provider (postgresql). Do not edit it manually.

---

## Commands

| Command | When to use |
|---|---|
| `npx prisma migrate deploy` | Production / CI — applies pending migrations only, never drops data |
| `npx prisma migrate dev --name <name>` | Local development — creates + applies migration, updates Prisma client |
| `npx prisma migrate dev --create-only --name <name>` | Creates SQL file without applying (useful when local DB has drift) |
| `npx prisma generate` | Regenerate the Prisma client after schema changes (no DB interaction) |
| `npx prisma migrate status` | Show which migrations have been applied on the connected DB |
| `npx prisma migrate reset` | **DESTRUCTIVE — drops all data.** Development only, never production |

---

## Creating a New Migration

### Standard (local DB in sync)
```bash
cd backend
# Edit prisma/schema.prisma
npx prisma migrate dev --name add_my_feature
# This creates the SQL and applies it locally
```

### When Local DB Has Drift
If your local DB schema has diverged from the migration history (common in this project due to historical manual changes), use `--create-only`:

```bash
cd backend
# Edit prisma/schema.prisma
npx prisma migrate dev --create-only --name add_my_feature
# Review the generated SQL in migrations/<timestamp>_add_my_feature/migration.sql
# Manually apply on local DB if needed, or let Render apply it on next deploy
npx prisma generate
```

Alternatively, write the migration SQL manually:
1. Create directory: `backend/prisma/migrations/<YYYYMMDDHHMMSS>_<name>/`
2. Create `migration.sql` with your DDL statements
3. Use `IF NOT EXISTS` / `IF EXISTS` guards to make it idempotent
4. Run `npx prisma generate`

---

## Migration History

| Migration | Description |
|---|---|
| `20260309192104_add_ocr_fields` | OCR fields on expense entries |
| `20260309212253_add_income_description` | description column on income_entries |
| `20260310215113_add_initial_quantity_to_inventory` | initial_quantity on inventory_items |
| `20260310222322_add_invoice_model` | invoices table |
| `20260310234923_track_farm_ops` | Core schema (users, organizations, etc.) |
| `20260311010912_track_farm_ops` | Schema refinements |
| `20260311214350_add_organization_field` | organization fields |
| `20260312135408_add_assets_table` | assets table |
| `20260312141916_add_createdby_to_expenses` | created_by on expenses |
| `20260312142027_make_createdby_optional` | Make created_by nullable |
| `20260313120000_add_inventory_categories` | inventory_categories table |
| `20260316*` | Organization FK on assets, income, expenses, subscriptions |
| `20260316202305_add_asset_creator_relation` | Asset creator FK |
| `20260317194607_add_receipt_image_url` | Receipt image URL on expenses |
| `20260331030000_add_superuser_role` | SUPERUSER enum value |
| `20260408_add_farm_operations` | Farm ops models (crops, livestock, etc.) |
| `20260531223335_fix_missing_schema` | Schema sync fix |
| `20260629000000_add_password_reset_tokens` | password_reset_token + password_reset_expiry on users |
| `20260629000001_add_email_verification` | email_verified + email_verification_token on users |

---

## Production Safety Rules

1. **Never run `prisma migrate reset` in production** — it drops all tables and data
2. **Always use `IF NOT EXISTS`** when writing manual SQL migrations to ensure idempotency
3. **Test migrations on a staging DB** before applying to production
4. **Take a snapshot** of the Render PostgreSQL database before applying any destructive migration
5. **`prisma migrate deploy` is safe** — it only applies unapplied migrations and is a no-op if already current

---

## Prisma Client Regeneration

After any schema change, regenerate the client:
```bash
cd backend && npx prisma generate
```

This updates the TypeScript types in `node_modules/@prisma/client`. Required before running `tsc` after a schema change. On Render, this runs automatically as part of the build script.
