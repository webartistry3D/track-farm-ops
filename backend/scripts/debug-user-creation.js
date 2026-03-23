const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function debugUserCreation() {
  try {
    console.log('🔍 Debugging user creation process...\n');
    
    // Get all users with their creation details
    const users = await prisma.user.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    console.log('📊 All Users Analysis:\n');
    
    for (const user of users) {
      console.log(`👤 ${user.name} (${user.role})`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Organization: ${user.organization?.name}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log(`   Updated: ${user.updatedAt.toISOString()}`);
      console.log(`   Created by: ${user.createdBy || 'Self/Org Owner'}`);
      console.log(`   Password Hash: ${user.password.substring(0, 25)}...`);
      console.log(`   Hash Algorithm: ${user.password.startsWith('$2b$') ? 'bcrypt' : 'Unknown'}`);
      
      // Extract bcrypt rounds from hash
      const hashParts = user.password.split('$');
      if (hashParts.length >= 3) {
        console.log(`   Bcrypt Rounds: ${hashParts[2]}`);
      }
      
      // Check if password hash format is consistent
      const isProperBcrypt = user.password.match(/^\$2[ab]\$\d+\$/);
      console.log(`   Proper Format: ${isProperBcrypt ? '✅ Yes' : '❌ No'}`);
      
      console.log('');
    }
    
    // Specifically compare the working vs non-working accounts
    console.log('🎯 Working vs Non-working Comparison:\n');
    
    const managerUser = users.find(u => u.email === 'kelechi@manager.com');
    const workerUser = users.find(u => u.email === 'kelechi@worker.com');
    
    if (managerUser && workerUser) {
      console.log('📋 Manager Account (Working):');
      console.log(`   Created by: ${managerUser.createdBy || 'Unknown'}`);
      console.log(`   Hash rounds: ${managerUser.password.split('$')[2] || 'Unknown'}`);
      console.log(`   Hash length: ${managerUser.password.length}`);
      
      console.log('\n📋 Worker Account (Not Working):');
      console.log(`   Created by: ${workerUser.createdBy || 'Unknown'}`);
      console.log(`   Hash rounds: ${workerUser.password.split('$')[2] || 'Unknown'}`);
      console.log(`   Hash length: ${workerUser.password.length}`);
      
      // Check if they were created by the same person
      console.log(`\n🔍 Creation Analysis:`);
      console.log(`   Same creator: ${managerUser.createdBy === workerUser.createdBy ? '✅ Yes' : '❌ No'}`);
      console.log(`   Same bcrypt rounds: ${managerUser.password.split('$')[2] === workerUser.password.split('$')[2] ? '✅ Yes' : '❌ No'}`);
      
      // Time difference between creations
      const timeDiff = Math.abs(workerUser.createdAt.getTime() - managerUser.createdAt.getTime());
      console.log(`   Time difference: ${Math.round(timeDiff / 1000)} seconds`);
    }
    
    // Check if there are any users with null/empty passwords
    const problematicUsers = users.filter(u => !u.password || u.password.length < 50);
    if (problematicUsers.length > 0) {
      console.log('\n⚠️ Problematic Users Found:');
      problematicUsers.forEach(user => {
        console.log(`   ${user.email}: Password length ${user.password?.length || 0}`);
      });
    }
    
    // Test password creation process
    console.log('\n🧪 Testing Password Creation Process:');
    const testPassword = 'test123';
    const rounds = [10, 11, 12];
    
    for (const round of rounds) {
      const hash = await bcrypt.hash(testPassword, round);
      const isValid = await bcrypt.compare(testPassword, hash);
      console.log(`   Round ${round}: ${isValid ? '✅ Valid' : '❌ Invalid'} (${hash.substring(0, 20)}...)`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugUserCreation();
