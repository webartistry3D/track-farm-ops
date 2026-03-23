const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function diagnoseUserAccounts() {
  try {
    console.log('🔍 Diagnosing user accounts...\n');
    
    // Get all users in the organization
    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { role: 'asc' }
    });
    
    console.log(`📊 Found ${users.length} users:\n`);
    
    for (const user of users) {
      console.log(`👤 User: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Organization: ${user.organization?.name} (ID: ${user.organizationId})`);
      console.log(`   Created: ${user.createdAt}`);
      console.log(`   Updated: ${user.updatedAt}`);
      console.log(`   Password Hash Length: ${user.password.length}`);
      console.log(`   Password Hash Starts With: ${user.password.substring(0, 10)}...`);
      
      // Test with common passwords
      const testPasswords = ['admin123', 'password', '123456', 'worker123', 'manager123'];
      console.log(`   Password Tests:`);
      
      for (const testPwd of testPasswords) {
        try {
          const isValid = await bcrypt.compare(testPwd, user.password);
          if (isValid) {
            console.log(`     ✅ "${testPwd}" - VALID`);
          }
        } catch (error) {
          console.log(`     ❌ "${testPwd}" - Error: ${error.message}`);
        }
      }
      
      console.log('');
    }
    
    // Specifically check the two accounts you mentioned
    console.log('🎯 Specific Account Analysis:\n');
    
    const workerUser = users.find(u => u.email === 'kelechi@worker.com');
    const managerUser = users.find(u => u.email === 'kelechi@manager.com');
    
    if (workerUser && managerUser) {
      console.log('🔄 Comparing Worker vs Manager accounts:');
      console.log(`Worker created: ${workerUser.createdAt}`);
      console.log(`Manager created: ${managerUser.createdAt}`);
      console.log(`Worker password hash: ${workerUser.password.substring(0, 20)}...`);
      console.log(`Manager password hash: ${managerUser.password.substring(0, 20)}...`);
      
      // Check if they're in the same organization
      console.log(`Same organization: ${workerUser.organizationId === managerUser.organizationId ? '✅ Yes' : '❌ No'}`);
      
      // Check if there are any special characters or encoding issues
      console.log(`Worker email encoding: ${Buffer.from(workerUser.email).toString('hex')}`);
      console.log(`Manager email encoding: ${Buffer.from(managerUser.email).toString('hex')}`);
    }
    
    // Test manual password verification for worker account
    if (workerUser) {
      console.log('\n🔧 Manual Password Test for Worker Account:');
      
      // Try to create a new hash and test it
      const testPassword = 'admin123';
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log(`New hash for "admin123": ${newHash}`);
      
      const newHashValid = await bcrypt.compare(testPassword, newHash);
      console.log(`New hash verification: ${newHashValid ? '✅ Valid' : '❌ Invalid'}`);
      
      // Test the current hash
      try {
        const currentHashValid = await bcrypt.compare(testPassword, workerUser.password);
        console.log(`Current hash verification: ${currentHashValid ? '✅ Valid' : '❌ Invalid'}`);
      } catch (error) {
        console.log(`Current hash error: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseUserAccounts();
