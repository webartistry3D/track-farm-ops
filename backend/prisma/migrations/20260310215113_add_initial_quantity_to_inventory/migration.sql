-- AlterTable
ALTER TABLE "income_entries" ADD COLUMN     "enable_vat" BOOLEAN DEFAULT false,
ADD COLUMN     "quantity" DECIMAL(10,2),
ADD COLUMN     "subtotal" DECIMAL(10,2),
ADD COLUMN     "unit_price" DECIMAL(10,2),
ADD COLUMN     "vat_amount" DECIMAL(10,2),
ADD COLUMN     "vat_rate" DECIMAL(5,2) DEFAULT 7.5;

-- AlterTable
ALTER TABLE "inventory_items" ADD COLUMN     "initial_quantity" DECIMAL(10,2);
