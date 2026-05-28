-- COMPREHENSIVE APPLICATION DATABASE SCAN (FIXED)
-- This script scans for all missing tables, columns, and data issues

-- =====================================================
-- STEP 1: CHECK ALL TABLES EXISTENCE
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '=== COMPREHENSIVE DATABASE SCAN STARTING ===';
    
    -- Create a temporary table to store scan results
    CREATE TEMP TABLE IF NOT EXISTS scan_results (
        check_type VARCHAR(100),
        item_name VARCHAR(255),
        status VARCHAR(20),
        details TEXT
    );
    
    -- Clear previous results
    DELETE FROM scan_results;
END $$;

-- Check core tables
DO $$
BEGIN
    -- Check each required table
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'TABLE_CHECK',
        table_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = t.table_name AND table_schema = 'public') 
             THEN 'Table exists' 
             ELSE 'Table is missing - will cause 500 errors' 
        END
    FROM (VALUES 
        ('users'),
        ('organizations'),
        ('income_entries'),
        ('expense_entries'),
        ('subscriptions'),
        ('assets'),
        ('inventory_categories'),
        ('inventory_items'),
        ('inventory_transactions'),
        ('invoices'),
        ('vat_records'),
        ('password_history'),
        ('crops'),
        ('soil_analysis'),
        ('weather_data'),
        ('irrigation_status'),
        ('pest_control'),
        ('equipment'),
        ('field_activity'),
        ('notifications'),
        ('notification_preferences')
    ) AS t(table_name);
    
    RAISE NOTICE 'Table existence check completed';
END $$;

-- =====================================================
-- STEP 2: CHECK CRITICAL COLUMNS IN EXISTING TABLES
-- =====================================================

-- Check users table columns
DO $$
BEGIN
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'COLUMN_CHECK',
        'users.' || column_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = c.column_name) 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = c.column_name) 
             THEN 'Column exists' 
             ELSE 'Column missing - may cause errors' 
        END
    FROM (VALUES 
        ('id'),
        ('name'),
        ('email'),
        ('password'),
        ('role'),
        ('organization_id'),
        ('created_by'),
        ('created_at'),
        ('updated_at'),
        ('last_password_change'),
        ('password_changed_by'),
        ('password_change_count'),
        ('requires_password_change'),
        ('address'),
        ('phone'),
        ('profile_image_url')
    ) AS c(column_name);
    
    RAISE NOTICE 'Users table column check completed';
END $$;

-- Check income_entries table columns
DO $$
BEGIN
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'COLUMN_CHECK',
        'income_entries.' || column_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income_entries' AND column_name = c.column_name) 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'income_entries' AND column_name = c.column_name) 
             THEN 'Column exists' 
             ELSE 'Column missing - subscription endpoint may fail' 
        END
    FROM (VALUES 
        ('id'),
        ('amount'),
        ('category'),
        ('payment_method'),
        ('date'),
        ('created_at'),
        ('updated_at'),
        ('user_id'),
        ('organization_id'),
        ('description'),
        ('enable_vat'),
        ('quantity'),
        ('subtotal'),
        ('unit_price'),
        ('vat_amount'),
        ('vat_rate'),
        ('created_by'),
        ('metadata')
    ) AS c(column_name);
    
    RAISE NOTICE 'Income entries table column check completed';
END $$;

-- Check expense_entries table columns
DO $$
BEGIN
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'COLUMN_CHECK',
        'expense_entries.' || column_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_entries' AND column_name = c.column_name) 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expense_entries' AND column_name = c.column_name) 
             THEN 'Column exists' 
             ELSE 'Column missing - may cause errors' 
        END
    FROM (VALUES 
        ('id'),
        ('amount'),
        ('category'),
        ('note'),
        ('date'),
        ('created_at'),
        ('updated_at'),
        ('user_id'),
        ('organization_id'),
        ('created_by'),
        ('merchant'),
        ('has_receipt'),
        ('receipt_image_url'),
        ('ocr_confidence'),
        ('ocr_source'),
        ('raw_text')
    ) AS c(column_name);
    
    RAISE NOTICE 'Expense entries table column check completed';
END $$;

-- Check subscriptions table columns
DO $$
BEGIN
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'COLUMN_CHECK',
        'subscriptions.' || column_name,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = c.column_name) 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = c.column_name) 
             THEN 'Column exists' 
             ELSE 'Column missing - subscription endpoint will fail' 
        END
    FROM (VALUES 
        ('id'),
        ('user_id'),
        ('organization_id'),
        ('plan'),
        ('status'),
        ('billing_cycle'),
        ('price'),
        ('paystack_reference'),
        ('expires_at'),
        ('activated_at'),
        ('cancelled_at'),
        ('created_at'),
        ('updated_at')
    ) AS c(column_name);
    
    RAISE NOTICE 'Subscriptions table column check completed';
END $$;

