const { PrismaClient } = require('@prisma/client');

async function migrateDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔧 Starting database migration...');
    
    // Check if organization_id column exists
    const result = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'organization_id'
    `;
    
    if (result.length === 0) {
      console.log('📝 Adding organization_id column...');
      await prisma.$executeRaw`ALTER TABLE "users" ADD COLUMN "organization_id" INTEGER`;
    }
    
    // Check if organizations table exists
    const orgTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'organizations'
    `;
    
    if (orgTable.length === 0) {
      console.log('📝 Creating organizations table...');
      await prisma.$executeRaw`
        CREATE TABLE "organizations" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL DEFAULT 'default',
          "description" TEXT,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await prisma.$executeRaw`
        INSERT INTO "organizations" (name, description) 
        VALUES ('default', 'Default organization')
      `;
    }
    
    // Create missing tables
    console.log('📝 Creating missing tables...');
    
    // Subscriptions table
    const subTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'subscriptions'
    `;
    
    if (subTable.length === 0) {
      console.log('📝 Creating subscriptions table...');
      await prisma.$executeRaw`
        CREATE TABLE "subscriptions" (
          "id" SERIAL PRIMARY KEY,
          "user_id" INTEGER NOT NULL,
          "plan" TEXT NOT NULL DEFAULT 'free',
          "status" TEXT NOT NULL DEFAULT 'active',
          "starts_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "ends_at" TIMESTAMP,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "organization_id" INTEGER
        )
      `;
    }
    
    // Expense entries table
    const expenseTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'expense_entries"
    `;
    
    if (expenseTable.length === 0) {
      console.log('📝 Creating expense_entries table...');
      await prisma.$executeRaw`
        CREATE TABLE "expense_entries" (
          "id" SERIAL PRIMARY KEY,
          "description" TEXT NOT NULL,
          "amount" DECIMAL(10,2) NOT NULL,
          "date" TIMESTAMP NOT NULL,
          "category" TEXT,
          "created_by" INTEGER,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "organization_id" INTEGER
        )
      `;
    }
    
    // Income entries table
    const incomeTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'income_entries"
    `;
    
    if (incomeTable.length === 0) {
      console.log('📝 Creating income_entries table...');
      await prisma.$executeRaw`
        CREATE TABLE "income_entries" (
          "id" SERIAL PRIMARY KEY,
          "description" TEXT NOT NULL,
          "amount" DECIMAL(10,2) NOT NULL,
          "date" TIMESTAMP NOT NULL,
          "source" TEXT,
          "created_by" INTEGER,
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "organization_id" INTEGER
        )
      `;
    }
    
    // Inventory items table
    const inventoryTable = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'inventory_items"
    `;
    
    if (inventoryTable.length === 0) {
      console.log('📝 Creating inventory_items table...');
      await prisma.$executeRaw`
        CREATE TABLE "inventory_items" (
          "id" SERIAL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "category" TEXT,
          "quantity" INTEGER DEFAULT 0,
          "initial_quantity" INTEGER DEFAULT 0,
          "unit" TEXT,
          "price_per_unit" DECIMAL(10,2),
          "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          "organization_id" INTEGER
        )
      `;
    }
    
    // Set default organization for all users
    console.log('📝 Setting default organization for all users...');
    await prisma.$executeRaw`
      UPDATE "users" 
      SET "organization_id" = (SELECT id FROM "organizations" WHERE "name" = 'default')
      WHERE "organization_id" IS NULL
    `;
    
    // Add foreign key constraints
    try {
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_organization_id_fkey" 
        FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      `;
    } catch (error) {
      console.log('⚠️ Users foreign key constraint may already exist');
    }
    
    // Add indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_organization_id" ON "users"("organization_id")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_subscriptions_user_id" ON "subscriptions"("user_id")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_expense_entries_organization_id" ON "expense_entries"("organization_id")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_income_entries_organization_id" ON "income_entries"("organization_id")
    `;
    
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_inventory_items_organization_id" ON "inventory_items"("organization_id")
    `;
    
    console.log('✅ Database migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  migrateDatabase();
}

module.exports = { migrateDatabase };
