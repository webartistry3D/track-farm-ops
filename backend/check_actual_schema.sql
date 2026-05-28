-- Get the actual database schema for inventory tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('inventory_items', 'inventory_categories') 
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
