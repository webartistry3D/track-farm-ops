const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
  try {
    console.log('🔍 Checking for user: kelechi@owner.com');
    
    const user = await prisma.user.findUnique({
      where: { email: 'kelechi@owner.com' },
      include: { organization: true }
    });
    
    if (user) {
      console.log('✅ User found:');
      console.log('   Email:', user.email);
      console.log('   Name:', user.name);
      console.log('   Role:', user.role);
      console.log('   Organization:', user.organization?.name || 'None');
      console.log('   Status:', user.status || 'No status field');
      console.log('   Created:', user.createdAt);
      console.log('   Password Hash Length:', user.password ? user.password.length : 'No password');
    } else {
      console.log('❌ User NOT found in database');
      
      // Check for similar emails
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true, createdAt: true }
      });
      
      console.log('\n📋 All users in database:');
      allUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.name || 'No name'}) - ${u.role} - Created: ${u.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
