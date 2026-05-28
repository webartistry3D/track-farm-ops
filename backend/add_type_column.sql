-- Add type column if it doesn't exist with proper enum type
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'inventory_items' AND column_name = 'type'
    ) THEN
        ALTER TABLE inventory_items ADD COLUMN type TEXT;
        UPDATE inventory_items SET type = 'CONSUMABLES' WHERE type IS NULL;
    END IF;
END $$;
