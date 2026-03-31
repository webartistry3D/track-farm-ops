-- Add password change tracking to users table
ALTER TABLE users 
ADD COLUMN last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN password_changed_by INTEGER REFERENCES users(id),
ADD COLUMN password_change_count INTEGER DEFAULT 0,
ADD COLUMN requires_password_change BOOLEAN DEFAULT FALSE;

-- Create password history table to prevent reuse
CREATE TABLE password_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  ip_address INET,
  user_agent TEXT
);

-- Create index for performance
CREATE INDEX idx_password_history_user_id_created_at ON password_history(user_id, created_at DESC);

-- Create audit log table for comprehensive logging
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  level VARCHAR(20) NOT NULL CHECK (level IN ('INFO', 'WARNING', 'ERROR', 'SECURITY')),
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE SET NULL,
  user_role VARCHAR(50),
  organization_name VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  resource_id TEXT,
  details JSONB,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT
);

-- Create indexes for audit logs
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX idx_audit_logs_level ON audit_logs(level);

-- Create function to update password change count
CREATE OR REPLACE FUNCTION increment_password_change_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET password_change_count = password_change_count + 1,
        last_password_change = CURRENT_TIMESTAMP
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update password change count
CREATE TRIGGER trigger_password_change_count
    AFTER INSERT ON password_history
    FOR EACH ROW
    EXECUTE FUNCTION increment_password_change_count();

-- Add comment to document the purpose
COMMENT ON TABLE users IS 'User accounts with password change tracking';
COMMENT ON TABLE password_history IS 'History of user passwords to prevent reuse and track changes';
COMMENT ON TABLE audit_logs IS 'Comprehensive audit logging for security and compliance';
