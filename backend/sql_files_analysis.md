# SQL Files Analysis - Cleanup Recommendations

## **Total SQL Files Found:** 37 files

## **SQL Files Categories:**

### **1. Prisma Migrations (26 files) - KEEP**
These are official Prisma migration files and should NEVER be deleted:
- `prisma/migrations/004_add_password_change_tracking.sql`
- `prisma/migrations/005_add_profile_image_url.sql`
- `prisma/migrations/20260309192104_add_ocr_fields/migration.sql`
- `prisma/migrations/20260309212253_add_income_description/migration.sql`
- `prisma/migrations/20260310215113_add_initial_quantity_to_inventory/migration.sql`
- `prisma/migrations/20260310222322_add_invoice_model/migration.sql`
- `prisma/migrations/20260310234923_track_farm_ops/migration.sql`
- `prisma/migrations/20260311010912_track_farm_ops/migration.sql`
- `prisma/migrations/20260311214350_add_organization_field/migration.sql`
- `prisma/migrations/20260312135408_add_assets_table/migration.sql`
- `prisma/migrations/20260312141916_add_createdby_to_expenses/migration.sql`
- `prisma/migrations/20260312142027_make_createdby_optional/migration.sql`
- `prisma/migrations/20260313120000_add_inventory_categories.sql`
- `prisma/migrations/20260316010000_add_organization_to_assets.sql`
- `prisma/migrations/20260316020000_add_organization_to_income.sql`
- `prisma/migrations/20260316030000_add_organization_to_expenses.sql`
- `prisma/migrations/20260316040000_add_organization_to_subscriptions.sql`
- `prisma/migrations/20260316202305_add_asset_creator_relation/migration.sql`
- `prisma/migrations/20260317194607_add_receipt_image_url/migration.sql`
- `prisma/migrations/20260331030000_add_superuser_role/migration.sql`
- `prisma/migrations/20260408_add_farm_operations/migration.sql`
- `database/inventory_transactions_schema.sql`

### **2. Database Schema Files (3 files) - KEEP**
These are essential for database setup and recreation:
- `create_full_schema.sql` - Complete schema creation (KEEP)
- `correct_seed.sql` - Current seed data (KEEP)
- `restore_basic_data.sql` - Basic data restoration (KEEP)

### **3. Database Reset Files (2 files) - KEEP**
Essential for database management:
- `reset_database.sql` - Database reset (KEEP)
- `reset_db.sql` - Database reset (KEEP)

### **4. Diagnostic/Checking Files (6 files) - DELETE**
These were for debugging and are no longer needed:
- `check_data.sql` - Data checking (DELETE)
- `check_irrigation_columns.sql` - Column checking (DELETE)
- `check_table_columns.sql` - Table checking (DELETE)
- `check_tables.sql` - Table validation (DELETE)
- `check_users_table.sql` - User table checking (DELETE)
- `list_all_tables.sql` - Table listing (DELETE)

### **5. Legacy/Outdated Files (3 files) - DELETE**
These are outdated or superseded:
- `create_basic_tables.sql` - Superseded by create_full_schema.sql (DELETE)
- `drop_farm_tables.sql` - Dangerous table deletion (DELETE)
- `fix_organization_column.sql` - Outdated fix (DELETE)

## **RECOMMENDED CLEANUP:**

### **DELETE THESE 9 FILES:**
```bash
# Diagnostic files (6 files)
rm check_data.sql check_irrigation_columns.sql check_table_columns.sql
rm check_tables.sql check_users_table.sql list_all_tables.sql

# Legacy files (3 files)
rm create_basic_tables.sql drop_farm_tables.sql fix_organization_column.sql
```

### **KEEP THESE 28 FILES:**
- **Prisma Migrations:** 26 files (NEVER delete)
- **Schema Files:** 2 files (essential)
- **Reset Files:** 2 files (essential)

## **FINAL COUNT:**
- **Files to Delete:** 9 files (24% of total)
- **Files to Keep:** 28 files (76% of total)
- **Risk Assessment:** Low (only diagnostic files being deleted)

## **BENEFITS:**
- Remove outdated diagnostic scripts
- Eliminate dangerous table deletion scripts
- Clean up legacy schema files
- Keep all essential Prisma migrations
- Maintain database recreation capabilities
