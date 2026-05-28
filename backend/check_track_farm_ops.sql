-- Check what tables exist in track_farm_ops database
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Check if inventory_items table exists and its columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory_items' ORDER BY ordinal_position;

-- Check if inventory_categories table exists and its columns  
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory_categories' ORDER BY ordinal_position;
