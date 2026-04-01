// Fix ONLY the critical columns causing login issues
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCriticalColumns() {
  console.log('🔧 Fixing critical login columns...');
  
  try {
    // Check what columns exist
    console.log('🔍 Checking existing columns...');
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'profile_image_url', 'last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by')
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumnNames);
    
    // Add only the critical columns needed for login
    const criticalColumns = [
      { name: 'address', sql: 'ALTER TABLE users ADD COLUMN address TEXT' },
      { name: 'profile_image_url', sql: 'ALTER TABLE users ADD COLUMN profile_image_url TEXT' },
      { name: 'last_password_change', sql: 'ALTER TABLE users ADD COLUMN last_password_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP' },
      { name: 'password_changed_by', sql: 'ALTER TABLE users ADD COLUMN password_changed_by INTEGER REFERENCES users(id)' },
      { name: 'password_change_count', sql: 'ALTER TABLE users ADD COLUMN password_change_count INTEGER DEFAULT 0' },
      { name: 'requires_password_change', sql: 'ALTER TABLE users ADD COLUMN requires_password_change BOOLEAN DEFAULT FALSE' }
    ];
    
    console.log('📝 Adding critical columns...');
    
    for (const column of criticalColumns) {
      if (!existingColumnNames.includes(column.name)) {
        try {
          await prisma.$executeRawUnsafe(column.sql);
          console.log(`✅ Added column: ${column.name}`);
        } catch (error) {
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️ Column ${column.name} already exists`);
          } else {
            console.error(`❌ Failed to add column ${column.name}:`, error.message);
            throw error;
          }
        }
      } else {
        console.log(`⚠️ Column ${column.name} already exists`);
      }
    }
    
    // Create index for profile_image_url
    if (!existingColumnNames.includes('profile_image_url')) {
      try {
        await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_users_profile_image_url ON users(profile_image_url) WHERE profile_image_url IS NOT NULL');
        console.log('✅ Created profile_image_url index');
      } catch (error) {
        console.log('⚠️ Profile_image_url index already exists');
      }
    }
    
    console.log('✅ Critical columns fix completed!');
    
    // Final verification
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'profile_image_url', 'last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by')
    `;
    
    const finalColumnNames = finalColumns.map(col => col.column_name);
    const missingColumns = ['address', 'profile_image_url', 'last_password_change', 'password_change_count', 'requires_password_change', 'password_changed_by'].filter(col => !finalColumnNames.includes(col));
    
    if (missingColumns.length === 0) {
      console.log('🎉 All critical columns are present!');
    } else {
      console.log('❌ Still missing columns:', missingColumns);
      throw new Error(`Missing critical columns: ${missingColumns.join(', ')}`);
    }
    
  } catch (error) {
    console.error('❌ Critical columns fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixCriticalColumns()
  .then(() => {
    console.log('🎉 Critical columns fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Critical columns fix failed:', error);
    process.exit(1);
  });
