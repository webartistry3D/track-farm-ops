const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // First, check what columns exist
    console.log('🔍 Checking existing columns...');
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by')
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('� Existing columns:', existingColumnNames);
    
    // Add missing columns one by one
    const columnsToAdd = [
      { name: 'last_password_change', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'password_changed_by', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_by INTEGER REFERENCES users(id)' },
      { name: 'password_change_count', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS password_change_count INTEGER DEFAULT 0' },
      { name: 'requires_password_change', sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS requires_password_change BOOLEAN DEFAULT FALSE' }
    ];
    
    for (const column of columnsToAdd) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await prisma.$executeRawUnsafe(column.sql);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          console.error(`❌ Failed to add column ${column.name}:`, error.message);
        }
      } else {
        console.log(`⚠️ Column ${column.name} already exists, skipping...`);
      }
    }
    
    console.log('✅ Database schema fix completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixDatabase()
  .then(() => {
    console.log('🎉 Database fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error);
    process.exit(1);
  });
