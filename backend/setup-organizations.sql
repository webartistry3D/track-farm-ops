-- Organizational Setup Script for FarmOps
-- This script sets up proper organizational structure

-- Create Organizations (only if they don't exist)
INSERT INTO organizations (name, description, created_at, updated_at) 
SELECT 'Kelechi Farms', 'Kelechi''s Agricultural Organization', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Kelechi Farms');

INSERT INTO organizations (name, description, created_at, updated_at) 
SELECT 'Nnenna Farms', 'Nnenna''s Agricultural Organization', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Nnenna Farms');

-- Update Users with proper organization assignments
-- Kelechi Farms Users
UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Kelechi Farms'),
    role = 'OWNER'
WHERE email = 'keechi@owner.com';

UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Kelechi Farms'),
    role = 'MANAGER',
    created_by = (SELECT id FROM users WHERE email = 'keechi@owner.com')
WHERE email = 'kelechi@manager.com';

UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Kelechi Farms'),
    role = 'WORKER',
    created_by = (SELECT id FROM users WHERE email = 'keechi@owner.com')
WHERE email = 'kelechi@worker.com';

-- Nnenna Farms Users
UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Nnenna Farms'),
    role = 'OWNER'
WHERE email = 'nnenna@owner.com';

UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Nnenna Farms'),
    role = 'MANAGER',
    created_by = (SELECT id FROM users WHERE email = 'nnenna@owner.com')
WHERE email = 'nnenna@manager.com';

UPDATE users 
SET organization_id = (SELECT id FROM organizations WHERE name = 'Nnenna Farms'),
    role = 'WORKER',
    created_by = (SELECT id FROM users WHERE email = 'nnenna@owner.com')
WHERE email = 'nnenna@worker.com';

-- Verify the setup
SELECT 
  o.name as organization_name,
  u.name as user_name,
  u.email as user_email,
  u.role as user_role,
  u.organization_id
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.email IN (
  'keechi@owner.com', 'kelechi@manager.com', 'kelechi@worker.com',
  'nnenna@owner.com', 'nnenna@manager.com', 'nnenna@worker.com'
)
ORDER BY o.name, u.role;
