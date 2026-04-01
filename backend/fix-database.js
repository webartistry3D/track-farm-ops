const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function fixDatabase() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // Read and execute the correct migration
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'prisma/migrations/004_add_password_change_tracking.sql'),
      'utf8'
    );
    
    console.log('📝 Executing migration SQL...');
    
    // Split SQL by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('✅ Statement executed successfully');
      } catch (error) {
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log('⚠️ Statement already applied, skipping...');
        } else {
          console.error('❌ Statement failed:', error.message);
          throw error;
        }
      }
    }
    
    console.log('✅ Database schema fixed successfully!');
    
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
