-- Fix inventory schema by adding missing columns

-- Add initial_quantity column to inventory_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='inventory_items' AND column_name='initial_quantity'
    ) THEN
        ALTER TABLE "inventory_items" ADD COLUMN "initial_quantity" DECIMAL(10,2);
        RAISE NOTICE 'Added initial_quantity column to inventory_items';
    ELSE
        RAISE NOTICE 'initial_quantity column already exists in inventory_items';
    END IF;
END $$;

-- Add category_id column to inventory_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='inventory_items' AND column_name='category_id'
    ) THEN
        ALTER TABLE "inventory_items" ADD COLUMN "category_id" INTEGER;
        
        -- Add foreign key constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name='inventory_items_category_id_fkey'
        ) THEN
            ALTER TABLE "inventory_items" 
            ADD CONSTRAINT "inventory_items_category_id_fkey" 
            FOREIGN KEY ("category_id") REFERENCES "inventory_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
        END IF;
        
        -- Create index if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename='inventory_items' AND indexname='inventory_items_category_id_idx'
        ) THEN
            CREATE INDEX "inventory_items_category_id_idx" ON "inventory_items"("category_id");
        END IF;
        
        RAISE NOTICE 'Added category_id column to inventory_items';
    ELSE
        RAISE NOTICE 'category_id column already exists in inventory_items';
    END IF;
END $$;

-- Create inventory_categories table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name='inventory_categories'
    ) THEN
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
            "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "organization_id" INTEGER REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
        
        -- Create indexes
        CREATE INDEX "inventory_categories_parent_id_idx" ON "inventory_categories"("parent_id");
        CREATE INDEX "inventory_categories_organization_id_idx" ON "inventory_categories"("organization_id");
        
        RAISE NOTICE 'Created inventory_categories table';
    ELSE
        RAISE NOTICE 'inventory_categories table already exists';
        
        -- Add organization_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name='inventory_categories' AND column_name='organization_id'
        ) THEN
            ALTER TABLE "inventory_categories" ADD COLUMN "organization_id" INTEGER REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
            CREATE INDEX "inventory_categories_organization_id_idx" ON "inventory_categories"("organization_id");
            RAISE NOTICE 'Added organization_id column to inventory_categories';
        END IF;
    END IF;
END $$;

-- Add organization_id column to inventory_items if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='inventory_items' AND column_name='organization_id'
    ) THEN
        ALTER TABLE "inventory_items" ADD COLUMN "organization_id" INTEGER REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        CREATE INDEX "inventory_items_organization_id_idx" ON "inventory_items"("organization_id");
        RAISE NOTICE 'Added organization_id column to inventory_items';
    ELSE
        RAISE NOTICE 'organization_id column already exists in inventory_items';
    END IF;
END $$;

-- Show final schema
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('inventory_items', 'inventory_categories')
    AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
