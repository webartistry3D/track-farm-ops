-- Fix missing tables and columns for superuser endpoints

-- 1. Create missing assets table if it doesn't exist
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    value DECIMAL(10,2),
    purchase_date DATE,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Fix income_entries table - add missing user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income_entries' AND column_name = 'user_id') THEN
        ALTER TABLE income_entries ADD COLUMN user_id INTEGER;
        -- If there are existing records, try to set user_id based on organization_id
        UPDATE income_entries SET user_id = (
            SELECT u.id FROM users u WHERE u.organization_id = income_entries.organization_id LIMIT 1
        ) WHERE user_id IS NULL AND organization_id IS NOT NULL;
    END IF;
END $$;

-- 3. Add foreign key constraint for income_entries.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'income_entries_user_id_fkey' 
        AND table_name = 'income_entries'
    ) THEN
        ALTER TABLE income_entries ADD CONSTRAINT income_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 4. Create missing expense_entries.user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_entries' AND column_name = 'user_id') THEN
        ALTER TABLE expense_entries ADD COLUMN user_id INTEGER;
        -- If there are existing records, try to set user_id based on organization_id
        UPDATE expense_entries SET user_id = (
            SELECT u.id FROM users u WHERE u.organization_id = expense_entries.organization_id LIMIT 1
        ) WHERE user_id IS NULL AND organization_id IS NOT NULL;
    END IF;
END $$;

-- 5. Add foreign key constraint for expense_entries.user_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'expense_entries_user_id_fkey' 
        AND table_name = 'expense_entries'
    ) THEN
        ALTER TABLE expense_entries ADD CONSTRAINT expense_entries_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 6. Create missing inventory_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) DEFAULT 0,
    unit VARCHAR(50),
    category_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create missing inventory_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create missing invoices table if it doesn't exist
CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    due_date DATE,
    paid_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create missing subscriptions table if it doesn't exist
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

-- 10. Insert some sample data if tables are empty
DO $$
BEGIN
    -- Insert sample assets if empty
    IF (SELECT COUNT(*) FROM assets) = 0 THEN
        INSERT INTO assets (name, description, value, purchase_date, organization_id) 
        SELECT 
            'Sample Asset', 
            'Sample asset description', 
            10000.00, 
            CURRENT_DATE - INTERVAL '30 days',
            id 
        FROM organizations LIMIT 1;
    END IF;
    
    -- Insert sample inventory categories if empty
    IF (SELECT COUNT(*) FROM inventory_categories) = 0 THEN
        INSERT INTO inventory_categories (name, description, organization_id) 
        SELECT 
            'General', 
            'General inventory category', 
            id 
        FROM organizations LIMIT 1;
    END IF;
    
    -- Insert sample inventory items if empty
    IF (SELECT COUNT(*) FROM inventory_items) = 0 THEN
        INSERT INTO inventory_items (name, description, quantity, unit, category_id, organization_id) 
        SELECT 
            'Sample Item', 
            'Sample inventory item', 
            100.0, 
            'pieces', 
            (SELECT id FROM inventory_categories LIMIT 1),
            id 
        FROM organizations LIMIT 1;
    END IF;
END $$;
