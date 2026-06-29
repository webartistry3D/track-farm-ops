# Database Schema

## Overview

The database is PostgreSQL 15, managed by Render. Schema is defined in `backend/prisma/schema.prisma` and managed via Prisma Migrate. All migrations live in `backend/prisma/migrations/` and are applied automatically on deploy via `npx prisma migrate deploy`.

---

## Multi-Tenancy Design

All data is scoped to an `Organization`. Every record that belongs to a farm includes an `organization_id` foreign key with `onDelete: Cascade`. Users are linked to one organization. Cross-organization data access is prevented at the middleware layer (`requireOrganization`) and query layer (`SecureQueryBuilder`).

---

## Models

### User
```
users
├── id                    Int  PK
├── name                  String
├── email                 String  UNIQUE
├── password              String  (bcrypt, 12 rounds)
├── role                  UserRole
├── organization_id       Int?  FK → organizations.id  CASCADE
├── created_by            Int?
├── created_at            DateTime
├── updated_at            DateTime
├── last_password_change  DateTime?
├── password_changed_by   Int?
├── password_change_count Int  default 0
├── requires_password_change Boolean  default false
├── address               String?
├── phone                 String?
├── profile_image_url     String?
├── password_reset_token  String?
├── password_reset_expiry DateTime?
├── email_verified        Boolean  default false
└── email_verification_token String?
```

### Organization
```
organizations
├── id          Int  PK
├── name        String
├── description String?
├── created_at  DateTime
└── updated_at  DateTime
```

### IncomeEntry
```
income_entries
├── id              Int  PK
├── amount          Decimal(10,2)
├── category        String
├── payment_method  PaymentMethod
├── date            DateTime
├── user_id         Int  FK → users.id  CASCADE
├── organization_id Int  FK → organizations.id  CASCADE
├── description     String?  (indexed)
├── enable_vat      Boolean?  default false
├── quantity        Decimal(10,2)?
├── subtotal        Decimal(10,2)?
├── unit_price      Decimal(10,2)?
├── vat_amount      Decimal(10,2)?
├── vat_rate        Decimal(5,2)?  default 7.5
├── created_by      Int?
└── metadata        Json?
```

### ExpenseEntry
```
expense_entries
├── id               Int  PK
├── amount           Decimal(10,2)
├── category         String
├── note             String?
├── date             DateTime
├── user_id          Int  FK → users.id  CASCADE
├── organization_id  Int  FK → organizations.id  CASCADE
├── created_by       Int?
├── merchant         String?  default "Manual Entry"
├── has_receipt      Boolean  default false
├── receipt_image_url String?
├── ocr_confidence   Int?
├── ocr_source       String?
└── raw_text         String?
```

### InventoryItem
```
inventory_items
├── id               Int  PK
├── name             String
├── type             InventoryType
├── unit             String
├── quantity         Decimal(10,2)  default 0
├── initial_quantity Decimal(10,2)?
├── description      String?
├── category_id      Int?  FK → inventory_categories.id
├── organization_id  Int?  FK → organizations.id  CASCADE
├── location         String?
├── supplier         String?
├── purchase_date    DateTime?
├── expiry_date      DateTime?
├── minimum_stock    Decimal(10,2)?
├── price_per_unit   Decimal(10,2)?
└── metadata         Json?
```

### InventoryCategory
```
inventory_categories
├── id              Int  PK
├── name            String
├── description     String?
├── icon            String?
├── color           String?
├── parent_id       Int?  FK → inventory_categories.id  (self-referential)
├── is_subcategory  Boolean  default false
├── organization_id Int?  FK → organizations.id  CASCADE
└── metadata        Json?
```

### InventoryTransaction
```
inventory_transactions
├── id                Int  PK
├── quantity_change   Decimal(10,2)
├── reason            String
├── usage_type        UsageType?
├── cost_per_unit     Decimal(10,2)?
├── total_cost        Decimal(10,2)?
├── related_entity    String?
├── related_entity_id Int?
├── date              DateTime
├── inventory_item_id Int  FK → inventory_items.id  CASCADE
└── user_id           Int  FK → users.id  CASCADE
```

### Invoice
```
invoices
├── id               Int  PK
├── invoice_number   String  UNIQUE
├── client_name      String
├── client_email     String?
├── client_phone     String?
├── client_address   String?
├── business_name    String
├── business_email   String?
├── business_phone   String?
├── business_address String?
├── items            Json
├── subtotal         Decimal(10,2)
├── tax              Decimal(10,2)  default 0
├── total            Decimal(10,2)
├── status           InvoiceStatus  default PENDING
├── payment_method   PaymentMethod?
├── due_date         DateTime?
├── paid_date        DateTime?
├── paid_by          Int?  FK → users.id
├── notes            String?
├── user_id          Int  FK → users.id  CASCADE
└── created_by       Int?
```

