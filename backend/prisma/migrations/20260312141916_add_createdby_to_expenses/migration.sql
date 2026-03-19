-- Step 1: Add the column as nullable first
ALTER TABLE "expense_entries" ADD COLUMN "created_by" INTEGER;

-- Step 2: Update existing records to have proper createdBy values
-- Set createdBy to userId for existing records (temporary fix)
UPDATE "expense_entries" SET "created_by" = "user_id";

-- Step 3: Now make the column required
ALTER TABLE "expense_entries" ALTER COLUMN "created_by" SET NOT NULL;
