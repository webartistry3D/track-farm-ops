-- Fix organization column mismatch
-- This will safely migrate from 'organization' TEXT to 'organization_id' Int

-- Step 1: Add the organization_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'organization_id'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "organization_id" INTEGER;
    END IF;
END $$;

-- Step 2: Create organization table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'organizations'
    ) THEN
        CREATE TABLE "organizations" (
            "id" SERIAL PRIMARY KEY,
            "name" TEXT NOT NULL DEFAULT 'default',
            "description" TEXT,
            "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Insert default organization
        INSERT INTO "organizations" (name, description) 
        VALUES ('default', 'Default organization');
    END IF;
END $$;

-- Step 3: Migrate data from organization TEXT to organization_id
UPDATE "users" 
SET "organization_id" = (
    SELECT id FROM "organizations" WHERE "name" = COALESCE("organization", 'default')
) 
WHERE "organization_id" IS NULL AND "organization" IS NOT NULL;

-- Step 4: Set default organization for users without one
UPDATE "users" 
SET "organization_id" = (SELECT id FROM "organizations" WHERE "name" = 'default')
WHERE "organization_id" IS NULL;

-- Step 5: Drop the old organization column (optional, after confirming migration)
-- ALTER TABLE "users" DROP COLUMN "organization";

-- Step 6: Add foreign key constraint
ALTER TABLE "users" 
ADD CONSTRAINT "users_organization_id_fkey" 
FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE;

-- Step 7: Create index for performance
CREATE INDEX IF NOT EXISTS "idx_users_organization_id" ON "users"("organization_id");
