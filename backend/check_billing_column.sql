-- Check the actual column name in subscriptions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
AND column_name ILIKE '%billing%';
