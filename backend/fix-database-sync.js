const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function fixDatabaseSync() {
  try {
    console.log('🔧 Fixing database synchronization...');
    
    // Check if password column exists in database
    const passwordColumnCheck = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'password'
    `;
    
    const hasPasswordColumn = passwordColumnCheck.length > 0;
    console.log(`📋 Password column exists: ${hasPasswordColumn}`);
    
    if (!hasPasswordColumn) {
      console.log('⚠️ Password column missing - adding it...');
      await prisma.$executeRaw`ALTER TABLE users ADD COLUMN password TEXT`;
      console.log('✅ Password column added');
    }
    
    // Check if user passwords are null using raw SQL
    const usersWithoutPasswordsResult = await prisma.$queryRaw`
      SELECT id, email, name 
      FROM users 
      WHERE password IS NULL 
      LIMIT 10
    `;
    
    console.log(`📊 Users without passwords: ${usersWithoutPasswordsResult.length}`);
    
    if (usersWithoutPasswordsResult.length > 0) {
      console.log(`⚠️ Found ${usersWithoutPasswordsResult.length} users without passwords`);
      
      // Set default passwords for users without passwords
      for (const user of usersWithoutPasswordsResult) {
        const bcrypt = require('bcryptjs');
        const defaultPassword = 'tempPassword123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            password: hashedPassword,
            requiresPasswordChange: true
          }
        });
        
        console.log(`🔑 Set temp password for ${user.email}: tempPassword123`);
      }
    }
    
    // Verify the fix worked
    const testUser = await prisma.user.findUnique({
      where: { email: 'new@owner.com' },
      select: { id: true, email: true, password: true }
    });
    
    if (testUser) {
      console.log('✅ new@owner.com now exists with password');
    } else {
      console.log('❌ new@owner.com still missing - creating it...');
      const bcrypt = require('bcryptjs');
      const defaultPassword = 'ownerPassword123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      await prisma.user.create({
        data: {
          name: 'Test Owner',
          email: 'new@owner.com',
          password: hashedPassword,
          role: 'OWNER',
          organizationId: 1 // Assuming org ID 1 exists
        }
      });
      
      console.log('✅ Created new@owner.com with password: ownerPassword123');
    }
    
    await prisma.$disconnect();
    console.log('✅ Database sync fix complete');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error.message);
  }
}

fixDatabaseSync();
