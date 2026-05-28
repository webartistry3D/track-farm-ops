-- COMPREHENSIVE DATABASE SCHEMA FIX SCRIPT
-- This script checks and fixes all missing tables, columns, and enums based on Prisma schema

-- Enable PL/pgSQL for DO blocks
DO $$
BEGIN
    RAISE NOTICE 'Starting comprehensive database schema fix...';
END $$;

-- =====================================================
-- 1. CREATE ALL MISSING ENUMS
-- =====================================================
DO $$
BEGIN
    -- Create UserRole enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "public"."UserRole" AS ENUM ('OWNER', 'MANAGER', 'WORKER', 'SUPERUSER');
        RAISE NOTICE 'Created UserRole enum';
    END IF;
    
    -- Create PaymentMethod enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentMethod') THEN
        CREATE TYPE "public"."PaymentMethod" AS ENUM ('CASH', 'TRANSFER');
        RAISE NOTICE 'Created PaymentMethod enum';
    END IF;
    
    -- Create InvoiceStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InvoiceStatus') THEN
        CREATE TYPE "public"."InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
        RAISE NOTICE 'Created InvoiceStatus enum';
    END IF;
    
    -- Create InventoryType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InventoryType') THEN
        CREATE TYPE "public"."InventoryType" AS ENUM ('LIVESTOCK', 'PRODUCE', 'CONSUMABLES', 'SEEDS', 'FERTILIZERS', 'PESTICIDES', 'EQUIPMENT', 'SUPPLIES', 'MEDICINE', 'FEED', 'OTHER');
        RAISE NOTICE 'Created InventoryType enum';
    END IF;
    
    -- Create VatStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VatStatus') THEN
        CREATE TYPE "public"."VatStatus" AS ENUM ('PENDING', 'REMITTED', 'OVERDUE');
        RAISE NOTICE 'Created VatStatus enum';
    END IF;
    
    -- Create UsageType enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UsageType') THEN
        CREATE TYPE "public"."UsageType" AS ENUM ('INITIAL_STOCK', 'RESTOCK', 'FEEDING', 'PLANTING', 'SALES', 'WASTE', 'TRANSFER', 'ADJUSTMENT', 'OTHER');
        RAISE NOTICE 'Created UsageType enum';
    END IF;
    
    -- Create CropStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CropStatus') THEN
        CREATE TYPE "public"."CropStatus" AS ENUM ('PLANTED', 'GROWING', 'FLOWERING', 'HARVESTED', 'FAILED');
        RAISE NOTICE 'Created CropStatus enum';
    END IF;
    
    -- Create CropHealth enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'CropHealth') THEN
        CREATE TYPE "public"."CropHealth" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL');
        RAISE NOTICE 'Created CropHealth enum';
    END IF;
    
    -- Create PestSeverity enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PestSeverity') THEN
        CREATE TYPE "public"."PestSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
        RAISE NOTICE 'Created PestSeverity enum';
    END IF;
    
    -- Create PestThreatLevel enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PestThreatLevel') THEN
        CREATE TYPE "public"."PestThreatLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
        RAISE NOTICE 'Created PestThreatLevel enum';
    END IF;
    
    -- Create EquipmentStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EquipmentStatus') THEN
        CREATE TYPE "public"."EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED');
        RAISE NOTICE 'Created EquipmentStatus enum';
    END IF;
    
    -- Create FieldPriority enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FieldPriority') THEN
        CREATE TYPE "public"."FieldPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        RAISE NOTICE 'Created FieldPriority enum';
    END IF;
    
    -- Create ActivityStatus enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ActivityStatus') THEN
        CREATE TYPE "public"."ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
        RAISE NOTICE 'Created ActivityStatus enum';
    END IF;
    
    -- Create FieldEfficiency enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FieldEfficiency') THEN
        CREATE TYPE "public"."FieldEfficiency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
        RAISE NOTICE 'Created FieldEfficiency enum';
    END IF;
    
    -- Create WeatherForecast enum
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WeatherForecast') THEN
        CREATE TYPE "public"."WeatherForecast" AS ENUM ('SUNNY', 'CLOUDY', 'RAINY', 'STORMY', 'PARTLY_CLOUDY', 'SNOWY', 'FOGGY');
        RAISE NOTICE 'Created WeatherForecast enum';
    END IF;