-- =====================================================
-- STEP 3: CHECK ENUMS EXISTENCE
-- =====================================================

DO $$
BEGIN
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'ENUM_CHECK',
        enum_name,
        CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = e.enum_name) 
             THEN 'EXISTS' 
             ELSE 'MISSING' 
        END,
        CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = e.enum_name) 
             THEN 'Enum exists' 
             ELSE 'Enum missing - will cause type errors' 
        END
    FROM (VALUES 
        ('UserRole'),
        ('PaymentMethod'),
        ('InvoiceStatus'),
        ('InventoryType'),
        ('VatStatus'),
        ('UsageType'),
        ('CropStatus'),
        ('CropHealth'),
        ('PestSeverity'),
        ('PestThreatLevel'),
        ('EquipmentStatus'),
        ('FieldPriority'),
        ('ActivityStatus'),
        ('FieldEfficiency'),
        ('WeatherForecast'),
        ('NotificationType')
    ) AS e(enum_name);
    
    RAISE NOTICE 'Enum existence check completed';
END $$;

-- =====================================================
-- STEP 4: CHECK DATA INTEGRITY
-- =====================================================

-- Check for orphaned records
DO $$
BEGIN
    -- Users without organizations
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'DATA_INTEGRITY',
        'users_without_organization',
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) = 0 THEN 'All users have organizations' 
             ELSE COUNT(*) || ' users without organizations - may cause access issues' 
        END
    FROM users WHERE organization_id IS NULL;
    
    -- Income entries without users
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'DATA_INTEGRITY',
        'income_entries_without_user',
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) = 0 THEN 'All income entries have users' 
             ELSE COUNT(*) || ' income entries without users - may cause errors' 
        END
    FROM income_entries WHERE user_id IS NULL;
    
    -- Expense entries without users
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'DATA_INTEGRITY',
        'expense_entries_without_user',
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) = 0 THEN 'All expense entries have users' 
             ELSE COUNT(*) || ' expense entries without users - may cause errors' 
        END
    FROM expense_entries WHERE user_id IS NULL;
    
    -- Subscriptions without users
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'DATA_INTEGRITY',
        'subscriptions_without_user',
        CASE WHEN COUNT(*) = 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) = 0 THEN 'All subscriptions have users' 
             ELSE COUNT(*) || ' subscriptions without users - may cause errors' 
        END
    FROM subscriptions WHERE user_id IS NULL;
    
    RAISE NOTICE 'Data integrity check completed';
END $$;

-- =====================================================
-- STEP 5: CHECK FOR CRITICAL DATA
-- =====================================================

DO $$
BEGIN
    -- Check for superuser
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'CRITICAL_DATA',
        'superuser_exists',
        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) > 0 THEN COUNT(*) || ' superuser(s) exist' 
             ELSE 'No superuser exists - superuser dashboard inaccessible' 
        END
    FROM users WHERE role = 'SUPERUSER';
    
    -- Check for organizations
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'CRITICAL_DATA',
        'organizations_exist',
        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'WARNING' END,
        CASE WHEN COUNT(*) > 0 THEN COUNT(*) || ' organization(s) exist' 
             ELSE 'No organizations exist - users cannot be assigned' 
        END
    FROM organizations;
    
    -- Check for active subscriptions
    INSERT INTO scan_results (check_type, item_name, status, details)
    SELECT 
        'CRITICAL_DATA',
        'active_subscriptions',
        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'INFO' END,
        CASE WHEN COUNT(*) > 0 THEN COUNT(*) || ' active subscription(s) exist' 
             ELSE 'No active subscriptions - all users on trial' 
        END
    FROM subscriptions WHERE status = 'active';
    
    RAISE NOTICE 'Critical data check completed';
END $$;

-- =====================================================
-- STEP 6: DISPLAY RESULTS
-- =====================================================

-- Show summary
SELECT 
    'SUMMARY' as check_type,
    'Overall Status' as item_name,
    CASE 
        WHEN COUNT(CASE WHEN status = 'MISSING' THEN 1 END) = 0 THEN 'HEALTHY'
        WHEN COUNT(CASE WHEN status = 'MISSING' THEN 1 END) <= 3 THEN 'MINOR_ISSUES'
        ELSE 'MAJOR_ISSUES'
    END as status,
    COUNT(CASE WHEN status = 'MISSING' THEN 1 END) || ' items need attention' as details
FROM scan_results;

-- Show all missing items
SELECT 
    check_type,
    item_name,
    status,
    details
FROM scan_results 
WHERE status = 'MISSING' 
ORDER BY check_type, item_name;

-- Show warnings
SELECT 
    check_type,
    item_name,
    status,
    details
FROM scan_results 
WHERE status = 'WARNING' 
ORDER BY check_type, item_name;

-- Clean up
DROP TABLE IF EXISTS scan_results;

SELECT 'COMPREHENSIVE DATABASE SCAN COMPLETED' as status;
