-- Check what inventory tables actually exist
SELECT table_name FROM information_schema.tables WHERE table_name LIKE 'inventory_%' AND table_schema = 'public' ORDER BY table_name;

-- Check inventory_items columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default,
    numeric_precision,
    numeric_scale
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check inventory_categories columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check inventory_transactions columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'inventory_transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;
