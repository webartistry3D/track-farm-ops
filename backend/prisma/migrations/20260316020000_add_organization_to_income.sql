-- AlterTable
ALTER TABLE "income_entries" ADD COLUMN     "organization_id" INTEGER;

-- AddForeignKey
ALTER TABLE "income_entries" ADD CONSTRAINT "income_entries_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
