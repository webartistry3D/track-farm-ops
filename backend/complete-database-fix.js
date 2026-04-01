// Complete database fix - handle all missing columns
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completeDatabaseFix() {
  console.log('🔧 Complete database schema fix...');
  
  try {
    // Check what columns exist
    console.log('🔍 Checking existing columns...');
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN (
        'last_password_change', 'password_change_count', 'requires_password_change', 
        'password_changed_by', 'address'
      )
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumnNames);
    
    // Add all missing columns
    const columnsToAdd = [
      { name: 'last_password_change', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'password_changed_by', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_by INTEGER REFERENCES users(id)' },
      { name: 'password_change_count', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0' },
      { name: 'requires_password_change', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE' },
      { name: 'address', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT' }
    ];
    
    console.log('📝 Adding missing columns...');
    
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await prisma.$executeRawUnsafe(column.sql);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️ Column ${column.name} already exists, skipping...`);
          } else {
            console.error(`❌ Failed to add column ${column.name}:`, error.message);
            throw error;
          }
        }
      } else {
        console.log(`⚠️ Column ${column.name} already exists, skipping...`);
      }
    }
    
    console.log('✅ Complete database schema fix successful!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the complete fix
completeDatabaseFix()
  .then(() => {
    console.log('🎉 Complete database fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Complete database fix failed:', error);
    process.exit(1);
  });
