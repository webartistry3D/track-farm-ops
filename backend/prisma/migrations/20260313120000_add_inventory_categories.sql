-- Alter InventoryItem table to add categoryId foreign key
ALTER TABLE "inventory_items" 
ADD COLUMN "category_id" INTEGER;

-- Add foreign key constraint
ALTER TABLE "inventory_items" 
ADD CONSTRAINT "inventory_items_category_id_fkey" 
FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create inventory_categories table
CREATE TABLE "inventory_categories" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "parent_id" INTEGER REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    "is_subcategory" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for foreign key
CREATE INDEX "inventory_items_category_id_idx" ON "inventory_items"("category_id");

-- Create index for parent relationship
CREATE INDEX "inventory_categories_parent_id_idx" ON "inventory_categories"("parent_id");
