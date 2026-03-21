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
    
    // Set default organization for all users
    console.log('📝 Setting default organization for all users...');
    await prisma.$executeRaw`
      UPDATE "users" 
      SET "organization_id" = (SELECT id FROM "organizations" WHERE "name" = 'default')
      WHERE "organization_id" IS NULL
    `;
    
    // Add foreign key constraint
    try {
      await prisma.$executeRaw`
        ALTER TABLE "users" 
        ADD CONSTRAINT "users_organization_id_fkey" 
        FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE
      `;
    } catch (error) {
      console.log('⚠️ Foreign key constraint may already exist');
    }
    
    // Add index
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "idx_users_organization_id" ON "users"("organization_id")
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
