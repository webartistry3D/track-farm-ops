-- Convert quantity column to decimal to match Prisma schema
ALTER TABLE inventory_items ALTER COLUMN quantity TYPE DECIMAL(10,2) USING quantity::DECIMAL(10,2);
