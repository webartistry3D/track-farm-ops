-- Check what columns actually exist in inventory_items table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check what columns exist in inventory_categories table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'inventory_categories' 
AND table_schema = 'public'
ORDER BY ordinal_position;
