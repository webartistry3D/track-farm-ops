const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
  console.log('🔍 Checking user: keechi@owner.com\n');
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found: keechi@owner.com');
      console.log('\n📋 Available users:');
      
      // Show all available users
      const allUsers = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true
            }
          }
        }
      });
      
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
        console.log(`     Organization: ${user.organization?.name || 'None'} (${user.organizationId})`);
        console.log('');
      });
      
      console.log('\n💡 To login, use one of the available email addresses above.');
      console.log('   Default password for test users is: password123');
      
    } else {
      console.log('✅ User found:');
      console.log(`   Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Organization: ${user.organization?.name || 'None'} (${user.organizationId})`);
      console.log(`   Created: ${user.createdAt}`);
      
      // Test common passwords
      console.log('\n🔐 Testing common passwords...');
      const commonPasswords = ['password123', 'password', '123456', 'admin', 'owner'];
      
      for (const password of commonPasswords) {
        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
          console.log(`✅ Password matches: ${password}`);
          console.log('\n🎯 You can login with:');
          console.log(`   Email: ${user.email}`);
          console.log(`   Password: ${password}`);
          return;
        }
      }
      
      console.log('❌ No common test passwords match this user');
      console.log('\n💡 This user might have a different password.');
      console.log('   Options:');
      console.log('   1. Try a different password you might have used');
      console.log('   2. Use one of the test accounts created earlier');
      console.log('   3. I can reset the password for this user');
      
      // Offer to reset password
      console.log('\n🔧 Would you like me to reset the password to "password123"?');
      console.log('   If yes, let me know and I\'ll update it for you.');
    }
    
  } catch (error) {
    console.error('❌ Error checking user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
