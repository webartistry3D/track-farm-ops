-- Create complete schema matching Prisma models

-- Drop existing tables
DROP TABLE IF EXISTS field_activity CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS pest_control CASCADE;
DROP TABLE IF EXISTS irrigation_status CASCADE;
DROP TABLE IF EXISTS weather_data CASCADE;
DROP TABLE IF EXISTS soil_analysis CASCADE;
DROP TABLE IF EXISTS crops CASCADE;
DROP TABLE IF EXISTS inventory_items CASCADE;
DROP TABLE IF EXISTS expense_entries CASCADE;
DROP TABLE IF EXISTS income_entries CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Create Organizations
CREATE TABLE organizations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Users with all required columns
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'WORKER',
    organization_id INTEGER REFERENCES organizations(id),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_password_change TIMESTAMP,
    password_changed_by INTEGER,
    password_change_count INTEGER DEFAULT 0,
    requires_password_change BOOLEAN DEFAULT FALSE,
    address TEXT,
    phone TEXT,
    profile_image_url TEXT
);

-- Create Farm Operations Tables
CREATE TABLE crops (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    planting_date TIMESTAMP NOT NULL,
    expected_harvest TIMESTAMP NOT NULL,
    zone_assignment TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PLANTED',
    health TEXT NOT NULL DEFAULT 'GOOD',
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE soil_analysis (
    id SERIAL PRIMARY KEY,
    moisture_level DECIMAL NOT NULL,
    ph_level DECIMAL NOT NULL,
    nitrogen_level DECIMAL NOT NULL,
    phosphorus_level DECIMAL NOT NULL,
    potassium_level DECIMAL NOT NULL,
    zone TEXT NOT NULL,
    treatment_type TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE weather_data (
    id SERIAL PRIMARY KEY,
    temperature DECIMAL NOT NULL,
    humidity DECIMAL NOT NULL,
    wind_speed DECIMAL NOT NULL,
    rainfall DECIMAL NOT NULL,
    forecast TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE irrigation_status (
    id SERIAL PRIMARY KEY,
    zone TEXT NOT NULL,
    duration INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    water_usage DECIMAL NOT NULL,
    efficiency DECIMAL NOT NULL,
    next_schedule TIMESTAMP,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pest_control (
    id SERIAL PRIMARY KEY,
    pest_type TEXT NOT NULL,
    severity TEXT NOT NULL,
    treatment_method TEXT NOT NULL,
    application_date TIMESTAMP NOT NULL,
    follow_up_date TIMESTAMP,
    threat_level TEXT NOT NULL,
    active_treatments INTEGER NOT NULL,
    next_spray TIMESTAMP,
    treatment_efficacy DECIMAL NOT NULL,
    last_check TIMESTAMP NOT NULL,
    notes TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'OPERATIONAL',
    utilization DECIMAL NOT NULL,
    last_service TIMESTAMP,
    next_service TIMESTAMP,
    maintenance_count INTEGER DEFAULT 0,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE field_activity (
    id SERIAL PRIMARY KEY,
    worker_name TEXT NOT NULL,
    assigned_task TEXT NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    status TEXT NOT NULL,
    priority TEXT,
    efficiency TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create other basic tables
CREATE TABLE income_entries (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category TEXT,
    date TIMESTAMP NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE expense_entries (
    id SERIAL PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category TEXT,
    date TIMESTAMP NOT NULL,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    organization_id INTEGER NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