### Asset
```
assets
├── id                   Int  PK
├── name                 String
├── description          String?
├── category             String
├── subcategory          String?
├── purchase_date        DateTime?
├── supplier             String?
├── cost                 Decimal(10,2)  default 0
├── warranty_period      String?
├── expected_lifespan    Int  default 10
├── depreciation_method  String  default "straight_line"
├── current_condition    String  default "good"
├── location             String
├── assigned_worker      String?
├── status               String  default "planned"
├── model                String?
├── serial_number        String?
├── power_rating         String?
├── capacity             String?
├── fuel_type            String?
├── maintenance_interval String?
├── organization_id      Int  FK → organizations.id  CASCADE
└── created_by           Int
```

### Subscription
```
subscriptions
├── id                  Int  PK
├── user_id             Int  FK → users.id  CASCADE
├── organization_id     Int  FK → organizations.id  CASCADE
├── plan                String
├── status              String
├── billing_cycle       String
├── price               Decimal(10,2)
├── paystack_reference  String?
├── expires_at          DateTime?
├── activated_at        DateTime?
└── cancelled_at        DateTime?
```

### Farm Operations Models

| Model | Table | Key Fields |
|---|---|---|
| `Crop` | `crops` | name, variety, zone, field, area, yield, status (CropStatus) |
| `EquipmentStatus` | `equipment_status` | equipment_id→assets, status (EquipmentStatusType), fuel_level |
| `FieldActivity` | `field_activities` | worker_name, task, priority (Priority), status (ActivityStatus) |
| `SoilAnalysis` | `soil_analyses` | zone, ph_level, moisture_level, nitrogen/phosphorus/potassium |
| `IrrigationSchedule` | `irrigation_schedules` | zone, duration, water_amount, status (IrrigationStatus) |
| `PestControl` | `pest_control` | pest_type, severity, treatment_method, treatment_efficacy |
| `Livestock` | `livestock` | tag_id UNIQUE, species, breed, gender, health_status |
| `HealthRecord` | `health_records` | livestock_id, record_type, diagnosis, treatment |
| `Vaccination` | `vaccinations` | livestock_id, vaccine_name, next_due_date |
| `CctvCamera` | `cctv_cameras` | name, ip_address, status, recording |
| `Notification` | `notifications` | user_id, type (NotificationType), read |
| `VatRecord` | `vat_records` | period, vat_amount, status (VatStatus) |
| `PasswordHistory` | `password_history` | user_id, hashed_password, changed_at |

---

## Enums

| Enum | Values |
|---|---|
| `UserRole` | SUPERUSER, OWNER, MANAGER, WORKER, ACCOUNTANT, INVENTORY, VETERINARIAN |
| `PaymentMethod` | CASH, TRANSFER |
| `InvoiceStatus` | PENDING, PAID, OVERDUE, CANCELLED |
| `InventoryType` | LIVESTOCK, PRODUCE, CONSUMABLES, SEEDS, FERTILIZERS, PESTICIDES, EQUIPMENT, SUPPLIES, MEDICINE, FEED, OTHER |
| `UsageType` | INITIAL_STOCK, RESTOCK, FEEDING, PLANTING, SALES, WASTE, TRANSFER, ADJUSTMENT, OTHER |
| `CropStatus` | PLANNING, PLANTED, GROWING, MATURE, HARVESTED, FAILED |
| `ActivityStatus` | PLANNED, IN_PROGRESS, COMPLETED, PAUSED, CANCELLED |
| `Priority` | LOW, MEDIUM, HIGH, URGENT |
| `IrrigationStatus` | SCHEDULED, RUNNING, COMPLETED, FAILED, CANCELLED |
| `EquipmentStatusType` | OPERATIONAL, MAINTENANCE, REPAIR, OUT_OF_SERVICE |
| `LivestockSpecies` | CATTLE, SHEEP, GOAT, PIG, POULTRY, HORSE, OTHER |
| `LivestockGender` | MALE, FEMALE |
| `LivestockHealthStatus` | HEALTHY, SICK, QUARANTINE, RECOVERY, CRITICAL |
| `HealthRecordType` | CHECKUP, VACCINATION, TREATMENT, SURGERY, LAB_TEST, OTHER |
| `HealthRecordStatus` | SCHEDULED, COMPLETED, CANCELLED |
| `NotificationType` | INFO, SUCCESS, WARNING, ERROR, LOW_STOCK, INCOME_RECORDED, EXPENSE_RECORDED, SYSTEM_UPDATE |
| `VatStatus` | PENDING, REMITTED, OVERDUE |

---

## Migration Strategy

- Migrations are written as SQL files in `backend/prisma/migrations/<timestamp>_<name>/migration.sql`
- Applied via `npx prisma migrate deploy` (idempotent, safe for CI/CD)
- Run automatically during every Render build via `build-production.js`
- Never use `prisma migrate reset` in production — it drops all data
- Local development: `npx prisma migrate dev --name <name>` (if local DB is in sync)
- If local DB has drift: write migration SQL manually, then `prisma generate` to update the client
