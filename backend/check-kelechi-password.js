const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkPassword() {
  try {
    console.log('🔍 Checking password for kelechi@owner.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' }
    });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found, testing passwords...');
    
    // Test common passwords
    const testPasswords = ['password123', 'password', '123456', 'admin', 'kelechi'];
    
    for (const testPwd of testPasswords) {
      const isValid = await bcrypt.compare(testPwd, user.password);
      console.log(`   "${testPwd}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      
      if (isValid) {
        console.log(`🎯 FOUND VALID PASSWORD: "${testPwd}"`);
        break;
      }
    }
    
    // Check password hash details
    console.log('\n📋 Password hash details:');
    console.log('   Hash length:', user.password.length);
    console.log('   Hash starts with:', user.password.substring(0, 10) + '...');
    console.log('   Hash format:', user.password.startsWith('$2b$') ? 'bcrypt' : 'Unknown');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPassword();
