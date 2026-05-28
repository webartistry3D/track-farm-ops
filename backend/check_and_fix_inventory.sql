-- Check and fix inventory_items table structure

-- Add missing columns to inventory_items if they don't exist
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS unit VARCHAR(50) DEFAULT 'pieces';
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2) DEFAULT 0;

-- Insert sample data with correct columns
DO $$
BEGIN
    -- Insert sample inventory items if empty
    IF (SELECT COUNT(*) FROM inventory_items) = 0 AND (SELECT COUNT(*) FROM organizations) > 0 THEN
        INSERT INTO inventory_items (name, quantity, organization_id) 
        SELECT 
            'Sample Item', 
            100.0,
            id 
        FROM organizations LIMIT 1;
        RAISE NOTICE 'Inserted sample inventory items';
    END IF;
END $$;

-- Final verification
SELECT 
    'Database fix completed!' as status,
    (SELECT COUNT(*) FROM assets) as assets_count,
    (SELECT COUNT(*) FROM subscriptions) as subscriptions_count,
    (SELECT COUNT(*) FROM inventory_items) as inventory_items_count,
    (SELECT COUNT(*) FROM organizations) as organizations_count,
    (SELECT COUNT(*) FROM users) as users_count;
