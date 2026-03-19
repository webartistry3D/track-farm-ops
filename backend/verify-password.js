const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifyPassword() {
  try {
    console.log('🔐 Verifying password for keechi@owner.com...');
    
    const user = await prisma.user.findUnique({
      where: { email: 'keechi@owner.com' },
      select: { password: true }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('🔍 Testing different passwords...');
    
    const passwords = [
      'Password1706#',
      'password123',
      'Password1706',
      'password1706#'
    ];
    
    for (const password of passwords) {
      const isValid = await bcrypt.compare(password, user.password);
      console.log(`   ${password}: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
    console.log('\n💡 Current valid password is marked with ✅ above');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyPassword();
