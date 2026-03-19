-- DropForeignKey
ALTER TABLE "assets" DROP CONSTRAINT "assets_created_by_fkey";

-- AlterTable
ALTER TABLE "expense_entries" ADD COLUMN     "receipt_image_url" TEXT;
