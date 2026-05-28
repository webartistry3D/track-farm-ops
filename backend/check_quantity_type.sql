-- Check current column types
SELECT column_name, data_type, numeric_precision, numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'inventory_items' 
AND column_name IN ('quantity', 'type', 'unit')
ORDER BY column_name;