END $$;

-- =====================================================
-- 2. CREATE ALL MISSING TABLES
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

-- Inventory categories table
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

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    unit VARCHAR(50) NOT NULL,
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

-- Inventory transactions table
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

-- VAT records table
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

-- Password history table
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
-- 3. FIX MISSING COLUMNS IN EXISTING TABLES
-- =====================================================

-- Fix users table
DO $$
BEGIN
    -- Add missing columns to users table
    ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_by INTEGER;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;
    
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_password_changed_by_fkey' 
        AND table_name = 'users'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_password_changed_by_fkey 
        FOREIGN KEY (password_changed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    RAISE NOTICE 'Fixed users table columns';
END $$;

-- Fix income_entries table
DO $$
BEGIN
    -- Add missing user_id column
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS user_id INTEGER;
    
    -- Set user_id based on organization if null
    UPDATE income_entries SET user_id = (
        SELECT u.id FROM users u WHERE u.organization_id = income_entries.organization_id LIMIT 1
    ) WHERE user_id IS NULL AND organization_id IS NOT NULL;
    
    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'income_entries_user_id_fkey' 
        AND table_name = 'income_entries'
    ) THEN
        ALTER TABLE income_entries ADD CONSTRAINT income_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add other missing columns
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS enable_vat BOOLEAN DEFAULT FALSE;
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2);
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2);
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS vat_amount DECIMAL(10,2);
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS vat_rate DECIMAL(5,2) DEFAULT 7.5;
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS created_by INTEGER;
    ALTER TABLE income_entries ADD COLUMN IF NOT EXISTS metadata JSON;
    
    RAISE NOTICE 'Fixed income_entries table columns';
END $$;

-- Fix expense_entries table
DO $$
BEGIN
    -- Add missing user_id column
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS user_id INTEGER;
    
    -- Set user_id based on organization if null
    UPDATE expense_entries SET user_id = (
        SELECT u.id FROM users u WHERE u.organization_id = expense_entries.organization_id LIMIT 1
    ) WHERE user_id IS NULL AND organization_id IS NOT NULL;
    
    -- Add foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expense_entries_user_id_fkey' 
        AND table_name = 'expense_entries'
    ) THEN
        ALTER TABLE expense_entries ADD CONSTRAINT expense_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Add other missing columns
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS created_by INTEGER;
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS merchant VARCHAR(255) DEFAULT 'Manual Entry';
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS has_receipt BOOLEAN DEFAULT FALSE;
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS receipt_image_url TEXT;
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS ocr_confidence INTEGER;
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS ocr_source VARCHAR(255);
    ALTER TABLE expense_entries ADD COLUMN IF NOT EXISTS raw_text TEXT;
    
    RAISE NOTICE 'Fixed expense_entries table columns';
END $$;

