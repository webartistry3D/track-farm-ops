-- Safe Migration: Add Farm Operations Tables Only
-- This script adds new tables without affecting existing data
-- Set correct user for database operations
SET ROLE = 'farmops_dev';

-- Crops Management Table
CREATE TABLE IF NOT EXISTS "crops" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "variety" VARCHAR(255),
    "planting_date" TIMESTAMP,
    "expected_harvest" TIMESTAMP,
    "actual_harvest" TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'GROWING',
    "zone" VARCHAR(100),
    "field" VARCHAR(100),
    "area" DECIMAL(10,2),
    "yield" DECIMAL(10,2),
    "actual_yield" DECIMAL(10,2),
    "notes" TEXT,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create CropStatus enum type
DO $$
    CREATE TYPE "CropStatus" AS ENUM ('PLANNING', 'PLANTED', 'GROWING', 'MATURE', 'HARVESTED', 'FAILED');
$$;

-- Equipment Status Table
CREATE TABLE IF NOT EXISTS "equipment_status" (
    "id" SERIAL PRIMARY KEY,
    "equipment_id" INTEGER,
    "name" VARCHAR(255) NOT NULL,
    "type" VARCHAR(100),
    "status" VARCHAR(50) DEFAULT 'OPERATIONAL',
    "last_maintenance" TIMESTAMP,
    "next_maintenance" TIMESTAMP,
    "operating_hours" DECIMAL(10,2),
    "location" VARCHAR(255),
    "assigned_worker" VARCHAR(255),
    "fuel_level" DECIMAL(10,2),
    "condition" VARCHAR(50) DEFAULT 'good',
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("equipment_id") REFERENCES "assets"("id") ON DELETE CASCADE,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create EquipmentStatusType enum type
DO $$
    CREATE TYPE "EquipmentStatusType" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'OUT_OF_SERVICE');
$$;

-- Field Activities Table
CREATE TABLE IF NOT EXISTS "field_activities" (
    "id" SERIAL PRIMARY KEY,
    "worker_name" VARCHAR(255) NOT NULL,
    "task" VARCHAR(255) NOT NULL,
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP,
    "duration" DECIMAL(10,2),
    "progress" DECIMAL(5,2) DEFAULT 0,
    "priority" VARCHAR(20) DEFAULT 'MEDIUM',
    "status" VARCHAR(50) DEFAULT 'IN_PROGRESS',
    "zone" VARCHAR(100),
    "field" VARCHAR(100),
    "notes" TEXT,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create Priority enum type
DO $$
    CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
$$;

-- Create ActivityStatus enum type
DO $$
    CREATE TYPE "ActivityStatus" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED');
$$;

-- Soil Analysis Table
CREATE TABLE IF NOT EXISTS "soil_analyses" (
    "id" SERIAL PRIMARY KEY,
    "zone" VARCHAR(100) NOT NULL,
    "field" VARCHAR(100),
    "sample_date" TIMESTAMP,
    "moisture_level" DECIMAL(10,2),
    "ph_level" DECIMAL(10,2),
    "nitrogen_level" DECIMAL(10,2),
    "phosphorus_level" DECIMAL(10,2),
    "potassium_level" DECIMAL(10,2),
    "organic_matter" DECIMAL(10,2),
    "texture" VARCHAR(100),
    "recommendation" TEXT,
    "treatment_type" VARCHAR(100),
    "treatment_date" TIMESTAMP,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Irrigation Scheduling Table
CREATE TABLE IF NOT EXISTS "irrigation_schedules" (
    "id" SERIAL PRIMARY KEY,
    "zone" VARCHAR(100) NOT NULL,
    "field" VARCHAR(100),
    "start_time" TIMESTAMP NOT NULL,
    "end_time" TIMESTAMP NOT NULL,
    "duration" DECIMAL(10,2) NOT NULL,
    "water_amount" DECIMAL(10,2) NOT NULL,
    "frequency" VARCHAR(100),
    "last_run" TIMESTAMP,
    "next_run" TIMESTAMP,
    "status" VARCHAR(50) DEFAULT 'SCHEDULED',
    "pump_status" VARCHAR(100),
    "flow_rate" DECIMAL(10,2),
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Create IrrigationStatus enum type
DO $$
    CREATE TYPE "IrrigationStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');
$$;

-- Pest Control Management Table
CREATE TABLE IF NOT EXISTS "pest_control" (
    "id" SERIAL PRIMARY KEY,
    "pest_type" VARCHAR(255) NOT NULL,
    "severity" VARCHAR(100),
    "affected_area" VARCHAR(255),
    "treatment_method" VARCHAR(255),
    "application_date" TIMESTAMP,
    "follow_up_date" TIMESTAMP,
    "threat_level" VARCHAR(50) DEFAULT 'LOW',
    "treatment_efficacy" DECIMAL(5,2) DEFAULT 0,
    "next_spray" TIMESTAMP,
    "last_check" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "chemicals_used" JSONB,
    "cost" DECIMAL(10,2),
    "notes" TEXT,
    "organization_id" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
);

-- Add new relation fields to organizations table
ALTER TABLE "organizations" 
ADD COLUMN IF NOT EXISTS "crops" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN IF NOT EXISTS "equipment_status" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN IF NOT EXISTS "field_activities" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN IF NOT EXISTS "soil_analyses" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN IF NOT EXISTS "irrigation_schedules" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
ADD COLUMN IF NOT EXISTS "pest_control" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Add equipment_status relation to assets table
ALTER TABLE "assets" 
ADD COLUMN IF NOT EXISTS "equipment_status" INTEGER[] DEFAULT ARRAY[]::INTEGER[];

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_crops_organization" ON "crops"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_equipment_status_organization" ON "equipment_status"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_field_activities_organization" ON "field_activities"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_soil_analyses_organization" ON "soil_analyses"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_irrigation_schedules_organization" ON "irrigation_schedules"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_pest_control_organization" ON "pest_control"("organization_id");
