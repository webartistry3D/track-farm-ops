-- Add missing password tracking columns to users table
DO $$ 
BEGIN
    -- Add last_password_change column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_password_change'
    ) THEN
        ALTER TABLE users ADD COLUMN last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;

    -- Add password_changed_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_changed_by'
    ) THEN
        ALTER TABLE users ADD COLUMN password_changed_by INTEGER REFERENCES users(id);
    END IF;

    -- Add password_change_count column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_change_count'
    ) THEN
        ALTER TABLE users ADD COLUMN password_change_count INTEGER DEFAULT 0;
    END IF;

    -- Add requires_password_change column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'requires_password_change'
    ) THEN
        ALTER TABLE users ADD COLUMN requires_password_change BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create password_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS password_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  ip_address INET,
  user_agent TEXT
);

-- Create index if it doesn't exist and the created_at column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'password_history' AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_password_history_user_id_created_at ON password_history(user_id, created_at DESC);
    END IF;
END $$;

-- Create audit_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
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

-- Create indexes for audit_logs if they don't exist
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource);
CREATE INDEX IF NOT EXISTS idx_audit_logs_level ON audit_logs(level);

-- Create field_activities table if it doesn't exist
CREATE TABLE IF NOT EXISTS field_activities (
  id SERIAL PRIMARY KEY,
  worker_name VARCHAR(255) NOT NULL,
  task VARCHAR(255) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration FLOAT,
  progress FLOAT DEFAULT 0,
  priority VARCHAR(50) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  status VARCHAR(50) DEFAULT 'IN_PROGRESS' CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED')),
  zone VARCHAR(255),
  field VARCHAR(255),
  notes TEXT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create soil_analyses table if it doesn't exist
CREATE TABLE IF NOT EXISTS soil_analyses (
  id SERIAL PRIMARY KEY,
  zone VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  sample_date TIMESTAMP NOT NULL,
  moisture_level FLOAT NOT NULL,
  ph_level FLOAT NOT NULL,
  nitrogen_level FLOAT NOT NULL,
  phosphorus_level FLOAT NOT NULL,
  potassium_level FLOAT NOT NULL,
  organic_matter FLOAT NOT NULL,
  texture VARCHAR(255),
  recommendation TEXT,
  treatment_type VARCHAR(255),
  treatment_date TIMESTAMP,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create irrigation_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS irrigation_schedules (
  id SERIAL PRIMARY KEY,
  zone VARCHAR(255) NOT NULL,
  field VARCHAR(255),
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration FLOAT NOT NULL,
  water_amount FLOAT NOT NULL,
  frequency VARCHAR(255) NOT NULL,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  status VARCHAR(50) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED')),
  pump_status VARCHAR(255),
  flow_rate FLOAT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create pest_control table if it doesn't exist
CREATE TABLE IF NOT EXISTS pest_control (
  id SERIAL PRIMARY KEY,
  pest_type VARCHAR(255) NOT NULL,
  severity VARCHAR(255) NOT NULL,
  affected_area VARCHAR(255),
  treatment_method VARCHAR(255) NOT NULL,
  application_date TIMESTAMP NOT NULL,
  follow_up_date TIMESTAMP,
  threat_level VARCHAR(255) DEFAULT 'LOW',
  treatment_efficacy FLOAT DEFAULT 0,
  next_spray TIMESTAMP,
  last_check TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chemicals_used JSONB,
  cost FLOAT,
  notes TEXT,
  organization_id INTEGER NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create function to update password change count if it doesn't exist
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

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS trigger_password_change_count ON password_history;
CREATE TRIGGER trigger_password_change_count
    AFTER INSERT ON password_history
    FOR EACH ROW
    EXECUTE FUNCTION increment_password_change_count();
