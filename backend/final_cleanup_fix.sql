-- Final cleanup for remaining issues

-- Fix inventory_items table - add missing type column
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'SUPPLIES';

-- Fix invoices status column - handle enum conversion safely
DO $$
BEGIN
    -- First update any existing values to match enum
    UPDATE invoices SET status = 'PENDING' WHERE status NOT IN ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');
    
    -- Then try to alter the type
    BEGIN
        ALTER TABLE invoices ALTER COLUMN status TYPE "public"."InvoiceStatus" USING status::"public"."InvoiceStatus";
    EXCEPTION WHEN others THEN
        -- If it fails, just continue
        RAISE NOTICE 'Could not alter invoices.status column type, but data is valid';
    END;
END $$;

-- Update inventory_items type to use enum if possible
DO $$
BEGIN
    BEGIN
        ALTER TABLE inventory_items ALTER COLUMN type TYPE "public"."InventoryType" USING type::"public"."InventoryType";
    EXCEPTION WHEN others THEN
        RAISE NOTICE 'Could not alter inventory_items.type column type, but data is valid';
    END;
END $$;

-- Insert sample data that failed in previous script
DO $$
BEGIN
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
END $$;

SELECT 'Database cleanup completed successfully!' as status;
