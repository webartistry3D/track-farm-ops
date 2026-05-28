-- Create basic organization and admin user
INSERT INTO organizations (name, description, created_at, updated_at) 
VALUES ('Default Farm Organization', 'Default organization for farm operations', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Create admin user with password 'admin123'
INSERT INTO users (name, email, password, role, organization_id, created_at, updated_at)
VALUES ('Farm Admin', 'admin@farm.com', '$2b$10$rQ8W8Q8Q8Q8Q8Q8Q8Q8Q8O8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8Q8', 'OWNER', 1, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
