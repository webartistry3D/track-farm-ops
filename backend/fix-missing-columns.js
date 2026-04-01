// Fix missing columns that aren't in migration files
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixMissingColumns() {
  console.log('🔧 Fixing missing columns...');
  
  try {
    // Check what columns exist
    console.log('🔍 Checking existing columns...');
    const existingColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name IN ('address', 'profile_image_url')
    `;
    
    const existingColumnNames = existingColumns.map(col => col.column_name);
    console.log('📋 Existing columns:', existingColumnNames);
    
    // Add missing address column
    if (!existingColumnNames.includes('address')) {
      try {
        await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN address TEXT');
        console.log('✅ Added address column');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Failed to add address column:', error.message);
          throw error;
        } else {
          console.log('⚠️ Address column already exists');
        }
      }
    } else {
      console.log('⚠️ Address column already exists');
    }
    
    // Add missing profile_image_url column
    if (!existingColumnNames.includes('profile_image_url')) {
      try {
        await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN profile_image_url TEXT');
        console.log('✅ Added profile_image_url column');
      } catch (error) {
        if (!error.message.includes('already exists')) {
          console.error('❌ Failed to add profile_image_url column:', error.message);
          throw error;
        } else {
          console.log('⚠️ Profile_image_url column already exists');
        }
      }
    } else {
      console.log('⚠️ Profile_image_url column already exists');
    }
    
    // Create index for profile_image_url if not exists
    try {
      await prisma.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS idx_users_profile_image_url ON users(profile_image_url) WHERE profile_image_url IS NOT NULL');
      console.log('✅ Created profile_image_url index');
    } catch (error) {
      if (!error.message.includes('already exists')) {
        console.log('⚠️ Profile_image_url index already exists');
      }
    }
    
    console.log('✅ Missing columns fixed successfully!');
    
  } catch (error) {
    console.error('❌ Column fix failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixMissingColumns()
  .then(() => {
    console.log('🎉 Missing columns fix completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Missing columns fix failed:', error);
    process.exit(1);
  });
