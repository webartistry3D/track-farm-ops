/*
  Warnings:

  - The values [PENDING] on the enum `ActivityStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [FLOWERING] on the enum `CropStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `created_by` on the `crops` table. All the data in the column will be lost.
  - You are about to drop the column `health` on the `crops` table. All the data in the column will be lost.
  - You are about to drop the column `zone_assignment` on the `crops` table. All the data in the column will be lost.
  - You are about to drop the column `active_treatments` on the `pest_control` table. All the data in the column will be lost.
  - You are about to drop the column `created_by` on the `pest_control` table. All the data in the column will be lost.
  - You are about to drop the column `threat_level` on the `pest_control` table. All the data in the column will be lost.
  - You are about to drop the `equipment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `field_activity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `irrigation_status` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `soil_analysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `weather_data` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `zone` to the `crops` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `severity` on the `pest_control` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "VatStatus" AS ENUM ('PENDING', 'REMITTED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "EquipmentStatusType" AS ENUM ('OPERATIONAL', 'MAINTENANCE', 'REPAIR', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "IrrigationStatus" AS ENUM ('SCHEDULED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- AlterEnum
BEGIN;
CREATE TYPE "ActivityStatus_new" AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED');
ALTER TABLE "field_activity" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "field_activities" ALTER COLUMN "status" TYPE "ActivityStatus_new" USING ("status"::text::"ActivityStatus_new");
ALTER TYPE "ActivityStatus" RENAME TO "ActivityStatus_old";
ALTER TYPE "ActivityStatus_new" RENAME TO "ActivityStatus";
DROP TYPE "ActivityStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "CropStatus_new" AS ENUM ('PLANNING', 'PLANTED', 'GROWING', 'MATURE', 'HARVESTED', 'FAILED');
ALTER TABLE "crops" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "crops" ALTER COLUMN "status" TYPE "CropStatus_new" USING ("status"::text::"CropStatus_new");
ALTER TYPE "CropStatus" RENAME TO "CropStatus_old";
ALTER TYPE "CropStatus_new" RENAME TO "CropStatus";
DROP TYPE "CropStatus_old";
ALTER TABLE "crops" ALTER COLUMN "status" SET DEFAULT 'GROWING';
COMMIT;

-- DropForeignKey
ALTER TABLE "crops" DROP CONSTRAINT "crops_created_by_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_created_by_fkey";

-- DropForeignKey
ALTER TABLE "equipment" DROP CONSTRAINT "equipment_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "field_activity" DROP CONSTRAINT "field_activity_created_by_fkey";

-- DropForeignKey
ALTER TABLE "field_activity" DROP CONSTRAINT "field_activity_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "irrigation_status" DROP CONSTRAINT "irrigation_status_created_by_fkey";

-- DropForeignKey
ALTER TABLE "irrigation_status" DROP CONSTRAINT "irrigation_status_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "pest_control" DROP CONSTRAINT "pest_control_created_by_fkey";

-- DropForeignKey
ALTER TABLE "soil_analysis" DROP CONSTRAINT "soil_analysis_created_by_fkey";

-- DropForeignKey
ALTER TABLE "soil_analysis" DROP CONSTRAINT "soil_analysis_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "weather_data" DROP CONSTRAINT "weather_data_organization_id_fkey";

-- DropIndex
DROP INDEX "crops_organization_id_idx";

-- DropIndex
DROP INDEX "pest_control_organization_id_idx";

-- AlterTable
ALTER TABLE "crops" DROP COLUMN "created_by",
DROP COLUMN "health",
DROP COLUMN "zone_assignment",
ADD COLUMN     "actual_harvest" TIMESTAMP(3),
ADD COLUMN     "actual_yield" DOUBLE PRECISION,
ADD COLUMN     "area" DOUBLE PRECISION,
ADD COLUMN     "field" TEXT,
ADD COLUMN     "variety" TEXT,
ADD COLUMN     "yield" DOUBLE PRECISION,
ADD COLUMN     "zone" TEXT NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'GROWING';

-- AlterTable
ALTER TABLE "income_entries" ADD COLUMN     "metadata" JSONB;

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "paid_by" INTEGER;

-- AlterTable
ALTER TABLE "pest_control" DROP COLUMN "active_treatments",
DROP COLUMN "created_by",
DROP COLUMN "threat_level",
ADD COLUMN     "affected_area" TEXT,
ADD COLUMN     "chemicals_used" JSONB,
ADD COLUMN     "cost" DOUBLE PRECISION,
ADD COLUMN     "threatLevel" TEXT NOT NULL DEFAULT 'LOW',
DROP COLUMN "severity",
ADD COLUMN     "severity" TEXT NOT NULL,
ALTER COLUMN "treatment_efficacy" SET DEFAULT 0,
ALTER COLUMN "last_check" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "address" TEXT,
ADD COLUMN     "last_password_change" TIMESTAMP(3),
ADD COLUMN     "password_change_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "password_changed_by" INTEGER,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "profile_image_url" TEXT,
ADD COLUMN     "requires_password_change" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "equipment";

-- DropTable
DROP TABLE "field_activity";

-- DropTable
DROP TABLE "irrigation_status";

-- DropTable
DROP TABLE "soil_analysis";

-- DropTable
DROP TABLE "weather_data";

-- DropEnum
DROP TYPE "CropHealth";

-- DropEnum
DROP TYPE "EquipmentStatus";

-- DropEnum
DROP TYPE "FieldEfficiency";

-- DropEnum
DROP TYPE "FieldPriority";

-- DropEnum
DROP TYPE "PestSeverity";

-- DropEnum
DROP TYPE "PestThreatLevel";

-- CreateTable
CREATE TABLE "vat_records" (
    "id" SERIAL NOT NULL,
    "period" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vatAmount" DECIMAL(10,2) NOT NULL,
    "transactionCount" INTEGER NOT NULL DEFAULT 0,
    "status" "VatStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,

    CONSTRAINT "vat_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_history" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "hashed_password" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by" INTEGER,

    CONSTRAINT "password_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cctv_cameras" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ip_address" TEXT,
    "resolution" TEXT DEFAULT '1080p',
    "status" TEXT NOT NULL DEFAULT 'offline',
    "recording" BOOLEAN NOT NULL DEFAULT false,
    "last_active" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" INTEGER,
    "created_by" INTEGER,

    CONSTRAINT "cctv_cameras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_status" (
    "id" SERIAL NOT NULL,
    "equipment_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" "EquipmentStatusType" NOT NULL DEFAULT 'OPERATIONAL',
    "last_maintenance" TIMESTAMP(3),
    "next_maintenance" TIMESTAMP(3),
    "operating_hours" DOUBLE PRECISION,
    "location" TEXT,
    "assigned_worker" TEXT,
    "fuel_level" DOUBLE PRECISION,
    "condition" TEXT NOT NULL DEFAULT 'good',
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_status_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_activities" (
    "id" SERIAL NOT NULL,
    "worker_name" TEXT NOT NULL,
    "task" TEXT NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration" DOUBLE PRECISION,
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ActivityStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "zone" TEXT,
    "field" TEXT,
    "notes" TEXT,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "field_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "soil_analyses" (
    "id" SERIAL NOT NULL,
    "zone" TEXT NOT NULL,
    "field" TEXT,
    "sample_date" TIMESTAMP(3) NOT NULL,
    "moisture_level" DOUBLE PRECISION NOT NULL,
    "ph_level" DOUBLE PRECISION NOT NULL,
    "nitrogen_level" DOUBLE PRECISION NOT NULL,
    "phosphorus_level" DOUBLE PRECISION NOT NULL,
    "potassium_level" DOUBLE PRECISION NOT NULL,
    "organic_matter" DOUBLE PRECISION NOT NULL,
    "texture" TEXT,
    "recommendation" TEXT,
    "treatment_type" TEXT,
    "treatment_date" TIMESTAMP(3),
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soil_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_schedules" (
    "id" SERIAL NOT NULL,
    "zone" TEXT NOT NULL,
    "field" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "duration" DOUBLE PRECISION NOT NULL,
    "water_amount" DOUBLE PRECISION NOT NULL,
    "frequency" TEXT NOT NULL,
    "last_run" TIMESTAMP(3),
    "next_run" TIMESTAMP(3),
    "status" "IrrigationStatus" NOT NULL DEFAULT 'SCHEDULED',
    "pump_status" TEXT,
    "flow_rate" DOUBLE PRECISION,
    "organization_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrigation_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "income_entries_description_idx" ON "income_entries"("description");

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_paid_by_fkey" FOREIGN KEY ("paid_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_records" ADD CONSTRAINT "vat_records_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_history" ADD CONSTRAINT "password_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cctv_cameras" ADD CONSTRAINT "cctv_cameras_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cctv_cameras" ADD CONSTRAINT "cctv_cameras_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_status" ADD CONSTRAINT "equipment_status_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_status" ADD CONSTRAINT "equipment_status_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_activities" ADD CONSTRAINT "field_activities_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "soil_analyses" ADD CONSTRAINT "soil_analyses_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_schedules" ADD CONSTRAINT "irrigation_schedules_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