-- =====================================================
-- 4. UPDATE COLUMN TYPES TO MATCH ENUMS
-- =====================================================
DO $$
BEGIN
    -- Update users.role
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'role' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE users ALTER COLUMN role TYPE "public"."UserRole" USING role::"public"."UserRole";
    END IF;
    
    -- Update income_entries.payment_method
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income_entries' AND column_name = 'payment_method' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE income_entries ALTER COLUMN payment_method TYPE "public"."PaymentMethod" USING payment_method::"public"."PaymentMethod";
    END IF;
    
    -- Update invoices.status
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'status' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE invoices ALTER COLUMN status TYPE "public"."InvoiceStatus" USING status::"public"."InvoiceStatus";
    END IF;
    
    -- Update invoices.payment_method
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'payment_method' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE invoices ALTER COLUMN payment_method TYPE "public"."PaymentMethod" USING payment_method::"public"."PaymentMethod";
    END IF;
    
    -- Update inventory_items.type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'type' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE inventory_items ALTER COLUMN type TYPE "public"."InventoryType" USING type::"public"."InventoryType";
    END IF;
    
    -- Update vat_records.status
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vat_records' AND column_name = 'status' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE vat_records ALTER COLUMN status TYPE "public"."VatStatus" USING status::"public"."VatStatus";
    END IF;
    
    -- Update inventory_transactions.usage_type
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'inventory_transactions' AND column_name = 'usage_type' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE inventory_transactions ALTER COLUMN usage_type TYPE "public"."UsageType" USING usage_type::"public"."UsageType";
    END IF;
    
    -- Update farm operation enums
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crops' AND column_name = 'status' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE crops ALTER COLUMN status TYPE "public"."CropStatus" USING status::"public"."CropStatus";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'crops' AND column_name = 'health' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE crops ALTER COLUMN health TYPE "public"."CropHealth" USING health::"public"."CropHealth";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pest_control' AND column_name = 'severity' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE pest_control ALTER COLUMN severity TYPE "public"."PestSeverity" USING severity::"public"."PestSeverity";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pest_control' AND column_name = 'threat_level' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE pest_control ALTER COLUMN threat_level TYPE "public"."PestThreatLevel" USING threat_level::"public"."PestThreatLevel";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipment' AND column_name = 'status' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE equipment ALTER COLUMN status TYPE "public"."EquipmentStatus" USING status::"public"."EquipmentStatus";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_activity' AND column_name = 'priority' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE field_activity ALTER COLUMN priority TYPE "public"."FieldPriority" USING priority::"public"."FieldPriority";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_activity' AND column_name = 'status' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE field_activity ALTER COLUMN status TYPE "public"."ActivityStatus" USING status::"public"."ActivityStatus";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'field_activity' AND column_name = 'efficiency' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE field_activity ALTER COLUMN efficiency TYPE "public"."FieldEfficiency" USING efficiency::"public"."FieldEfficiency";
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weather_data' AND column_name = 'forecast' AND data_type != 'USERDEFINED') THEN
        ALTER TABLE weather_data ALTER COLUMN forecast TYPE "public"."WeatherForecast" USING forecast::"public"."WeatherForecast";
    END IF;
    
    RAISE NOTICE 'Updated column types to match enums';
END $$;

-- =====================================================
-- 5. INSERT SAMPLE DATA IF TABLES ARE EMPTY
-- =====================================================
DO $$
BEGIN
    -- Insert sample assets if empty
    IF (SELECT COUNT(*) FROM assets) = 0 AND (SELECT COUNT(*) FROM organizations) > 0 THEN
        INSERT INTO assets (name, description, category, location, cost, organization_id, created_by) 
        SELECT 
            'Sample Asset', 
            'Sample asset description', 
            'Equipment', 
            'Main Storage',
            10000.00,
            id,
            (SELECT id FROM users LIMIT 1)
        FROM organizations LIMIT 1;
        RAISE NOTICE 'Inserted sample assets';
    END IF;
    
    -- Insert sample inventory categories if empty
    IF (SELECT COUNT(*) FROM inventory_categories) = 0 AND (SELECT COUNT(*) FROM organizations) > 0 THEN
        INSERT INTO inventory_categories (name, description, organization_id) 
        SELECT 
            'General', 
            'General inventory category', 
            id 
        FROM organizations LIMIT 1;
        RAISE NOTICE 'Inserted sample inventory categories';
    END IF;
    
    -- Insert sample inventory items if empty
    IF (SELECT COUNT(*) FROM inventory_items) = 0 AND (SELECT COUNT(*) FROM organizations) > 0 THEN
        INSERT INTO inventory_items (name, type, unit, quantity, category_id, organization_id) 
        SELECT 
            'Sample Item', 
            'SUPPLIES', 
            'pieces', 
            100.0, 
            (SELECT id FROM inventory_categories LIMIT 1),
            id 
        FROM organizations LIMIT 1;
        RAISE NOTICE 'Inserted sample inventory items';
    END IF;
    
    -- Insert sample subscription if empty
    IF (SELECT COUNT(*) FROM subscriptions) = 0 AND (SELECT COUNT(*) FROM users) > 0 AND (SELECT COUNT(*) FROM organizations) > 0 THEN
        INSERT INTO subscriptions (user_id, organization_id, plan, status, billing_cycle, price) 
        SELECT 
            u.id,
            u.organization_id,
            'Basic',
            'active',
            'monthly',
            50000.00
        FROM users u WHERE u.organization_id IS NOT NULL LIMIT 1;
        RAISE NOTICE 'Inserted sample subscription';
    END IF;
END $$;

-- =====================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_income_entries_user_id ON income_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_expense_entries_user_id ON expense_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_organization_id ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);

RAISE NOTICE 'Comprehensive database schema fix completed successfully!';
