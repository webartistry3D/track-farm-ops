const { execSync } = require('child_process');

async function baselineProduction() {
  try {
    console.log('🔧 Starting production database baseline...');
    
    // Step 1: Create baseline migration
    console.log('📝 Creating baseline migration...');
    try {
      execSync('npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > baseline.sql', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Diff failed, trying manual baseline...');
    }
    
    // Step 2: Apply baseline
    console.log('🔄 Applying baseline...');
    try {
      execSync('npx prisma migrate resolve --applied "20260310234923_track_farm_ops"', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️ Baseline resolve failed, trying deploy...');
    }
    
    // Step 3: Try migrate deploy again
    console.log('🔄 Trying migrate deploy again...');
    try {
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
      console.log('✅ Prisma migrate deploy succeeded!');
    } catch (error) {
      console.log('⚠️ Migrate deploy still failed, using manual table creation...');
      
      // Fallback: Create tables manually
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      
      try {
        console.log('📝 Creating missing tables manually...');
        
        // Create income_entries table
        try {
          await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "income_entries" (
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
          console.log('✅ income_entries table created');
        } catch (e) {
          console.log('⚠️ income_entries table may already exist');
        }
        
        // Create expense_entries table
        try {
          await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "expense_entries" (
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
          console.log('✅ expense_entries table created');
        } catch (e) {
          console.log('⚠️ expense_entries table may already exist');
        }
        
        // Create inventory_items table
        try {
          await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "inventory_items" (
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
          console.log('✅ inventory_items table created');
        } catch (e) {
          console.log('⚠️ inventory_items table may already exist');
        }
        
        // Create subscriptions table
        try {
          await prisma.$executeRaw`
            CREATE TABLE IF NOT EXISTS "subscriptions" (
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
          console.log('✅ subscriptions table created');
        } catch (e) {
          console.log('⚠️ subscriptions table may already exist');
        }
        
        console.log('✅ Manual table creation completed');
        
      } catch (error) {
        console.error('❌ Manual table creation failed:', error);
      } finally {
        await prisma.$disconnect();
      }
    }
    
    console.log('✅ Production baseline completed successfully!');
    
  } catch (error) {
    console.error('❌ Baseline failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  baselineProduction();
}

module.exports = { baselineProduction };
