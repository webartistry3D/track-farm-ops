-- Complete inventory schema with all required columns and tables

-- Add missing columns to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS type TEXT,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS initial_quantity DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS category_id INTEGER,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS supplier TEXT,
ADD COLUMN IF NOT EXISTS purchase_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS minimum_stock DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS price_per_unit DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Create inventory_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    parent_id INTEGER REFERENCES inventory_categories(id) ON DELETE SET NULL,
    is_subcategory BOOLEAN DEFAULT false,
    metadata JSONB,
    organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category_id ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_organization_id ON inventory_items(organization_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_parent_id ON inventory_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_inventory_categories_organization_id ON inventory_categories(organization_id);

-- Add foreign key constraint for category_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inventory_items_category_id_fkey'
    ) THEN
        ALTER TABLE inventory_items 
        ADD CONSTRAINT inventory_items_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create inventory_transactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id SERIAL PRIMARY KEY,
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_change DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    usage_type TEXT DEFAULT 'OTHER',
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_item_id ON inventory_transactions(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user_id ON inventory_transactions(user_id);
