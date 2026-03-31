-- Fix specific invoice UCH-000003
-- This script fixes the invoice where subtotal should be 400,000, not 430,000

-- Update the invoice record
UPDATE invoices 
SET 
    subtotal = 400000.00,
    tax = 30000.00,
    total = 430000.00,
    updated_at = NOW()
WHERE invoice_number = 'UCH-000003';

-- Find and update related income entries
-- Note: This assumes the invoice ID is stored in metadata
UPDATE income_entries 
SET 
    amount = 400000.00,
    vat_amount = 30000.00,
    updated_at = NOW()
WHERE metadata->>'invoiceId' IN (
    SELECT id::text FROM invoices WHERE invoice_number = 'UCH-000003'
);

-- Verify the fix
SELECT 
    invoice_number,
    subtotal,
    tax,
    total,
    status
FROM invoices 
WHERE invoice_number = 'UCH-000003';

-- Verify income entries
SELECT 
    id,
    amount,
    vat_amount,
    category,
    created_at
FROM income_entries 
WHERE metadata->>'invoiceId' IN (
    SELECT id::text FROM invoices WHERE invoice_number = 'UCH-000003'
);
