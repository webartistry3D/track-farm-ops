-- Simple check for inventory tables and key columns
SELECT 'inventory_items table exists' as status FROM information_schema.tables WHERE table_name = 'inventory_items' AND table_schema = 'public';
SELECT 'inventory_categories table exists' as status FROM information_schema.tables WHERE table_name = 'inventory_categories' AND table_schema = 'public';
SELECT 'inventory_transactions table exists' as status FROM information_schema.tables WHERE table_name = 'inventory_transactions' AND table_schema = 'public';

-- Check for key missing columns in inventory_items
SELECT 'initial_quantity column exists' as status FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'initial_quantity' AND table_schema = 'public';
SELECT 'type column exists' as status FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'type' AND table_schema = 'public';
SELECT 'unit column exists' as status FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'unit' AND table_schema = 'public';
SELECT 'category_id column exists' as status FROM information_schema.columns WHERE table_name = 'inventory_items' AND column_name = 'category_id' AND table_schema = 'public';
