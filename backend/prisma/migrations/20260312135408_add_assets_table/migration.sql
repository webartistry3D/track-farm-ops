/*
  Warnings:

  - You are about to drop the column `organization` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "organization";

-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "purchase_date" TIMESTAMP(3),
    "supplier" TEXT,
    "cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "warranty_period" TEXT,
    "expected_lifespan" INTEGER NOT NULL DEFAULT 10,
    "depreciation_method" TEXT NOT NULL DEFAULT 'straight_line',
    "currentCondition" TEXT NOT NULL DEFAULT 'good',
    "location" TEXT NOT NULL,
    "assigned_worker" TEXT,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "model" TEXT,
    "serial_number" TEXT,
    "power_rating" TEXT,
    "capacity" TEXT,
    "fuel_type" TEXT,
    "maintenance_interval" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
