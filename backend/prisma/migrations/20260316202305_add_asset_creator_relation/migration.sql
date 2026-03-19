/*
  Warnings:

  - Added the required column `organization_id` to the `assets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `expense_entries` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organization_id` to the `income_entries` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('INITIAL_STOCK', 'RESTOCK', 'FEEDING', 'PLANTING', 'SALES', 'WASTE', 'TRANSFER', 'ADJUSTMENT', 'OTHER');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "InventoryType" ADD VALUE 'SEEDS';
ALTER TYPE "InventoryType" ADD VALUE 'FERTILIZERS';
ALTER TYPE "InventoryType" ADD VALUE 'PESTICIDES';
ALTER TYPE "InventoryType" ADD VALUE 'EQUIPMENT';
ALTER TYPE "InventoryType" ADD VALUE 'SUPPLIES';
ALTER TYPE "InventoryType" ADD VALUE 'MEDICINE';
ALTER TYPE "InventoryType" ADD VALUE 'FEED';
ALTER TYPE "InventoryType" ADD VALUE 'OTHER';

-- AlterTable
ALTER TABLE "assets" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "expense_entries" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "income_entries" ADD COLUMN     "organization_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "category_id" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "location" TEXT,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "minimum_stock" DECIMAL(10,2),
ADD COLUMN     "organization_id" INTEGER,
ADD COLUMN     "price_per_unit" DECIMAL(10,2),
ADD COLUMN     "purchase_date" TIMESTAMP(3),
ADD COLUMN     "supplier" TEXT;

-- AlterTable
ALTER TABLE "inventory_transactions" ADD COLUMN     "cost_per_unit" DECIMAL(10,2),
ADD COLUMN     "related_entity" TEXT,
ADD COLUMN     "related_entity_id" INTEGER,
ADD COLUMN     "total_cost" DECIMAL(10,2),
ADD COLUMN     "usage_type" "UsageType";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "organization_id" INTEGER;

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "parent_id" INTEGER,
    "is_subcategory" BOOLEAN NOT NULL DEFAULT false,
    "organization_id" INTEGER,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "plan" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "billingCycle" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "paystack_reference" TEXT,
    "expires_at" TIMESTAMP(3),
    "activated_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "income_entries" ADD CONSTRAINT "income_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expense_entries" ADD CONSTRAINT "expense_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_categories" ADD CONSTRAINT "inventory_categories_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
