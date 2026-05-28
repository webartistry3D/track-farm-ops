-- Fix missing billingCycle column in subscriptions table

-- Add billingCycle column if it doesn't exist
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS billingCycle VARCHAR(50) DEFAULT 'monthly';

-- Update existing records to have a billing cycle value
UPDATE subscriptions SET billingCycle = 'monthly' WHERE billingCycle IS NULL;

-- Verify the fix
SELECT 
    'billingCycle column fixed' as status,
    COUNT(*) as total_subscriptions,
    COUNT(CASE WHEN billingCycle IS NOT NULL THEN 1 END) as subscriptions_with_billing_cycle
FROM subscriptions;
