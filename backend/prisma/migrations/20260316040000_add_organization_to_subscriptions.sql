-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "organization_id" INTEGER;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update existing subscriptions to have organizationId based on user's organization
UPDATE "subscriptions" 
SET "organization_id" = (
  SELECT u."organization_id" 
  FROM "users" u 
  WHERE u."id" = "subscriptions"."user_id"
)
WHERE "organization_id" IS NULL;
