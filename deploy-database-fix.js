// Production database fix - add missing columns safely
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixProductionDatabase() {
  console.log('🔧 Production database fix...');
  
  try {
    // Check if columns exist
    const columnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by')
    `;
    
    const existingColumns = columnCheck.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumns);
    
    // Add only missing columns
    const neededColumns = [
      'last_password_change',
      'password_change_count', 
      'requires_password_change',
      'password_changed_by'
    ];
    
    for (const column of neededColumns) {
      if (!existingColumns.includes(column)) {
        const sql = `ALTER TABLE users ADD COLUMN ${column} ${
          column === 'last_password_change' ? 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP' :
          column.includes('password_change') ? 'INTEGER DEFAULT 0' :
          'BOOLEAN DEFAULT FALSE'
        }`;
        
        try {
          await prisma.$executeRawUnsafe(sql);
          console.log(`✅ Added column: ${column}`);
        } catch (error) {
          if (!error.message.includes('already exists')) {
            console.error(`❌ Failed to add ${column}:`, error.message);
          }
        }
      } else {
        console.log(`⚠️ Column ${column} already exists`);
      }
    }
    
    console.log('✅ Production database fixed!');
    
  } catch (error) {
    console.error('❌ Production fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixProductionDatabase()
  .then(() => {
    console.log('🎉 Database fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Database fix failed:', error);
    process.exit(1);
  });
