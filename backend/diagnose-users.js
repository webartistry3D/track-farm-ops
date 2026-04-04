const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function diagnoseUsers() {
  try {
    console.log('🔍 Diagnosing user database issues...');
    
    // Check if users table exists and has data
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount === 0) {
      console.log('❌ CRITICAL: No users found in database!');
      console.log('💡 Solution: Need to create test users or restore from backup');
      return;
    }
    
    // Check specific users you mentioned
    const testEmails = ['kelechi@super.com', 'new@owner.com'];
    
    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          organizationId: true,
          createdAt: true,
          lastPasswordChange: true,
          requiresPasswordChange: true
        }
      });
      
      if (user) {
        console.log(`✅ User found: ${email}`, {
          id: user.id,
          name: user.name,
          role: user.role,
          hasPassword: !!user.password,
          passwordLength: user.password ? user.password.length : 0,
          orgId: user.organizationId,
          requiresPasswordChange: user.requiresPasswordChange,
          lastPasswordChange: user.lastPasswordChange
        });
      } else {
        console.log(`❌ User NOT found: ${email}`);
      }
    }
    
    // Check for any data corruption
    console.log('🔍 Checking for data issues...');
    const usersWithIssues = await prisma.user.findMany({
      where: {
        OR: [
          { password: null },
          { email: null },
          { name: null }
        ]
      },
      take: 5
    });
    
    if (usersWithIssues.length > 0) {
      console.log('⚠️ Found users with data issues:');
      usersWithIssues.forEach(user => {
        console.log(`  - User ${user.email}: missing ${!user.password ? 'password' : ''}${!user.email ? 'email' : ''}${!user.name ? 'name' : ''}`);
      });
    }
    
    await prisma.$disconnect();
    console.log('✅ Diagnosis complete');
    
  } catch (error) {
    console.error('❌ Error during diagnosis:', error.message);
    console.error('❌ Full error:', error);
  }
}

diagnoseUsers();
