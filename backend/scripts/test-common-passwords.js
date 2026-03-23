const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function testCommonPasswords() {
  try {
    console.log('🔍 Testing common passwords for Manager and Worker accounts...\n');
    
    const manager = await prisma.user.findUnique({
      where: { email: 'kelechi@manager.com' }
    });
    
    const worker = await prisma.user.findUnique({
      where: { email: 'kelechi@worker.com' }
    });
    
    if (!manager || !worker) {
      console.log('❌ Accounts not found');
      return;
    }
    
    // Common passwords to test
    const commonPasswords = [
      'admin123',
      'password',
      '123456',
      'manager123',
      'worker123',
      'kelechi123',
      'farm123',
      'test123',
      'default',
      'welcome',
      'changeme',
      'temp123',
      'user123',
      'pass123',
      'qwerty',
      'abc123'
    ];
    
    console.log('👤 Testing Manager Account (kelechi@manager.com):');
    let managerPasswordFound = false;
    for (const pwd of commonPasswords) {
      const isValid = await bcrypt.compare(pwd, manager.password);
      if (isValid) {
        console.log(`   ✅ FOUND: "${pwd}"`);
        managerPasswordFound = true;
        break;
      }
    }
    if (!managerPasswordFound) {
      console.log(`   ❌ No common password found (you're using a custom password)`);
    }
    
    console.log('\n👤 Testing Worker Account (kelechi@worker.com):');
    let workerPasswordFound = false;
    for (const pwd of commonPasswords) {
      const isValid = await bcrypt.compare(pwd, worker.password);
      if (isValid) {
        console.log(`   ✅ FOUND: "${pwd}"`);
        workerPasswordFound = true;
        break;
      }
    }
    if (!workerPasswordFound) {
      console.log(`   ❌ No common password found (you're using a custom password)`);
    }
    
    console.log('\n💡 Recommendations:');
    console.log('1. If you remember the password you used for the worker account, try that');
    console.log('2. If not, you can reset the worker password through the application');
    console.log('3. Or use the "Forgot Password" feature if available');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCommonPasswords();
