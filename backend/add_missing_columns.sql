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

-- Add foreign key constraint for category_id if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'inventory_items_category_id_fkey'
        AND table_name = 'inventory_items'
    ) THEN
        ALTER TABLE inventory_items 
        ADD CONSTRAINT inventory_items_category_id_fkey 
        FOREIGN KEY (category_id) REFERENCES inventory_categories(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Check final columns
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;
