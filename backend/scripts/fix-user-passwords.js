const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function fixUserPasswords() {
  try {
    console.log('🔧 Fixing user passwords...\n');
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users`);
    
    // Password mapping
    const passwordMap = {
      'kelechi@owner.com': 'admin123',
      'kelechi@manager.com': 'admin123', 
      'kelechi@worker.com': 'admin123',
      'emeka@owner.com': 'admin123'
    };
    
    for (const user of users) {
      const correctPassword = passwordMap[user.email];
      
      if (correctPassword) {
        console.log(`\n👤 Updating password for: ${user.email} (${user.role})`);
        
        // Hash the correct password
        const hashedPassword = await bcrypt.hash(correctPassword, 10);
        
        // Update user password
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        
        console.log(`✅ Password updated for ${user.name}`);
        
        // Verify the password works
        const isValid = await bcrypt.compare(correctPassword, hashedPassword);
        console.log(`🔍 Password verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
        
      } else {
        console.log(`⚠️ No password mapping found for: ${user.email}`);
      }
    }
    
    console.log('\n🎉 Password fix completed!');
    
    // Test login for each user
    console.log('\n🔐 Testing login credentials:');
    for (const user of users) {
      const testPassword = passwordMap[user.email] || 'admin123';
      const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
      
      const isValid = await bcrypt.compare(testPassword, updatedUser.password);
      console.log(`${user.email}: ${isValid ? '✅ Login works' : '❌ Login failed'}`);
    }
    
  } catch (error) {
    console.error('❌ Password fix failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUserPasswords();
