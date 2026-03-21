-- Check what tables exist
SELECT 'TABLES' as status, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public';

-- List all tables
\dt+

-- Check users table if it exists
SELECT 'USERS_TABLE' as status, COUNT(*) as count FROM information_schema.tables WHERE table_name = 'users';

-- Check if users table has data
SELECT 'USERS_DATA' as status, COUNT(*) as count FROM users;

-- Show user data if exists
SELECT email, role, name FROM users ORDER BY id LIMIT 5;
