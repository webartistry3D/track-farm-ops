-- SAFE PRODUCTION DATABASE MIGRATION SCRIPT
-- This script ONLY adds missing tables/columns without deleting any existing data
-- It's designed to be run safely on production databases

-- =====================================================
-- STEP 1: BACKUP CRITICAL DATA BEFORE MAKING CHANGES
-- =====================================================

-- Create backup tables for critical data (if they don't exist)
CREATE TABLE IF NOT EXISTS backup_users AS SELECT * FROM users;
CREATE TABLE IF NOT EXISTS backup_organizations AS SELECT * FROM organizations;
CREATE TABLE IF NOT EXISTS backup_income_entries AS SELECT * FROM income_entries;
CREATE TABLE IF NOT EXISTS backup_expense_entries AS SELECT * FROM expense_entries;

-- =====================================================
-- STEP 2: CREATE MISSING ENUMS (SAFE - won't affect existing data)
-- =====================================================

DO $$
BEGIN
    -- Create missing enums only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "public"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'WORKER', 'SUPERUSER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
        CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
        CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryType') THEN
        CREATE TYPE "public"."InventoryType" AS ENUM ('LIVESTOCK', 'PRODUCE', 'CONSUMABLES', 'SEEDS', 'FERTILIZERS', 'PESTICIDES', 'EQUIPMENT', 'SUPPLIES', 'MEDICINE', 'FEED', 'OTHER');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VatStatus') THEN
        CREATE TYPE "public"."VatStatus" AS ENUM ('PENDING', 'REMITTED', 'OVERDUE');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UsageType') THEN
        CREATE TYPE "public"."UsageType" AS ENUM ('INITIAL_STOCK', 'RESTOCK', 'FEEDING', 'PLANTING', 'SALES', 'WASTE', 'TRANSFER', 'ADJUSTMENT', 'OTHER');
    END IF;
    
    -- Add farm operation enums
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CropStatus') THEN
        CREATE TYPE "public"."CropStatus" AS ENUM ('PLANTED', 'GROWING', 'FLOWERING', 'HARVESTED', 'FAILED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CropHealth') THEN
        CREATE TYPE "public"."CropHealth" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PestSeverity') THEN
        CREATE TYPE "public"."PestSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PestThreatLevel') THEN
        CREATE TYPE "public"."PestThreatLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EquipmentStatus') THEN
        CREATE TYPE "public"."EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FieldPriority') THEN
        CREATE TYPE "public"."FieldPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActivityStatus') THEN
        CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FieldEfficiency') THEN
        CREATE TYPE "public"."FieldEfficiency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WeatherForecast') THEN
        CREATE TYPE "public"."WeatherForecast" AS ENUM ('SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'PARTLY_CLOUDY', 'SNOWY', 'FOGGY');
    END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE MISSING TABLES (SAFE - won't affect existing data)
-- =====================================================

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    purchase_date DATE,
    supplier VARCHAR(255),
    cost DECIMAL(10,2) DEFAULT 0,
    warranty_period VARCHAR(100),
    expected_lifespan INTEGER DEFAULT 10,
    depreciation_method VARCHAR(50) DEFAULT 'straight_line',
    current_condition VARCHAR(50) DEFAULT 'good',
    location VARCHAR(255) NOT NULL,
    assigned_worker VARCHAR(255),
    status VARCHAR(50) DEFAULT 'planned',
    model VARCHAR(100),
    serial_number VARCHAR(100),
    power_rating VARCHAR(100),
    capacity VARCHAR(100),
    fuel_type VARCHAR(100),
    maintenance_interval VARCHAR(100),
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    billing_cycle VARCHAR(50) DEFAULT 'monthly',
    price DECIMAL(10,2) DEFAULT 0,
    paystack_reference VARCHAR(255),
    expires_at TIMESTAMP,
    activated_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inventory tables
CREATE TABLE IF NOT EXISTS inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(50),
    parent_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
    is_subcategory BOOLEAN DEFAULT FALSE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'SUPPLIES',
    unit VARCHAR(50) DEFAULT 'pieces',
    quantity DECIMAL(10,2) DEFAULT 0,
    description TEXT,
    category_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    location VARCHAR(255),
    supplier VARCHAR(255),
    purchase_date DATE,
    expiry_date DATE,
    minimum_stock DECIMAL(10,2),
    price_per_unit DECIMAL(10,2),
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    quantity_change DECIMAL(10,2) NOT NULL,
    reason VARCHAR(255) NOT NULL,
    usage_type VARCHAR(50),
    cost_per_unit DECIMAL(10,2),
    total_cost DECIMAL(10,2),
    related_entity VARCHAR(100),
    related_entity_id INTEGER,
    date DATE NOT NULL,
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255),
    client_phone VARCHAR(50),
    client_address TEXT,
    business_name VARCHAR(255) NOT NULL,
    business_email VARCHAR(255),
    business_phone VARCHAR(50),
    business_address TEXT,
    items JSON NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_method VARCHAR(50),
    due_date DATE,
    paid_date DATE,
    paid_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- VAT and password tables
CREATE TABLE IF NOT EXISTS vat_records (
    id SERIAL PRIMARY KEY,
    period VARCHAR(100) NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    vat_amount DECIMAL(10,2) NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hashed_password VARCHAR(255) NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Farm operations tables
CREATE TABLE IF NOT EXISTS crops (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    planting_date DATE NOT NULL,
    expected_harvest DATE,
    zone_assignment VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'PLANTED',
    health VARCHAR(50) DEFAULT 'GOOD',
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS soil_analysis (
    id SERIAL PRIMARY KEY,
    moisture_level FLOAT,
    ph_level FLOAT,
    nitrogen_level FLOAT,
    phosphorus_level FLOAT,
    potassium_level FLOAT,
    zone VARCHAR(100) NOT NULL,
    treatment_type VARCHAR(100),
    treatment_date DATE,
    notes TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    temperature FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    rainfall FLOAT,
    forecast VARCHAR(50) DEFAULT 'SUNNY',
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS irrigation_status (
    id SERIAL PRIMARY KEY,
    zone VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    water_amount FLOAT,
    frequency VARCHAR(100),
    active_zones INTEGER DEFAULT 0,
    total_zones INTEGER DEFAULT 0,
    water_usage_today FLOAT DEFAULT 0,
    next_schedule TIMESTAMP,
    efficiency FLOAT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pest_control (
    id SERIAL PRIMARY KEY,
    pest_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    treatment_method VARCHAR(255) NOT NULL,
    application_date DATE NOT NULL,
    follow_up_date DATE,
    threat_level VARCHAR(50) DEFAULT 'LOW',
    active_treatments INTEGER DEFAULT 0,
    next_spray DATE,
    treatment_efficacy FLOAT DEFAULT 0,
    last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'OPERATIONAL',
    utilization FLOAT DEFAULT 0,
    last_service DATE,
    next_service DATE,
    maintenance_count INTEGER DEFAULT 0,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS field_activity (
    id SERIAL PRIMARY KEY,
    worker_name VARCHAR(255) NOT NULL,
    assigned_task VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    estimated_duration INTEGER,
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    status VARCHAR(50) DEFAULT 'PENDING',
    efficiency VARCHAR(50) DEFAULT 'MEDIUM',
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    productivity FLOAT DEFAULT 0,
    notes TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- STEP 4: ADD MISSING COLUMNS TO EXISTING TABLES (SAFE)
-- =====================================================

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_by INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add missing columns to income_entries table
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS enable_vat BOOLEAN DEFAULT FALSE;
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2);
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2);
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 7.5;
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS metadata JSON;

-- Add missing columns to expense_entries table
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS created_by INTEGER;
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS merchant VARCHAR(255) DEFAULT 'Manual Entry';
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS has_receipt BOOLEAN DEFAULT FALSE;
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS ocr_confidence INTEGER;
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS ocr_source VARCHAR(255);
ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS raw_text TEXT;

-- Add missing columns to subscriptions table
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billing_cycle VARCHAR(50) DEFAULT 'monthly';

-- =====================================================
-- STEP 5: UPDATE EXISTING DATA (SAFE - only updates NULL values)
-- =====================================================

-- Set user_id for existing income_entries if NULL
UPDATE income_entries SET user_id = (
    SELECT u.id FROM users u WHERE u.organization_id = income_entries.organization_id LIMIT 1
) WHERE user_id IS NULL AND organization_id IS NOT NULL;

-- Set user_id for existing expense_entries if NULL
UPDATE expense_entries SET user_id = (
    SELECT u.id FROM users u WHERE u.organization_id = expense_entries.organization_id LIMIT 1
) WHERE user_id IS NULL AND organization_id IS NOT NULL;

-- Set billing_cycle for existing subscriptions if NULL
UPDATE subscriptions SET billing_cycle = 'monthly' WHERE billing_cycle IS NULL;

-- =====================================================
-- STEP 6: ADD FOREIGN KEY CONSTRAINTS (SAFE - only if they don't exist)
-- =====================================================

DO $$
BEGIN
    -- Add foreign key constraints only if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_password_changed_by_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_password_changed_by_fkey 
        FOREIGN KEY (password_changed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'income_entries_user_id_fkey' 
        AND table_name = 'income_entries'
    ) THEN
        ALTER TABLE income_entries ADD CONSTRAINT income_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expense_entries_user_id_fkey' 
        AND table_name = 'expense_entries'
    ) THEN
        ALTER TABLE expense_entries ADD CONSTRAINT expense_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================
-- STEP 7: VERIFY MIGRATION SUCCESS
-- =====================================================

SELECT 'PRODUCTION MIGRATION COMPLETED SUCCESSFULLY' as status,
       (SELECT COUNT(*) FROM users) as total_users,
       (SELECT COUNT(*) FROM organizations) as total_organizations,
       (SELECT COUNT(*) FROM income_entries) as total_income_entries,
       (SELECT COUNT(*) FROM expense_entries) as total_expense_entries,
       (SELECT COUNT(*) FROM assets) as total_assets,
       (SELECT COUNT(*) FROM subscriptions) as total_subscriptions;
