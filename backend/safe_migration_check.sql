-- This script verifies that existing tables are preserved
-- and only new farm operations tables are added

-- Check existing tables (should exist)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'organizations', 'income_entries', 'expense_entries', 'inventory_items');

-- Check new tables (will be added)
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('crops', 'equipment', 'pest_control', 'field_activity', 'soil_analysis', 'weather_data', 'irrigation_status');

-- Check user count (should remain unchanged)
SELECT COUNT(*) as user_count FROM users;
