-- CreateFarmOperationsTables
-- This migration safely adds new farm operations tables without affecting existing data

-- Create enums for farm operations
CREATE TYPE "CropStatus" AS ENUM ('PLANTED', 'GROWING', 'FLOWERING', 'HARVESTED', 'FAILED');
CREATE TYPE "CropHealth" AS ENUM ('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL');
CREATE TYPE "PestSeverity" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE "PestThreatLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'CRITICAL');
CREATE TYPE "EquipmentStatus" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'RETIRED');
CREATE TYPE "FieldPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "ActivityStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "FieldEfficiency" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Create crops table
CREATE TABLE "crops" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "planting_date" TIMESTAMP(3) NOT NULL,
    "expected_harvest" TIMESTAMP(3) NOT NULL,
    "zone_assignment" TEXT NOT NULL,
    "notes" TEXT,
    "status" "CropStatus" NOT NULL DEFAULT 'PLANTED',
    "health" "CropHealth" NOT NULL DEFAULT 'GOOD',
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- Create soil_analysis table
CREATE TABLE "soil_analysis" (
    "id" SERIAL NOT NULL,
    "moisture_level" DOUBLE PRECISION NOT NULL,
    "ph_level" DOUBLE PRECISION NOT NULL,
    "nitrogen_level" DOUBLE PRECISION NOT NULL,
    "phosphorus_level" DOUBLE PRECISION NOT NULL,
    "potassium_level" DOUBLE PRECISION NOT NULL,
    "zone" TEXT NOT NULL,
    "treatment_type" TEXT,
    "treatment_date" TIMESTAMP(3),
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_analysis_pkey" PRIMARY KEY ("id")
);

-- Create weather_data table
CREATE TABLE "weather_data" (
    "id" SERIAL NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "humidity" DOUBLE PRECISION NOT NULL,
    "wind_speed" DOUBLE PRECISION NOT NULL,
    "rainfall" DOUBLE PRECISION NOT NULL,
    "forecast" TEXT NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weather_data_pkey" PRIMARY KEY ("id")
);

-- Create irrigation_status table
CREATE TABLE "irrigation_status" (
    "id" SERIAL NOT NULL,
    "zone" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "water_amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "active_zones" INTEGER NOT NULL,
    "total_zones" INTEGER NOT NULL,
    "water_usage_today" DOUBLE PRECISION NOT NULL,
    "next_schedule" TIMESTAMP(3),
    "efficiency" DOUBLE PRECISION NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrigation_status_pkey" PRIMARY KEY ("id")
);

-- Create pest_control table
CREATE TABLE "pest_control" (
    "id" SERIAL NOT NULL,
    "pest_type" TEXT NOT NULL,
    "severity" "PestSeverity" NOT NULL,
    "treatment_method" TEXT NOT NULL,
    "application_date" TIMESTAMP(3) NOT NULL,
    "follow_up_date" TIMESTAMP(3),
    "threat_level" "PestThreatLevel" NOT NULL,
    "active_treatments" INTEGER NOT NULL,
    "next_spray" TIMESTAMP(3),
    "treatment_efficacy" DOUBLE PRECISION NOT NULL,
    "last_check" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pest_control_pkey" PRIMARY KEY ("id")
);

-- Create equipment table
CREATE TABLE "equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'OPERATIONAL',
    "utilization" DOUBLE PRECISION NOT NULL,
    "last_service" TIMESTAMP(3),
    "next_service" TIMESTAMP(3),
    "maintenance_count" INTEGER NOT NULL DEFAULT 0,
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- Create field_activity table
CREATE TABLE "field_activity" (
    "id" SERIAL NOT NULL,
    "worker_name" TEXT NOT NULL,
    "assigned_task" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "estimated_duration" INTEGER,
    "priority" "FieldPriority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ActivityStatus" NOT NULL DEFAULT 'PENDING',
    "efficiency" "FieldEfficiency" NOT NULL DEFAULT 'MEDIUM',
    "tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "tasks_total" INTEGER NOT NULL DEFAULT 0,
    "productivity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_activity_pkey" PRIMARY KEY ("id")
);

-- Create foreign key constraints
ALTER TABLE "crops" ADD CONSTRAINT "crops_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "crops" ADD CONSTRAINT "crops_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "soil_analysis" ADD CONSTRAINT "soil_analysis_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "soil_analysis" ADD CONSTRAINT "soil_analysis_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "weather_data" ADD CONSTRAINT "weather_data_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "irrigation_status" ADD CONSTRAINT "irrigation_status_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "irrigation_status" ADD CONSTRAINT "irrigation_status_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pest_control" ADD CONSTRAINT "pest_control_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "pest_control" ADD CONSTRAINT "pest_control_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "equipment" ADD CONSTRAINT "equipment_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "equipment" ADD CONSTRAINT "equipment_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "field_activity" ADD CONSTRAINT "field_activity_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "field_activity" ADD CONSTRAINT "field_activity_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create indexes for better performance
CREATE INDEX "crops_organization_id_idx" ON "crops"("organization_id");

CREATE INDEX "soil_analysis_organization_id_idx" ON "soil_analysis"("organization_id");

CREATE INDEX "weather_data_organization_id_idx" ON "weather_data"("organization_id");

CREATE INDEX "irrigation_status_organization_id_idx" ON "irrigation_status"("organization_id");

CREATE INDEX "pest_control_organization_id_idx" ON "pest_control"("organization_id");

CREATE INDEX "equipment_organization_id_idx" ON "equipment"("organization_id");

CREATE INDEX "field_activity_organization_id_idx" ON "field_activity"("organization_id");
